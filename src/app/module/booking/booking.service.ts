import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule, ScheduleDocument } from './entities/schedule.entity';
import { Booking, BookingDocument } from './entities/booking.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { generateSlots, getDateRange } from 'src/app/helpers/generateSlots';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import { IFilterParams } from 'src/app/helpers/pick';

const bookingSearchAbleFields = ['name', 'email', 'phoneNumber', 'projectLocation'];

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<ScheduleDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  // ---------- ADMIN: set schedule, auto-generate slots ----------

  async createSchedule(dto: CreateScheduleDto) {
    if (
      (dto.breakStartTime && !dto.breakEndTime) ||
      (!dto.breakStartTime && dto.breakEndTime)
    ) {
      throw new BadRequestException(
        'breakStartTime and breakEndTime must be provided together',
      );
    }

    const endDate = dto.endDate ?? dto.startDate;

    const dailySlotTimes = generateSlots({
      startTime: dto.startTime,
      endTime: dto.endTime,
      durationMinutes: dto.appointmentDuration,
      breakStartTime: dto.breakStartTime ?? null,
      breakEndTime: dto.breakEndTime ?? null,
    });

    if (!dailySlotTimes.length) {
      throw new BadRequestException(
        'No slots could be generated with the given time range, duration, and break',
      );
    }

    const dates = getDateRange(dto.startDate, endDate);

    const schedules = await Promise.all(
      dates.map((date) =>
        this.scheduleModel.findOneAndUpdate(
          { date },
          {
            date,
            startTime: dto.startTime,
            endTime: dto.endTime,
            appointmentDuration: dto.appointmentDuration,
            breakStartTime: dto.breakStartTime ?? null,
            breakEndTime: dto.breakEndTime ?? null,
            slots: dailySlotTimes.map((s) => ({ ...s, status: 'available' })),
          },
          { upsert: true, new: true },
        ),
      ),
    );

    return {
      schedules,
      slotsPerDay: dailySlotTimes.length,
      daysCovered: dates.length,
      totalSlotsGenerated: dailySlotTimes.length * dates.length,
    };
  }

  async findAllSchedules() {
    return this.scheduleModel.find().sort({ date: 1 });
  }

  // ---------- PUBLIC: see only available slots ----------

  async findAvailableSlotsByDate(date: string) {
    const schedule = await this.scheduleModel.findOne({ date });
    if (!schedule) return [];

    return schedule.slots
      .filter((slot) => slot.status === 'available')
      .map((slot) => ({
        scheduleId: schedule._id,
        slotId: slot._id,
        date: schedule.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));
  }

  async findAvailableDates() {
    const schedules = await this.scheduleModel.find({
      'slots.status': 'available',
    });

    return schedules.map((schedule) => ({
      date: schedule.date,
      availableCount: schedule.slots.filter((s) => s.status === 'available')
        .length,
    }));
  }

  // ---------- BOOKING: public request, admin accept/reject/complete ----------

  async createBooking(dto: CreateBookingDto) {
    const schedule = await this.scheduleModel.findById(dto.scheduleId);
    if (!schedule) {
      throw new HttpException('Schedule not found', 404);
    }

    const slot = schedule.slots.id(dto.slotId);
    if (!slot) {
      throw new HttpException('Slot not found', 404);
    }
    if (slot.status !== 'available') {
      throw new ConflictException(
        'This slot is no longer available. Please choose another slot.',
      );
    }

    const booking = await this.bookingModel.create({
      ...dto,
      status: 'pending',
    });

    // Lock it immediately so two people can't request the same slot
    slot.status = 'pending';
    await schedule.save();

    return booking;
  }

  async findAllBookings(
    params: IFilterParams & { status?: string },
    options: IOptions,
  ) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const { status, ...restParams } = params;
    const whereConditions = buildWhereConditions(
      restParams,
      bookingSearchAbleFields,
    );

    if (status) {
      (whereConditions as Record<string, unknown>).status = status;
    }

    const total = await this.bookingModel.countDocuments(whereConditions);
    const data = await this.bookingModel
      .find(whereConditions)
      .populate('scheduleId')
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder } as any);

    return { meta: { page, limit, total }, data };
  }

  async findOneBooking(id: string) {
    const result = await this.bookingModel.findById(id).populate('scheduleId');
    if (!result) {
      throw new HttpException('Booking not found', 404);
    }
    return result;
  }

  async updateBookingStatus(id: string, dto: UpdateBookingDto) {
    const booking = await this.bookingModel.findById(id);
    if (!booking) {
      throw new HttpException('Booking not found', 404);
    }

    const schedule = await this.scheduleModel.findById(booking.scheduleId);
    if (!schedule) {
      throw new HttpException('Linked schedule not found', 404);
    }

    const slot = schedule.slots.id(booking.slotId);
    if (!slot) {
      throw new HttpException('Linked slot not found', 404);
    }

    if (dto.action === 'accept') {
      if (booking.status !== 'pending') {
        throw new BadRequestException('Only a pending booking can be accepted');
      }
      booking.status = 'scheduled';
      slot.status = 'scheduled';
    }

    if (dto.action === 'reject') {
      if (booking.status !== 'pending') {
        throw new BadRequestException('Only a pending booking can be rejected');
      }
      booking.status = 'cancelled';
      slot.status = 'available';
    }

    if (dto.action === 'complete') {
      if (booking.status !== 'scheduled') {
        throw new BadRequestException(
          'Only a scheduled booking can be marked as completed',
        );
      }
      booking.status = 'completed';
      slot.status = 'completed';
    }

    await schedule.save();
    await booking.save();

    return booking;
  }

  async removeBooking(id: string) {
    const booking = await this.bookingModel.findById(id);
    if (!booking) {
      throw new HttpException('Booking not found', 404);
    }
    return this.bookingModel.findByIdAndDelete(id);
  }
}