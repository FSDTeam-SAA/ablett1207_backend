import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq, FaqDocument } from './entities/faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import { IFilterParams } from 'src/app/helpers/pick';

const faqSearchAbleFields = ['question', 'answer'];

@Injectable()
export class FaqService {
  constructor(
    @InjectModel(Faq.name) private readonly faqModel: Model<FaqDocument>,
  ) {}

  async create(dto: CreateFaqDto) {
    return this.faqModel.create(dto);
  }

  async findAll(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereConditions = buildWhereConditions(params, faqSearchAbleFields);

    const total = await this.faqModel.countDocuments(whereConditions);
    const data = await this.faqModel
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
    const result = await this.faqModel.findById(id);
    if (!result) {
      throw new HttpException('FAQ not found', 404);
    }
    return result;
  }

  async update(id: string, dto: UpdateFaqDto) {
    const faq = await this.faqModel.findById(id);
    if (!faq) {
      throw new HttpException('FAQ not found', 404);
    }
    return this.faqModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async remove(id: string) {
    const faq = await this.faqModel.findById(id);
    if (!faq) {
      throw new HttpException('FAQ not found', 404);
    }
    return this.faqModel.findByIdAndDelete(id);
  }
}