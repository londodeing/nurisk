/**
 * Delta Sync Service
 * ==============
 * Handles delta sync between client and server
 */

import { Pool } from 'pg';

export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';

export interface SyncChange {
  id?: number;
  entity_type: string;
  entity_id: string;
  operation: SyncOperation;
  data: Record<string, unknown>;
  version: number;
  client_id: string;
  timestamp: Date;
}

export interface SyncResult {
  accepted: SyncChange[];
  rejected: Array<{
    change: SyncChange;
    reason: string;
  }>;
  server_version: string;
}

export interface VectorClock {
  [entity_type: string]: number;
}

/**
 * Delta Sync Service
 */
class DeltaSyncService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Push changes from client to server
   */
  async pushChanges(changes: SyncChange[]): Promise<SyncResult> {
    const accepted: SyncChange[] = [];
    const rejected: Array<{ change: SyncChange; reason: string }> = [];

    for (const change of changes) {
      try {
        const result = await this.processChange(change);
        if (result.accepted) {
          accepted.push(change);
        } else {
          rejected.push({ change, reason: result.reason ?? 'Unknown error' });
        }
      } catch (err) {
        rejected.push({ change, reason: (err as Error).message });
      }
    }

    return {
      accepted,
      rejected,
      server_version: String(Date.now()),
    };
  }

  /**
   * Process single change
   */
  private async processChange(change: SyncChange): Promise<{ accepted: boolean; reason?: string }> {
    const { entity_type, entity_id, operation, data, version } = change;

    // Get current version from server
    const currentVersion = await this.getEntityVersion(entity_type, entity_id);

    // Version conflict check
    if (currentVersion !== null && version <= currentVersion) {
      return {
        accepted: false,
        reason: `Version conflict: client v${version}, server v${currentVersion}`,
      };
    }

    // Apply change based on operation
    switch (operation) {
      case 'CREATE':
        await this.createEntity(entity_type, entity_id, data, version);
        break;
      case 'UPDATE':
        await this.updateEntity(entity_type, entity_id, data, version);
        break;
      case 'DELETE':
        await this.deleteEntity(entity_type, entity_id);
        break;
    }

    // Log change to changelog
    await this.logChange(change, currentVersion);

    return { accepted: true };
  }

  /**
   * Get entity current version
   */
  private async getEntityVersion(entityType: string, entityId: string): Promise<number | null> {
    const table = this.getTableName(entityType);
    if (!table) return null;

    try {
      const result = await this.pool.query(
        `SELECT sync_version FROM ${table} WHERE id = $1`,
        [entityId]
      );
      return result.rows.length > 0 ? result.rows[0].sync_version : null;
    } catch {
      return null;
    }
  }

  /**
   * Create entity
   */
  private async createEntity(
    entityType: string,
    entityId: string,
    data: Record<string, unknown>,
    version: number
  ): Promise<void> {
    const table = this.getTableName(entityType);
    if (!table) throw new Error(`Unknown entity type: ${entityType}`);

    const columns = ['id', 'sync_version', ...Object.keys(data)];
    const values = [entityId, version, ...Object.values(data)];
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    await this.pool.query(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})
       ON CONFLICT (id) DO UPDATE SET sync_version = EXCLUDED.sync_version`,
      values
    );
  }

  /**
   * Update entity
   */
  private async updateEntity(
    entityType: string,
    entityId: string,
    data: Record<string, unknown>,
    version: number
  ): Promise<void> {
    const table = this.getTableName(entityType);
    if (!table) throw new Error(`Unknown entity type: ${entityType}`);

    const setClauses: string[] = ['sync_version = $2'];
    const valueList: unknown[] = [entityId, version];

    let idx = 3;
    for (const [key, value] of Object.entries(data)) {
      setClauses.push(`${key} = $${idx++}`);
      valueList.push(value);
    }

    await this.pool.query(
      `UPDATE ${table} SET ${setClauses.join(', ')} WHERE id = $1`,
      valueList
    );
  }

  /**
   * Delete entity
   */
  private async deleteEntity(entityType: string, entityId: string): Promise<void> {
    const table = this.getTableName(entityType);
    if (!table) throw new Error(`Unknown entity type: ${entityType}`);

    await this.pool.query(`DELETE FROM ${table} WHERE id = $1`, [entityId]);
  }

  /**
   * Log change to changelog
   */
  private async logChange(change: SyncChange, previousVersion: number | null): Promise<void> {
    await this.pool.query(
      `INSERT INTO sync_changelog (entity_type, entity_id, operation, data, client_version, server_version, client_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        change.entity_type,
        change.entity_id,
        change.operation,
        JSON.stringify(change.data),
        change.version,
        previousVersion,
        change.client_id,
      ]
    );
  }

  /**
   * Pull changes since timestamp
   */
  async pullChanges(
    entityTypes: string[],
    since: number,
    limit: number = 100
  ): Promise<SyncChange[]> {
    if (entityTypes.length === 0) {
      entityTypes = ['incident', 'mission', 'asset', 'message', 'volunteer'];
    }

    const changes: SyncChange[] = [];

    for (const entityType of entityTypes) {
      const table = this.getTableName(entityType);
      if (!table) continue;

      try {
        const result = await this.pool.query(
          `SELECT * FROM ${table} WHERE sync_version > $1 ORDER BY sync_version ASC LIMIT $2`,
          [since, limit]
        );

        for (const row of result.rows) {
          changes.push({
            entity_type: entityType,
            entity_id: row.id,
            operation: 'UPDATE',
            data: row,
            version: row.sync_version,
            client_id: '',
            timestamp: new Date(),
          });
        }
      } catch {
        // Table might not exist
      }
    }

    return changes;
  }

  /**
   * Get table name for entity type
   */
  private getTableName(entityType: string): string | null {
    const tableMap: Record<string, string> = {
      incident: 'incidents',
      mission: 'missions',
      asset: 'assets',
      message: 'messages',
      volunteer: 'volunteers',
      shelter: 'shelters',
      notification: 'notifications',
    };
    return tableMap[entityType] || null;
  }

  /**
   * Get vector clock for client
   */
  async getVectorClock(clientId: string): Promise<VectorClock> {
    const clock: VectorClock = {};

    const entityTypes = ['incident', 'mission', 'asset', 'message', 'volunteer'];

    for (const entityType of entityTypes) {
      const table = this.getTableName(entityType);
      if (!table) continue;

      try {
        const result = await this.pool.query(
          `SELECT MAX(sync_version) as max_version FROM ${table}`
        );
        clock[entityType] = result.rows[0]?.max_version || 0;
      } catch {
        clock[entityType] = 0;
      }
    }

    return clock;
  }

  /**
   * Resolve conflicts using vector clock
   */
  async resolveConflicts(
    clientClock: VectorClock,
    serverClock: VectorClock
  ): Promise<{
    wins: string[];
    conflicts: Array<{ entity_type: string; entity_id: string }>;
  }> {
    const wins: string[] = [];
    const conflicts: Array<{ entity_type: string; entity_id: string }> = [];

    for (const [entityType, clientVersion] of Object.entries(clientClock)) {
      const serverVersion = serverClock[entityType] || 0;

      if (clientVersion > serverVersion) {
        wins.push(entityType);
      } else if (clientVersion < serverVersion) {
        conflicts.push({ entity_type: entityType, entity_id: '' });
      }
    }

    return { wins, conflicts };
  }
}

// Export for CommonJS
export { DeltaSyncService as DeltaSyncService };