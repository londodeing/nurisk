import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import pool from '../config/database';

export interface AgentInput {
  type: string;
  data: Record<string, any>;
  context?: Record<string, any>;
}

export interface AgentOutput {
  agent: string;
  decision: string;
  confidence: number;
  reasoning: string;
  metadata: Record<string, any>;
}

export interface ClassifierDecision extends AgentOutput {
  disasterType: string;
  category: string;
  subCategory?: string;
}

export interface PredictorDecision extends AgentOutput {
  severity: number;
  impact: number;
  likelihood: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  affectedArea: number;
  estimatedCasualties: number;
}

export interface RecommenderDecision extends AgentOutput {
  recommendations: ResourceRecommendation[];
  priority: string;
}

export interface ResourceRecommendation {
  type: 'volunteer' | 'equipment' | 'logistics' | 'medical' | 'evacuation';
  quantity: number;
  urgency: 'immediate' | 'soon' | 'later';
  estimatedCost: number;
  notes?: string;
}

export interface AnalyzerDecision extends AgentOutput {
  verified: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: VerificationFactor[];
  recommendation: string;
}

export interface VerificationFactor {
  factor: string;
  status: 'positive' | 'negative' | 'neutral';
  weight: number;
  notes: string;
}

@Injectable()
export class AgentGovernanceService {
  private readonly logger = new Logger(AgentGovernanceService.name);

  constructor(private eventEmitter: EventEmitter2) {}

  /**
   * Classifier Agent - Determine disaster type
   */
  async classify(input: AgentInput): Promise<ClassifierDecision> {
    const startTime = Date.now();
    const { data } = input;

    // Analyze content for disaster indicators
    const content = (data.content || data.description || '').toLowerCase();
    const keywords = this.extractKeywords(content);

    // Determine disaster type
    const disasterType = this.matchDisasterType(keywords);
    const category = this.categorizeDisaster(disasterType, data);

    // Calculate confidence
    const confidence = this.calculateConfidence(keywords, disasterType);

    const reasoning = this.generateReasoning('classifier', {
      keywords,
      disasterType,
      category,
    });

    this.logger.log(`Classifier: ${disasterType} (${confidence}%)`);

    return {
      agent: 'classifier',
      decision: disasterType,
      confidence,
      reasoning,
      disasterType,
      category,
      subCategory: keywords[0],
      metadata: {
        keywords,
        processingTime: Date.now() - startTime,
      },
    };
  }

  /**
   * Predictor Agent - Forecast severity and impact
   */
  async predict(input: AgentInput): Promise<PredictorDecision> {
    const startTime = Date.now();
    const { data, context } = input;

    // Fetch historical data
    const historical = await this.fetchHistoricalData(data.location);

    // Calculate severity score
    const severity = this.calculateSeverity(data, historical);

    // Calculate impact
    const impact = this.calculateImpact(data, historical);

    // Calculate likelihood
    const likelihood = this.calculateLikelihood(data, historical);

    // Determine trend
    const trend = this.determineTrend(historical);

    // Estimate affected area
    const affectedArea = this.estimateAffectedArea(data);

    // Estimate casualties
    const estimatedCasualties = this.estimateCasualties(
      data,
      severity,
      affectedArea
    );

    const confidence = Math.min(95, 50 + severity * 0.3 + impact * 0.2);

    const reasoning = this.generateReasoning('predictor', {
      severity,
      impact,
      trend,
      historical,
    });

    this.logger.log(`Predictor: severity=${severity}, impact=${impact}`);

    return {
      agent: 'predictor',
      decision: 'severity_prediction',
      confidence,
      reasoning,
      severity,
      impact,
      likelihood,
      trend,
      affectedArea,
      estimatedCasualties,
      metadata: {
        historical,
        processingTime: Date.now() - startTime,
      },
    };
  }

