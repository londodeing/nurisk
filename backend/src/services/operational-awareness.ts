/**
 * Operational Awareness Service
 * ==================
 * Aggregates shift status, mission progress, and resource health
 */

import { Pool } from 'pg';

export interface ShiftSummary {
  shift_id: string;
  start_time: Date;
  end_time: Date;
  incidents: IncidentSummary;
  missions: MissionSummary;
  resources: ResourceSummary;
  delta_from_previous: DeltaIndicators;
}

export interface IncidentSummary {
  created: number;
  resolved: number;
  active: number;
  critical: number;
}

export interface MissionSummary {
  active: number;
  completed: number;
  completion_rate: number;
  avg_eta_minutes: number;
}

export interface ResourceSummary {
  total_deployed: number;
  total_available: number;
  total_capacity: number;
}

export interface DeltaIndicators {
  incidents_created: number;
  incidents_resolved: number;
  missions_completed: number;
  resources_deployed: number;
}

export interface OperationalOverview {
  timestamp: Date;
  resource_health: ResourceHealth[];
  capacity_summary: CapacitySummary[];
  alerts: ResourceAlert[];
}

export interface ResourceHealth {
  category: string;
  total: number;
  available: number;
  deployed: number;
  degraded: number;
  unusable: number;
  health_score: number;
}

export interface CapacitySummary {
  type: string;
  capacity: number;
  deployed: number;
  available: number;
  utilization_pct: number;
}

export interface ResourceAlert {
  resource_id: string;
  name: string;
  category: string;
  status: string;
  alert_type: 'DEGRADED' | 'UNUSABLE';
}

/**
 * Operational Awareness Service
 */
