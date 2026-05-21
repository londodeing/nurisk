/**
 * Edge Node Service
 * =============
 * Handles edge node operations and cloud sync
 */

import { Pool } from 'pg';

export interface EdgeNodeCapabilities {
  local_db: boolean;
  cache: boolean;
  sync_relay: boolean;
  basic_api: boolean;
}

export interface EdgeNodeConfig {
  node_id: string;
  region: string;
  cloud_endpoint: string;
  sync_interval: number;
  pull_interval: number;
  max_retry: number;
}

export interface EdgeSyncStatus {
  last_sync: Date | null;
  last_pull: Date | null;
  last_push: Date | null;
  pending_changes: number;
  conflicts: number;
  online: boolean;
}

export interface EdgeSyncResult {
  pulled: number;
  pushed: number;
  conflicts: number;
  errors: string[];
}

const DEFAULT_CONFIG: EdgeNodeConfig = {
  node_id: '',
  region: 'default',
  cloud_endpoint: process.env.CLOUD_ENDPOINT || 'https://api.nurisk.id',
  sync_interval: 300000, // 5 minutes
  pull_interval: 300000, // 5 minutes
  max_retry: 3,
};

/**
 * Edge Node Service
 */
export class EdgeNodeService {
  private pool: Pool;
  private config: EdgeNodeConfig;
  private online: boolean = true;
  private syncTimer?: NodeJS.Timeout;

