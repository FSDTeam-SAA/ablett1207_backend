import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const PROJECT_STATUSES = ['normal', 'emergency'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type QuoteDocument = HydratedDocument<Quote>;

@Schema({ timestamps: true })
export class Quote {
  @Prop({
    required: [true, 'Name is required'],
    trim: true,
  })
  name: string;

  @Prop({
    required: [true, 'Phone number is required'],
    trim: true,
  })
  phoneNumber: string;

  @Prop({
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    required: [true, 'Location is required'],
    trim: true,
  })
  location: string;

  @Prop({
    required: [true, 'Project name is required'],
    trim: true,
  })
  projectName: string;

  @Prop({
    required: [true, 'Project budget is required'],
    trim: true,
  })
  projectBudget: string;

  @Prop({
    type: String,
    enum: PROJECT_STATUSES,
    default: 'normal',
  })
  projectStatus: ProjectStatus;

  @Prop({
    required: [true, 'Message is required'],
  })
  message: string;

  @Prop({ type: String, default: null })
  photo: string | null;
}

export const QuoteSchema = SchemaFactory.createForClass(Quote);