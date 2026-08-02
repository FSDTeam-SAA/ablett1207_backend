import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'Jerome K.' })
  @IsString()
  name: string;

  @ApiProperty({ example: '(017) 555-0124' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: 'jerome@mail.co' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '5558 Green Rd.' })
  @IsString()
  projectLocation: string;

  @ApiPropertyOptional({ example: 'Would like to discuss kitchen remodel.' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    example: '6863f1b2a1e2c8a1b8f1e2c8',
    description: 'The _id of the Schedule document (the day)',
  })
  @IsMongoId()
  scheduleId: string;

  @ApiProperty({
    example: '6863f1b2a1e2c8a1b8f1e2c9',
    description: 'The _id of the specific slot inside that schedule\'s "slots" array',
  })
  @IsMongoId()
  slotId: string;
}