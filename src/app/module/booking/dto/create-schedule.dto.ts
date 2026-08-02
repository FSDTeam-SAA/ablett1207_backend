import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class CreateScheduleDto {
  @ApiProperty({ example: '2026-06-18' })
  @IsString()
  @Matches(DATE_PATTERN, { message: 'startDate must be in YYYY-MM-DD format' })
  startDate: string;

  @ApiPropertyOptional({
    example: '2026-06-20',
    description: 'Defaults to startDate if omitted (single-day schedule)',
  })
  @IsOptional()
  @IsString()
  @Matches(DATE_PATTERN, { message: 'endDate must be in YYYY-MM-DD format' })
  endDate?: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(TIME_PATTERN, { message: 'startTime must be in HH:mm 24hr format' })
  startTime: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @Matches(TIME_PATTERN, { message: 'endTime must be in HH:mm 24hr format' })
  endTime: string;

  @ApiProperty({ example: 30, description: 'Duration of each slot in minutes' })
  @IsInt()
  @Min(1)
  appointmentDuration: number;

  @ApiPropertyOptional({ example: '13:00' })
  @IsOptional()
  @IsString()
  @Matches(TIME_PATTERN, { message: 'breakStartTime must be in HH:mm 24hr format' })
  breakStartTime?: string;

  @ApiPropertyOptional({ example: '13:30' })
  @IsOptional()
  @IsString()
  @Matches(TIME_PATTERN, { message: 'breakEndTime must be in HH:mm 24hr format' })
  breakEndTime?: string;
}