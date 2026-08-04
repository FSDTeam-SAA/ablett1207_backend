import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../user/entities/user.entity';
import { Message, MessageDocument } from './entities/message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import config from 'src/app/config';
import { fileUpload } from 'src/app/helpers/fileUploder';

const SUPPORT_ROLE = 'admin';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getSupportUser() {
    const support = await this.userModel
      .findOne({
        ...(config.supportUserId ? { _id: config.supportUserId } : {}),
        role: SUPPORT_ROLE,
        status: 'active',
      })
      .select('fullName email role profilePicture status bio')
      .lean();

    if (!support) {
      throw new HttpException('Support account is not configured', 503);
    }
    return support;
  }

  private async getActiveUser(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid user id');
    const user = await this.userModel
      .findOne({ _id: id, status: 'active' })
      .select('fullName email role profilePicture status')
      .lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async assertSupportAccount(userId: string) {
    const support = await this.getSupportUser();
    if (String(support._id) !== userId) {
      throw new ForbiddenException(
        'Only the configured support account can access the support inbox',
      );
    }
    return support;
  }

  async sendMessage(
    senderId: string,
    dto: SendMessageDto,
    isSupport: boolean,
    files: Express.Multer.File[] = [],
  ) {
    const support = await this.getSupportUser();
    if (isSupport) await this.assertSupportAccount(senderId);
    const receiverId = isSupport ? (dto.userId ?? '') : String(support._id);

    if (isSupport && !receiverId)
      throw new BadRequestException('userId is required for support replies');
    if (receiverId === senderId)
      throw new ForbiddenException('A conversation must have two participants');

    const receiver = await this.getActiveUser(receiverId);
    if (isSupport && receiver.role === SUPPORT_ROLE)
      throw new ForbiddenException('Support can only reply to users');

    const text = dto.text?.trim() ?? '';
    if (!text && !files.length) {
      throw new BadRequestException(
        'A message must contain text or at least one attachment',
      );
    }

    const attachments = await Promise.all(
      files.map((file) => fileUpload.uploadChatAttachment(file)),
    );

    const message = await this.messageModel.create({
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(receiverId),
      text,
      attachments,
      readAt: null,
    });

    return this.messageModel
      .findById(message._id)
      .populate('senderId', 'fullName email role profilePicture')
      .populate('receiverId', 'fullName email role profilePicture')
      .lean();
  }

  async getHistory(
    userId: string,
    isSupport: boolean,
    otherUserId?: string,
    limit = 100,
  ) {
    const support = isSupport
      ? await this.assertSupportAccount(userId)
      : await this.getSupportUser();
    const participantId = isSupport ? otherUserId : String(support._id);
    if (!participantId)
      throw new BadRequestException('userId is required for support history');
    if (!Types.ObjectId.isValid(participantId))
      throw new BadRequestException('Invalid user id');
    if (!isSupport && participantId !== String(support._id))
      throw new ForbiddenException(
        'Users can only view their support conversation',
      );

    const participant = await this.getActiveUser(participantId);
    if (isSupport && participant.role === SUPPORT_ROLE) {
      throw new ForbiddenException(
        'Support conversations can only contain users',
      );
    }
    const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 200);
    const messages = await this.messageModel
      .find({
        $or: [
          { senderId: userId, receiverId: participantId },
          { senderId: participantId, receiverId: userId },
        ],
      })
      .sort({ createdAt: 1 })
      .limit(safeLimit)
      .populate('senderId', 'fullName email role profilePicture')
      .populate('receiverId', 'fullName email role profilePicture')
      .lean();

    return messages;
  }

  async getInbox(userId: string) {
    const support = await this.assertSupportAccount(userId);
    const rows = await this.messageModel.aggregate([
      {
        $match: {
          $or: [{ senderId: support._id }, { receiverId: support._id }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', support._id] },
              '$receiverId',
              '$senderId',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', support._id] },
                    { $eq: ['$readAt', null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    const userIds = rows.map((row) => row._id);
    const users = await this.userModel
      .find({ _id: { $in: userIds } })
      .select('fullName email role profilePicture status')
      .lean();
    const userMap = new Map(users.map((user) => [String(user._id), user]));
    return rows.map((row) => ({
      user: userMap.get(String(row._id)) ?? null,
      lastMessage: row.lastMessage,
      unreadCount: row.unreadCount,
    }));
  }

  async markRead(userId: string, isSupport: boolean, otherUserId?: string) {
    const support = isSupport
      ? await this.assertSupportAccount(userId)
      : await this.getSupportUser();
    const participantId = isSupport ? otherUserId : String(support._id);
    if (!participantId || !Types.ObjectId.isValid(participantId))
      throw new BadRequestException('Invalid conversation user id');
    const filter = isSupport
      ? { senderId: participantId, receiverId: support._id, readAt: null }
      : { senderId: support._id, receiverId: userId, readAt: null };
    const result = await this.messageModel.updateMany(filter, {
      $set: { readAt: new Date() },
    });
    return { updated: result.modifiedCount };
  }
}
