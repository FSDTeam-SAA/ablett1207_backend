import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../project/entities/project.entity';
import { Service, ServiceDocument } from '../service/entities/service.entity';
import { Quote, QuoteDocument } from '../quote/entities/quote.entity';
import { Booking, BookingDocument } from '../booking/entities/booking.entity';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,

    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,

    @InjectModel(Quote.name)
    private readonly quoteModel: Model<QuoteDocument>,

    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  // ─── Overview Cards ─────────────────────────────────────────────
  // Total Projects | Total Services | Quote Requests | Book Appointment

  async getOverview() {
    const [totalProjects, totalServices, quoteRequests, bookAppointment] =
      await Promise.all([
        this.projectModel.countDocuments(),
        this.serviceModel.countDocuments(),
        this.quoteModel.countDocuments(),
        this.bookingModel.countDocuments(),
      ]);

    return {
      totalProjects,
      totalServices,
      quoteRequests,
      bookAppointment,
    };
  }

  // ─── Project Statistics Chart (monthly, by year) ────────────────

  async getProjectStatistics(year?: number) {
    const targetYear = year ?? new Date().getFullYear();

    const data = await this.projectModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${targetYear}-01-01`),
            $lte: new Date(`${targetYear}-12-31T23:59:59`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    const monthlyMap = new Map(data.map((d) => [d._id.month, d.count]));

    // Cumulative running total across the year, matching the rising
    // area-chart shape in the design (Jan -> Dec keeps climbing)
    let runningTotal = 0;
    const chartData = MONTHS.map((month, i) => {
      runningTotal += monthlyMap.get(i + 1) ?? 0;
      return {
        month,
        projects: runningTotal,
        newProjects: monthlyMap.get(i + 1) ?? 0,
      };
    });

    return { year: targetYear, chartData };
  }
}