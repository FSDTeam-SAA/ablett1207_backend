import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HistoryDocument = HydratedDocument<HistoryRecord>;

@Schema({ timestamps: true })
export class HistoryRecord {
  @Prop({ trim: true })
  userId?: string;

  @Prop({ trim: true })
  title?: string;

  @Prop({ trim: true })
  type?: string;

  @Prop({ type: Object })
  payload?: Record<string, unknown>;
}

export const HistorySchema = SchemaFactory.createForClass(HistoryRecord);
