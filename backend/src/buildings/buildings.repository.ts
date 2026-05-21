import { Injectable, Optional } from '@nestjs/common';
import { Pool } from 'pg';
import { PaginationRequest, ListResponse } from '@nurisk/shared-types/api';

import { pool } from '../config/database';

export interface BuildingFilter {
  region?: string;
  struktur?: string;
  search?: string;
}

@Injectable()
export class BuildingsRepository {
  constructor(@Optional() private pool: Pool = pool) {}

  async create(data: {
    user_id?: number;
    name: string;
    address: string;
    region: string;
    district?: string;
    village?: string;
    latitude?: number;
    longitude?: number;
    imb?: boolean;
    slf?: boolean;
    struktur?: string;
    non_struktural?: string;
    odnk?: boolean;
    ibu_hamil?: boolean;
    lansia?: boolean;
    balita?: boolean;
    fasilitas?: string[];
    peralatan?: string[];
    dana_darurat?: string;
    anggaran?: string;
    asuransi?: string;
  }) {
    const result = await this.pool.query(
      `INSERT INTO building_assessments 
       (user_id, name, address, region, district, village, latitude, longitude, imb, slf, struktur, non_struktural, odnk, ibu_hamil, lansia, balita, fasilitas, peralatan, dana_darurat, anggaran, asuransi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
       RETURNING *`,
      [
        data.user_id,
        data.name,
        data.address,
        data.region,
        data.district,
        data.village,
        data.latitude,
        data.longitude,
        data.imb?.toString(),
        data.slf?.toString(),
        data.struktur,
        data.non_struktural,
        data.odnk?.toString(),
        data.ibu_hamil?.toString(),
        data.lansia?.toString(),
        data.balita?.toString(),
        JSON.stringify(data.fasilitas || []),
        JSON.stringify(data.peralatan || []),
        data.dana_darurat,
        data.anggaran,
        data.asuransi,
      ],
    );
    return result.rows[0];
  }

  async findById(id: number): Promise<any> {
    const result = await this.pool.query(
      'SELECT * FROM building_assessments WHERE id = $1',
      [id],
    );
    return result.rows[0];
  }

  async findAll(filters: BuildingFilter = {}, options: PaginationRequest): Promise<ListResponse<any>> {
    const { region, struktur, search } = filters;
    const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = options;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (region) {
      whereClause += ` AND LOWER(region) LIKE LOWER($${paramIndex})`;
      params.push(`%${region}%`);
      paramIndex++;
    }

    if (struktur) {
      whereClause += ` AND struktur = $${paramIndex}`;
      params.push(struktur);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (LOWER(name) LIKE LOWER($${paramIndex}) OR LOWER(address) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await this.pool.query(
      `SELECT COUNT(*) FROM building_assessments ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const offset = (page - 1) * limit;
    const dataResult = await this.pool.query(
      `SELECT * FROM building_assessments ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    const totalPages = Math.ceil(total / limit);
    return {
      items: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async update(id: number, data: Partial<{
    name: string;
    address: string;
    region: string;
    district: string;
    village: string;
    latitude: number;
    longitude: number;
    imb: boolean;
    slf: boolean;
    struktur: string;
    non_struktural: string;
    odnk: boolean;
    ibu_hamil: boolean;
    lansia: boolean;
    balita: boolean;
    fasilitas: string[];
    peralatan: string[];
    dana_darurat: string;
    anggaran: string;
    asuransi: string;
  }>) {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) {
      return this.findById(id);
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const result = await this.pool.query(
      `UPDATE building_assessments SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values],
    );
    return result.rows[0];
  }

  async delete(id: number): Promise<void> {
    await this.pool.query('DELETE FROM building_assessments WHERE id = $1', [id]);
  }

  async findByRegion(region: string): Promise<any[]> {
    const result = await this.pool.query(
      'SELECT * FROM building_assessments WHERE LOWER(region) LIKE LOWER($1) ORDER BY created_at DESC',
      [`%${region}%`],
    );
    return result.rows;
  }
}