import {
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Body,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import AuthGuard from 'src/app/middlewares/auth.guard';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatGateway } from './chat.gateway';

const MAX_CHAT_ATTACHMENT_SIZE = 10 * 1024 * 1024;

const chatAttachmentUploadConfig = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_CHAT_ATTACHMENT_SIZE, files: 5 },
  fileFilter: (
    _req: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          'Only JPG, PNG, WEBP, GIF, and PDF attachments are allowed',
        ),
        false,
      );
    }
    callback(null, true);
  },
};

@ApiTags('Chat')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('admin', 'user'))
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get('support')
  @ApiOperation({ summary: 'Get the configured support account' })
  async support() {
    return {
      message: 'Support account fetched successfully',
      data: await this.chatService.getSupportUser(),
    };
  }

  @Get('messages')
  @ApiOperation({
    summary:
      'Get the current user support conversation, or an admin conversation with one user',
  })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async messages(
    @Req() req: Request,
    @Query('userId') userId?: string,
    @Query('limit') limit?: number,
  ) {
    const isSupport = req.user!.role === 'admin';
    return {
      message: 'Messages fetched successfully',
      data: await this.chatService.getHistory(
        req.user!.id,
        isSupport,
        userId,
        limit,
      ),
    };
  }

  @Post('messages')
  @ApiOperation({
    summary: 'Send a text, image, or PDF message and broadcast it in real time',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(
    FilesInterceptor('attachments', 5, chatAttachmentUploadConfig),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', maxLength: 5000 },
        userId: {
          type: 'string',
          description: 'Required only for support replies',
        },
        attachments: {
          type: 'array',
          maxItems: 5,
          items: { type: 'string', format: 'binary' },
          description: 'JPG, PNG, WEBP, GIF, or PDF; maximum 10 MB each',
        },
      },
    },
  })
  async send(
    @Req() req: Request,
    @Body() dto: SendMessageDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    const data = await this.chatService.sendMessage(
      req.user!.id,
      dto,
      req.user!.role === 'admin',
      files,
    );
    if (data) this.chatGateway.broadcastMessage(data);
    return { message: 'Message sent successfully', data };
  }

  @Get('inbox')
  @UseGuards(AuthGuard('admin'))
  @ApiOperation({ summary: 'Get all support conversations' })
  async inbox(@Req() req: Request) {
    return {
      message: 'Chat inbox fetched successfully',
      data: await this.chatService.getInbox(req.user!.id),
    };
  }

  @Patch('read')
  @ApiOperation({ summary: 'Mark messages in a conversation as read' })
  @ApiQuery({ name: 'userId', required: false, type: String })
  async read(@Req() req: Request, @Query('userId') userId?: string) {
    return {
      message: 'Messages marked as read',
      data: await this.chatService.markRead(
        req.user!.id,
        req.user!.role === 'admin',
        userId,
      ),
    };
  }
}
