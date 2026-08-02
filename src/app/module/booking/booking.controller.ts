import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { BookingService } from './booking.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import AuthGuard from 'src/app/middlewares/auth.guard';
import pick from 'src/app/helpers/pick';
import { BOOKING_STATUSES } from './entities/booking.entity';

@ApiTags('Booking')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // ---------- ADMIN: schedule + slot generation ----------

  @Post('schedule')
  @ApiOperation({
    summary:
      'Admin sets working hours + break -> slots are generated automatically',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiBody({ type: CreateScheduleDto })
  @HttpCode(HttpStatus.CREATED)
  async createSchedule(@Body() createScheduleDto: CreateScheduleDto) {
    const result = await this.bookingService.createSchedule(createScheduleDto);
    return {
      message: `Schedule saved, ${result.totalSlotsGenerated} slot(s) generated across ${result.daysCovered} day(s)`,
      data: result,
    };
  }

  @Get('schedule')
  @ApiOperation({ summary: 'Get all schedules with their slots (admin only)' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async findAllSchedules() {
    const result = await this.bookingService.findAllSchedules();
    return {
      message: 'Schedules fetched successfully',
      data: result,
    };
  }

  // ---------- PUBLIC: view available slots ----------

  @Get('slots/available-dates')
  @ApiOperation({ summary: 'Get dates that currently have available slots (public)' })
  @HttpCode(HttpStatus.OK)
  async availableDates() {
    const result = await this.bookingService.findAvailableDates();
    return {
      message: 'Available dates fetched successfully',
      data: result,
    };
  }

  @Get('slots')
  @ApiOperation({ summary: 'Get available slots for a specific date (public)' })
  @ApiQuery({ name: 'date', required: true, example: '2026-06-18' })
  @HttpCode(HttpStatus.OK)
  async availableSlots(@Query('date') date: string) {
    const result = await this.bookingService.findAvailableSlotsByDate(date);
    return {
      message: 'Available slots fetched successfully',
      data: result,
    };
  }

  // ---------- PUBLIC: request a booking ----------

  @Post()
  @ApiOperation({ summary: 'Request a booking for a slot (public)' })
  @ApiBody({ type: CreateBookingDto })
  @HttpCode(HttpStatus.CREATED)
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    const result = await this.bookingService.createBooking(createBookingDto);
    return {
      message: 'Booking request submitted, awaiting admin approval',
      data: result,
    };
  }

  // ---------- ADMIN: manage bookings ----------

  @Get()
  @ApiOperation({ summary: 'Get all bookings, filterable by status (admin only)' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiQuery({ name: 'searchTerm', required: false, type: String, example: '' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: BOOKING_STATUSES as unknown as string[],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], example: 'desc' })
  @HttpCode(HttpStatus.OK)
  async findAllBookings(@Req() req: Request) {
    const params = pick(req.query, ['searchTerm', 'status']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.bookingService.findAllBookings(params, options);
    return {
      message: 'Bookings fetched successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single booking (admin only)' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiParam({ name: 'id', type: String })
  @HttpCode(HttpStatus.OK)
  async findOneBooking(@Param('id') id: string) {
    const result = await this.bookingService.findOneBooking(id);
    return {
      message: 'Booking fetched successfully',
      data: result,
    };
  }

  @Put(':id')
  @ApiOperation({
    summary:
      'Accept / reject / complete a booking (admin only) - body: { "action": "accept" | "reject" | "complete" }',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiBody({ type: UpdateBookingDto })
  @HttpCode(HttpStatus.OK)
  async updateBooking(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    const result = await this.bookingService.updateBookingStatus(
      id,
      updateBookingDto,
    );
    const messages: Record<string, string> = {
      accept: 'Booking accepted successfully',
      reject: 'Booking rejected successfully',
      complete: 'Booking marked as completed successfully',
    };
    return {
      message: messages[updateBookingDto.action],
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a booking record (admin only)' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiParam({ name: 'id', type: String })
  @HttpCode(HttpStatus.OK)
  async removeBooking(@Param('id') id: string) {
    const result = await this.bookingService.removeBooking(id);
    return {
      message: 'Booking deleted successfully',
      data: result,
    };
  }
}