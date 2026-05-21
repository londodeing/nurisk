import { Injectable, Logger } from '@nestjs/common';
import pool from '../config/database';

export interface TrustScore {
  sourceId: string;
  sourceType: string;
  score: number;
  tier: 'trusted' | 'verified' | 'unverified' | 'untrusted';
  factors: TrustFactor[];
  lastUpdated: Date;
}

export interface TrustFactor {
  name: string;
  value: number;
  weight: number;
  contribution: number;
}

export interface SourceMetrics {
  sourceId: string;
  sourceType: string;
  totalReports: number;
  verifiedReports: number;
  accuracy: number;
  avgResponseTime: number;
  falseReports: number;
  lastReportAt?: Date;
}

@Injectable()
export class TrustScoringService {
  private readonly logger = new Logger(TrustScoringService.name);
  private readonly cache = new Map<string, TrustScore>();
  private readonly CACHE_TTL = 3600000; // 1 hour

  /**
   * Calculate trust score for a source
   */
  async calculateScore(sourceId: string): Promise<TrustScore> {
    // Check cache
    const cached = this.cache.get(sourceId);
    if (cached && Date.now() - cached.lastUpdated.getTime() < this.CACHE_TTL) {
      return cached;
    }

    // Get source metrics
    const metrics = await this.getSourceMetrics(sourceId);

    // Calculate factors
    const factors = this.calculateFactors(metrics);

    // Calculate overall score
    const score = this.calculateOverallScore(factors);

    // Determine tier
    const tier = this.determineTier(score);

    const trustScore: TrustScore = {
      sourceId,
      sourceType: metrics.sourceType || 'unknown',
      score,
      tier,
      factors,
      lastUpdated: new Date(),
    };

    // Cache result
    this.cache.set(sourceId, trustScore);

    // Update in database
    await this.updateTrustScore(sourceId, score, tier, factors);

    this.logger.log(`Trust score for ${sourceId}: ${score} (${tier})`);
    return trustScore;
  }

