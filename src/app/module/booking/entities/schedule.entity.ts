import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export const SLOT_STATUSES = ['available', 'pending', 'scheduled', 'completed'] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

@Schema({ _id: true })
export class Slot {
  @Prop({ required: true })
  startTime: string; // "HH:mm"

  @Prop({ required: true })
  endTime: string; // "HH:mm"

  @Prop({ type: String, enum: SLOT_STATUSES, default: 'available' })
  status: SlotStatus;
}
export const SlotSchema = SchemaFactory.createForClass(Slot);

export type ScheduleDocument = HydratedDocument<Schedule>;

@Schema({ timestamps: true })
export class Schedule {
  // "YYYY-MM-DD"
  @Prop({ required: [true, 'Date is required'] })
  date: string;

  @Prop({ required: [true, 'Start time is required'] })
  startTime: string; // "HH:mm"

  @Prop({ required: [true, 'End time is required'] })
  endTime: string; // "HH:mm"

  @Prop({ required: [true, 'Appointment duration is required'] })
  appointmentDuration: number; // minutes

  @Prop({ default: null })
  breakStartTime: string | null;

  @Prop({ default: null })
  breakEndTime: string | null;

  @Prop({ type: [SlotSchema], default: [] })
  slots: Types.DocumentArray<Slot>;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
ScheduleSchema.index({ date: 1 }, { unique: true });