import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export const BOOKING_ACTIONS = ['accept', 'reject', 'complete'] as const;
export type BookingAction = (typeof BOOKING_ACTIONS)[number];

export class UpdateBookingDto {
  @ApiProperty({
    enum: BOOKING_ACTIONS,
    example: 'accept',
    description:
      'accept -> status becomes "scheduled" and the slot is locked. ' +
      'reject -> status becomes "cancelled" and the slot is freed for others. ' +
      'complete -> status becomes "completed" (only valid once already "scheduled").',
  })
  @IsIn([...BOOKING_ACTIONS])
  action: BookingAction;
}