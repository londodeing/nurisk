/**
 * Conflict Resolution Service
 * ======================
 * Handles sync conflicts with multiple resolution strategies
 */

import { Pool } from 'pg';

export type ConflictResolutionStrategy = 'AUTHORITATIVE' | 'WRITE_WINS' | 'MERGE';

export interface SyncConflict {
  id?: number;
  entity_type: string;
  entity_id: string;
  client_version: number;
  server_version: number;
  client_data: Record<string, unknown>;
  server_data: Record<string, unknown>;
  resolution_strategy: ConflictResolutionStrategy;
  resolved_data: Record<string, unknown> | null;
  resolved_at: Date | null;
  created_at: Date;
}

export interface ConflictResolutionResult {
  resolved: boolean;
  strategy: ConflictResolutionStrategy;
  resolved_data: Record<string, unknown>;
  message: string;
}

// Fields that are server-authoritative (cannot be overwritten by client)
const AUTHORITATIVE_FIELDS: Record<string, string[]> = {
  incident: ['status', 'priority', 'assigned_to', 'region', 'disaster_type'],
  mission: ['status', 'assigned_to', 'volunteers', 'region', 'priority'],
  volunteer: ['status', 'approved', 'expertise', 'region'],
  asset: ['status', 'location', 'availability'],
  shelter: ['status', 'capacity', 'location'],
};

// Fields that use write-wins (newest timestamp wins)
const WRITE_WINS_FIELDS: Record<string, string[]> = {
  incident: ['description', 'notes', 'location_details'],
  mission: ['description', 'notes', 'objectives'],
  volunteer: ['notes', 'availability_notes'],
  message: ['content'],
};

/**
 * Conflict Resolution Service
 */
