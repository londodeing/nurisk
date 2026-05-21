/**
 * Strategic Awareness Service
 * ==================
 * Aggregates long-term trends and trajectory analysis
 */

import { Pool } from 'pg';

export interface TrendData {
  period: '7d' | '30d' | '90d' | 'ytd';
  incidents_by_type: TrendMetric[];
  incidents_by_region: TrendMetric[];
  incidents_by_severity: TrendMetric[];
  resource_utilization: TrendMetric[];
  response_time: TrendMetric[];
}

export interface TrendMetric {
  label: string;
  value: number;
  previous_value: number;
  change_pct: number;
}

export interface TrajectoryData {
  timestamp: Date;
  kpis: TrajectoryKPI[];
  alerts: TrajectoryAlert[];
}

export interface TrajectoryKPI {
  name: string;
  current_value: number;
  trajectory: 'improving' | 'stable' | 'worsening';
  slope: number;
  trend: number[];
}

export interface TrajectoryAlert {
  kpi_name: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

/**
 * Strategic Awareness Service
 */
export class StrategicAwarenessService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Get trend data for specified period
   */
  async getTrends(period: '7d' | '30d' | '90d' | 'ytd' = '30d'): Promise<TrendData> {
    const [incidentsByType, incidentsByRegion, incidentsBySeverity, resourceUtil, responseTime] = await Promise.all([
      this.getIncidentTrendsByType(period),
      this.getIncidentTrendsByRegion(period),
      this.getIncidentTrendsBySeverity(period),
      this.getResourceUtilizationTrend(period),
      this.getResponseTimeTrend(period),
    ]);

    return {
      period,
      incidents_by_type: incidentsByType,
      incidents_by_region: incidentsByRegion,
      incidents_by_severity: incidentsBySeverity,
      resource_utilization: resourceUtil,
      response_time: responseTime,
    };
  }

  /**
   * Get trajectory data
   */
  async getTrajectory(): Promise<TrajectoryData> {
    const kpis = await Promise.all([
      this.calculateTrajectoryKPI('incident_rate', 'Incident Rate'),
      this.calculateTrajectoryKPI('response_time', 'Response Time'),
      this.calculateTrajectoryKPI('resource_utilization', 'Resource Utilization'),
      this.calculateTrajectoryKPI('resolution_rate', 'Resolution Rate'),
    ]);

    // Filter for alerts
    const alerts = kpis
      .filter((kpi) => kpi.trajectory === 'worsening')
      .map((kpi) => ({
        kpi_name: kpi.name,
        message: `${kpi.name} showing worsening trajectory`,
        severity: this.getAlertSeverity(kpi) as 'info' | 'warning' | 'critical',
      }));

    return {
      timestamp: new Date(),
      kpis,
      alerts,
    };
  }

  /**
   * Get incident trends by type
   */
  private async getIncidentTrendsByType(period: string): Promise<TrendMetric[]> {
    const interval = this.getInterval(period);
    const previousInterval = this.getPreviousInterval(period);

    const [current, previous] = await Promise.all([
      this.pool.query(`
        SELECT type, COUNT(*) as count
        FROM incidents
        WHERE created_at >= NOW() - $1
        GROUP BY type
      `, [interval]),
      this.pool.query(`
        SELECT type, COUNT(*) as count
        WHERE created_at >= NOW() - $2 AND created_at < NOW() - $1
        GROUP BY type
      `, [previousInterval, interval]),
    ]);

    const previousMap = new Map(previous.rows.map((r) => [r.type, parseInt(r.count)]));
    const currentMap = new Map(current.rows.map((r) => [r.type, parseInt(r.count)]));

    const allTypes = new Set([...previousMap.keys(), ...currentMap.keys()]);

    return Array.from(allTypes).map((type) => {
      const currentVal = currentMap.get(type) || 0;
      const previousVal = previousMap.get(type) || 0;
      const change = previousVal > 0 ? ((currentVal - previousVal) / previousVal) * 100 : 0;

      return {
        label: type,
        value: currentVal,
        previous_value: previousVal,
        change_pct: Math.round(change * 10) / 10,
      };
    });
  }

