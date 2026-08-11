import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ type: String, trim: true, default: null })
  title: string | null;

  @Prop({ type: String, default: null })
  description: string | null;

  @Prop({ type: String, default: null })
  coverImage: string | null;

  @Prop({ type: String, default: null })
  scope: string | null;

  @Prop({ type: String, default: null })
  challenge: string | null;

  @Prop({ type: String, default: null })
  a7Solution: string | null;

  @Prop({ type: String, default: null })
  result: string | null;

  @Prop({ type: String, default: null })
  equipmentsUsed: string | null;

  @Prop({ type: String, default: null })
  timeline: string | null;

  @Prop({ type: String, default: null })
  before: string | null;

  @Prop({ type: String, default: null })
  during: string | null;

  @Prop({ type: String, default: null })
  completed: string | null;

  @Prop({ type: String, default: null })
  constructionProcess: string | null;

  @Prop({ type: String, default: null })
  projectExperience: string | null;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);