export class ConflictResolutionService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Detect and resolve conflict
   */
  async detectAndResolve(
    entityType: string,
    entityId: string,
    clientVersion: number,
    clientData: Record<string, unknown>,
    serverVersion: number,
    serverData: Record<string, unknown>
  ): Promise<ConflictResolutionResult> {
    // No conflict if versions match
    if (clientVersion >= serverVersion) {
      return {
        resolved: true,
        strategy: 'WRITE_WINS',
        resolved_data: clientData,
        message: 'No conflict - client version is newer or equal',
      };
    }

    // Log conflict
    const conflict = await this.logConflict(
      entityType,
      entityId,
      clientVersion,
      serverVersion,
      clientData,
      serverData
    );

    // Determine resolution strategy
    const strategy = this.determineStrategy(entityType, clientData, serverData);

    // Apply resolution
    const resolved = await this.applyResolution(
      conflict.id!,
      entityType,
      entityId,
      strategy,
      clientData,
      serverData
    );

    return resolved;
  }

  /**
   * Determine resolution strategy based on entity type
   */
  private determineStrategy(
    entityType: string,
    clientData: Record<string, unknown>,
    serverData: Record<string, unknown>
  ): ConflictResolutionStrategy {
    // Check if any authoritative fields differ
    const authFields = AUTHORITATIVE_FIELDS[entityType] || [];
    for (const field of authFields) {
      if (clientData[field] !== serverData[field]) {
        return 'AUTHORITATIVE';
      }
    }

    // Default to write-wins
    return 'WRITE_WINS';
  }

  /**
   * Log conflict to database
   */
  private async logConflict(
    entityType: string,
    entityId: string,
    clientVersion: number,
    serverVersion: number,
    clientData: Record<string, unknown>,
    serverData: Record<string, unknown>
  ): Promise<SyncConflict> {
    const result = await this.pool.query(
      `INSERT INTO sync_conflicts 
       (entity_type, entity_id, client_version, server_version, client_data, server_data, resolution_strategy)
       VALUES ($1, $2, $3, $4, $5, $6, 'AUTHORITATIVE')
       RETURNING *`,
      [
        entityType,
        entityId,
        clientVersion,
        serverVersion,
        JSON.stringify(clientData),
        JSON.stringify(serverData),
      ]
    );

    return result.rows[0];
  }

  /**
   * Apply resolution based on strategy
   */
  private async applyResolution(
    conflictId: number,
    entityType: string,
    entityId: string,
    strategy: ConflictResolutionStrategy,
    clientData: Record<string, unknown>,
    serverData: Record<string, unknown>
  ): Promise<ConflictResolutionResult> {
    let resolvedData: Record<string, unknown>;

    switch (strategy) {
      case 'AUTHORITATIVE':
        resolvedData = this.applyAuthoritativeResolution(entityType, clientData, serverData);
        break;
      case 'WRITE_WINS':
        resolvedData = this.applyWriteWinsResolution(clientData, serverData);
        break;
      default:
        resolvedData = serverData;
    }

    // Update conflict with resolution
    await this.pool.query(
      `UPDATE sync_conflicts 
       SET resolved_data = $1, resolved_at = NOW(), resolution_strategy = $2
       WHERE id = $3`,
      [JSON.stringify(resolvedData), strategy, conflictId]
    );

    return {
      resolved: true,
      strategy,
      resolved_data: resolvedData,
      message: `Resolved using ${strategy} strategy`,
    };
  }

  /**
   * Apply authoritative resolution (server wins for critical fields)
   */
  private applyAuthoritativeResolution(
    entityType: string,
    clientData: Record<string, unknown>,
    serverData: Record<string, unknown>
  ): Record<string, unknown> {
    const result = { ...clientData };
    const authFields = AUTHORITATIVE_FIELDS[entityType] || [];

    // Server wins for authoritative fields
    for (const field of authFields) {
      if (serverData[field] !== undefined) {
        result[field] = serverData[field];
      }
    }

    return result;
  }

  /**
   * Apply write-wins resolution (newest timestamp wins)
   */
  private applyWriteWinsResolution(
    clientData: Record<string, unknown>,
    serverData: Record<string, unknown>
  ): Record<string, unknown> {
    const clientUpdated = (clientData.updated_at as string) || '';
    const serverUpdated = (serverData.updated_at as string) || '';

    // Compare timestamps
    if (clientUpdated > serverUpdated) {
      return clientData;
    }

    return serverData;
  }

  /**
   * Get unresolved conflicts
   */
  async getUnresolvedConflicts(
    entityType?: string,
    limit: number = 50
  ): Promise<SyncConflict[]> {
    let query = 'SELECT * FROM sync_conflicts WHERE resolved_at IS NULL';
    const params: unknown[] = [limit];

    if (entityType) {
      query += ' AND entity_type = $1';
      params.unshift(entityType);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + params.length;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  /**
   * Resolve conflict manually
   */
  async resolveConflictManually(
    conflictId: number,
    resolution: 'CLIENT' | 'SERVER' | 'MERGE',
    mergedData?: Record<string, unknown>
  ): Promise<boolean> {
    const conflictResult = await this.pool.query(
      'SELECT * FROM sync_conflicts WHERE id = $1',
      [conflictId]
    );

    if (conflictResult.rows.length === 0) {
      return false;
    }

    const conflict = conflictResult.rows[0];
    const clientData = JSON.parse(conflict.client_data);
    const serverData = JSON.parse(conflict.server_data);

    let resolvedData: Record<string, unknown>;
    switch (resolution) {
      case 'CLIENT':
        resolvedData = clientData;
        break;
      case 'SERVER':
        resolvedData = serverData;
        break;
      case 'MERGE':
        resolvedData = mergedData || serverData;
        break;
    }

    await this.pool.query(
      `UPDATE sync_conflicts 
       SET resolved_data = $1, resolved_at = NOW(), resolution_strategy = $2
       WHERE id = $3`,
      [JSON.stringify(resolvedData), resolution, conflictId]
    );

    return true;
  }

  /**
   * Get conflict statistics
   */
  async getConflictStats(): Promise<{
    total: number;
    unresolved: number;
    resolved_today: number;
    by_entity_type: Record<string, number>;
  }> {
    const totalResult = await this.pool.query(
      'SELECT COUNT(*) as count FROM sync_conflicts'
    );
    const unresolvedResult = await this.pool.query(
      'SELECT COUNT(*) as count FROM sync_conflicts WHERE resolved_at IS NULL'
    );
    const resolvedTodayResult = await this.pool.query(
      "SELECT COUNT(*) as count FROM sync_conflicts WHERE resolved_at > NOW() - INTERVAL '24 hours'"
    );
    const byTypeResult = await this.pool.query(
      'SELECT entity_type, COUNT(*) as count FROM sync_conflicts GROUP BY entity_type'
    );

    const byEntityType: Record<string, number> = {};
    for (const row of byTypeResult.rows) {
      byEntityType[row.entity_type] = parseInt(row.count);
    }

    return {
      total: parseInt(totalResult.rows[0].count),
      unresolved: parseInt(unresolvedResult.rows[0].count),
      resolved_today: parseInt(resolvedTodayResult.rows[0].count),
      by_entity_type: byEntityType,
    };
  }
};