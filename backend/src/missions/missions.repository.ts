import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

import { DatabaseService } from '../config/database';
import { MissionFilter } from '@nurisk/shared-types/mission';

export interface Mission {
  id: number;
  name: string;
  description?: string;
  incident_id?: number;
  status?: string;
  priority?: string;
  region?: string;
  start_date?: Date;
  end_date?: Date;
  capacity?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

@Injectable()
export class MissionsRepository {
  private pool: Pool;

  constructor(private databaseService: DatabaseService) {
    this.pool = this.databaseService.getPool();
  }

  async create(data: Partial<Mission>): Promise<Mission> {
    const result = await this.pool.query(
      `INSERT INTO missions (name, description, incident_id, status, priority, region, start_date, end_date, capacity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        data.name,
        data.description,
        data.incident_id,
        data.status || 'pending',
        data.priority,
        data.region,
        data.start_date,
        data.end_date,
        data.capacity,
      ]
    );
    return result.rows[0];
  }

  async findAll(filters: MissionFilter): Promise<Mission[]> {
    let query = `SELECT * FROM missions WHERE deleted_at IS NULL`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.incidentId) {
      params.push(filters.incidentId);
      query += ` AND incident_id = ${paramIndex++}`;
    }
    if (filters.status) {
      params.push(filters.status);
      query += ` AND status = ${paramIndex++}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async findById(id: number): Promise<Mission | null> {
    const result = await this.pool.query(
      `SELECT * FROM missions WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return result.rows[0] || null;
  }

  async update(id: number, data: Partial<Mission>): Promise<Mission | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    const fields = ['name', 'description', 'incident_id', 'status', 'priority', 'region', 'start_date', 'end_date', 'capacity'];

    for (const field of fields) {
      if (data[field as keyof Mission] !== undefined) {
        params.push(data[field as keyof Mission]);
        updates.push(`${field} = $${paramIndex++}`);
      }
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    const result = await this.pool.query(
      `UPDATE missions SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
      params
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE missions SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
      [id]
    );
    return result.rows.length > 0;
  }

  async deployVolunteer(missionId: number, volunteerId: number): Promise<any> {
    const mission = await this.findById(missionId);
    if (!mission) {
      throw new Error('Mission not found');
    }

    // Check capacity
    const countResult = await this.pool.query(
      `SELECT COUNT(*) as count FROM volunteer_deployments WHERE mission_id = $1 AND status = 'ACTIVE'`,
      [missionId]
    );
    const deployed = parseInt(countResult.rows[0]?.count || '0', 10);
    if (mission.capacity && deployed >= mission.capacity) {
      throw new Error('Mission capacity reached');
    }

    const result = await this.pool.query(
      `INSERT INTO volunteer_deployments (volunteer_id, mission_id, status, deployed_at)
       VALUES ($1, $2, 'ACTIVE', NOW()) RETURNING *`,
      [volunteerId, missionId]
    );
    return result.rows[0];
  }

  async recallVolunteer(missionId: number, volunteerId: number): Promise<any> {
    const result = await this.pool.query(
      `UPDATE volunteer_deployments SET status = 'RECALLED', recalled_at = NOW()
       WHERE mission_id = $1 AND volunteer_id = $2 AND status = 'ACTIVE' RETURNING *`,
      [missionId, volunteerId]
    );
    if (result.rows.length === 0) {
      throw new Error('Active deployment not found');
    }
    return result.rows[0];
  }

  async getDeployments(missionId: number): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM volunteer_deployments WHERE mission_id = $1 ORDER BY deployed_at DESC`,
      [missionId]
    );
    return result.rows;
  }
}