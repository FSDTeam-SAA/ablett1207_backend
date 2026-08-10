import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { fileUpload } from 'src/app/helpers/fileUploder';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import { IFilterParams } from 'src/app/helpers/pick';

const projectSearchAbleFields = [
  'projectName',
  'location',
  'projectType',
  'category',
  'description',
];

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  private async uploadImages(files?: Express.Multer.File[]) {
    if (!files?.length) return [];
    const uploaded = await Promise.all(
      files.map((file) => fileUpload.uploadToCloudinary(file)),
    );
    return uploaded.map((item) => item.url);
  }

  async create(dto: CreateProjectDto, files?: Express.Multer.File[]) {
    const images = await this.uploadImages(files);
    return this.projectModel.create({ ...dto, images });
  }

  async findAll(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereConditions = buildWhereConditions(
      params,
      projectSearchAbleFields,
    );

    const total = await this.projectModel.countDocuments(whereConditions);
    const data = await this.projectModel
      .find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder } as any);

    return {
      meta: { page, limit, total },
      data,
    };
  }

  async findOne(id: string) {
    const result = await this.projectModel.findById(id);
    if (!result) {
      throw new HttpException('Project not found', 404);
    }
    return result;
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    files?: Express.Multer.File[],
  ) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new HttpException('Project not found', 404);
    }

    const payload: Record<string, unknown> = { ...dto };
    if (files?.length) {
      payload.images = await this.uploadImages(files);
    }

    return this.projectModel.findByIdAndUpdate(id, payload, { new: true });
  }

  async remove(id: string) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new HttpException('Project not found', 404);
    }
    return this.projectModel.findByIdAndDelete(id);
  }
}