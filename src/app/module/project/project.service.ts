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
  'title',
  'description',
  'scope',
  'challenge',
  'timeline',
];

export interface ProjectImageFiles {
  coverImage?: Express.Multer.File[];
  before?: Express.Multer.File[];
  during?: Express.Multer.File[];
  completed?: Express.Multer.File[];
}

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  private async uploadNamedImages(files?: ProjectImageFiles) {
    const result: Record<string, string> = {};
    if (!files) return result;

    const entries = Object.entries(files) as [
      keyof ProjectImageFiles,
      Express.Multer.File[] | undefined,
    ][];

    await Promise.all(
      entries.map(async ([field, fileArray]) => {
        const file = fileArray?.[0];
        if (!file) return;
        const uploaded = await fileUpload.uploadToCloudinary(file);
        result[field] = uploaded.url;
      }),
    );

    return result;
  }

  async create(dto: CreateProjectDto, files?: ProjectImageFiles) {
    const images = await this.uploadNamedImages(files);
    return this.projectModel.create({ ...dto, ...images });
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

  async update(id: string, dto: UpdateProjectDto, files?: ProjectImageFiles) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new HttpException('Project not found', 404);
    }

    const images = await this.uploadNamedImages(files);

    return this.projectModel.findByIdAndUpdate(
      id,
      { ...dto, ...images },
      { new: true },
    );
  }

  async remove(id: string) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new HttpException('Project not found', 404);
    }
    return this.projectModel.findByIdAndDelete(id);
  }
}