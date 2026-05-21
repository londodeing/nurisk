/**
 * Verification Pipeline Service
 * =================
 * Multi-step verification pipeline for intelligence reports
 */

import { Pool } from 'pg';
import { TrustScoringService } from './trust-score';
import { SourceReliabilityService } from './source-reliability';

export interface VerificationRequest {
  reportId: string;
  content: string;
  source: string;
  sourceType: 'reporter' | 'institution' | 'scraper';
  location?: { lat: number; lng: number };
  metadata?: Record<string, unknown>;
  webhookUrl?: string;
}

export interface VerificationResult {
  report_id: string;
  status: 'CONFIRMED' | 'LIKELY' | 'POSSIBLE' | 'UNLIKELY' | 'REJECTED' | 'PENDING_REVIEW';
  confidence: number;
  evidence: VerificationEvidence;
  flags: string[];
  recommended_action: 'auto_publish' | 'manual_review' | 'reject' | 'escalate';
  processed_at: Date;
}

export interface VerificationEvidence {
  trust_score: number;
  source_reliability: number;
  corroboration_count: number;
  cross_references: CrossReference[];
  authoritative_matches: AuthoritativeMatch[];
  hoax_flags: HoaxFlag[];
}

export interface CrossReference {
  reference_id: string;
  similarity: number;
  source: string;
}

export interface AuthoritativeMatch {
  source: string;
  matched: boolean;
  details?: string;
}

export interface HoaxFlag {
  pattern: string;
  matched: boolean;
  description?: string;
}

export type VerificationStatus = 'pending' | 'processing' | 'completed' | 'failed';

const THRESHOLDS = {
  CONFIRMED: 80,
  LIKELY: 60,
  POSSIBLE: 40,
  UNLIKELY: 20,
};

const HOAX_PATTERNS = [
  'hoax',
  'fake',
  'berita palsu',
  'hoax bjir',
  'news is fake',
  'this is a test',
  'testing only',
];

const AUTHORITATIVE_SOURCES = ['BMKG', 'MAGMA', 'BNPB', 'PVMBG', 'BASARNAS'];

/**
 * Verification Pipeline
 */
class VerificationPipeline {
  private pool: Pool;
  private trustService: TrustScoringService;
  private sourceService: SourceReliabilityService;

  constructor(pool: Pool) {
    this.pool = pool;
    this.trustService = new TrustScoringService();
    this.sourceService = new SourceReliabilityService(pool);
  }

  /**
   * Run full verification pipeline
   */
  async verify(request: VerificationRequest): Promise<VerificationResult> {
    const startTime = Date.now();

    try {
      // Step 1: Parse (already have structured data)
      const parsed = await this.stepParse(request);

      // Step 2: Cross-reference
      const crossRef = await this.stepCrossReference(parsed);

      // Step 3: Score
      const scores = await this.stepScore(parsed);

      // Step 4: Classify
      const classification = await this.stepClassify(scores);

      // Step 5: Store
      const result = await this.stepStore(parsed, classification, crossRef);

      // Callback webhook if provided
      if (request.webhookUrl) {
        this.sendWebhook(request.webhookUrl, result).catch(console.error);
      }

      console.log(`[VERIFICATION_PIPELINE] Completed in ${Date.now() - startTime}ms`);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[VERIFICATION_PIPELINE] Error:', errorMessage);
      throw error;
    }
  }

  /**
   * Step 1: Parse
   */
  private async stepParse(request: VerificationRequest): Promise<VerificationRequest> {
    // Validate required fields
    if (!request.reportId || !request.content) {
      throw new Error('Missing required fields: reportId, content');
    }

    // Update status
    await this.updateStatus(request.reportId, 'processing');

    return request;
  }

  /**
   * Step 2: Cross-reference
   */
  private async stepCrossReference(request: VerificationRequest): Promise<{
    crossReferences: CrossReference[];
    hoaxFlags: HoaxFlag[];
    authoritativeMatches: AuthoritativeMatch[];
  }> {
    const crossReferences: CrossReference[] = [];
    const hoaxFlags: HoaxFlag[] = [];
    const authoritativeMatches: AuthoritativeMatch[] = [];

    // Check against existing intel_reports
    try {
      const existingResult = await this.pool.query(`
        SELECT id, title, content, similarity($1, content) as sim
        FROM intel_reports
        WHERE similarity($1, content) > 0.5
        LIMIT 5
      `, [request.content]);

      for (const row of existingResult.rows) {
        crossReferences.push({
          reference_id: row.id,
          similarity: parseFloat(row.sim),
          source: 'intel_reports',
        });
      }
    } catch {
      // Similarity function may not exist
    }

    // Check hoax patterns
    const contentLower = request.content.toLowerCase();
    for (const pattern of HOAX_PATTERNS) {
      if (contentLower.includes(pattern.toLowerCase())) {
        hoaxFlags.push({
          pattern,
          matched: true,
          description: `Found hoax pattern: ${pattern}`,
        });
      }
    }

    // Cross-reference authoritative sources
    for (const source of AUTHORITATIVE_SOURCES) {
      try {
        const match = await this.checkAuthoritativeSource(source, request);
        authoritativeMatches.push(match);
      } catch {
        authoritativeMatches.push({
          source,
          matched: false,
        });
      }
    }

    return { crossReferences, hoaxFlags, authoritativeMatches };
  }

