import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { PostGISUtils } from '../utils/postgis.utils';

export interface RiskInput {
  type: 'social_media' | 'news' | 'sensor' | 'field_report';
  source: string;
  content: string;
  location?: { lat: number; lng: number };
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface RiskScore {
  overall: number; // 0-100
  impact: number;
  likelihood: number;
  vulnerability: number;
  urgency: number;
}

export interface RiskDecision {
  incidentId?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedResources: ResourceRecommendation[];
  nextActions: string[];
  confidence: number;
}

export interface ResourceRecommendation {
  type: 'volunteer' | 'equipment' | 'logistics' | 'evacuation';
  quantity: number;
  urgency: 'immediate' | 'soon' | 'later';
  notes?: string;
}

@Injectable()
export class RiskOrchestrator {
  private readonly logger = new Logger(RiskOrchestrator.name);

  // Weight configuration for risk scoring
  private readonly weights = {
    sourceReliability: {
      social_media: 0.3,
      news: 0.5,
      sensor: 0.9,
      field_report: 1.0,
    },
    riskFactors: {
      impact: 0.4,
      likelihood: 0.3,
      vulnerability: 0.2,
      urgency: 0.1,
    },
  };

  constructor(private eventEmitter: EventEmitter2) {}

  /**
   * Main orchestration method - process risk input and generate decision
   */
  async process(input: RiskInput): Promise<RiskDecision> {
    this.logger.log(`Processing risk input: ${input.type} from ${input.source}`);

    // 1. Input fusion - normalize and validate
    const fused = await this.fuseInput(input);

    // 2. Risk scoring
    const score = await this.calculateRiskScore(fused);

    // 3. Priority assignment
    const priority = this.assignPriority(score);

    // 4. Resource recommendation
    const resources = this.recommendResources(fused, score);

    // 5. Generate next actions
    const actions = this.generateActions(fused, score, priority);

    // Emit event for downstream processing
    this.eventEmitter.emit('risk.evaluated', {
      input,
      score,
      priority,
      resources,
      timestamp: new Date(),
    });

    return {
      priority,
      recommendedResources: resources,
      nextActions: actions,
      confidence: this.calculateConfidence(fused),
    };
  }

  /**
   * Fuse multiple inputs for the same event
   */
  private async fuseInput(input: RiskInput): Promise<RiskInput & { reliability: number }> {
    let reliability = this.weights.sourceReliability[input.type];

    // Adjust reliability based on metadata
    if (input.metadata?.verified) reliability *= 1.2;
    if (input.metadata?.followers > 1000) reliability *= 1.1;
    if (input.metadata?.shares > 100) reliability *= 1.05;

    return {
      ...input,
      reliability: Math.min(reliability, 1.0),
    };
  }

  /**
   * Calculate risk score (0-100)
   */
  private async calculateRiskScore(input: RiskInput & { reliability: number }): Promise<RiskScore> {
    // Base scores by input type
    const baseScores = {
      social_media: { impact: 40, likelihood: 50, vulnerability: 60, urgency: 30 },
      news: { impact: 60, likelihood: 70, vulnerability: 50, urgency: 50 },
      sensor: { impact: 80, likelihood: 90, vulnerability: 70, urgency: 70 },
      field_report: { impact: 90, likelihood: 95, vulnerability: 80, urgency: 90 },
    };

    const base = baseScores[input.type];
    const reliability = input.reliability;

    // Adjust scores by reliability
    const impact = Math.min(100, base.impact * reliability);
    const likelihood = Math.min(100, base.likelihood * reliability);
    const vulnerability = Math.min(100, base.vulnerability * reliability);
    const urgency = Math.min(100, base.urgency * reliability);

    // Weighted overall
    const overall =
      impact * this.weights.riskFactors.impact +
      likelihood * this.weights.riskFactors.likelihood +
      vulnerability * this.weights.riskFactors.vulnerability +
      urgency * this.weights.riskFactors.urgency;

    return {
      overall: Math.round(overall),
      impact: Math.round(impact),
      likelihood: Math.round(likelihood),
      vulnerability: Math.round(vulnerability),
      urgency: Math.round(urgency),
    };
  }

