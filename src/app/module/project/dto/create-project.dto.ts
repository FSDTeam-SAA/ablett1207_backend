import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Lakeside Family Residence' })
  @IsString()
  projectName: string;

  @ApiProperty({ example: 'Austin, TX' })
  @IsString()
  location: string;

  @ApiProperty({ example: 'New Construction' })
  @IsString()
  projectType: string;

  @ApiProperty({
    example: 'Residential',
    description: 'Free text category, handled/validated by the frontend',
  })
  @IsString()
  category: string;

  @ApiProperty({ example: 'March 2025' })
  @IsString()
  completion: string;

  @ApiProperty({ example: '6 months' })
  @IsString()
  duration: string;

  @ApiProperty({ example: 'Describe your project in detail...' })
  @IsString()
  description: string;
}