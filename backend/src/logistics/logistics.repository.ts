import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

import { DatabaseService } from '../config/database';
import { LogisticsFilter } from '@nurisk/shared-types/logistics';

export interface LogisticsRequest {
  id: number;
  incident_id: number;
  item_name?: string;
  quantity_requested?: number;
  quantity_fulfilled?: number;
  requester_region?: string;
  status?: string;
  admin_note?: string;
  created_at?: Date;
  updated_at?: Date;
}

@Injectable()
export class LogisticsRepository {
  private pool: Pool;

  constructor(private databaseService: DatabaseService) {
    this.pool = this.databaseService.getPool();
  }

  async create(data: Partial<LogisticsRequest>): Promise<LogisticsRequest> {
    const result = await this.pool.query(
      `INSERT INTO logistics_requests (incident_id, item_name, quantity_requested, requester_region, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [
        data.incident_id,
        data.item_name,
        data.quantity_requested,
        data.requester_region,
      ]
    );
    return result.rows[0];
  }

  async findAll(filters: LogisticsFilter): Promise<LogisticsRequest[]> {
    let query = `SELECT * FROM logistics_requests WHERE 1=1`;
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

  async findById(id: number): Promise<LogisticsRequest | null> {
    const result = await this.pool.query(
      `SELECT * FROM logistics_requests WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async updateStatus(id: number, status: string, adminNote?: string): Promise<LogisticsRequest | null> {
    const result = await this.pool.query(
      `UPDATE logistics_requests SET status = $1, admin_note = COALESCE($2, admin_note), updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, adminNote, id]
    );
    return result.rows[0] || null;
  }

  async approve(id: number, approvedBy: string): Promise<LogisticsRequest | null> {
    const result = await this.pool.query(
      `UPDATE logistics_requests SET status = 'APPROVED', approved_by = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [approvedBy, id]
    );
    return result.rows[0] || null;
  }

  async reject(id: number, reason: string): Promise<LogisticsRequest | null> {
    const result = await this.pool.query(
      `UPDATE logistics_requests SET status = 'REJECTED', admin_note = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [reason, id]
    );
    return result.rows[0] || null;
  }

  async fulfill(id: number, items: { inventory_id: number; quantity: number }[], fulfilledBy: string): Promise<LogisticsRequest | null> {
    // Process each item
    for (const item of items) {
      await this.pool.query(
        `INSERT INTO asset_transactions (asset_id, quantity, type, status, performed_by, notes)
         VALUES ($1, $2, 'CHECKOUT', 'COMPLETED', $3, $4)`,
        [item.inventory_id, item.quantity, fulfilledBy, `Fulfillment for request ${id}`]
      );

      await this.pool.query(
        `UPDATE asset_inventories SET quantity = quantity - $1 WHERE id = $2`,
        [item.quantity, item.inventory_id]
      );
    }

    // Get request to check fulfillment
    const request = await this.findById(id);
    if (!request) return null;

    const totalFulfilled = items.reduce((sum, item) => sum + item.quantity, 0);
    const newStatus = totalFulfilled >= (request.quantity_requested || 0) ? 'FULFILLED' : 'PARTIALLY_FULFILLED';

    const result = await this.pool.query(
      `UPDATE logistics_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [newStatus, id]
    );
    return result.rows[0] || null;
  }
}