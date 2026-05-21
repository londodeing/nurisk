"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var BiasMonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiasMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = __importDefault(require("../config/database"));
let BiasMonitoringService = BiasMonitoringService_1 = class BiasMonitoringService {
    logger = new common_1.Logger(BiasMonitoringService_1.name);
    alerts = [];
    /**
     * Generate comprehensive bias report
     */
    async generateReport(days = 30) {
        const end = new Date();
        const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const [geographic, demographic, temporal] = await Promise.all([
            this.analyzeGeographicBias(start, end),
            this.analyzeDemographicBias(start, end),
            this.analyzeTemporalBias(start, end),
        ]);
        const metrics = { geographic, demographic, temporal };
        const alerts = this.detectAlerts(metrics);
        const recommendations = this.generateRecommendations(metrics);
        return {
            generatedAt: new Date(),
            period: { start, end },
            metrics,
            alerts,
            recommendations,
        };
    }
    /**
     * Analyze geographic bias
     */
    async analyzeGeographicBias(start, end) {
        // Get incident distribution by region
        const regionResult = await database_1.default.query(`
      SELECT 
        COALESCE(region, 'UNKNOWN') as region,
        COUNT(*) as count,
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/60) as avg_response_minutes,
        AVG(CASE WHEN verification_status = 'VERIFIED' THEN 1 ELSE 0 END) as accuracy
      FROM incidents
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY region
      ORDER BY count DESC
    `, [start, end]);
        const regionDistribution = {};
        const regionResponseTimes = {};
        const regionAccuracy = {};
        for (const row of regionResult.rows) {
            regionDistribution[row.region] = parseInt(row.count);
            regionResponseTimes[row.region] = parseFloat(row.avg_response_minutes) || 0;
            regionAccuracy[row.region] = parseFloat(row.accuracy) || 0;
        }
        // Identify underserved regions
        const avgCount = Object.values(regionDistribution).reduce((a, b) => a + b, 0) /
            Math.max(1, Object.keys(regionDistribution).length);
        const underservedRegions = Object.entries(regionDistribution)
            .filter(([_, count]) => count < avgCount * 0.3)
            .map(([region]) => region);
        // Calculate bias score (0-100, lower is better)
        const biasScore = this.calculateBiasScore(regionDistribution);
        return {
            regionDistribution,
            regionResponseTimes,
            regionAccuracy,
            underservedRegions,
            biasScore,
        };
    }
    /**
     * Analyze demographic bias
     */
    async analyzeDemographicBias(start, end) {
        // Get age distribution from reports
        const ageResult = await database_1.default.query(`
      SELECT 
        CASE 
          WHEN age < 18 THEN 'under_18'
          WHEN age BETWEEN 18 AND 30 THEN '18_30'
          WHEN age BETWEEN 31 AND 45 THEN '31_45'
          WHEN age BETWEEN 46 AND 60 THEN '46_60'
          ELSE 'over_60'
        END as age_group,
        COUNT(*) as count
      FROM reports
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY age_group
    `, [start, end]);
        const ageDistribution = {};
        for (const row of ageResult.rows) {
            ageDistribution[row.age_group] = parseInt(row.count);
        }
        // Get gender distribution
        const genderResult = await database_1.default.query(`
      SELECT 
        COALESCE(gender, 'UNKNOWN') as gender,
        COUNT(*) as count
      FROM reports
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY gender
    `, [start, end]);
        const genderDistribution = {};
        for (const row of genderResult.rows) {
            genderDistribution[row.gender] = parseInt(row.count);
        }
        // Get socioeconomic bias (based on reporter location type)
        const socioResult = await database_1.default.query(`
      SELECT 
        COALESCE(location_type, 'UNKNOWN') as location_type,
        COUNT(*) as count
      FROM reports
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY location_type
    `, [start, end]);
        const socioeconomicBias = {};
        for (const row of socioResult.rows) {
            socioeconomicBias[row.location_type] = parseInt(row.count);
        }
        // Calculate accessibility score
        const accessibilityScore = this.calculateAccessibilityScore(ageDistribution, genderDistribution);
        // Calculate bias score
        const biasScore = Math.max(this.calculateBiasScore(ageDistribution), this.calculateBiasScore(genderDistribution), this.calculateBiasScore(socioeconomicBias));
        return {
            ageDistribution,
            genderDistribution,
            socioeconomicBias,
            accessibilityScore,
            biasScore,
        };
    }
    /**
     * Analyze temporal bias
     */
    async analyzeTemporalBias(start, end) {
        // Get hourly distribution
        const hourlyResult = await database_1.default.query(`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count,
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/60) as avg_response
      FROM incidents
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY hour
      ORDER BY hour
    `, [start, end]);
        const hourlyDistribution = {};
        const responseTimeByHour = {};
        for (const row of hourlyResult.rows) {
            hourlyDistribution[row.hour] = parseInt(row.count);
            responseTimeByHour[row.hour] = parseFloat(row.avg_response) || 0;
        }
        // Get daily distribution
        const dailyResult = await database_1.default.query(`
      SELECT 
        EXTRACT(DOW FROM created_at) as day,
        COUNT(*) as count
      FROM incidents
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY day
      ORDER BY day
    `, [start, end]);
        const dailyDistribution = {};
        for (const row of dailyResult.rows) {
            dailyDistribution[row.day] = parseInt(row.count);
        }
        // Get seasonal trends
        const seasonalResult = await database_1.default.query(`
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        COUNT(*) as count
      FROM incidents
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY month
      ORDER BY month
    `, [start, end]);
        const seasonalTrends = {};
        for (const row of seasonalResult.rows) {
            seasonalTrends[row.month] = parseInt(row.count);
        }
        // Calculate bias score
        const biasScore = this.calculateTemporalBiasScore(hourlyDistribution, responseTimeByHour);
        return {
            hourlyDistribution,
            dailyDistribution,
            seasonalTrends,
            responseTimeByHour,
            biasScore,
        };
    }
    /**
     * Detect bias alerts
     */
    detectAlerts(metrics) {
        const alerts = [];
        // Geographic alerts
        if (metrics.geographic.biasScore > 40) {
            alerts.push({
                id: `alert-${Date.now()}-geo`,
                type: 'geographic',
                severity: metrics.geographic.biasScore > 70 ? 'critical' : 'high',
                message: 'Significant geographic bias detected',
                details: {
                    biasScore: metrics.geographic.biasScore,
                    underservedRegions: metrics.geographic.underservedRegions,
                },
                detectedAt: new Date(),
            });
        }
        // Demographic alerts
        if (metrics.demographic.biasScore > 40) {
            alerts.push({
                id: `alert-${Date.now()}-demo`,
                type: 'demographic',
                severity: metrics.demographic.biasScore > 70 ? 'critical' : 'high',
                message: 'Significant demographic bias detected',
                details: {
                    biasScore: metrics.demographic.biasScore,
                    accessibilityScore: metrics.demographic.accessibilityScore,
                },
                detectedAt: new Date(),
            });
        }
        // Temporal alerts
        if (metrics.temporal.biasScore > 40) {
            alerts.push({
                id: `alert-${Date.now()}-temp`,
                type: 'temporal',
                severity: metrics.temporal.biasScore > 70 ? 'critical' : 'high',
                message: 'Significant temporal bias detected',
                details: {
                    biasScore: metrics.temporal.biasScore,
                },
                detectedAt: new Date(),
            });
        }
        this.alerts.push(...alerts);
        return alerts;
    }
    /**
     * Generate recommendations
     */
    generateRecommendations(metrics) {
        const recommendations = [];
        // Geographic recommendations
        if (metrics.geographic.underservedRegions.length > 0) {
            recommendations.push(`Increase outreach in underserved regions: ${metrics.geographic.underservedRegions.join(', ')}`);
        }
        // Response time recommendations
        const slowRegions = Object.entries(metrics.geographic.regionResponseTimes)
            .filter(([_, time]) => time > 120)
            .map(([region]) => region);
        if (slowRegions.length > 0) {
            recommendations.push(`Improve response times in: ${slowRegions.join(', ')}`);
        }
        // Demographic recommendations
        if (metrics.demographic.accessibilityScore < 60) {
            recommendations.push('Improve accessibility for underrepresented demographics');
        }
        // Temporal recommendations
        const offPeakHours = Object.entries(metrics.temporal.hourlyDistribution)
            .filter(([_, count]) => count < 5)
            .map(([hour]) => hour);
        if (offPeakHours.length > 0) {
            recommendations.push('Ensure coverage during off-peak hours');
        }
        return recommendations;
    }
    /**
     * Calculate bias score (0-100)
     */
    calculateBiasScore(distribution) {
        const values = Object.values(distribution);
        if (values.length === 0)
            return 0;
        const total = values.reduce((a, b) => a + b, 0);
        if (total === 0)
            return 0;
        // Calculate standard deviation
        const mean = total / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        // Coefficient of variation (lower is more biased)
        const cv = stdDev / mean;
        // Convert to 0-100 score (higher = more biased)
        return Math.min(100, Math.round(cv * 50));
    }
    /**
     * Calculate accessibility score
     */
    calculateAccessibilityScore(ageDistribution, genderDistribution) {
        let score = 100;
        // Age diversity bonus
        const ageKeys = Object.keys(ageDistribution).length;
        if (ageKeys < 3)
            score -= 20;
        if (ageKeys < 5)
            score -= 10;
        // Gender diversity bonus
        const genderKeys = Object.keys(genderDistribution).length;
        if (genderKeys < 2)
            score -= 20;
        return Math.max(0, score);
    }
    /**
     * Calculate temporal bias score
     */
    calculateTemporalBiasScore(distribution, responseTimes) {
        // Check for coverage gaps
        const coveredHours = Object.keys(distribution).length;
        const gapPenalty = (24 - coveredHours) * 3;
        // Check for response time variance
        const responseValues = Object.values(responseTimes).filter((v) => v > 0);
        if (responseValues.length > 1) {
            const mean = responseValues.reduce((a, b) => a + b, 0) / responseValues.length;
            const variance = responseValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / responseValues.length;
            const stdDev = Math.sqrt(variance);
            const responseVariance = (stdDev / mean) * 30;
            return Math.min(100, gapPenalty + responseVariance);
        }
        return Math.min(100, gapPenalty);
    }
    /**
     * Get recent alerts
     */
    getAlerts(limit = 10) {
        return this.alerts.slice(-limit);
    }
    /**
     * Clear old alerts
     */
    clearAlerts(olderThanHours = 24) {
        const cutoff = Date.now() - olderThanHours * 60 * 60 * 1000;
        this.alerts = this.alerts.filter((a) => a.detectedAt.getTime() > cutoff);
    }
};
exports.BiasMonitoringService = BiasMonitoringService;
exports.BiasMonitoringService = BiasMonitoringService = BiasMonitoringService_1 = __decorate([
    (0, common_1.Injectable)()
], BiasMonitoringService);
//# sourceMappingURL=biasMonitoring.service.js.map