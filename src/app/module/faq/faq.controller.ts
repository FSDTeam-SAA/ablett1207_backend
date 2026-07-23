import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import AuthGuard from 'src/app/middlewares/auth.guard';
import pick from 'src/app/helpers/pick';

@ApiTags('Faq')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  @ApiOperation({ summary: 'Create a FAQ (admin only)' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiBody({ type: CreateFaqDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createFaqDto: CreateFaqDto) {
    const result = await this.faqService.create(createFaqDto);
    return {
      message: 'FAQ created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all FAQs (public)' })
  @ApiQuery({ name: 'searchTerm', required: false, type: String, example: '' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @HttpCode(HttpStatus.OK)
  async findAll(@Req() req: Request) {
    const params = pick(req.query, ['searchTerm']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.faqService.findAll(params, options);
    return {
      message: 'FAQs fetched successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single FAQ by id (public)' })
  @ApiParam({ name: 'id', type: String })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const result = await this.faqService.findOne(id);
    return {
      message: 'FAQ fetched successfully',
      data: result,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a FAQ by id (admin only)' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiBody({ type: UpdateFaqDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
    const result = await this.faqService.update(id, updateFaqDto);
    return {
      message: 'FAQ updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a FAQ by id (admin only)' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiParam({ name: 'id', type: String })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const result = await this.faqService.remove(id);
    return {
      message: 'FAQ deleted successfully',
      data: result,
    };
  }
}