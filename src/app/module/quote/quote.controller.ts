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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { fileUpload } from 'src/app/helpers/fileUploder';
import AuthGuard from 'src/app/middlewares/auth.guard';
import pick from 'src/app/helpers/pick';
import { PROJECT_STATUSES } from './entities/quote.entity';

@ApiTags('Quote')
@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a quote request (public)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo', fileUpload.uploadConfig))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        phoneNumber: { type: 'string', example: '+1 555 123 4567' },
        email: { type: 'string', example: 'john@example.com' },
        location: { type: 'string', example: 'Austin, TX' },
        projectName: { type: 'string', example: 'Backyard Deck Renovation' },
        projectBudget: { type: 'string', example: '$5,000 - $10,000' },
        projectStatus: {
          type: 'string',
          enum: PROJECT_STATUSES as unknown as string[],
          example: 'normal',
        },
        message: { type: 'string', example: 'Write your message here...' },
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createQuoteDto: CreateQuoteDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    const result = await this.quoteService.create(createQuoteDto, photo);
    return {
      message: 'Quote request submitted successfully',
      data: result,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a quote request (public)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo', fileUpload.uploadConfig))
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: '' },
        phoneNumber: { type: 'string', example: '' },
        email: { type: 'string', example: '' },
        location: { type: 'string', example: '' },
        projectName: { type: 'string', example: '' },
        projectBudget: { type: 'string', example: '' },
        projectStatus: {
          type: 'string',
          enum: PROJECT_STATUSES as unknown as string[],
        },
        message: { type: 'string', example: '' },
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    const result = await this.quoteService.update(id, updateQuoteDto, photo);
    return {
      message: 'Quote request updated successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all quote requests, filterable by status (admin only)' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiQuery({ name: 'searchTerm', required: false, type: String, example: '' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PROJECT_STATUSES as unknown as string[],
    description: 'Filter by project status, e.g. emergency',
  })
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
    const params = pick(req.query, ['searchTerm', 'status']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.quoteService.findAll(params, options);
    return {
      message: 'Quote requests fetched successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single quote request by id (admin only)' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiParam({ name: 'id', type: String })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const result = await this.quoteService.findOne(id);
    return {
      message: 'Quote request fetched successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quote request by id (admin only)' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiParam({ name: 'id', type: String })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const result = await this.quoteService.remove(id);
    return {
      message: 'Quote request deleted successfully',
      data: result,
    };
  }
}