import { Injectable, Logger } from '@nestjs/common';
import pool from '../config/database';

export interface TrendAnalysis {
  metric: string;
  anomalies: Anomaly[];
  patterns: Pattern[];
  decomposition: SeasonalDecomposition;
  generatedAt: Date;
}

export interface Anomaly {
  date: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
}

export interface Pattern {
  type: 'spike' | 'drop' | 'shift' | 'cycle';
  startDate: Date;
  endDate?: Date;
  description: string;
  confidence: number;
}

export interface SeasonalDecomposition {
  trend: number[];
  seasonal: number[];
  residual: number[];
}

export interface TrendInput {
  metric: string;
  days: number;
  sensitivity: number;
  region?: string;
}

@Injectable()
export class TrendAnalysisService {
  private readonly logger = new Logger(TrendAnalysisService.name);

  /**
   * Analyze trends
   */
  async analyze(input: TrendInput): Promise<TrendAnalysis> {
    const { metric, days, sensitivity, region } = input;

    // Get time series data
    const data = await this.getTimeSeriesData(metric, days, region);

    // Detect anomalies
    const anomalies = this.detectAnomalies(data, sensitivity);

    // Recognize patterns
    const patterns = this.recognizePatterns(data);

    // Seasonal decomposition
    const decomposition = this.decompose(data);

    return {
      metric,
      anomalies,
      patterns,
      decomposition,
      generatedAt: new Date(),
    };
  }