export class OperationalAwarenessService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Get current shift summary
   */
  async getShiftSummary(shiftId?: string): Promise<ShiftSummary> {
    const currentShift = await this.getCurrentShift(shiftId);
    const previousShift = await this.getPreviousShift(currentShift.shift_id);

    const [incidentSummary, missionSummary, resourceSummary] = await Promise.all([
      this.getIncidentSummary(currentShift.start_time, currentShift.end_time),
      this.getMissionSummary(currentShift.start_time),
      this.getResourceSummary(),
    ]);

    // Calculate deltas
    const delta = await this.calculateDeltas(currentShift, previousShift);

    return {
      shift_id: currentShift.shift_id,
      start_time: currentShift.start_time,
      end_time: currentShift.end_time,
      incidents: incidentSummary,
      missions: missionSummary,
      resources: resourceSummary,
      delta_from_previous: delta,
    };
  }

  /**
   * Get operational overview
   */
  async getOperationalOverview(): Promise<OperationalOverview> {
    const [resourceHealth, capacitySummary, alerts] = await Promise.all([
      this.getResourceHealth(),
      this.getCapacitySummary(),
      this.getResourceAlerts(),
    ]);

    return {
      timestamp: new Date(),
      resource_health: resourceHealth,
      capacity_summary: capacitySummary,
      alerts,
    };
  }

  /**
   * Get current shift info
   */
  private async getCurrentShift(shiftId?: string): Promise<{
    shift_id: string;
    start_time: Date;
    end_time: Date;
  }> {
    if (shiftId) {
      const result = await this.pool.query(`
        SELECT id, start_time, end_time FROM shifts WHERE id = $1
      `, [shiftId]);
      if (result.rows.length > 0) {
        return result.rows[0];
      }
    }

    // Get current shift based on time
    const result = await this.pool.query(`
      SELECT id, start_time, end_time FROM shifts
      WHERE start_time <= NOW() AND end_time >= NOW()
      ORDER BY start_time DESC
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Default to last shift if no current shift
    const lastResult = await this.pool.query(`
      SELECT id, start_time, end_time FROM shifts
      ORDER BY start_time DESC
      LIMIT 1
    `);

    if (lastResult.rows.length > 0) {
      return lastResult.rows[0];
    }

    // Create default shift
    const now = new Date();
    const start = new Date(now);
    start.setHours(start.getHours() - 8);
    const end = new Date(now);
    end.setHours(end.getHours() + 16);

    return {
      shift_id: 'default',
      start_time: start,
      end_time: end,
    };
  }

  /**
   * Get previous shift
   */
  private async getPreviousShift(currentShiftId: string): Promise<{
    shift_id: string;
    start_time: Date;
    end_time: Date;
  } | null> {
    const result = await this.pool.query(`
      SELECT id, start_time, end_time FROM shifts
      WHERE id != $1
      ORDER BY start_time DESC
      LIMIT 1
    `, [currentShiftId]);

    return result.rows[0] || null;
  }

  /**
   * Get incident summary
   */
  private async getIncidentSummary(startTime: Date, endTime: Date): Promise<IncidentSummary> {
    const result = await this.pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE created_at >= $1 AND created_at < $2) as created,
        COUNT(*) FILTER (WHERE status IN ('RESOLVED', 'CLOSED') AND resolved_at >= $1 AND resolved_at < $2) as resolved,
        COUNT(*) FILTER (WHERE status NOT IN ('RESOLVED', 'CLOSED')) as active,
        COUNT(*) FILTER (WHERE priority >= 4 AND status NOT IN ('RESOLVED', 'CLOSED')) as critical
      FROM incidents
      WHERE created_at < $2
    `, [startTime, endTime]);

    const row = result.rows[0];
    return {
      created: parseInt(row.created) || 0,
      resolved: parseInt(row.resolved) || 0,
      active: parseInt(row.active) || 0,
      critical: parseInt(row.critical) || 0,
    };
  }

  /**
   * Get mission summary
   */
  private async getMissionSummary(since: Date): Promise<MissionSummary> {
    const result = await this.pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'ACTIVE') as active,
        COUNT(*) FILTER (WHERE status = 'COMPLETED' AND completed_at >= $1) as completed,
        AVG(estimated_completion - NOW()) FILTER (WHERE status = 'ACTIVE' AND estimated_completion IS NOT NULL) as avg_eta
      FROM missions
      WHERE created_at >= $1
    `, [since]);

    const row = result.rows[0];
    const active = parseInt(row.active) || 0;
    const completed = parseInt(row.completed) || 0;
    const total = active + completed;
    const completion_rate = total > 0 ? (completed / total) * 100 : 0;

    let avgEtaMinutes = 0;
    if (row.avg_eta) {
      avgEtaMinutes = Math.round(row.avg_eta.getTime() / 60000);
    }

    return {
      active,
      completed,
      completion_rate: Math.round(completion_rate * 10) / 10,
      avg_eta_minutes: avgEtaMinutes,
    };
  }

  /**
   * Get resource summary
   */
  private async getResourceSummary(): Promise<ResourceSummary> {
    const result = await this.pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'DEPLOYED') as deployed,
        COUNT(*) FILTER (WHERE status = 'AVAILABLE') as available,
        COUNT(*) as total
      FROM resources
    `);

    const row = result.rows[0];
    return {
      total_deployed: parseInt(row.deployed) || 0,
      total_available: parseInt(row.available) || 0,
      total_capacity: parseInt(row.total) || 0,
    };
  }

  /**
   * Calculate deltas from previous shift
   */
  private async calculateDeltas(
    currentShift: { shift_id: string; start_time: Date; end_time: Date },
    previousShift: { shift_id: string; start_time: Date; end_time: Date } | null
  ): Promise<DeltaIndicators> {
    if (!previousShift) {
      return {
        incidents_created: 0,
        incidents_resolved: 0,
        missions_completed: 0,
        resources_deployed: 0,
      };
    }

    const [currentIncidents, previousIncidents] = await Promise.all([
      this.getIncidentSummary(currentShift.start_time, currentShift.end_time),
      this.getIncidentSummary(previousShift.start_time, previousShift.end_time),
    ]);

    return {
      incidents_created: currentIncidents.created - previousIncidents.created,
      incidents_resolved: currentIncidents.resolved - previousIncidents.resolved,
      missions_completed: 0, // Would need mission history
      resources_deployed: 0, // Would need resource history
    };
  }

  /**
   * Get resource health per category
   */
  private async getResourceHealth(): Promise<ResourceHealth[]> {
    const result = await this.pool.query(`
      SELECT 
        category,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'AVAILABLE') as available,
        COUNT(*) FILTER (WHERE status = 'DEPLOYED') as deployed,
        COUNT(*) FILTER (WHERE status = 'DEGRADED') as degraded,
        COUNT(*) FILTER (WHERE status = 'UNUSABLE') as unusable
      FROM resources
      GROUP BY category
    `);

    return result.rows.map((row) => {
      const total = parseInt(row.total);
      const available = parseInt(row.available);
      const deployed = parseInt(row.deployed);
      const degraded = parseInt(row.degraded);
      const unusable = parseInt(row.unusable);
      const healthy = available + deployed;
      const healthScore = total > 0 ? (healthy / total) * 100 : 0;

      return {
        category: row.category,
        total,
        available,
        deployed,
        degraded,
        unusable,
        health_score: Math.round(healthScore),
      };
    });
  }

  /**
   * Get capacity summary
   */
  private async getCapacitySummary(): Promise<CapacitySummary[]> {
    const result = await this.pool.query(`
      SELECT 
        type,
        capacity,
        deployed,
        available
      FROM resource_capacity
      ORDER BY type
    `);

    return result.rows.map((row) => {
      const capacity = parseInt(row.capacity);
      const deployed = parseInt(row.deployed);
      const available = parseInt(row.available);
      const utilization = capacity > 0 ? (deployed / capacity) * 100 : 0;

      return {
        type: row.type,
        capacity,
        deployed,
        available,
        utilization_pct: Math.round(utilization * 10) / 10,
      };
    });
  }

  /**
   * Get resource alerts
   */
  private async getResourceAlerts(): Promise<ResourceAlert[]> {
    const result = await this.pool.query(`
      SELECT id, name, category, status
      FROM resources
      WHERE status IN ('DEGRADED', 'UNUSABLE')
      ORDER BY 
        CASE status 
          WHEN 'UNUSABLE' THEN 1 
          WHEN 'DEGRADED' THEN 2 
        END
      LIMIT 20
    `);

    return result.rows.map((row) => ({
      resource_id: row.id,
      name: row.name,
      category: row.category,
      status: row.status,
      alert_type: row.status === 'UNUSABLE' ? 'UNUSABLE' : 'DEGRADED',
    }));
  }
};