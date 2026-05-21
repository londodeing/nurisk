import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class HazardMappingService {
  constructor(private pool: Pool) {}

  readonly HAZARD_TYPES = ['flood', 'earthquake', 'landslide', 'volcanic', 'tsunami', 'drought'];
  readonly SEVERITY_LEVELS = ['very_low', 'low', 'moderate', 'high', 'very_high'];

  async createHazardZone(data: {
    region: string;
    hazard_type: string;
    severity_level: string;
    recurrence_interval?: string;
    polygon_geometry?: any;
    population_exposed?: number;
    infrastructure_value?: number;
  }) {
    const result = await this.pool.query(
      `INSERT INTO hazard_zones 
       (region, hazard_type, severity_level, recurrence_interval, polygon_geometry, population_exposed, infrastructure_value)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.region,
        data.hazard_type,
        data.severity_level,
        data.recurrence_interval,
        JSON.stringify(data.polygon_geometry),
        data.population_exposed || 0,
        data.infrastructure_value || 0,
      ],
    );
    return result.rows[0];
  }

  async getHazardZones(filters: {
    region?: string;
    hazard_type?: string;
    severity_level?: string;
  } = {}) {
    let query = 'SELECT * FROM hazard_zones WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.region) {
      query += ` AND region = $${paramIndex}`;
      params.push(filters.region);
      paramIndex++;
    }
    if (filters.hazard_type) {
      query += ` AND hazard_type = $${paramIndex}`;
      params.push(filters.hazard_type);
      paramIndex++;
    }
    if (filters.severity_level) {
      query += ` AND severity_level = $${paramIndex}`;
      params.push(filters.severity_level);
      paramIndex++;
    }
    query += ' ORDER BY created_at DESC';

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getHazardZoneById(id: number) {
    const result = await this.pool.query('SELECT * FROM hazard_zones WHERE id = $1', [id]);
    return result.rows[0];
  }

  async updateHazardZone(
    id: number,
    data: Partial<{
      region: string;
      hazard_type: string;
      severity_level: string;
      recurrence_interval: string;
      polygon_geometry: any;
      population_exposed: number;
      infrastructure_value: number;
    }>,
  ) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.region !== undefined) {
      fields.push(`region = $${paramIndex++}`);
      values.push(data.region);
    }
    if (data.hazard_type !== undefined) {
      fields.push(`hazard_type = $${paramIndex++}`);
      values.push(data.hazard_type);
    }
    if (data.severity_level !== undefined) {
      fields.push(`severity_level = $${paramIndex++}`);
      values.push(data.severity_level);
    }
    if (data.recurrence_interval !== undefined) {
      fields.push(`recurrence_interval = $${paramIndex++}`);
      values.push(data.recurrence_interval);
    }
    if (data.polygon_geometry !== undefined) {
      fields.push(`polygon_geometry = $${paramIndex++}`);
      values.push(JSON.stringify(data.polygon_geometry));
    }
    if (data.population_exposed !== undefined) {
      fields.push(`population_exposed = $${paramIndex++}`);
      values.push(data.population_exposed);
    }
    if (data.infrastructure_value !== undefined) {
      fields.push(`infrastructure_value = $${paramIndex++}`);
      values.push(data.infrastructure_value);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await this.pool.query(
      `UPDATE hazard_zones SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  async deleteHazardZone(id: number) {
    const result = await this.pool.query('DELETE FROM hazard_zones WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  async computeZoneIntersections(zoneId: number) {
    const zone = await this.getHazardZoneById(zoneId);
    if (!zone) return null;

    const populationResult = await this.pool.query(
      `SELECT COUNT(DISTINCT v.id) as population_count FROM volunteers v WHERE v.region = $1`,
      [zone.region],
    );

    const infraResult = await this.pool.query(
      `SELECT COUNT(*) as infrastructure_count FROM building_assessments ba WHERE ba.region = $1`,
      [zone.region],
    );

    return {
      zone_id: zone.id,
      region: zone.region,
      hazard_type: zone.hazard_type,
      severity_level: zone.severity_level,
      population_exposed: populationResult.rows[0]?.population_count || 0,
      infrastructure_count: infraResult.rows[0]?.infrastructure_count || 0,
      infrastructure_value: zone.infrastructure_value,
    };
  }

  async calculateVulnerabilityScore(region: string, hazardType: string) {
    const zones = await this.getHazardZones({ region, hazard_type: hazardType });

    if (zones.length === 0) {
      return { vulnerability_score: 0, risk_level: 'unknown', details: [] };
    }

    const severityWeights: Record<string, number> = {
      very_low: 1,
      low: 2,
      moderate: 3,
      high: 4,
      very_high: 5,
    };

    let totalScore = 0;
    let totalWeight = 0;

    const details = zones.map((zone: any) => {
      const severityWeight = severityWeights[zone.severity_level] || 3;
      const populationFactor = zone.population_exposed || 0;
      const infrastructureFactor = parseFloat(zone.infrastructure_value) || 0;
      const zoneScore = severityWeight * (populationFactor * 0.001 + infrastructureFactor * 0.0001);

      totalScore += zoneScore;
      totalWeight += severityWeight;

      return {
        zone_id: zone.id,
        severity_level: zone.severity_level,
        population_exposed: zone.population_exposed,
        infrastructure_value: zone.infrastructure_value,
        zone_score: zoneScore.toFixed(4),
      };
    });

    const avgScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    const vulnerabilityScore = Math.min(avgScore * 10, 100);

    let riskLevel = 'low';
    if (vulnerabilityScore >= 80) riskLevel = 'very_high';
    else if (vulnerabilityScore >= 60) riskLevel = 'high';
    else if (vulnerabilityScore >= 40) riskLevel = 'moderate';
    else if (vulnerabilityScore >= 20) riskLevel = 'low';

    return {
      vulnerability_score: vulnerabilityScore.toFixed(2),
      risk_level: riskLevel,
      region,
      hazard_type: hazardType,
      zones_count: zones.length,
      details,
    };
  }

  async getHazardStatsByRegion(region: string) {
    const result = await this.pool.query(
      `SELECT hazard_type, severity_level, COUNT(*) as zone_count, 
              SUM(population_exposed) as total_population,
              SUM(infrastructure_value) as total_infrastructure
       FROM hazard_zones 
       WHERE region = $1
       GROUP BY hazard_type, severity_level
       ORDER BY hazard_type, severity_level`,
      [region],
    );
    return result.rows;
  }
}