import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiPropertyOptional({
    example: 'Hello, I need help with my booking.',
    description: 'Optional when at least one attachment is uploaded.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  text?: string;

  @ApiPropertyOptional({
    description: 'Required only when an admin replies to a user.',
  })
  @IsOptional()
  @IsMongoId()
  userId?: string;
}
