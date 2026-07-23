import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ trim: true })
  paymentId?: string;

  @Prop({ required: true, default: 0 })
  amount: number;

  @Prop({ default: 'usd', lowercase: true, trim: true })
  currency: string;

  @Prop({ trim: true })
  paymentMethod?: string;

  @Prop({
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  nameOnCard?: string;

  @Prop({ lowercase: true, trim: true })
  email?: string;

  @Prop({ trim: true })
  country?: string;

  @Prop({ trim: true })
  stripePaymentIntentId?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
