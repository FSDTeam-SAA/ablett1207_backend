import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from '../project/entities/project.entity';
import { Service, ServiceSchema } from '../service/entities/service.entity';
import { Quote, QuoteSchema } from '../quote/entities/quote.entity';
import { Booking, BookingSchema } from '../booking/entities/booking.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashbaord.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Quote.name, schema: QuoteSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}