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
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { fileUpload } from 'src/app/helpers/fileUploder';
import AuthGuard from 'src/app/middlewares/auth.guard';
import pick from 'src/app/helpers/pick';

@ApiTags('Project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: 'Create a project (admin only)' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FilesInterceptor('images', 5, fileUpload.uploadConfig))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        projectName: { type: 'string', example: 'Lakeside Family Residence' },
        location: { type: 'string', example: 'Austin, TX' },
        projectType: { type: 'string', example: 'New Construction' },
        category: { type: 'string', example: 'Residential' },
        completion: { type: 'string', example: 'March 2025' },
        duration: { type: 'string', example: '6 months' },
        description: { type: 'string', example: 'Describe your project in detail...' },
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
    @Body() createProjectDto: CreateProjectDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    const result = await this.projectService.create(
      createProjectDto,
      images,
    );
    return {
      message: 'Project created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects (public)' })
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
    const result = await this.projectService.findAll(params, options);
    return {
      message: 'Projects fetched successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single project by id (public)' })
  @ApiParam({ name: 'id', type: String })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const result = await this.projectService.findOne(id);
    return {
      message: 'Project fetched successfully',
      data: result,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project by id (admin only)' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FilesInterceptor('images', 5, fileUpload.uploadConfig))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        projectName: { type: 'string', example: '' },
        location: { type: 'string', example: '' },
        projectType: { type: 'string', example: '' },
        category: { type: 'string', example: '' },
        completion: { type: 'string', example: '' },
        duration: { type: 'string', example: '' },
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
    @Body() updateProjectDto: UpdateProjectDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    const result = await this.projectService.update(
      id,
      updateProjectDto,
      images,
    );
    return {
      message: 'Project updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project by id (admin only)' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiParam({ name: 'id', type: String })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const result = await this.projectService.remove(id);
    return {
      message: 'Project deleted successfully',
      data: result,
    };
  }
}