  constructor(pool: Pool, config?: Partial<EdgeNodeConfig>) {
    this.pool = pool;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get edge node capabilities
   */
  getCapabilities(): EdgeNodeCapabilities {
    return {
      local_db: true,
      cache: true,
      sync_relay: true,
      basic_api: true,
    };
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<EdgeSyncStatus> {
    const lastSync = await this.getLastSyncTime();
    const pendingChanges = await this.getPendingChangesCount();
    const conflicts = await this.getConflictsCount();

    return {
      last_sync: lastSync,
      last_pull: await this.getLastPullTime(),
      last_push: await this.getLastPushTime(),
      pending_changes: pendingChanges,
      conflicts,
      online: this.online,
    };
  }

  /**
   * Check cloud connectivity
   */
  async checkCloudConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.cloud_endpoint}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      this.online = response.ok;
      return response.ok;
    } catch {
      this.online = false;
      return false;
    }
  }

  /**
   * Start automatic sync
   */
  startAutoSync(): void {
    if (this.syncTimer) return;

    this.syncTimer = setInterval(async () => {
      await this.syncWithCloud();
    }, this.config.sync_interval);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
  }

  /**
   * Sync with cloud
   */
  async syncWithCloud(): Promise<EdgeSyncResult> {
    const result: EdgeSyncResult = {
      pulled: 0,
      pushed: 0,
      conflicts: 0,
      errors: [],
    };

    // Check connectivity
    const isOnline = await this.checkCloudConnectivity();
    if (!isOnline) {
      result.errors.push('Cloud offline - skipping sync');
      return result;
    }

    try {
      // Pull from cloud
      result.pulled = await this.pullFromCloud();

      // Push to cloud
      result.pushed = await this.pushToCloud();

      // Log sync
      await this.logSync(result);
    } catch (error) {
      result.errors.push((error as Error).message);
    }

    return result;
  }

  /**
   * Pull data from cloud
   */
  private async pullFromCloud(): Promise<number> {
    let pulled = 0;

    try {
      const response = await fetch(`${this.config.cloud_endpoint}/sync/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          since: await this.getLastPullTime(),
          entity_types: ['incident', 'shelter', 'asset', 'volunteer'],
        }),
      });

      if (!response.ok) {
        throw new Error(`Pull failed: ${response.status}`);
      }

      const data = await response.json();
      const changes = data.changes || [];

      // Apply changes locally
      for (const change of changes) {
        await this.applyChange(change);
        pulled++;
      }

      // Update last pull time
      await this.updateLastPullTime();
    } catch (error) {
      console.error('PULL_ERROR:', error);
    }

    return pulled;
  }

  /**
   * Push local changes to cloud
   */
  private async pushToCloud(): Promise<number> {
    let pushed = 0;

    try {
      // Get pending changes
      const changes = await this.getPendingChanges();

      if (changes.length === 0) {
        return 0;
      }

      const response = await fetch(`${this.config.cloud_endpoint}/sync/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changes,
          client_id: this.config.node_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Push failed: ${response.status}`);
      }

      const result = await response.json();

      // Mark accepted changes as synced
      for (const change of changes) {
        if (typeof change.id === 'number') {
          await this.markChangeSynced(change.id);
          pushed++;
        }
      }

      // Update last push time
      await this.updateLastPushTime();
    } catch (error) {
      console.error('PUSH_ERROR:', error);
    }

    return pushed;
  }

  /**
   * Apply change locally
   */
  private async applyChange(change: Record<string, unknown>): Promise<void> {
    const { entity_type, entity_id, operation, data } = change as {
      entity_type: string;
      entity_id: string;
      operation: string;
      data: Record<string, unknown>;
    };

    const table = this.getTableName(entity_type);
    if (!table) return;

    switch (operation) {
      case 'CREATE':
      case 'UPDATE':
        await this.pool.query(
          `INSERT INTO ${table} (id, sync_version, data)
           VALUES ($1, $2, $3)
           ON CONFLICT (id) DO UPDATE SET sync_version = $2, data = $3`,
          [entity_id, data.version, JSON.stringify(data)]
        );
        break;
      case 'DELETE':
        await this.pool.query(`DELETE FROM ${table} WHERE id = $1`, [entity_id]);
        break;
    }
  }

  /**
   * Get table name for entity type
   */
  private getTableName(entityType: string): string | null {
    const tableMap: Record<string, string> = {
      incident: 'incidents',
      mission: 'missions',
      asset: 'assets',
      volunteer: 'volunteers',
      shelter: 'shelters',
    };
    return tableMap[entityType] || null;
  }

  /**
   * Get pending changes
   */
  private async getPendingChanges(): Promise<Array<Record<string, unknown>>> {
    const result = await this.pool.query(
      `SELECT * FROM sync_changelog 
       WHERE synced = false AND created_at > NOW() - INTERVAL '24 hours'
       ORDER BY created_at ASC LIMIT 100`
    );
    return result.rows;
  }

  /**
   * Mark change as synced
   */
  private async markChangeSynced(changeId: number): Promise<void> {
    await this.pool.query(
      `UPDATE sync_changelog SET synced = true WHERE id = $1`,
      [changeId]
    );
  }

  /**
   * Get last sync time
   */
  private async getLastSyncTime(): Promise<Date | null> {
    const result = await this.pool.query(
      `SELECT MAX(created_at) as last_sync FROM edge_sync_log`
    );
    return result.rows[0]?.last_sync || null;
  }

  /**
   * Get last pull time
   */
  private async getLastPullTime(): Promise<Date> {
    const result = await this.pool.query(
      `SELECT MAX(pulled_at) as last_pull FROM edge_sync_log`
    );
    return result.rows[0]?.last_pull || new Date(0);
  }

  /**
   * Get last push time
   */
  private async getLastPushTime(): Promise<Date> {
    const result = await this.pool.query(
      `SELECT MAX(pushed_at) as last_push FROM edge_sync_log`
    );
    return result.rows[0]?.last_push || new Date(0);
  }

  /**
   * Update last pull time
   */
  private async updateLastPullTime(): Promise<void> {
    await this.pool.query(
      `INSERT INTO edge_sync_log (node_id, pulled_at) VALUES ($1, NOW())`,
      [this.config.node_id]
    );
  }

  /**
   * Update last push time
   */
  private async updateLastPushTime(): Promise<void> {
    await this.pool.query(
      `INSERT INTO edge_sync_log (node_id, pushed_at) VALUES ($1, NOW())`,
      [this.config.node_id]
    );
  }

  /**
   * Get pending changes count
   */
  private async getPendingChangesCount(): Promise<number> {
    const result = await this.pool.query(
      `SELECT COUNT(*) as count FROM sync_changelog WHERE synced = false`
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Get conflicts count
   */
  private async getConflictsCount(): Promise<number> {
    const result = await this.pool.query(
      `SELECT COUNT(*) as count FROM sync_conflicts WHERE resolved_at IS NULL`
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Log sync result
   */
  private async logSync(result: EdgeSyncResult): Promise<void> {
    await this.pool.query(
      `INSERT INTO edge_sync_log (node_id, pulled, pushed, errors)
       VALUES ($1, $2, $3, $4)`,
      [this.config.node_id, result.pulled, result.pushed, JSON.stringify(result.errors)]
    );
  }
};