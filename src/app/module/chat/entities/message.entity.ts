import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ _id: false })
export class MessageAttachment {
  @Prop({ required: true, enum: ['image', 'pdf'] })
  type: 'image' | 'pdf';

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  publicId: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true, min: 1 })
  size: number;
}

export const MessageAttachmentSchema =
  SchemaFactory.createForClass(MessageAttachment);

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  receiverId: Types.ObjectId;

  @Prop({ trim: true, maxlength: 5000, default: '' })
  text: string;

  @Prop({ type: [MessageAttachmentSchema], default: [] })
  attachments: MessageAttachment[];

  @Prop({ type: Date, default: null })
  readAt: Date | null;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
MessageSchema.index({ receiverId: 1, readAt: 1, createdAt: -1 });
