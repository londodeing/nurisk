import { Controller, Get, Query } from '@nestjs/common';

import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('summary')
  async getDashboardStats(
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('region') region?: string,
  ) {
    return this.analyticsService.getDashboardStats(startDate, endDate, region);
  }

  @Get('regional/:region')
  async getRegionalStats(@Query('region') region: string) {
    return this.analyticsService.getRegionalStats(region);
  }

  @Get('trends')
  async getTrendData(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getTrendData(daysNum);
  }

  @Get('distribution')
  async getDisasterTypeDistribution(@Query('region') region?: string) {
    return this.analyticsService.getDisasterTypeDistribution(region);
  }

  @Get('audit-logs')
  async getAuditLogs(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.analyticsService.getAuditLogs(limitNum);
  }
}