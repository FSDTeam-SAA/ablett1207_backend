import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Faq, FaqSchema } from './entities/faq.entity';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Faq.name, schema: FaqSchema }])],
  controllers: [FaqController],
  providers: [FaqService],
})
export class FaqModule {}