  /**
   * Step 3: Score
   */
  private async stepScore(request: VerificationRequest): Promise<{
    trustScore: number;
    sourceReliability: number;
    corroborationCount: number;
  }> {
    // Get trust score
    let trustScore = 50;
    try {
      const trustResult = await this.trustService.calculateScore(request.reportId);
      trustScore = trustResult.score;
    } catch {
      // Use default
    }

    // Get source reliability
    let sourceReliability = 50;
    try {
      const sourceResult = await this.sourceService.getSourceReliability(request.source);
      if (sourceResult) {
        sourceReliability = sourceResult.reputation_score;
      }
    } catch {
      // Use default
    }

    // Count corroborating sources
    let corroborationCount = 0;
    try {
      const corrResult = await this.pool.query(`
        SELECT COUNT(*) as count FROM intel_reports
        WHERE source_id != $1
          AND content = $2
      `, [request.source, request.content]);
      corroborationCount = parseInt(corrResult.rows[0].count);
    } catch {
      // Use default
    }

    return { trustScore, sourceReliability, corroborationCount };
  }

  /**
   * Step 4: Classify
   */
  private async stepClassify(scores: {
    trustScore: number;
    sourceReliability: number;
    corroborationCount: number;
  }): Promise<{
    status: VerificationResult['status'];
    confidence: number;
    recommended_action: VerificationResult['recommended_action'];
  }> {
    // Calculate composite confidence
    const trustWeight = 0.5;
    const sourceWeight = 0.3;
    const corrWeight = 0.2;

    const confidence = Math.round(
      scores.trustScore * trustWeight +
      scores.sourceReliability * sourceWeight +
      Math.min(scores.corroborationCount * 20, 100) * corrWeight
    );

    // Determine status based on thresholds
    let status: VerificationResult['status'];
    if (confidence >= THRESHOLDS.CONFIRMED) {
      status = 'CONFIRMED';
    } else if (confidence >= THRESHOLDS.LIKELY) {
      status = 'LIKELY';
    } else if (confidence >= THRESHOLDS.POSSIBLE) {
      status = 'POSSIBLE';
    } else if (confidence >= THRESHOLDS.UNLIKELY) {
      status = 'UNLIKELY';
    } else {
      status = 'REJECTED';
    }

    // Determine recommended action
    let recommended_action: VerificationResult['recommended_action'];
    if (status === 'REJECTED') {
      recommended_action = 'reject';
    } else if (confidence < THRESHOLDS.LIKELY) {
      recommended_action = 'manual_review';
    } else if (status === 'CONFIRMED') {
      recommended_action = 'auto_publish';
    } else {
      recommended_action = 'escalate';
    }

    return { status, confidence, recommended_action };
  }

  /**
   * Step 5: Store
   */
  private async stepStore(
    request: VerificationRequest,
    classification: {
      status: VerificationResult['status'];
      confidence: number;
      recommended_action: VerificationResult['recommended_action'];
    },
    crossRef: {
      crossReferences: CrossReference[];
      hoaxFlags: HoaxFlag[];
      authoritativeMatches: AuthoritativeMatch[];
    }
  ): Promise<VerificationResult> {
    const evidence: VerificationEvidence = {
      trust_score: 0,
      source_reliability: 0,
      corroboration_count: crossRef.crossReferences.length,
      cross_references: crossRef.crossReferences,
      authoritative_matches: crossRef.authoritativeMatches,
      hoax_flags: crossRef.hoaxFlags,
    };

    // Store verification result
    await this.pool.query(`
      INSERT INTO verification_results 
        (report_id, status, confidence, evidence, recommended_action, processed_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (report_id) DO UPDATE SET
        status = $2,
        confidence = $3,
        evidence = $4,
        recommended_action = $5,
        processed_at = NOW()
    `, [
      request.reportId,
      classification.status,
      classification.confidence,
      JSON.stringify(evidence),
      classification.recommended_action,
    ]);

    // Update status
    await this.updateStatus(
      request.reportId,
      classification.status === 'REJECTED' ? 'failed' : 'completed'
    );

    return {
      report_id: request.reportId,
      status: classification.status,
      confidence: classification.confidence,
      evidence,
      flags: crossRef.hoaxFlags.filter((f) => f.matched).map((f) => f.description || f.pattern),
      recommended_action: classification.recommended_action,
      processed_at: new Date(),
    };
  }

  /**
   * Check authoritative source
   */
  private async checkAuthoritativeSource(
    source: string,
    request: VerificationRequest
  ): Promise<AuthoritativeMatch> {
    // Simplified - would integrate with actual APIs
    return {
      source,
      matched: false,
    };
  }

  /**
   * Update verification status
   */
  private async updateStatus(
    reportId: string,
    status: VerificationStatus
  ): Promise<void> {
    try {
      await this.pool.query(`
        INSERT INTO verification_status (report_id, status, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (report_id) DO UPDATE SET
          status = $2,
          updated_at = NOW()
      `, [reportId, status]);
    } catch {
      // Table may not exist
    }
  }

  /**
   * Send webhook callback
   */
  private async sendWebhook(
    url: string,
    result: VerificationResult
  ): Promise<void> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        console.error('[VERIFICATION_PIPELINE] Webhook failed:', response.status);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[VERIFICATION_PIPELINE] Webhook error:', errorMessage);
    }
  }

  /**
   * Get verification result
   */
  async getResult(reportId: string): Promise<VerificationResult | null> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM verification_results WHERE report_id = $1
      `, [reportId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        report_id: row.report_id,
        status: row.status,
        confidence: row.confidence,
        evidence: typeof row.evidence === 'string' ? JSON.parse(row.evidence) : row.evidence,
        flags: [],
        recommended_action: row.recommended_action,
        processed_at: row.processed_at,
      };
    } catch {
      return null;
    }
  }
}

// Export for CommonJS
export { VerificationPipeline as VerificationPipeline };