  /**
   * Assign priority based on risk score
   */
  private assignPriority(score: RiskScore): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    if (score.overall >= 80 || score.urgency >= 90) return 'CRITICAL';
    if (score.overall >= 60 || score.urgency >= 70) return 'HIGH';
    if (score.overall >= 40 || score.urgency >= 50) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Recommend resources based on risk level
   */
  private recommendResources(
    input: RiskInput,
    score: RiskScore
  ): ResourceRecommendation[] {
    const resources: ResourceRecommendation[] = [];

    // Base recommendations by priority
    if (score.overall >= 80) {
      resources.push(
        { type: 'volunteer', quantity: 20, urgency: 'immediate' },
        { type: 'equipment', quantity: 10, urgency: 'immediate' },
        { type: 'logistics', quantity: 5, urgency: 'immediate' },
        { type: 'evacuation', quantity: 1, urgency: 'immediate' }
      );
    } else if (score.overall >= 60) {
      resources.push(
        { type: 'volunteer', quantity: 10, urgency: 'soon' },
        { type: 'equipment', quantity: 5, urgency: 'soon' },
        { type: 'logistics', quantity: 2, urgency: 'soon' }
      );
    } else if (score.overall >= 40) {
      resources.push(
        { type: 'volunteer', quantity: 5, urgency: 'later' },
        { type: 'equipment', quantity: 2, urgency: 'later' }
      );
    }

    // Adjust by input type
    if (input.type === 'sensor') {
      resources.push({ type: 'equipment', quantity: 5, urgency: 'immediate', notes: 'Calibration needed' });
    }

    return resources;
  }

  /**
   * Generate next actions based on risk evaluation
   */
  private generateActions(
    input: RiskInput,
    score: RiskScore,
    priority: string
  ): string[] {
    const actions: string[] = [];

    // Always verify source
    actions.push('Verify source reliability');

    // Priority-based actions
    if (priority === 'CRITICAL') {
      actions.push('Activate emergency response');
      actions.push('Notify incident command');
      actions.push('Dispatch rapid assessment team');
      actions.push('Prepare evacuation if needed');
    } else if (priority === 'HIGH') {
      actions.push('Dispatch assessment team');
      actions.push('Monitor for escalation');
      actions.push('Prepare resources');
    } else if (priority === 'MEDIUM') {
      actions.push('Log for monitoring');
      actions.push('Schedule routine check');
    }

    // Type-specific actions
    if (input.type === 'social_media') {
      actions.push('Cross-reference with official sources');
    } else if (input.type === 'sensor') {
      actions.push('Verify sensor calibration');
    } else if (input.type === 'field_report') {
      actions.push('Update incident status');
    }

    return actions;
  }

  /**
   * Calculate confidence in the decision
   */
  private calculateConfidence(input: RiskInput & { reliability: number }): number {
    let confidence = input.reliability * 100;

    // Location availability increases confidence
    if (input.location) confidence += 20;

    // Recent timestamp increases confidence
    const age = Date.now() - input.timestamp.getTime();
    if (age < 3600000) confidence += 10; // < 1 hour
    else if (age < 86400000) confidence += 5; // < 24 hours

    return Math.min(100, Math.round(confidence));
  }

  /**
   * Batch process multiple inputs
   */
  async processBatch(inputs: RiskInput[]): Promise<RiskDecision[]> {
    return Promise.all(inputs.map((input) => this.process(input)));
  }

  /**
   * Re-evaluate existing incident with new input
   */
  async reevaluate(incidentId: string, newInput: RiskInput): Promise<RiskDecision> {
    this.logger.log(`Re-evaluating incident ${incidentId}`);

    // Fetch existing inputs for this incident
    // const existingInputs = await this.fetchIncidentInputs(incidentId);

    // Process new input
    return this.process(newInput);
  }
}