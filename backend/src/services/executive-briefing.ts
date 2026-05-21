/**
 * Executive Briefing Service
 * ==================
 * Aggregates data from all awareness layers for executive briefings
 */

import { Pool } from 'pg';
import { TacticalAwarenessService } from './tactical-awareness';
import { OperationalAwarenessService } from './operational-awareness';
import { StrategicAwarenessService } from './strategic-awareness';

export interface ExecutiveBriefing {
  generated_at: Date;
  incident_id?: string;
  sections: BriefingSections;
  data_freshness: DataFreshness;
}

export interface BriefingSections {
  situation: SituationSummary;
  operations: OperationsSummary;
  risks: RiskSummary;
  recommendations: Recommendation[];
}

export interface SituationSummary {
  overview: string;
  active_incidents: number;
  critical_incidents: number;
  regions_affected: string[];
  weather_alert?: string;
  tactical?: {
    incidents: TacticalIncident[];
    deployed_units: number;
    shelters_occupied: number;
  };
}

export interface TacticalIncident {
  id: string;
  type: string;
  status: string;
  priority: number;
  title: string;
}

export interface OperationsSummary {
  current_shift: {
    start: Date;
    end: Date;
  };
  incidents_created: number;
  incidents_resolved: number;
  missions_active: number;
  missions_completed: number;
  resources_deployed: number;
  avg_response_time_minutes: number;
  operational?: {
    resource_health: ResourceHealthItem[];
    alerts: ResourceAlertItem[];
  };
}

export interface ResourceHealthItem {
  category: string;
  health_score: number;
}

export interface ResourceAlertItem {
  resource_id: string;
  name: string;
  alert_type: string;
}

export interface RiskSummary {
  trajectory: string;
  kpis: RiskKPI[];
  flagged_items: FlaggedItem[];
}

export interface RiskKPI {
  name: string;
  value: number;
  trajectory: 'improving' | 'stable' | 'worsening';
}

