import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import { AnalyticsRepository } from './analytics.repository';

import type { AnalyticsDashboard, DashboardSummary, TimeSeriesPoint, AnalyticsFilter, MetricValue } from '@nurisk/shared-types';

@Injectable()
export class AnalyticsService {
  constructor(
    private analyticsRepository: AnalyticsRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async getDashboardStats(startDate?: string, endDate?: string, region?: string) {
    const stats = await this.analyticsRepository.getDashboardStats(startDate, endDate, region);

    return {
      success: true,
      data: stats,
    };
  }

  async getRegionalStats(region: string) {
    const stats = await this.analyticsRepository.getRegionalStats(region);

    return {
      success: true,
      data: stats,
    };
  }

  async getTrendData(days: number = 30) {
    const trends = await this.analyticsRepository.getTrendData(days);

    return {
      success: true,
      data: trends,
    };
  }

  async getDisasterTypeDistribution(region?: string) {
    const distribution = await this.analyticsRepository.getDisasterTypeDistribution(region);

    return {
      success: true,
      data: distribution,
    };
  }

  async getAuditLogs(limit: number = 100) {
    const logs = await this.analyticsRepository.getAuditLogs(limit);

    return {
      success: true,
      data: logs,
      count: logs.length,
    };
  }
}