  /**
   * Get time series data
   */
  private async getTimeSeriesData(
    metric: string,
    days: number,
    region?: string
  ): Promise<{ date: Date; value: number }[]> {
    const whereClause = region ? `WHERE region = $1` : '';

    try {
      const result = await pool.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM incidents
        ${whereClause}
        AND created_at > NOW() - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `, region ? [region] : []);

      return result.rows.map((row) => ({
        date: row.date,
        value: parseInt(row.count),
      }));
    } catch (error) {
      this.logger.error(`Failed to get time series data: ${error}`);
      throw error;
    }
  }

  /**
   * Detect anomalies
   */
  private detectAnomalies(
    data: { date: Date; value: number }[],
    sensitivity: number
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];
    if (data.length < 7) return anomalies;

    // Calculate moving average and standard deviation
    const windowSize = 7;
    const values = data.map((d) => d.value);

    for (let i = windowSize; i < values.length; i++) {
      const window = values.slice(i - windowSize, i);
      const mean = window.reduce((a, b) => a + b, 0) / window.length;
      const stdDev = this.calculateStdDev(window, mean);

      const expectedValue = mean;
      const deviation = Math.abs(values[i] - expectedValue);
      const threshold = stdDev * (4 - sensitivity);

      if (deviation > threshold) {
        const severity: 'low' | 'medium' | 'high' =
          deviation > threshold * 2 ? 'high' : deviation > threshold * 1.5 ? 'medium' : 'low';

        anomalies.push({
          date: data[i].date,
          value: values[i],
          expectedValue,
          deviation,
          severity,
        });
      }
    }

    return anomalies;
  }

  /**
   * Recognize patterns
   */
  private recognizePatterns(
    data: { date: Date; value: number }[]
  ): Pattern[] {
    const patterns: Pattern[] = [];
    if (data.length < 7) return patterns;

    const values = data.map((d) => d.value);

    // Detect spikes
    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1] * 1.5 && values[i] > 10) {
        patterns.push({
          type: 'spike',
          startDate: data[i].date,
          description: `Spike detected: ${values[i]} incidents`,
          confidence: Math.min(90, Math.round((values[i] / values[i - 1]) * 50)),
        });
      }
    }

    // Detect drops
    for (let i = 1; i < values.length; i++) {
      if (values[i] < values[i - 1] * 0.5) {
        patterns.push({
          type: 'drop',
          startDate: data[i].date,
          description: `Drop detected: ${values[i]} incidents`,
          confidence: Math.min(90, Math.round((1 - values[i] / values[i - 1]) * 50)),
        });
      }
    }

    // Detect shifts (sustained change)
    if (values.length >= 14) {
      const recent = values.slice(-7);
      const previous = values.slice(-14, -7);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const prevAvg = previous.reduce((a, b) => a + b, 0) / previous.length;

      if (recentAvg > prevAvg * 1.3) {
        patterns.push({
          type: 'shift',
          startDate: data[data.length - 14].date,
          description: `Upward shift: ${Math.round(recentAvg - prevAvg)} increase`,
          confidence: 75,
        });
      } else if (recentAvg < prevAvg * 0.7) {
        patterns.push({
          type: 'shift',
          startDate: data[data.length - 14].date,
          description: `Downward shift: ${Math.round(prevAvg - recentAvg)} decrease`,
          confidence: 75,
        });
      }
    }

    // Detect cycles (weekly pattern)
    const cycleStrength = this.detectCycleStrength(values);
    if (cycleStrength > 0.5) {
      patterns.push({
        type: 'cycle',
        startDate: data[0].date,
        description: `Weekly cycle detected (strength: ${cycleStrength})`,
        confidence: Math.round(cycleStrength * 80),
      });
    }

    return patterns;
  }

  /**
   * Seasonal decomposition
   */
  private decompose(
    data: { date: Date; value: number }[]
  ): SeasonalDecomposition {
    const values = data.map((d) => d.value);
    const n = values.length;

    if (n < 14) {
      return {
        trend: values,
        seasonal: new Array(n).fill(0),
        residual: new Array(n).fill(0),
      };
    }

    // Extract trend (moving average)
    const trend: number[] = [];
    for (let i = 0; i < n; i++) {
      const start = Math.max(0, i - 3);
      const end = Math.min(n, i + 4);
      const window = values.slice(start, end);
      trend.push(window.reduce((a, b) => a + b, 0) / window.length);
    }

    // Extract seasonal (average by day of week)
    const seasonal: number[] = new Array(7).fill(0);
    const seasonalCounts: number[] = new Array(7).fill(0);

    for (let i = 0; i < n; i++) {
      const dayOfWeek = i % 7;
      seasonal[dayOfWeek] += values[i] - trend[i];
      seasonalCounts[dayOfWeek]++;
    }

    for (let i = 0; i < 7; i++) {
      seasonal[i] = seasonalCounts[i] > 0 ? seasonal[i] / seasonalCounts[i] : 0;
    }

    // Extend seasonal to full length
    const seasonalExtended = new Array(n);
    for (let i = 0; i < n; i++) {
      seasonalExtended[i] = seasonal[i % 7];
    }

    // Calculate residual
    const residual: number[] = [];
    for (let i = 0; i < n; i++) {
      residual.push(values[i] - trend[i] - seasonalExtended[i]);
    }

    return {
      trend,
      seasonal: seasonalExtended,
      residual,
    };
  }

  /**
   * Calculate standard deviation
   */
  private calculateStdDev(data: number[], mean: number): number {
    const variance = data.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  /**
   * Detect cycle strength
   */
  private detectCycleStrength(values: number[]): number {
    if (values.length < 14) return 0;

    // Compare variance of weekly averages to overall variance
    const weeklyAverages: number[] = [];
    for (let i = 0; i < values.length; i += 7) {
      const week = values.slice(i, Math.min(i + 7, values.length));
      weeklyAverages.push(week.reduce((a, b) => a + b, 0) / week.length);
    }

    if (weeklyAverages.length < 2) return 0;

    const overallMean = values.reduce((a, b) => a + b, 0) / values.length;
    const overallVariance = values.reduce((sum, v) => sum + Math.pow(v - overallMean, 2), 0) / values.length;

    const weeklyMean = weeklyAverages.reduce((a, b) => a + b, 0) / weeklyAverages.length;
    const weeklyVariance = weeklyAverages.reduce((sum, v) => sum + Math.pow(v - weeklyMean, 2), 0) / weeklyAverages.length;

    return overallVariance > 0 ? weeklyVariance / overallVariance : 0;
  }


}