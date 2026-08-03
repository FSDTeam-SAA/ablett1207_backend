// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument, Types } from 'mongoose';

// export const BOOKING_STATUSES = [
//   'pending',
//   'scheduled',
//   'cancelled',
//   'completed',
// ] as const;
// export type BookingStatus = (typeof BOOKING_STATUSES)[number];

// export type BookingDocument = HydratedDocument<Booking>;

// @Schema({ timestamps: true })
// export class Booking {
//   @Prop({ required: [true, 'Name is required'], trim: true })
//   name: string;

//   @Prop({ required: [true, 'Phone number is required'], trim: true })
//   phoneNumber: string;

//   @Prop({ required: [true, 'Email is required'], trim: true, lowercase: true })
//   email: string;

//   @Prop({ required: [true, 'Project location is required'], trim: true })
//   projectLocation: string;

//   @Prop({ default: null })
//   message: string | null;

//   @Prop({ type: Types.ObjectId, ref: 'Schedule', required: true })
//   scheduleId: Types.ObjectId;

//   // _id of the slot subdocument inside Schedule.slots
//   @Prop({ type: Types.ObjectId, required: true })
//   slotId: Types.ObjectId;

//   @Prop({
//     type: String,
//     enum: BOOKING_STATUSES,
//     default: 'pending',
//   })
//   status: BookingStatus;
// }

// export const BookingSchema = SchemaFactory.createForClass(Booking);


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export const BOOKING_STATUSES = [
  'pending',
  'scheduled',
  'cancelled',
  'completed',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: [true, 'Name is required'], trim: true })
  name: string;

  @Prop({ required: [true, 'Phone number is required'], trim: true })
  phoneNumber: string;

  @Prop({ required: [true, 'Email is required'], trim: true, lowercase: true })
  email: string;

  @Prop({ required: [true, 'Project location is required'], trim: true })
  projectLocation: string;

  @Prop({ type: String, default: null })
  message: string | null;

  @Prop({ type: Types.ObjectId, ref: 'Schedule', required: true })
  scheduleId: Types.ObjectId;

  // _id of the slot subdocument inside Schedule.slots
  @Prop({ type: Types.ObjectId, required: true })
  slotId: Types.ObjectId;

  @Prop({
    type: String,
    enum: BOOKING_STATUSES,
    default: 'pending',
  })
  status: BookingStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);