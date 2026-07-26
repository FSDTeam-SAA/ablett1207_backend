import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';
import {
  PROJECT_STATUSES,
  type ProjectStatus,
} from '../entities/quote.entity';

export class CreateQuoteDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+1 555 123 4567' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Austin, TX' })
  @IsString()
  location: string;

  @ApiProperty({ example: 'Backyard Deck Renovation' })
  @IsString()
  projectName: string;

  @ApiProperty({ example: '$5,000 - $10,000' })
  @IsString()
  projectBudget: string;

  @ApiPropertyOptional({
    enum: PROJECT_STATUSES,
    example: 'normal',
    description:
      'normal | emergency. If "emergency" is selected, the request is also emailed to the admin automatically.',
  })
  @IsOptional()
  @IsIn(PROJECT_STATUSES)
  projectStatus?: ProjectStatus;

  @ApiProperty({ example: 'Write your message here...' })
  @IsString()
  message: string;
}
