import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ServiceDocument = HydratedDocument<Service>;

@Schema({ timestamps: true })
export class Service {
  @Prop({
    required: [true, 'Service title is required'],
    trim: true,
  })
  serviceTitle: string;

  @Prop({ type: [String], default: [] })
  coreFeatures: string[];

  @Prop({
    required: [true, 'Description is required'],
  })
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];
}

export const ServiceSchema = SchemaFactory.createForClass(Service);