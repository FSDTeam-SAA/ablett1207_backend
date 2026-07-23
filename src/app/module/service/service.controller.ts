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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
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
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { fileUpload } from 'src/app/helpers/fileUploder';
import AuthGuard from 'src/app/middlewares/auth.guard';
import pick from 'src/app/helpers/pick';

@ApiTags('Service')
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a service (admin only)' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FilesInterceptor('images', 5, fileUpload.uploadConfig))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        serviceTitle: { type: 'string', example: 'Residential Construction' },
        coreFeatures: {
          type: 'string',
          example:
            '["Residential Construction","Full Foundation-to-finish Service","New construction on rural lots"]',
          description: 'JSON array string (or comma separated values)',
        },
        description: { type: 'string', example: 'At A7 Property Solutions...' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Up to 5 images',
        },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    const result = await this.serviceService.create(
      createServiceDto,
      images,
    );
    return {
      message: 'Service created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all services (public)' })
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
    const result = await this.serviceService.findAll(params, options);
    return {
      message: 'Services fetched successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single service by id (public)' })
  @ApiParam({ name: 'id', type: String })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const result = await this.serviceService.findOne(id);
    return {
      message: 'Service fetched successfully',
      data: result,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a service by id (admin only)' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FilesInterceptor('images', 5, fileUpload.uploadConfig))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        serviceTitle: { type: 'string', example: '' },
        coreFeatures: { type: 'string', example: '' },
        description: { type: 'string', example: '' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    const result = await this.serviceService.update(
      id,
      updateServiceDto,
      images,
    );
    return {
      message: 'Service updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service by id (admin only)' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiParam({ name: 'id', type: String })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const result = await this.serviceService.remove(id);
    return {
      message: 'Service deleted successfully',
      data: result,
    };
  }
}