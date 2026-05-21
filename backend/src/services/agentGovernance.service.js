"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AgentGovernanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentGovernanceService = void 0;
const common_1 = require("@nestjs/common");
const eventemitter2_1 = require("eventemitter2");
const database_1 = __importDefault(require("../config/database"));
let AgentGovernanceService = AgentGovernanceService_1 = class AgentGovernanceService {
    eventEmitter;
    logger = new common_1.Logger(AgentGovernanceService_1.name);
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
    }
    /**
     * Classifier Agent - Determine disaster type
     */
    async classify(input) {
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
    async predict(input) {
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
        const estimatedCasualties = this.estimateCasualties(data, severity, affectedArea);
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
    async recommend(input) {
        const startTime = Date.now();
        const { data, context } = input;
        const recommendations = [];
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
    async analyze(input) {
        const startTime = Date.now();
        const { data, context } = input;
        const factors = [];
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
    async orchestrate(input) {
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
    extractKeywords(content) {
        const keywords = {
            BANJIR: ['banjir', 'air', 'genangan', 'flood'],
            GEMPA: ['gempa', 'quake', 'gempabumi', 'shake'],
            LONGSOR: ['longsor', 'tanah', 'landslide'],
            KEBAKARAN: ['kebakaran', 'api', 'fire', 'terbakar'],
            TSUNAMI: ['tsunami', 'air laut', 'gelombang'],
            PUTING_BELIANG: ['puting', 'angin', 'topan', 'typhoon'],
            ERUPSI: ['erupsi', 'letusan', 'vulkanik'],
        };
        const found = [];
        for (const [type, words] of Object.entries(keywords)) {
            if (words.some((w) => content.includes(w))) {
                found.push(type);
            }
        }
        return found;
    }
    matchDisasterType(keywords) {
        if (keywords.length === 0)
            return 'UNKNOWN';
        return keywords[0];
    }
    categorizeDisaster(type, data) {
        const categories = {
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
    calculateConfidence(keywords, type) {
        if (type === 'UNKNOWN')
            return 20;
        const base = 60;
        const keywordBonus = Math.min(30, keywords.length * 10);
        return Math.min(95, base + keywordBonus);
    }
    generateReasoning(agent, data) {
        return `Agent: ${agent}, Data: ${JSON.stringify(data)}`;
    }
    async fetchHistoricalData(location) {
        if (!location)
            return {};
        try {
            const result = await database_1.default.query(`
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
        }
        catch {
            return {};
        }
    }
    calculateSeverity(data, historical) {
        let severity = 50;
        // Base from priority
        if (data.priority === 'CRITICAL')
            severity += 30;
        else if (data.priority === 'HIGH')
            severity += 20;
        else if (data.priority === 'MEDIUM')
            severity += 10;
        // Historical factor
        if (historical?.count > 10)
            severity += 15;
        if (historical?.avg_severity > 70)
            severity += 10;
        return Math.min(100, severity);
    }
    calculateImpact(data, historical) {
        let impact = 40;
        if (data.populationAffected)
            impact += 20;
        if (data.infrastructureDamage)
            impact += 15;
        if (historical?.count > 5)
            impact += 10;
        return Math.min(100, impact);
    }
    calculateLikelihood(data, historical) {
        let likelihood = 50;
        if (historical?.count > 0) {
            likelihood += Math.min(30, historical.count * 3);
        }
        return Math.min(100, likelihood);
    }
    determineTrend(historical) {
        if (!historical?.count)
            return 'stable';
        if (historical.count > 10)
            return 'increasing';
        if (historical.count < 3)
            return 'decreasing';
        return 'stable';
    }
    estimateAffectedArea(data) {
        return data.affectedRadius || 5; // km²
    }
    estimateCasualties(data, severity, area) {
        return Math.round((severity / 100) * (area / 10) * 5);
    }
    calculateVolunteers(severity, impact) {
        return Math.ceil((severity + impact) / 20);
    }
    calculateEquipment(severity, impact) {
        return Math.ceil((severity + impact) / 40);
    }
    calculateLogistics(severity, impact) {
        return Math.ceil((severity + impact) / 60);
    }
    verifySource(source) {
        const trustedSources = ['bmkg', 'magma', 'volunteer', 'field'];
        const isTrusted = trustedSources.some((s) => source?.toLowerCase().includes(s));
        return {
            factor: 'source',
            status: isTrusted ? 'positive' : 'neutral',
            weight: 0.3,
            notes: isTrusted ? 'Trusted source' : 'Unknown source',
        };
    }
    verifyLocation(location) {
        const hasLocation = location?.lat && location?.lng;
        return {
            factor: 'location',
            status: hasLocation ? 'positive' : 'negative',
            weight: 0.25,
            notes: hasLocation ? 'Location verified' : 'No location data',
        };
    }
    verifyContent(content) {
        const hasContent = content && content.length > 20;
        return {
            factor: 'content',
            status: hasContent ? 'positive' : 'negative',
            weight: 0.2,
            notes: hasContent ? 'Content verified' : 'Insufficient content',
        };
    }
    async verifyHistorical(data) {
        const hasHistory = data.historicalCount > 0;
        return {
            factor: 'historical',
            status: hasHistory ? 'positive' : 'neutral',
            weight: 0.15,
            notes: hasHistory ? 'Historical data exists' : 'No historical data',
        };
    }
    async verifyCrossReference(data) {
        const hasMultiple = data.sources?.length > 1;
        return {
            factor: 'cross_reference',
            status: hasMultiple ? 'positive' : 'neutral',
            weight: 0.1,
            notes: hasMultiple ? 'Multiple sources' : 'Single source',
        };
    }
    calculateRiskLevel(factors) {
        const positive = factors.filter((f) => f.status === 'positive').length;
        const negative = factors.filter((f) => f.status === 'negative').length;
        if (negative >= 2)
            return 'critical';
        if (negative >= 1)
            return 'high';
        if (positive >= 3)
            return 'low';
        return 'medium';
    }
    calculateVerificationConfidence(factors) {
        const positive = factors.filter((f) => f.status === 'positive').length;
        return Math.min(95, 40 + positive * 15);
    }
    generateRecommendation(factors, riskLevel) {
        if (riskLevel === 'critical')
            return 'Immediate verification required';
        if (riskLevel === 'high')
            return 'Manual review recommended';
        return 'Proceed with standard processing';
    }
};
exports.AgentGovernanceService = AgentGovernanceService;
exports.AgentGovernanceService = AgentGovernanceService = AgentGovernanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [eventemitter2_1.EventEmitter2])
], AgentGovernanceService);
//# sourceMappingURL=agentGovernance.service.js.map