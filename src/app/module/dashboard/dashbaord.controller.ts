import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import AuthGuard from 'src/app/middlewares/auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('admin'))
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Get overview stat cards (admin only)',
    description:
      'Total Projects, Total Services, Quote Requests, Book Appointment counts.',
  })
  @HttpCode(HttpStatus.OK)
  async getOverview() {
    const result = await this.dashboardService.getOverview();
    return {
      message: 'Overview fetched successfully',
      data: result,
    };
  }

  @Get('project-statistics')
  @ApiOperation({
    summary: 'Get project statistics chart data, monthly (admin only)',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    example: 2026,
    description: 'Defaults to the current year.',
  })
  @HttpCode(HttpStatus.OK)
  async getProjectStatistics(@Query('year') year?: string) {
    const result = await this.dashboardService.getProjectStatistics(
      year ? Number(year) : undefined,
    );
    return {
      message: 'Project statistics fetched successfully',
      data: result,
    };
  }
}