  /**
   * Get incident trends by region
   */
  private async getIncidentTrendsByRegion(period: string): Promise<TrendMetric[]> {
    const interval = this.getInterval(period);
    const previousInterval = this.getPreviousInterval(period);

    const [current, previous] = await Promise.all([
      this.pool.query(`
        SELECT region, COUNT(*) as count
        FROM incidents
        WHERE created_at >= NOW() - $1
        GROUP BY region
      `, [interval]),
      this.pool.query(`
        SELECT region, COUNT(*) as count
        FROM incidents
        WHERE created_at >= NOW() - $2 AND created_at < NOW() - $1
        GROUP BY region
      `, [previousInterval, interval]),
    ]);

    const previousMap = new Map(previous.rows.map((r) => [r.region, parseInt(r.count)]));
    const currentMap = new Map(current.rows.map((r) => [r.region, parseInt(r.count)]));

    const allRegions = new Set([...previousMap.keys(), ...currentMap.keys()]);

    return Array.from(allRegions).map((region) => {
      const currentVal = currentMap.get(region) || 0;
      const previousVal = previousMap.get(region) || 0;
      const change = previousVal > 0 ? ((currentVal - previousVal) / previousVal) * 100 : 0;

      return {
        label: region,
        value: currentVal,
        previous_value: previousVal,
        change_pct: Math.round(change * 10) / 10,
      };
    });
  }

  /**
   * Get incident trends by severity
   */
  private async getIncidentTrendsBySeverity(period: string): Promise<TrendMetric[]> {
    const interval = this.getInterval(period);
    const previousInterval = this.getPreviousInterval(period);

    const [current, previous] = await Promise.all([
      this.pool.query(`
        SELECT priority, COUNT(*) as count
        FROM incidents
        WHERE created_at >= NOW() - $1
        GROUP BY priority
      `, [interval]),
      this.pool.query(`
        SELECT priority, COUNT(*) as count
        FROM incidents
        WHERE created_at >= NOW() - $2 AND created_at < NOW() - $1
        GROUP BY priority
      `, [previousInterval, interval]),
    ]);

    const previousMap = new Map(previous.rows.map((r) => [r.priority, parseInt(r.count)]));
    const currentMap = new Map(current.rows.map((r) => [r.priority, parseInt(r.count)]));

    const allPriorities = new Set([...previousMap.keys(), ...currentMap.keys()]);

    return Array.from(allPriorities).map((priority) => {
      const currentVal = currentMap.get(priority) || 0;
      const previousVal = previousMap.get(priority) || 0;
      const change = previousVal > 0 ? ((currentVal - previousVal) / previousVal) * 100 : 0;

      return {
        label: `Priority ${priority}`,
        value: currentVal,
        previous_value: previousVal,
        change_pct: Math.round(change * 10) / 10,
      };
    });
  }

  /**
   * Get resource utilization trend
   */
  private async getResourceUtilizationTrend(period: string): Promise<TrendMetric[]> {
    const interval = this.getInterval(period);
    const previousInterval = this.getPreviousInterval(period);

    const [current, previous] = await Promise.all([
      this.pool.query(`
        SELECT category, 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'DEPLOYED') as deployed
        FROM resources
        GROUP BY category
      `),
      this.pool.query(`
        SELECT category
        FROM resource_history
        WHERE timestamp >= NOW() - $1
        GROUP BY category
      `, [previousInterval]),
    ]);

    // Simplified - would need historical data for proper trend
    return current.rows.map((row) => ({
      label: row.category,
      value: parseInt(row.deployed),
      previous_value: 0,
      change_pct: 0,
    }));
  }

  /**
   * Get response time trend
   */
  private async getResponseTimeTrend(period: string): Promise<TrendMetric[]> {
    const interval = this.getInterval(period);
    const previousInterval = this.getPreviousInterval(period);

    const [current, previous] = await Promise.all([
      this.pool.query(`
        SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) / 60 as avg_minutes
        FROM incidents
        WHERE resolved_at IS NOT NULL AND created_at >= NOW() - $1
      `, [interval]),
      this.pool.query(`
        SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) / 60 as avg_minutes
        FROM incidents
        WHERE resolved_at IS NOT NULL 
          AND created_at >= NOW() - $2 
          AND created_at < NOW() - $1
      `, [previousInterval, interval]),
    ]);

    const currentVal = current.rows[0]?.avg_minutes ? Math.round(current.rows[0].avg_minutes) : 0;
    const previousVal = previous.rows[0]?.avg_minutes ? Math.round(previous.rows[0].avg_minutes) : 0;
    const change = previousVal > 0 ? ((currentVal - previousVal) / previousVal) * 100 : 0;

    return [{
      label: 'Average Response Time (min)',
      value: currentVal,
      previous_value: previousVal,
      change_pct: Math.round(change * 10) / 10,
    }];
  }

