import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

import { DatabaseService } from '../config/database';

export interface Warehouse {
  id: number;
  name: string;
  type?: string;
  region?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  contact_person?: string;
  phone?: string;
  email?: string;
  operating_hours?: string;
  status?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

import { WarehouseFilter } from '@nurisk/shared-types/warehouse';

@Injectable()
export class WarehousesRepository {
  private pool: Pool;

  constructor(private databaseService: DatabaseService) {
    this.pool = this.databaseService.getPool();
  }

  async create(data: Partial<Warehouse>): Promise<Warehouse> {
    const result = await this.pool.query(
      `INSERT INTO warehouses (name, type, region, address, latitude, longitude, contact_person, phone, email, operating_hours)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        data.name,
        data.type,
        data.region,
        data.address,
        data.latitude,
        data.longitude,
        data.contact_person,
        data.phone,
        data.email,
        data.operating_hours,
      ]
    );
    return result.rows[0];
  }

  async findAll(filters: WarehouseFilter): Promise<Warehouse[]> {
    let query = `SELECT * FROM warehouses WHERE deleted_at IS NULL`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.type) {
      params.push(filters.type);
      query += ` AND type = $${paramIndex++}`;
    }
    if (filters.region) {
      params.push(filters.region);
      query += ` AND region = $${paramIndex++}`;
    }
    if (filters.status) {
      params.push(filters.status);
      query += ` AND status = $${paramIndex++}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async findById(id: number): Promise<Warehouse | null> {
    const result = await this.pool.query(
      `SELECT * FROM warehouses WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return result.rows[0] || null;
  }

  async update(id: number, data: Partial<Warehouse>): Promise<Warehouse | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    const fields = ['name', 'type', 'region', 'address', 'latitude', 'longitude', 'contact_person', 'phone', 'email', 'operating_hours', 'status'];

    for (const field of fields) {
      if (data[field as keyof Warehouse] !== undefined) {
        params.push(data[field as keyof Warehouse]);
        updates.push(`${field} = $${paramIndex++}`);
      }
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    const result = await this.pool.query(
      `UPDATE warehouses SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
      params
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE warehouses SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
      [id]
    );
    return result.rows.length > 0;
  }
}