  /**
   * Get source metrics from database
   */
  private async getSourceMetrics(sourceId: string): Promise<SourceMetrics & { sourceType: string }> {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.source_type,
        COUNT(r.id) as total_reports,
        SUM(CASE WHEN r.verification_status = 'VERIFIED' THEN 1 ELSE 0 END) as verified_reports,
        SUM(CASE WHEN r.verification_status = 'FALSE' THEN 1 ELSE 0 END) as false_reports,
        AVG(CASE WHEN r.verification_status = 'VERIFIED' THEN 1.0 ELSE 0.0 END) as accuracy,
        AVG(EXTRACT(EPOCH FROM (r.resolved_at - r.created_at))/60) as avg_response_minutes,
        MAX(r.created_at) as last_report_at
      FROM sources s
      LEFT JOIN reports r ON r.source_id = s.id
      WHERE s.id = $1
      GROUP BY s.id, s.source_type
    `, [sourceId]);

    if (result.rows.length === 0) {
      return {
        sourceId,
        sourceType: 'unknown',
        totalReports: 0,
        verifiedReports: 0,
        accuracy: 0,
        avgResponseTime: 0,
        falseReports: 0,
      };
    }

    const row = result.rows[0];
    return {
      sourceId: row.id,
      sourceType: row.source_type,
      totalReports: parseInt(row.total_reports) || 0,
      verifiedReports: parseInt(row.verified_reports) || 0,
      accuracy: parseFloat(row.accuracy) || 0,
      avgResponseTime: parseFloat(row.avg_response_minutes) || 0,
      falseReports: parseInt(row.false_reports) || 0,
      lastReportAt: row.last_report_at,
    };
  }

  /**
   * Calculate trust factors
   */
  private calculateFactors(metrics: SourceMetrics): TrustFactor[] {
    const factors: TrustFactor[] = [];

    // Historical accuracy (40% weight)
    const accuracy = this.normalizeAccuracy(metrics.accuracy);
    factors.push({
      name: 'historical_accuracy',
      value: accuracy,
      weight: 0.4,
      contribution: accuracy * 0.4,
    });

    // Response time (30% weight)
    const responseScore = this.normalizeResponseTime(metrics.avgResponseTime);
    factors.push({
      name: 'response_time',
      value: responseScore,
      weight: 0.3,
      contribution: responseScore * 0.3,
    });

    // Verification rate (20% weight)
    const verificationRate = this.calculateVerificationRate(metrics);
    factors.push({
      name: 'verification_rate',
      value: verificationRate,
      weight: 0.2,
      contribution: verificationRate * 0.2,
    });

    // Activity level (10% weight)
    const activityScore = this.calculateActivityScore(metrics);
    factors.push({
      name: 'activity_level',
      value: activityScore,
      weight: 0.1,
      contribution: activityScore * 0.1,
    });

    return factors;
  }

  /**
   * Normalize accuracy to 0-100
   */
  private normalizeAccuracy(accuracy: number): number {
    return Math.min(100, Math.round(accuracy * 100));
  }

  /**
   * Normalize response time (faster = higher score)
   */
  private normalizeResponseTime(minutes: number): number {
    if (minutes <= 0) return 50;
    if (minutes <= 15) return 100;
    if (minutes <= 30) return 90;
    if (minutes <= 60) return 75;
    if (minutes <= 120) return 60;
    if (minutes <= 240) return 45;
    return 30;
  }

  /**
   * Calculate verification rate
   */
  private calculateVerificationRate(metrics: SourceMetrics): number {
    if (metrics.totalReports === 0) return 50;
    return Math.min(100, Math.round(
      (metrics.verifiedReports / metrics.totalReports) * 100
    ));
  }

  /**
   * Calculate activity score
   */
  private calculateActivityScore(metrics: SourceMetrics): number {
    if (metrics.totalReports === 0) return 20;
    if (metrics.totalReports >= 50) return 100;
    if (metrics.totalReports >= 20) return 75;
    if (metrics.totalReports >= 10) return 50;
    return 30;
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(factors: TrustFactor[]): number {
    return Math.round(
      factors.reduce((sum, f) => sum + f.contribution, 0)
    );
  }

  /**
   * Determine tier
   */
  private determineTier(score: number): 'trusted' | 'verified' | 'unverified' | 'untrusted' {
    if (score >= 80) return 'trusted';
    if (score >= 60) return 'verified';
    if (score >= 40) return 'unverified';
    return 'untrusted';
  }

  /**
   * Update trust score in database
   */
  private async updateTrustScore(
    sourceId: string,
    score: number,
    tier: string,
    factors: TrustFactor[]
  ): Promise<void> {
    await pool.query(`
      INSERT INTO source_trust_scores (source_id, score, tier, factors, last_updated)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (source_id) 
      DO UPDATE SET score = $2, tier = $3, factors = $4, last_updated = NOW()
    `, [sourceId, score, tier, JSON.stringify(factors)]);
  }

  /**
   * Get trust score (cached)
   */
  async getScore(sourceId: string): Promise<TrustScore | null> {
    return this.cache.get(sourceId) || null;
  }

  /**
   * Batch calculate scores
   */
  async batchCalculate(sourceIds: string[]): Promise<TrustScore[]> {
    return Promise.all(sourceIds.map((id) => this.calculateScore(id)));
  }

  /**
   * Get all sources by tier
   */
  async getSourcesByTier(tier: string): Promise<TrustScore[]> {
    const result = await pool.query(`
      SELECT source_id, score, tier, factors, last_updated
      FROM source_trust_scores
      WHERE tier = $1
      ORDER BY score DESC
    `, [tier]);

    return result.rows.map((row) => ({
      sourceId: row.source_id,
      sourceType: 'unknown',
      score: row.score,
      tier: row.tier,
      factors: JSON.parse(row.factors),
      lastUpdated: row.last_updated,
    }));
  }

  /**
   * Get trust leaderboard
   */
  async getLeaderboard(limit = 10): Promise<TrustScore[]> {
    const result = await pool.query(`
      SELECT source_id, score, tier, factors, last_updated
      FROM source_trust_scores
      ORDER BY score DESC
      LIMIT $1
    `, [limit]);

    return result.rows.map((row) => ({
      sourceId: row.source_id,
      sourceType: 'unknown',
      score: row.score,
      tier: row.tier,
      factors: JSON.parse(row.factors),
      lastUpdated: row.last_updated,
    }));
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}