  /**
   * Recommender Agent - Allocate resources
   */
  async recommend(input: AgentInput): Promise<RecommenderDecision> {
    const startTime = Date.now();
    const { data, context } = input;

    const recommendations: ResourceRecommendation[] = [];

    // Analyze severity and impact
    const severity = context?.severity || 50;
    const impact = context?.impact || 50;

    // Volunteer recommendations
    const volunteerCount = this.calculateVolunteers(severity, impact);
    if (volunteerCount > 0) {
      recommendations.push({
        type: 'volunteer',
        quantity: volunteerCount,
        urgency: severity > 70 ? 'immediate' : severity > 40 ? 'soon' : 'later',
        estimatedCost: volunteerCount * 150000,
        notes: `Minimum ${volunteerCount} responders required`,
      });
    }

    // Equipment recommendations
    const equipmentCount = this.calculateEquipment(severity, impact);
    if (equipmentCount > 0) {
      recommendations.push({
        type: 'equipment',
        quantity: equipmentCount,
        urgency: severity > 60 ? 'immediate' : 'soon',
        estimatedCost: equipmentCount * 500000,
        notes: 'Rescue and search equipment',
      });
    }

    // Logistics
    const logisticsCount = this.calculateLogistics(severity, impact);
    if (logisticsCount > 0) {
      recommendations.push({
        type: 'logistics',
        quantity: logisticsCount,
        urgency: 'soon',
        estimatedCost: logisticsCount * 200000,
        notes: 'Supply trucks and supplies',
      });
    }

    // Medical
    if (severity > 50) {
      recommendations.push({
        type: 'medical',
        quantity: Math.ceil(severity / 20),
        urgency: severity > 70 ? 'immediate' : 'soon',
        estimatedCost: severity * 50000,
        notes: 'Medical teams and supplies',
      });
    }

    // Evacuation
    if (impact > 70 || data.evacuationRequired) {
      recommendations.push({
        type: 'evacuation',
        quantity: Math.ceil(impact / 10),
        urgency: 'immediate',
        estimatedCost: impact * 100000,
        notes: 'Evacuation vehicles and shelters',
      });
    }

    const priority = severity > 70 ? 'CRITICAL' : severity > 40 ? 'HIGH' : 'MEDIUM';
    const confidence = Math.min(90, 60 + (recommendations.length * 5));

    const reasoning = this.generateReasoning('recommender', {
      recommendations,
      priority,
    });

    this.logger.log(`Recommender: ${recommendations.length} recommendations`);

    return {
      agent: 'recommender',
      decision: 'resource_allocation',
      confidence,
      reasoning,
      recommendations,
      priority,
      metadata: {
        processingTime: Date.now() - startTime,
      },
    };
  }

  /**
   * Analyzer Agent - Verify and analyze
   */
  async analyze(input: AgentInput): Promise<AnalyzerDecision> {
    const startTime = Date.now();
    const { data, context } = input;

    const factors: VerificationFactor[] = [];

    // Source verification
    const sourceFactor = this.verifySource(data.source);
    factors.push(sourceFactor);

    // Location verification
    const locationFactor = this.verifyLocation(data.location);
    factors.push(locationFactor);

    // Content verification
    const contentFactor = this.verifyContent(data.content);
    factors.push(contentFactor);

    // Historical verification
    const historyFactor = await this.verifyHistorical(data);
    factors.push(historyFactor);

    // Cross-reference verification
    const crossFactor = await this.verifyCrossReference(data);
    factors.push(crossFactor);

    // Calculate overall risk level
    const riskLevel = this.calculateRiskLevel(factors);

    // Determine if verified
    const verified = riskLevel === 'low' || riskLevel === 'medium';

    // Generate recommendation
    const recommendation = this.generateRecommendation(factors, riskLevel);

    const confidence = this.calculateVerificationConfidence(factors);

    const reasoning = this.generateReasoning('analyzer', {
      factors,
      riskLevel,
      verified,
    });

    this.logger.log(`Analyzer: risk=${riskLevel}, verified=${verified}`);

    return {
      agent: 'analyzer',
      decision: 'verification',
      confidence,
      reasoning,
      verified,
      riskLevel,
      factors,
      recommendation,
      metadata: {
        processingTime: Date.now() - startTime,
      },
    };
  }

  /**
   * Orchestrate all agents for a complete decision
   */
  async orchestrate(input: AgentInput): Promise<{
    classification: ClassifierDecision;
    prediction: PredictorDecision;
    recommendation: RecommenderDecision;
    analysis: AnalyzerDecision;
  }> {
    this.logger.log('Orchestrating AI agents...');

    // Run classifiers in parallel
    const [classification, prediction, analysis] = await Promise.all([
      this.classify(input),
      this.predict(input),
      this.analyze(input),
    ]);

    // Run recommender with context from other agents
    const recommendation = await this.recommend({
      ...input,
      context: {
        severity: prediction.severity,
        impact: prediction.impact,
        verified: analysis.verified,
      },
    });

    return {
      classification,
      prediction,
      recommendation,
      analysis,
    };
  }

  // Helper methods

