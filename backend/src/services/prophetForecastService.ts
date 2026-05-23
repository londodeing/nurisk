import { Injectable, Logger } from '@nestjs/common';
import pool from '../config/database';

export interface ForecastResult {
  metric: string;
  predictions: ForecastPrediction[];
  trend: 'increasing' | 'stable' | 'decreasing';
  seasonality: Record<string, number>;
  confidence: number;
  generatedAt: Date;
}

export interface ForecastPrediction {
  date: Date;
  value: number;
  lower: number;
  upper: number;
}

export interface ForecastInput {
  metric: 'incident_volume' | 'resource_demand' | 'volunteer_availability';
  days: number;
  region?: string;
}

@Injectable()
export class ProphetForecastService {
  private readonly logger = new Logger(ProphetForecastService.name);

  /**
   * Generate forecast
   */
  async forecast(input: ForecastInput): Promise<ForecastResult> {
    const { metric, days, region } = input;

    // Get historical data
    const historical = await this.getHistoricalData(metric, region);

    // Calculate trend
    const trend = this.calculateTrend(historical);

    // Calculate seasonality
    const seasonality = this.calculateSeasonality(historical);

    // Generate predictions
    const predictions = this.generatePredictions(historical, days);

    // Calculate confidence
    const confidence = this.calculateConfidence(historical);

    return {
      metric,
      predictions,
      trend,
      seasonality,
      confidence,
      generatedAt: new Date(),
    };
  }

  /**
   * Get historical data
   */
  private async getHistoricalData(metric: string, region?: string): Promise<number[]> {
    const tableMap: Record<string, string> = {
      incident_volume: 'incidents',
      resource_demand: 'resource_requests',
      volunteer_availability: 'volunteers',
    };

    const table = tableMap[metric] || 'incidents';
    const whereClause = region ? `WHERE region = $1` : '';

    try {
      const result = await pool.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM ${table}
        ${whereClause}
        AND created_at > NOW() - INTERVAL '90 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `, region ? [region] : []);

      return result.rows.map((row) => parseInt(row.count));
    } catch (error) {
      this.logger.error(`Failed to get historical data: ${error}`);
      throw error;
    }
  }

  /**
   * Calculate trend
   */
  private calculateTrend(data: number[]): 'increasing' | 'stable' | 'decreasing' {
    if (data.length < 7) return 'stable';

    const recent = data.slice(-7);
    const previous = data.slice(-14, -7);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const prevAvg = previous.reduce((a, b) => a + b, 0) / previous.length;

    const change = (recentAvg - prevAvg) / prevAvg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate seasonality
   */
  private calculateSeasonality(data: number[]): Record<string, number> {
    const seasonality: Record<string, number> = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    };

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // Group by day of week
    const dayCounts: number[][] = [[], [], [], [], [], [], [], []];
    for (let i = 0; i < data.length; i++) {
      const dayIndex = i % 7;
      dayCounts[dayIndex].push(data[i]);
    }

    // Calculate averages
    for (let i = 0; i < 7; i++) {
      if (dayCounts[i].length > 0) {
        seasonality[days[i]] = dayCounts[i].reduce((a, b) => a + b, 0) / dayCounts[i].length;
      }
    }

    return seasonality;
  }

  /**
   * Generate predictions
   */
  private generatePredictions(historical: number[], days: number): ForecastPrediction[] {
    const predictions: ForecastPrediction[] = [];
    const avg = historical.reduce((a, b) => a + b, 0) / historical.length;
    const stdDev = this.calculateStdDev(historical, avg);

    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      // Simple prediction: average with slight variation
      const value = avg + (Math.random() - 0.5) * stdDev * 0.5;

      predictions.push({
        date,
        value: Math.max(0, Math.round(value)),
        lower: Math.max(0, Math.round(value - stdDev)),
        upper: Math.round(value + stdDev),
      });
    }

    return predictions;
  }

  /**
   * Calculate confidence
   */
  private calculateConfidence(data: number[]): number {
    if (data.length < 30) return 30;
    if (data.length < 60) return 50;
    if (data.length < 90) return 70;
    return 80;
  }

  /**
   * Calculate standard deviation
   */
  private calculateStdDev(data: number[], mean: number): number {
    const variance = data.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }


}