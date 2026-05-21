/**
 * Source Reliability Service
 * =================
 * Manages source reputation tracking and scoring
 */

import { Pool } from 'pg';

export interface SourceReliability {
  source_id: string;
  source_type: 'reporter' | 'institution' | 'scraper';
  reputation_score: number;
  total_reports: number;
  verified_count: number;
  false_count: number;
  last_accuracy: number;
  last_updated: Date;
  created_at: Date;
}

export interface SourceReputationHistory {
  id: number;
  source_id: string;
  reputation_score: number;
  recorded_at: Date;
}

const RECENCY_WEIGHT = 2;
const RECENCY_COUNT = 50;
const DECAY_RATE = 1; // 1 point per month
const INACTIVE_MONTHS = 12; // Start decaying after 12 months

/**
 * Source Reliability Service
 */
class SourceReliabilityService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Initialize tables
   */
  async initializeTables(): Promise<void> {
    // Create source_reliability table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS source_reliability (
        source_id VARCHAR(255) PRIMARY KEY,
        source_type VARCHAR(50) NOT NULL DEFAULT 'reporter',
        reputation_score DECIMAL(5,2) NOT NULL DEFAULT 50.00,
        total_reports INTEGER NOT NULL DEFAULT 0,
        verified_count INTEGER NOT NULL DEFAULT 0,
        false_count INTEGER NOT NULL DEFAULT 0,
        last_accuracy DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create source_reputation_history table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS source_reputation_history (
        id SERIAL PRIMARY KEY,
        source_id VARCHAR(255) REFERENCES source_reliability(source_id),
        reputation_score DECIMAL(5,2) NOT NULL,
        recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create index on history
    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_source_reputation_history_source_id 
      ON source_reputation_history(source_id)
    `);

    // Create trust_bad_actors table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS trust_bad_actors (
        source_id VARCHAR(255) PRIMARY KEY,
        reason TEXT,
        added_by VARCHAR(255),
        active BOOLEAN NOT NULL DEFAULT true,
        added_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    console.log('[SOURCE_RELIABILITY] Tables initialized');
  }

  /**
   * Calculate and update reputation for a source
   */
  async calculateReputation(sourceId: string): Promise<SourceReliability> {
    // Get all reports for this source
    const reportsResult = await this.pool.query(`
      SELECT id, status, created_at
      FROM intel_reports
      WHERE source_id = $1
      ORDER BY created_at DESC
    `, [sourceId]);

    const reports = reportsResult.rows;
    const total = reports.length;

    if (total === 0) {
      // Initialize with default score
      await this.pool.query(`
        INSERT INTO source_reliability (source_id, source_type, reputation_score, total_reports)
        VALUES ($1, 'reporter', 50.00, 0)
        ON CONFLICT (source_id) DO UPDATE SET
          last_updated = NOW()
      `, [sourceId]);

      const result = await this.getSourceReliability(sourceId);
      if (!result) {
        throw new Error('Failed to create source reliability record');
      }
      return result;
    }

    // Count verified and false
    let verified = 0;
    let falseReports = 0;

    for (const report of reports) {
      if (report.status === 'VERIFIED_TRUE') verified++;
      else if (report.status === 'VERIFIED_FALSE') falseReports++;
    }

    // Calculate weighted accuracy (recent reports weighted more)
    const recentReports = reports.slice(0, RECENCY_COUNT);
    let weightedVerified = 0;
    let weightedTotal = 0;

    for (let i = 0; i < reports.length; i++) {
      const weight = i < RECENCY_COUNT ? RECENCY_WEIGHT : 1;
      weightedTotal += weight;

      if (reports[i].status === 'VERIFIED_TRUE') {
        weightedVerified += weight;
      } else if (reports[i].status === 'VERIFIED_FALSE') {
        // Penalize false reports
        weightedVerified -= weight * 0.5;
      }
    }

    // Calculate reputation score
    let reputation = weightedTotal > 0 
      ? (weightedVerified / weightedTotal) * 100 
      : 50;

    // Apply decay for inactivity
    const lastReportDate = new Date(reports[0]?.created_at);
    const monthsInactive = this.monthsSince(lastReportDate);

    if (monthsInactive > INACTIVE_MONTHS) {
      const decay = (monthsInactive - INACTIVE_MONTHS) * DECAY_RATE;
      reputation = Math.max(0, reputation - decay);
    }

    // Ensure bounds
    reputation = Math.max(0, Math.min(100, Math.round(reputation * 100) / 100));

    // Update database
    await this.pool.query(`
      INSERT INTO source_reliability 
        (source_id, source_type, reputation_score, total_reports, verified_count, false_count, last_accuracy, last_updated)
      VALUES ($1, 'reporter', $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (source_id) DO UPDATE SET
        reputation_score = $2,
        total_reports = $3,
        verified_count = $4,
        false_count = $5,
        last_accuracy = $6,
        last_updated = NOW()
    `, [sourceId, reputation, total, verified, falseReports, verified / total * 100]);

    // Record history
    await this.recordHistory(sourceId, reputation);

    const result = await this.getSourceReliability(sourceId);
    if (!result) {
      throw new Error('Failed to update source reliability record');
    }
    return result;
  }

  /**
   * Get source reliability record
   */
  async getSourceReliability(sourceId: string): Promise<SourceReliability | null> {
    const result = await this.pool.query(`
      SELECT * FROM source_reliability WHERE source_id = $1
    `, [sourceId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Get all sources with pagination
   */
  async getAllSources(limit = 50, offset = 0): Promise<SourceReliability[]> {
    const result = await this.pool.query(`
      SELECT * FROM source_reliability
      ORDER BY reputation_score DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    return result.rows;
  }

  /**
   * Get reputation history
   */
  async getReputationHistory(
    sourceId: string,
    days = 30
  ): Promise<SourceReputationHistory[]> {
    const result = await this.pool.query(`
      SELECT * FROM source_reputation_history
      WHERE source_id = $1 AND recorded_at >= NOW() - INTERVAL '$2 days'
      ORDER BY recorded_at ASC
    `, [sourceId, days.toString()]);

    return result.rows;
  }

  /**
   * Record history point
   */
  private async recordHistory(sourceId: string, score: number): Promise<void> {
    // Only record if significantly different from last
    const lastResult = await this.pool.query(`
      SELECT reputation_score FROM source_reputation_history
      WHERE source_id = $1
      ORDER BY recorded_at DESC
      LIMIT 1
    `, [sourceId]);

    if (lastResult.rows.length === 0 || Math.abs(lastResult.rows[0].reputation_score - score) > 2) {
      await this.pool.query(`
        INSERT INTO source_reputation_history (source_id, reputation_score)
        VALUES ($1, $2)
      `, [sourceId, score]);
    }
  }

  /**
   * Add bad actor
   */
  async addBadActor(sourceId: string, reason: string, addedBy: string): Promise<void> {
    await this.pool.query(`
      INSERT INTO trust_bad_actors (source_id, reason, added_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (source_id) DO UPDATE SET
        reason = $2,
        added_by = $3,
        active = true
    `, [sourceId, reason, addedBy]);

    // Set reputation to 0
    await this.pool.query(`
      UPDATE source_reliability SET reputation_score = 0 WHERE source_id = $1
    `, [sourceId]);
  }

  /**
   * Remove bad actor
   */
  async removeBadActor(sourceId: string): Promise<void> {
    await this.pool.query(`
      UPDATE trust_bad_actors SET active = false WHERE source_id = $1
    `, [sourceId]);
  }

  /**
   * Check if source is bad actor
   */
  async isBadActor(sourceId: string): Promise<boolean> {
    const result = await this.pool.query(`
      SELECT COUNT(*) as count FROM trust_bad_actors
      WHERE source_id = $1 AND active = true
    `, [sourceId]);

    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Calculate months since date
   */
  private monthsSince(date: Date): number {
    const now = new Date();
    return (now.getTime() - date.getTime()) / (30 * 24 * 60 * 60 * 1000);
  }

  /**
   * Batch recalculate all sources
   */
  async batchRecalculate(): Promise<number> {
    const sourcesResult = await this.pool.query(`
      SELECT source_id FROM intel_reports
      GROUP BY source_id
    `);

    let updated = 0;
    for (const row of sourcesResult.rows) {
      try {
        await this.calculateReputation(row.source_id);
        updated++;
      } catch {
        // Skip failed sources
      }
    }

    return updated;
  }
}

// Export for CommonJS
export { SourceReliabilityService };