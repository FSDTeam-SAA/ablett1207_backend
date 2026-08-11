import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiPropertyOptional({ example: 'Lakeside Family Residence' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'A full-scope residential rebuild...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Full foundation-to-finish residential build' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ example: 'Unstable soil required deep pier foundations' })
  @IsOptional()
  @IsString()
  challenge?: string;

  @ApiPropertyOptional({ example: 'Engineered a helical pier foundation system' })
  @IsOptional()
  @IsString()
  a7Solution?: string;

  @ApiPropertyOptional({ example: 'Delivered 3 weeks ahead of schedule' })
  @IsOptional()
  @IsString()
  result?: string;

  @ApiPropertyOptional({ example: 'Excavator, concrete pump, tower crane' })
  @IsOptional()
  @IsString()
  equipmentsUsed?: string;

  @ApiPropertyOptional({ example: '6 months (Mar 2025 - Sep 2025)' })
  @IsOptional()
  @IsString()
  timeline?: string;

  @ApiPropertyOptional({ example: 'Poured slab foundation, framing complete' })
  @IsOptional()
  @IsString()
  constructionProcess?: string;

  @ApiPropertyOptional({ example: 'Client was closely involved in material selection' })
  @IsOptional()
  @IsString()
  projectExperience?: string;
}