import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class RiskRegistryService {
  constructor(private pool: Pool) {}

  readonly HAZARD_TYPES = [
    'Banjir',
    'Banjir Bandang',
    'Tanah Longsor',
    'Gempa Bumi',
    'Gunung Api',
    'Cuaca Ekstrim',
    'Kekeringan',
    'Tsunami',
  ];

  readonly MITIGATION_STATUSES = ['pending', 'in_progress', 'completed', 'monitoring', 'no_action'] as const;

  readonly RISK_TIERS = {
    VERY_LOW: { min: 1, max: 4, color: '#22c55e', label: 'Very Low' },
    LOW: { min: 5, max: 9, color: '#84cc16', label: 'Low' },
    MEDIUM: { min: 10, max: 14, color: '#eab308', label: 'Medium' },
    HIGH: { min: 15, max: 19, color: '#f97316', label: 'High' },
    VERY_HIGH: { min: 20, max: 25, color: '#ef4444', label: 'Very High' },
  } as const;

  async createRiskEntry(data: {
    region_id: string;
    hazard_type: string;
    likelihood: number;
    impact: number;
    mitigation_status?: string;
    owner?: string;
    review_date?: Date;
    notes?: string;
  }) {
    const risk_score = data.likelihood * data.impact;

    const result = await this.pool.query(
      `INSERT INTO risk_registry 
       (region_id, hazard_type, likelihood, impact, risk_score, mitigation_status, owner, review_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.region_id,
        data.hazard_type,
        data.likelihood,
        data.impact,
        risk_score,
        data.mitigation_status || 'pending',
        data.owner,
        data.review_date,
        data.notes,
      ],
    );
    return result.rows[0];
  }

  async getRiskEntries(filters: {
    region_id?: string;
    hazard_type?: string;
    mitigation_status?: string;
    min_score?: number;
    max_score?: number;
  } = {}) {
    let query = 'SELECT * FROM risk_registry WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.region_id) {
      query += ` AND region_id = $${paramIndex}`;
      params.push(filters.region_id);
      paramIndex++;
    }
    if (filters.hazard_type) {
      query += ` AND hazard_type = $${paramIndex}`;
      params.push(filters.hazard_type);
      paramIndex++;
    }
    if (filters.mitigation_status) {
      query += ` AND mitigation_status = $${paramIndex}`;
      params.push(filters.mitigation_status);
      paramIndex++;
    }
    if (filters.min_score) {
      query += ` AND risk_score >= $${paramIndex}`;
      params.push(filters.min_score);
      paramIndex++;
    }
    if (filters.max_score) {
      query += ` AND risk_score <= $${paramIndex}`;
      params.push(filters.max_score);
      paramIndex++;
    }
    query += ' ORDER BY risk_score DESC, created_at DESC';

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getRiskEntryById(id: number) {
    const result = await this.pool.query('SELECT * FROM risk_registry WHERE id = $1', [id]);
    return result.rows[0];
  }

  async updateRiskEntry(
    id: number,
    data: Partial<{
      region_id: string;
      hazard_type: string;
      likelihood: number;
      impact: number;
      mitigation_status: string;
      owner: string;
      review_date: Date;
      notes: string;
    }>,
    changedBy: string = 'system',
  ) {
    const current = await this.getRiskEntryById(id);
    if (!current) return null;

    const newLikelihood = data.likelihood ?? current.likelihood;
    const newImpact = data.impact ?? current.impact;
    const newRiskScore = newLikelihood * newImpact;

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.region_id !== undefined) {
      fields.push(`region_id = $${paramIndex++}`);
      values.push(data.region_id);
    }
    if (data.hazard_type !== undefined) {
      fields.push(`hazard_type = $${paramIndex++}`);
      values.push(data.hazard_type);
    }
    if (data.likelihood !== undefined) {
      fields.push(`likelihood = $${paramIndex++}`);
      values.push(data.likelihood);
    }
    if (data.impact !== undefined) {
      fields.push(`impact = $${paramIndex++}`);
      values.push(data.impact);
    }
    fields.push(`risk_score = $${paramIndex++}`);
    values.push(newRiskScore);
    if (data.mitigation_status !== undefined) {
      fields.push(`mitigation_status = $${paramIndex++}`);
      values.push(data.mitigation_status);
    }
    if (data.owner !== undefined) {
      fields.push(`owner = $${paramIndex++}`);
      values.push(data.owner);
    }
    if (data.review_date !== undefined) {
      fields.push(`review_date = $${paramIndex++}`);
      values.push(data.review_date);
    }
    if (data.notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`);
      values.push(data.notes);
    }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await this.pool.query(
      `UPDATE risk_registry SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );

    if (data.likelihood !== undefined || data.impact !== undefined) {
      await this.createAuditLog(
        id,
        'updated',
        current.likelihood,
        newLikelihood,
        current.impact,
        newImpact,
        changedBy,
      );
    }

    return result.rows[0];
  }

  async deleteRiskEntry(id: number) {
    const result = await this.pool.query('DELETE FROM risk_registry WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  private async createAuditLog(
    riskId: number,
    action: string,
    oldLikelihood: number,
    newLikelihood: number,
    oldImpact: number,
    newImpact: number,
    changedBy: string,
  ) {
    const result = await this.pool.query(
      `INSERT INTO risk_audit_logs 
       (risk_id, action, old_likelihood, new_likelihood, old_impact, new_impact, changed_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [riskId, action, oldLikelihood, newLikelihood, oldImpact, newImpact, changedBy],
    );
    return result.rows[0];
  }

  async getAuditLogs(riskId: number) {
    const result = await this.pool.query(
      `SELECT * FROM risk_audit_logs WHERE risk_id = $1 ORDER BY changed_at DESC`,
      [riskId],
    );
    return result.rows;
  }

  async getRiskHeatmap() {
    const result = await this.pool.query(
      `SELECT region_id, hazard_type, likelihood, impact, risk_score, 
              mitigation_status, owner, review_date, notes, created_at, updated_at
       FROM risk_registry ORDER BY risk_score DESC`,
    );

    const regionData: Record<string, any> = {};
    for (const row of result.rows) {
      if (!regionData[row.region_id]) {
        regionData[row.region_id] = {
          type: 'Feature',
          properties: {
            region_id: row.region_id,
            risks: [],
            max_risk_score: 0,
            avg_risk_score: 0,
            hazard_count: 0,
          },
          geometry: {
            type: 'Point',
            coordinates: [110.42, -6.99],
          },
        };
      }

      const riskTier = this.getRiskTier(row.risk_score);
      regionData[row.region_id].properties.risks.push({
        hazard_type: row.hazard_type,
        likelihood: row.likelihood,
        impact: row.impact,
        risk_score: row.risk_score,
        risk_tier: riskTier.label,
        mitigation_status: row.mitigation_status,
        owner: row.owner,
        review_date: row.review_date,
      });
      regionData[row.region_id].properties.max_risk_score = Math.max(
        regionData[row.region_id].properties.max_risk_score,
        row.risk_score,
      );
      regionData[row.region_id].properties.hazard_count++;
    }

    for (const regionId in regionData) {
      const risks = regionData[regionId].properties.risks;
      if (risks.length > 0) {
        const totalScore = risks.reduce((sum: number, r: any) => sum + r.risk_score, 0);
        regionData[regionId].properties.avg_risk_score = (totalScore / risks.length).toFixed(2);
      }
    }

    const features = Object.values(regionData).map((feature: any) => {
      const tier = this.getRiskTier(feature.properties.max_risk_score);
      feature.properties.risk_tier = tier.label;
      feature.properties.color = tier.color;
      return feature;
    });

    return { type: 'FeatureCollection', features };
  }

  getRiskTier(score: number) {
    if (score >= 20) return this.RISK_TIERS.VERY_HIGH;
    if (score >= 15) return this.RISK_TIERS.HIGH;
    if (score >= 10) return this.RISK_TIERS.MEDIUM;
    if (score >= 5) return this.RISK_TIERS.LOW;
    return this.RISK_TIERS.VERY_LOW;
  }

  async getRiskSummary() {
    const result = await this.pool.query(
      `SELECT COUNT(*) as total_risks,
              AVG(risk_score) as avg_risk_score,
              MAX(risk_score) as max_risk_score,
              MIN(risk_score) as min_risk_score,
              COUNT(CASE WHEN mitigation_status = 'pending' THEN 1 END) as pending,
              COUNT(CASE WHEN mitigation_status = 'in_progress' THEN 1 END) as in_progress,
              COUNT(CASE WHEN mitigation_status = 'completed' THEN 1 END) as completed
       FROM risk_registry`,
    );
    return result.rows[0];
  }

  async getTopRisks(limit: number = 10) {
    const result = await this.pool.query(
      `SELECT * FROM risk_registry ORDER BY risk_score DESC LIMIT $1`,
      [limit],
    );
    return result.rows;
  }

  async getRisksByRegion(regionId: string) {
    const result = await this.pool.query(
      `SELECT * FROM risk_registry WHERE region_id = $1 ORDER BY risk_score DESC`,
      [regionId],
    );

    return result.rows.map((row: any) => ({
      ...row,
      risk_tier: this.getRiskTier(row.risk_score).label,
      color: this.getRiskTier(row.risk_score).color,
    }));
  }
}