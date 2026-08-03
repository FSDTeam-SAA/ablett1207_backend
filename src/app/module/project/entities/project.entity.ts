import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({
    required: [true, 'Project name is required'],
    trim: true,
  })
  projectName: string;

  @Prop({
    required: [true, 'Location is required'],
    trim: true,
  })
  location: string;

  @Prop({
    required: [true, 'Project type is required'],
    trim: true,
  })
  projectType: string;

  // Plain string, no enum - handled by frontend
  @Prop({
    required: [true, 'Category is required'],
    trim: true,
  })
  category: string;

  @Prop({
    required: [true, 'Completion date is required'],
    trim: true,
  })
  completion: string;

  @Prop({
    required: [true, 'Duration is required'],
    trim: true,
  })
  duration: string;

  @Prop({
    required: [true, 'Description is required'],
  })
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);