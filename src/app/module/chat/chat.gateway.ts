import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import config from 'src/app/config';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtPayload } from 'src/app/middlewares/auth.guard';

type AuthenticatedSocket = Socket & { data: { user: JwtPayload } };

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*', credentials: true },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.getToken(client);
      const user = this.jwtService.verify<JwtPayload>(token, {
        secret: config.jwt.accessTokenSecret!,
      });
      client.data.user = user;
      void client.join(this.userRoom(user.id));
      client.emit('chat:ready', { userId: user.id, role: user.role });
    } catch {
      client.emit('chat:error', { message: 'Unauthorized' });
      client.disconnect(true);
    }
  }

  @SubscribeMessage('message:send')
  async sendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: SendMessageDto,
  ) {
    try {
      const user = this.requireUser(client);
      const message = await this.chatService.sendMessage(
        user.id,
        dto,
        user.role === 'admin',
      );
      if (!message) throw new Error('Message could not be created');
      this.broadcastMessage(message);
      return { success: true, data: message };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Message could not be sent';
      client.emit('chat:error', { message });
      return { success: false, message };
    }
  }

  broadcastMessage(message: { senderId: unknown; receiverId: unknown }) {
    const receiverId = this.getParticipantId(message.receiverId);
    const senderId = this.getParticipantId(message.senderId);
    this.server
      .to(this.userRoom(senderId))
      .to(this.userRoom(receiverId))
      .emit('message:new', message);
    this.server
      .to(this.userRoom(senderId))
      .to(this.userRoom(receiverId))
      .emit('conversation:updated', message);
  }

  @SubscribeMessage('conversation:read')
  async markRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { userId?: string },
  ) {
    const user = this.requireUser(client);
    const result = await this.chatService.markRead(
      user.id,
      user.role === 'admin',
      body?.userId,
    );
    return { success: true, data: result };
  }

  private requireUser(client: AuthenticatedSocket) {
    if (!client.data.user) throw new Error('Unauthorized');
    return client.data.user;
  }

  private getToken(client: Socket) {
    const authToken = client.handshake.auth?.token;
    const header = client.handshake.headers.authorization;
    const token =
      authToken || (header?.startsWith('Bearer ') ? header.slice(7) : header);
    if (!token || typeof token !== 'string') throw new Error('Unauthorized');
    return token;
  }

  private userRoom(userId: string) {
    return `user:${userId}`;
  }

  private getParticipantId(participant: unknown) {
    if (
      typeof participant === 'object' &&
      participant !== null &&
      '_id' in participant
    ) {
      return String((participant as { _id: unknown })._id);
    }
    return String(participant);
  }
}
