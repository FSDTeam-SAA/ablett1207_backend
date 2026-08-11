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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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
import { ProjectService, ProjectImageFiles } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { fileUpload } from 'src/app/helpers/fileUploder';
import AuthGuard from 'src/app/middlewares/auth.guard';
import pick from 'src/app/helpers/pick';

const IMAGE_FIELDS = [
  { name: 'coverImage', maxCount: 1 },
  { name: 'before', maxCount: 1 },
  { name: 'during', maxCount: 1 },
  { name: 'completed', maxCount: 1 },
];

const PROJECT_BODY_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', example: 'Lakeside Family Residence' },
    description: { type: 'string', example: 'A full-scope residential rebuild...' },
    scope: { type: 'string', example: 'Full foundation-to-finish residential build' },
    challenge: { type: 'string', example: 'Unstable soil required deep pier foundations' },
    a7Solution: { type: 'string', example: 'Engineered a helical pier foundation system' },
    result: { type: 'string', example: 'Delivered 3 weeks ahead of schedule' },
    equipmentsUsed: { type: 'string', example: 'Excavator, concrete pump, tower crane' },
    timeline: { type: 'string', example: '6 months (Mar 2025 - Sep 2025)' },
    constructionProcess: { type: 'string', example: 'Poured slab foundation, framing complete' },
    projectExperience: { type: 'string', example: 'Client was closely involved in material selection' },
    coverImage: { type: 'string', format: 'binary' },
    before: { type: 'string', format: 'binary' },
    during: { type: 'string', format: 'binary' },
    completed: { type: 'string', format: 'binary' },
  },
};

@ApiTags('Project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: 'Create a project (admin only) - every field optional' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileFieldsInterceptor(IMAGE_FIELDS, fileUpload.uploadConfig))
  @ApiBody({ schema: PROJECT_BODY_SCHEMA })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @UploadedFiles() files?: { [fieldname: string]: Express.Multer.File[] },
  ) {
    const result = await this.projectService.create(
      createProjectDto,
      files as ProjectImageFiles,
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
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], example: 'desc' })
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
  @ApiOperation({ summary: 'Update a project by id (admin only) - every field optional' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileFieldsInterceptor(IMAGE_FIELDS, fileUpload.uploadConfig))
  @ApiBody({ schema: PROJECT_BODY_SCHEMA })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @UploadedFiles() files?: { [fieldname: string]: Express.Multer.File[] },
  ) {
    const result = await this.projectService.update(
      id,
      updateProjectDto,
      files as ProjectImageFiles,
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