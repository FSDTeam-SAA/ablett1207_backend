import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quote, QuoteDocument } from './entities/quote.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { fileUpload } from 'src/app/helpers/fileUploder';
import sendMailer from 'src/app/helpers/sendMailer';
import config from 'src/app/config';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import { IFilterParams } from 'src/app/helpers/pick';

const quoteSearchAbleFields = [
  'name',
  'email',
  'phoneNumber',
  'projectName',
  'location',
];

@Injectable()
export class QuoteService {
  constructor(
    @InjectModel(Quote.name) private readonly quoteModel: Model<QuoteDocument>,
  ) {}

  private buildEmergencyEmailHtml(quote: QuoteDocument) {
    return `
      <h2>🚨 Emergency Quote Request</h2>
      <p><strong>Name:</strong> ${quote.name}</p>
      <p><strong>Phone:</strong> ${quote.phoneNumber}</p>
      <p><strong>Email:</strong> ${quote.email}</p>
      <p><strong>Location:</strong> ${quote.location}</p>
      <p><strong>Project Name:</strong> ${quote.projectName}</p>
      <p><strong>Project Budget:</strong> ${quote.projectBudget}</p>
      <p><strong>Status:</strong> ${quote.projectStatus}</p>
      <p><strong>Message:</strong> ${quote.message}</p>
      ${quote.photo ? `<p><strong>Photo:</strong> <a href="${quote.photo}">${quote.photo}</a></p>` : ''}
    `;
  }

  private async notifyAdminIfEmergency(quote: QuoteDocument) {
    if (quote.projectStatus !== 'emergency') return;
    if (!config.email.admin) return;

    try {
      await sendMailer(
        config.email.admin,
        `Emergency Quote Request - ${quote.projectName}`,
        this.buildEmergencyEmailHtml(quote),
      );
    } catch (error) {
      // Don't fail the request creation if the email fails to send
      console.error('Failed to send emergency quote email:', error);
    }
  }

  async create(dto: CreateQuoteDto, file?: Express.Multer.File) {
    let photo: string | null = null;
    if (file) {
      const uploaded = await fileUpload.uploadToCloudinary(file);
      photo = uploaded.url;
    }

    const created = await this.quoteModel.create({ ...dto, photo });
    await this.notifyAdminIfEmergency(created);
    return created;
  }

  async findAll(params: IFilterParams & { status?: string }, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const { status, ...restParams } = params;
    const whereConditions = buildWhereConditions(
      restParams,
      quoteSearchAbleFields,
    );

    if (status) {
      (whereConditions as Record<string, unknown>).projectStatus = status;
    }

    const total = await this.quoteModel.countDocuments(whereConditions);
    const data = await this.quoteModel
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
    const result = await this.quoteModel.findById(id);
    if (!result) {
      throw new HttpException('Quote request not found', 404);
    }
    return result;
  }

  async update(id: string, dto: UpdateQuoteDto, file?: Express.Multer.File) {
    const quote = await this.quoteModel.findById(id);
    if (!quote) {
      throw new HttpException('Quote request not found', 404);
    }

    const payload: Record<string, unknown> = { ...dto };
    if (file) {
      const uploaded = await fileUpload.uploadToCloudinary(file);
      payload.photo = uploaded.url;
    }

    const updated = await this.quoteModel.findByIdAndUpdate(id, payload, {
      new: true,
    });

    if (updated) {
      await this.notifyAdminIfEmergency(updated);
    }

    return updated;
  }

  async remove(id: string) {
    const quote = await this.quoteModel.findById(id);
    if (!quote) {
      throw new HttpException('Quote request not found', 404);
    }
    return this.quoteModel.findByIdAndDelete(id);
  }
}