export interface FlaggedItem {
  description: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface Recommendation {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export interface DataFreshness {
  tactical: Date;
  operational: Date;
  strategic: Date;
  generated_at: Date;
}

/**
 * Executive Briefing Service
 */
export class ExecutiveBriefingService {
  private pool: Pool;
  private tacticalService: TacticalAwarenessService;
  private operationalService: OperationalAwarenessService;
  private strategicService: StrategicAwarenessService;

  constructor(pool: Pool) {
    this.pool = pool;
    this.tacticalService = new TacticalAwarenessService(pool);
    this.operationalService = new OperationalAwarenessService(pool);
    this.strategicService = new StrategicAwarenessService(pool);
  }

  /**
   * Generate executive briefing
   */
  async generateBriefing(incidentId?: string): Promise<ExecutiveBriefing> {
    const tacticalTimestamp = new Date();
    const operationalTimestamp = new Date();
    const strategicTimestamp = new Date();

    // Fetch all data in parallel
    const [tactical, operational, strategic, situation] = await Promise.all([
      this.getTacticalSummary(),
      this.getOperationalSummary(),
      this.getStrategicSummary(),
      this.getSituationSummary(incidentId),
    ]);

    // Generate recommendations based on data
    const recommendations = this.generateRecommendations(
      tactical,
      operational,
      strategic
    );

    return {
      generated_at: new Date(),
      incident_id: incidentId,
      sections: {
        situation,
        operations: operational,
        risks: strategic,
        recommendations,
      },
      data_freshness: {
        tactical: tacticalTimestamp,
        operational: operationalTimestamp,
        strategic: strategicTimestamp,
        generated_at: new Date(),
      },
    };
  }

  /**
   * Get tactical summary
   */
  private async getTacticalSummary(): Promise<{
    incidents: TacticalIncident[];
    deployed_units: number;
    shelters_occupied: number;
  }> {
    try {
      // Get regions with active incidents
      const regionsResult = await this.pool.query(`
        SELECT DISTINCT region FROM incidents 
        WHERE status NOT IN ('RESOLVED', 'CLOSED')
        LIMIT 5
      `);

      const allIncidents: TacticalIncident[] = [];
      let totalDeployed = 0;
      let totalShelters = 0;

      for (const row of regionsResult.rows) {
        const regionId = row.region;
        try {
          const snapshot = await this.tacticalService.getSnapshot(regionId);
          allIncidents.push(...snapshot.incidents.slice(0, 5));
          totalDeployed += snapshot.deployed_units.length;
          totalShelters += snapshot.shelters.reduce(
            (sum, s) => sum + s.current_occupancy,
            0
          );
        } catch {
          // Skip region if error
        }
      }

      return {
        incidents: allIncidents.slice(0, 10),
        deployed_units: totalDeployed,
        shelters_occupied: totalShelters,
      };
    } catch {
      return {
        incidents: [],
        deployed_units: 0,
        shelters_occupied: 0,
      };
    }
  }

  /**
   * Get operational summary
   */
  private async getOperationalSummary(): Promise<OperationsSummary> {
    try {
      const shiftSummary = await this.operationalService.getShiftSummary();
      const overview = await this.operationalService.getOperationalOverview();

      return {
        current_shift: {
          start: shiftSummary.start_time,
          end: shiftSummary.end_time,
        },
        incidents_created: shiftSummary.incidents.created,
        incidents_resolved: shiftSummary.incidents.resolved,
        missions_active: shiftSummary.missions.active,
        missions_completed: shiftSummary.missions.completed,
        resources_deployed: shiftSummary.resources.total_deployed,
        avg_response_time_minutes: 0, // Would need calculation
        operational: {
          resource_health: overview.resource_health.slice(0, 5).map((r) => ({
            category: r.category,
            health_score: r.health_score,
          })),
          alerts: overview.alerts.slice(0, 5).map((a) => ({
            resource_id: a.resource_id,
            name: a.name,
            alert_type: a.alert_type,
          })),
        },
      };
    } catch {
      return {
        current_shift: {
          start: new Date(),
          end: new Date(),
        },
        incidents_created: 0,
        incidents_resolved: 0,
        missions_active: 0,
        missions_completed: 0,
        resources_deployed: 0,
        avg_response_time_minutes: 0,
        operational: {
          resource_health: [],
          alerts: [],
        },
      };
    }
  }

  /**
   * Get strategic summary
   */
  private async getStrategicSummary(): Promise<RiskSummary> {
    try {
      const trajectory = await this.strategicService.getTrajectory();

      return {
        trajectory: this.aggregateTrajectory(trajectory.kpis),
        kpis: trajectory.kpis.map((k) => ({
          name: k.name,
          value: k.current_value,
          trajectory: k.trajectory,
        })),
        flagged_items: trajectory.alerts.map((a) => ({
          description: a.message,
          severity: a.severity,
        })),
      };
    } catch {
      return {
        trajectory: 'stable',
        kpis: [],
        flagged_items: [],
      };
    }
  }

  /**
   * Get situation summary
   */
  private async getSituationSummary(
    incidentId?: string
  ): Promise<SituationSummary> {
    try {
      let incident = null;
      if (incidentId) {
        const result = await this.pool.query(
          `SELECT id, type, status, priority, title, region FROM incidents WHERE id = $1`,
          [incidentId]
        );
        incident = result.rows[0];
      }

      const [activeCount, criticalCount, regionsResult, weatherResult] =
        await Promise.all([
          this.pool.query(
            `SELECT COUNT(*) as count FROM incidents WHERE status NOT IN ('RESOLVED', 'CLOSED')`
          ),
          this.pool.query(
            `SELECT COUNT(*) as count FROM incidents WHERE priority >= 4 AND status NOT IN ('RESOLVED', 'CLOSED')`
          ),
          this.pool.query(`
            SELECT DISTINCT region FROM incidents 
            WHERE status NOT IN ('RESOLVED', 'CLOSED')
            AND created_at > NOW() - INTERVAL '24 hours'
            LIMIT 5
          `),
          this.pool.query(`
            SELECT alert_level FROM weather_data
            ORDER BY observed_at DESC
            LIMIT 1
          `),
        ]);

      const regions = regionsResult.rows.map((r) => r.region);
      const weatherAlert = weatherResult.rows[0]?.alert_level;

      return {
        overview: incident
          ? `Active incident: ${incident.type} (${incident.status})`
          : `${activeCount.rows[0].count} active incidents across ${regions.length} regions`,
        active_incidents: parseInt(activeCount.rows[0].count) || 0,
        critical_incidents: parseInt(criticalCount.rows[0].count) || 0,
        regions_affected: regions,
        weather_alert: weatherAlert,
        tactical: undefined, // Populated by getTacticalSummary
      };
    } catch {
      return {
        overview: 'Unable to load situation data',
        active_incidents: 0,
        critical_incidents: 0,
        regions_affected: [],
        tactical: undefined,
      };
    }
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    tactical: Awaited<ReturnType<typeof this.getTacticalSummary>>,
    operational: Awaited<ReturnType<typeof this.getOperationalSummary>>,
    strategic: Awaited<ReturnType<typeof this.getStrategicSummary>>
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Risk-based recommendations
    for (const kpi of strategic.kpis) {
      if (kpi.trajectory === 'worsening') {
        recommendations.push({
          id: `risk-${kpi.name.toLowerCase().replace(/\s/g, '-')}`,
          text: `Monitor ${kpi.name} - trajectory is worsening`,
          priority: 'high',
          category: 'risk',
        });
      }
    }

    // Resource alerts
    if (operational.operational?.alerts.length) {
      recommendations.push({
        id: 'resource-alerts',
        text: `${operational.operational.alerts.length} resources require attention`,
        priority: 'medium',
        category: 'resources',
      });
    }

    // Critical incidents
    if (tactical.incidents.filter((i: TacticalIncident) => i.priority >= 4).length > 0) {
      recommendations.push({
        id: 'critical-incidents',
        text: 'Critical incidents active - consider resource escalation',
        priority: 'high',
        category: 'operations',
      });
    }

    // Default recommendation if nothing else
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'status-quo',
        text: 'Continue current operations - no critical alerts',
        priority: 'low',
        category: 'operations',
      });
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Aggregate trajectory from KPIs
   */
  private aggregateTrajectory(
    kpis: Array<{ trajectory: string }>
  ): string {
    if (kpis.length === 0) return 'stable';

    const worsening = kpis.filter((k) => k.trajectory === 'worsening').length;
    const improving = kpis.filter((k) => k.trajectory === 'improving').length;

    if (worsening > improving) return 'worsening';
    if (improving > worsening) return 'improving';
    return 'stable';
  }
};