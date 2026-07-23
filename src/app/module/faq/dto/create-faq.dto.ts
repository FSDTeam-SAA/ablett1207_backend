import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateFaqDto {
  @ApiProperty({ example: 'What areas do you service?' })
  @IsString()
  question: string;

  @ApiProperty({ example: 'We currently operate across the entire state.' })
  @IsString()
  answer: string;
}