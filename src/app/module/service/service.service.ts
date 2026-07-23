import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service, ServiceDocument } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { fileUpload } from 'src/app/helpers/fileUploder';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import { IFilterParams } from 'src/app/helpers/pick';

const serviceSearchAbleFields = ['serviceTitle', 'description'];

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  private async uploadImages(files?: Express.Multer.File[]) {
    if (!files?.length) return [];
    const uploaded = await Promise.all(
      files.map((file) => fileUpload.uploadToCloudinary(file)),
    );
    return uploaded.map((item) => item.url);
  }

  async create(dto: CreateServiceDto, files?: Express.Multer.File[]) {
    const images = await this.uploadImages(files);
    const created = await this.serviceModel.create({ ...dto, images });
    return created;
  }

  async findAll(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereConditions = buildWhereConditions(
      params,
      serviceSearchAbleFields,
    );

    const total = await this.serviceModel.countDocuments(whereConditions);
    const data = await this.serviceModel
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
    const result = await this.serviceModel.findById(id);
    if (!result) {
      throw new HttpException('Service not found', 404);
    }
    return result;
  }

  async update(
    id: string,
    dto: UpdateServiceDto,
    files?: Express.Multer.File[],
  ) {
    const service = await this.serviceModel.findById(id);
    if (!service) {
      throw new HttpException('Service not found', 404);
    }

    const payload: Record<string, unknown> = { ...dto };
    if (files?.length) {
      payload.images = await this.uploadImages(files);
    }

    const updated = await this.serviceModel.findByIdAndUpdate(id, payload, {
      new: true,
    });
    return updated;
  }

  async remove(id: string) {
    const service = await this.serviceModel.findById(id);
    if (!service) {
      throw new HttpException('Service not found', 404);
    }
    return this.serviceModel.findByIdAndDelete(id);
  }
}