  private extractKeywords(content: string): string[] {
    const keywords: Record<string, string[]> = {
      BANJIR: ['banjir', 'air', 'genangan', 'flood'],
      GEMPA: ['gempa', 'quake', 'gempabumi', 'shake'],
      LONGSOR: ['longsor', 'tanah', 'landslide'],
      KEBAKARAN: ['kebakaran', 'api', 'fire', 'terbakar'],
      TSUNAMI: ['tsunami', 'air laut', 'gelombang'],
      PUTING_BELIANG: ['puting', 'angin', 'topan', 'typhoon'],
      ERUPSI: ['erupsi', 'letusan', 'vulkanik'],
    };

    const found: string[] = [];
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some((w) => content.includes(w))) {
        found.push(type);
      }
    }

    return found;
  }

  private matchDisasterType(keywords: string[]): string {
    if (keywords.length === 0) return 'UNKNOWN';
    return keywords[0];
  }

  private categorizeDisaster(type: string, data: any): string {
    const categories: Record<string, string> = {
      BANJIR: 'hydrometeorological',
      GEMPA: 'geophysical',
      LONGSOR: 'geological',
      KEBAKARAN: 'technological',
      TSUNAMI: 'geophysical',
      PUTING_BELIANG: 'hydrometeorological',
      ERUPSI: 'geological',
    };
    return categories[type] || 'other';
  }

  private calculateConfidence(keywords: string[], type: string): number {
    if (type === 'UNKNOWN') return 20;
    const base = 60;
    const keywordBonus = Math.min(30, keywords.length * 10);
    return Math.min(95, base + keywordBonus);
  }

  private generateReasoning(agent: string, data: any): string {
    return `Agent: ${agent}, Data: ${JSON.stringify(data)}`;
  }

  private async fetchHistoricalData(location: any): Promise<any> {
    if (!location) return {};
    try {
      const result = await pool.query(`
        SELECT COUNT(*) as count, AVG(priority_score) as avg_severity
        FROM incidents
        WHERE ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          10000
        )
        AND created_at > NOW() - INTERVAL '90 days'
      `, [location.lng, location.lat]);
      return result.rows[0] || {};
    } catch {
      return {};
    }
  }

  private calculateSeverity(data: any, historical: any): number {
    let severity = 50;

    // Base from priority
    if (data.priority === 'CRITICAL') severity += 30;
    else if (data.priority === 'HIGH') severity += 20;
    else if (data.priority === 'MEDIUM') severity += 10;

    // Historical factor
    if (historical?.count > 10) severity += 15;
    if (historical?.avg_severity > 70) severity += 10;

    return Math.min(100, severity);
  }

  private calculateImpact(data: any, historical: any): number {
    let impact = 40;

    if (data.populationAffected) impact += 20;
    if (data.infrastructureDamage) impact += 15;
    if (historical?.count > 5) impact += 10;

    return Math.min(100, impact);
  }

  private calculateLikelihood(data: any, historical: any): number {
    let likelihood = 50;

    if (historical?.count > 0) {
      likelihood += Math.min(30, historical.count * 3);
    }

    return Math.min(100, likelihood);
  }

  private determineTrend(historical: any): 'increasing' | 'stable' | 'decreasing' {
    if (!historical?.count) return 'stable';
    if (historical.count > 10) return 'increasing';
    if (historical.count < 3) return 'decreasing';
    return 'stable';
  }

  private estimateAffectedArea(data: any): number {
    return data.affectedRadius || 5; // km²
  }

  private estimateCasualties(data: any, severity: number, area: number): number {
    return Math.round((severity / 100) * (area / 10) * 5);
  }

  private calculateVolunteers(severity: number, impact: number): number {
    return Math.ceil((severity + impact) / 20);
  }

  private calculateEquipment(severity: number, impact: number): number {
    return Math.ceil((severity + impact) / 40);
  }

  private calculateLogistics(severity: number, impact: number): number {
    return Math.ceil((severity + impact) / 60);
  }

  private verifySource(source: string): VerificationFactor {
    const trustedSources = ['bmkg', 'magma', 'volunteer', 'field'];
    const isTrusted = trustedSources.some((s) => source?.toLowerCase().includes(s));

    return {
      factor: 'source',
      status: isTrusted ? 'positive' : 'neutral',
      weight: 0.3,
      notes: isTrusted ? 'Trusted source' : 'Unknown source',
    };
  }

  private verifyLocation(location: any): VerificationFactor {
    const hasLocation = location?.lat && location?.lng;

    return {
      factor: 'location',
      status: hasLocation ? 'positive' : 'negative',
      weight: 0.25,
      notes: hasLocation ? 'Location verified' : 'No location data',
    };
  }

  private verifyContent(content: string): VerificationFactor {
    const hasContent = content && content.length > 20;

    return {
      factor: 'content',
      status: hasContent ? 'positive' : 'negative',
      weight: 0.2,
      notes: hasContent ? 'Content verified' : 'Insufficient content',
    };
  }

  private async verifyHistorical(data: any): Promise<VerificationFactor> {
    const hasHistory = data.historicalCount > 0;

    return {
      factor: 'historical',
      status: hasHistory ? 'positive' : 'neutral',
      weight: 0.15,
      notes: hasHistory ? 'Historical data exists' : 'No historical data',
    };
  }

  private async verifyCrossReference(data: any): Promise<VerificationFactor> {
    const hasMultiple = data.sources?.length > 1;

    return {
      factor: 'cross_reference',
      status: hasMultiple ? 'positive' : 'neutral',
      weight: 0.1,
      notes: hasMultiple ? 'Multiple sources' : 'Single source',
    };
  }

  private calculateRiskLevel(factors: VerificationFactor[]): 'low' | 'medium' | 'high' | 'critical' {
    const positive = factors.filter((f) => f.status === 'positive').length;
    const negative = factors.filter((f) => f.status === 'negative').length;

    if (negative >= 2) return 'critical';
    if (negative >= 1) return 'high';
    if (positive >= 3) return 'low';
    return 'medium';
  }

  private calculateVerificationConfidence(factors: VerificationFactor[]): number {
    const positive = factors.filter((f) => f.status === 'positive').length;
    return Math.min(95, 40 + positive * 15);
  }

  private generateRecommendation(factors: VerificationFactor[], riskLevel: string): string {
    if (riskLevel === 'critical') return 'Immediate verification required';
    if (riskLevel === 'high') return 'Manual review recommended';
    return 'Proceed with standard processing';
  }
}