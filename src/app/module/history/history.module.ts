import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoryRecord, HistorySchema } from './entity/history.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HistoryRecord.name, schema: HistorySchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class HistoryModule {}