  /**
   * Calculate trajectory for a KPI
   */
  private async calculateTrajectoryKPI(
    kpiKey: string,
    kpiName: string
  ): Promise<TrajectoryKPI> {
    // Get last 7 data points
    const dataPoints = await this.getDataPoints(kpiKey, 7);

    if (dataPoints.length < 2) {
      return {
        name: kpiName,
        current_value: dataPoints[0]?.value || 0,
        trajectory: 'stable',
        slope: 0,
        trend: dataPoints.map((d) => d.value),
      };
    }

    // Calculate slope using linear regression
    const slope = this.calculateSlope(dataPoints);
    const trajectory = this.slopeToTrajectory(slope);

    return {
      name: kpiName,
      current_value: dataPoints[dataPoints.length - 1].value,
      trajectory,
      slope: Math.round(slope * 1000) / 1000,
      trend: dataPoints.map((d) => d.value),
    };
  }

  /**
   * Get data points for trajectory calculation
   */
  private async getDataPoints(kpiKey: string, limit: number): Promise<Array<{ timestamp: Date; value: number }>> {
    let query = '';
    let params: string[] = [];

    switch (kpiKey) {
      case 'incident_rate':
        query = `
          SELECT DATE(created_at) as date, COUNT(*) as count
          FROM incidents
          WHERE created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(created_at)
          ORDER BY date DESC
          LIMIT $1
        `;
        params = [limit.toString()];
        break;
      case 'response_time':
        query = `
          SELECT DATE(resolved_at) as date, 
            AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) / 60 as avg_minutes
          FROM incidents
          WHERE resolved_at IS NOT NULL AND resolved_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(resolved_at)
          ORDER BY date DESC
          LIMIT $1
        `;
        params = [limit.toString()];
        break;
      case 'resource_utilization':
        query = `
          SELECT DATE(timestamp) as date, AVG(utilization) as avg
          FROM resource_history
          WHERE timestamp >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(timestamp)
          ORDER BY date DESC
          LIMIT $1
        `;
        params = [limit.toString()];
        break;
      case 'resolution_rate':
        query = `
          SELECT DATE(created_at) as date,
            COUNT(*) FILTER (WHERE status IN ('RESOLVED', 'CLOSED')) * 1.0 / COUNT(*) as rate
          FROM incidents
          WHERE created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(created_at)
          ORDER BY date DESC
          LIMIT $1
        `;
        params = [limit.toString()];
        break;
      default:
        return [];
    }

    try {
      const result = await this.pool.query(query, params);
      return result.rows.map((row) => ({
        timestamp: row.date,
        value: parseFloat(row.count || row.avg_minutes || row.avg || row.rate || 0),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Calculate slope using linear regression
   */
  private calculateSlope(dataPoints: Array<{ timestamp: Date; value: number }>): number {
    const n = dataPoints.length;
    if (n < 2) return 0;

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += dataPoints[i].value;
      sumXY += i * dataPoints[i].value;
      sumXX += i * i;
    }

    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) return 0;

    return (n * sumXY - sumX * sumY) / denominator;
  }

  /**
   * Convert slope to trajectory
   */
  private slopeToTrajectory(slope: number): 'improving' | 'stable' | 'worsening' {
    const threshold = 0.1;
    if (slope > threshold) return 'worsening';
    if (slope < -threshold) return 'improving';
    return 'stable';
  }

  /**
   * Get alert severity based on slope
   */
  private getAlertSeverity(kpi: TrajectoryKPI): string {
    const absSlope = Math.abs(kpi.slope);
    if (absSlope > 0.5) return 'critical';
    if (absSlope > 0.2) return 'warning';
    return 'info';
  }

  /**
   * Get interval string
   */
  private getInterval(period: string): string {
    switch (period) {
      case '7d': return '7 days';
      case '30d': return '30 days';
      case '90d': return '90 days';
      case 'ytd': return '1 year';
      default: return '30 days';
    }
  }

  /**
   * Get previous interval string
   */
  private getPreviousInterval(period: string): string {
    switch (period) {
      case '7d': return '14 days';
      case '30d': return '60 days';
      case '90d': return '180 days';
      case 'ytd': return '2 years';
      default: return '60 days';
    }
  }
};