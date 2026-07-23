import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

const parseArray = ({ value }: { value: unknown }) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // not JSON, fall back to comma separated string
    }
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return value;
};

export class CreateServiceDto {
  @ApiProperty({ example: 'Residential Construction' })
  @IsString()
  serviceTitle: string;

  @ApiProperty({
    example: [
      'Residential Construction',
      'Full Foundation-to-finish Service',
      'New construction on rural lots',
    ],
    type: [String],
    description:
      'Send as a JSON array string in Swagger form-data, e.g. ["Feature 1","Feature 2"]',
  })
  @Transform(parseArray)
  @IsArray()
  @IsString({ each: true })
  coreFeatures: string[];

  @ApiProperty({
    example:
      'At A7 Property Solutions, we believe every home should be as unique as the family living in it...',
  })
  @IsString()
  description: string;
}