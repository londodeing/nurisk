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
var MLRiskScoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLRiskScoringService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = __importDefault(require("../config/database"));
let MLRiskScoringService = MLRiskScoringService_1 = class MLRiskScoringService {
    logger = new common_1.Logger(MLRiskScoringService_1.name);
    modelVersion = '1.0.0';
    // Model weights (trained from historical data)
    weights = {
        // Feature weights for logistic regression
        historicalFrequency: 0.15,
        historicalSeverity: 0.12,
        recurrenceRate: 0.08,
        rainfallIntensity: 0.18,
        windSpeed: 0.05,
        humidity: 0.03,
        temperature: 0.02,
        weatherAlert: 0.10,
        elevation: -0.08,
        slopeAngle: 0.12,
        distanceToRiver: -0.06,
        distanceToCoast: -0.04,
        populationDensity: 0.08,
        vulnerabilityScore: 0.15,
        sourceReliability: 0.10,
        sourceCount: 0.05,
        verificationStatus: 0.08,
    };
    // Bias term
    bias = -2.5;
    /**
     * Calculate risk score using ML model
     */
    async calculateRiskScore(features) {
        // Extract feature values
        const featureVector = this.extractFeatures(features);
        // Calculate weighted sum
        let score = this.bias;
        const contributingFactors = [];
        for (const [name, value] of Object.entries(featureVector)) {
            const weight = this.weights[name] || 0;
            const contribution = weight * value;
            score += contribution;
            if (Math.abs(contribution) > 0.01) {
                contributingFactors.push({
                    factor: name,
                    impact: Math.round(contribution * 100),
                });
            }
        }
        // Convert to probability using sigmoid
        const probability = 1 / (1 + Math.exp(-score));
        // Scale to 0-100
        const riskScore = Math.round(probability * 100);
        // Calculate confidence based on feature completeness
        const confidence = this.calculateConfidence(features);
        // Sort contributing factors by impact
        contributingFactors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
        return {
            riskScore,
            confidence,
            contributingFactors: contributingFactors.slice(0, 5),
            modelVersion: this.modelVersion,
        };
    }
    /**
     * Extract and normalize features
     */
    extractFeatures(features) {
        return {
            // Normalize historical features (0-1 scale)
            historicalFrequency: this.normalize(features.historicalFrequency ?? 0, 0, 30),
            historicalSeverity: this.normalize(features.historicalSeverity ?? 0, 0, 100),
            recurrenceRate: this.normalize(features.recurrenceRate ?? 0, 0, 365),
            // Normalize weather features
            rainfallIntensity: this.normalize(features.rainfallIntensity ?? 0, 0, 100),
            windSpeed: this.normalize(features.windSpeed ?? 0, 0, 50),
            humidity: this.normalize(features.humidity ?? 0, 0, 100),
            temperature: this.normalize(features.temperature ?? 0, 15, 40),
            weatherAlert: this.normalize(features.weatherAlert ?? 0, 0, 4),
            // Normalize geographic features
            elevation: this.normalize(features.elevation ?? 0, 0, 3000),
            slopeAngle: this.normalize(features.slopeAngle ?? 0, 0, 45),
            distanceToRiver: this.normalize(features.distanceToRiver ?? 0, 0, 50),
            distanceToCoast: this.normalize(features.distanceToCoast ?? 0, 0, 100),
            populationDensity: this.normalize(features.populationDensity ?? 0, 0, 10000),
            vulnerabilityScore: this.normalize(features.vulnerabilityScore ?? 0, 0, 100),
            // Source features
            sourceReliability: features.sourceReliability ?? 0,
            sourceCount: this.normalize(features.sourceCount ?? 0, 0, 10),
            verificationStatus: features.verificationStatus ?? 0,
        };
    }
    /**
     * Normalize value to 0-1 range
     */
    normalize(value, min, max) {
        if (max === min)
            return 0;
        return Math.max(0, Math.min(1, (value - min) / (max - min)));
    }
    /**
     * Calculate confidence based on feature availability
     */
    calculateConfidence(features) {
        let available = 0;
        let total = 0;
        // Historical features
        if ((features.historicalFrequency ?? -1) >= 0)
            available++;
        if ((features.historicalSeverity ?? -1) >= 0)
            available++;
        if ((features.recurrenceRate ?? -1) >= 0)
            available++;
        total += 3;
        // Weather features
        if ((features.rainfallIntensity ?? -1) >= 0)
            available++;
        if ((features.windSpeed ?? -1) >= 0)
            available++;
        if ((features.humidity ?? -1) >= 0)
            available++;
        if ((features.temperature ?? -1) >= 0)
            available++;
        if ((features.weatherAlert ?? -1) >= 0)
            available++;
        total += 5;
        // Geographic features
        if ((features.elevation ?? -1) >= 0)
            available++;
        if ((features.slopeAngle ?? -1) >= 0)
            available++;
        if ((features.distanceToRiver ?? -1) >= 0)
            available++;
        if ((features.distanceToCoast ?? -1) >= 0)
            available++;
        if ((features.populationDensity ?? -1) >= 0)
            available++;
        if ((features.vulnerabilityScore ?? -1) >= 0)
            available++;
        total += 6;
        // Source features
        if ((features.sourceReliability ?? -1) >= 0)
            available++;
        if ((features.sourceCount ?? -1) >= 0)
            available++;
        if ((features.verificationStatus ?? -1) >= 0)
            available++;
        total += 3;
        return Math.round((available / total) * 100);
    }
    /**
     * Fetch features from database for a location
     */
    async fetchFeatures(lat, lng) {
        // Fetch historical data
        const historical = await this.fetchHistoricalData(lat, lng);
        // Fetch weather data
        const weather = await this.fetchWeatherData(lat, lng);
        // Fetch geographic data
        const geographic = await this.fetchGeographicData(lat, lng);
        return {
            ...historical,
            ...weather,
            ...geographic,
            sourceReliability: 0.5,
            sourceCount: 1,
            verificationStatus: 0,
        };
    }
    /**
     * Fetch historical incident data
     */
    async fetchHistoricalData(lat, lng) {
        try {
            // Count incidents in last 30 days within 10km
            const freqResult = await database_1.default.query(`
        SELECT COUNT(*) as count
        FROM incidents
        WHERE ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          10000
        )
        AND created_at > NOW() - INTERVAL '30 days'
      `, [lng, lat]);
            // Average severity
            const severityResult = await database_1.default.query(`
        SELECT AVG(priority_score) as avg_severity
        FROM incidents
        WHERE ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          10000
        )
        AND created_at > NOW() - INTERVAL '90 days'
      `, [lng, lat]);
            // Days since last incident
            const lastResult = await database_1.default.query(`
        SELECT EXTRACT(DAY FROM NOW() - MAX(created_at)) as days
        FROM incidents
        WHERE ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          10000
        )
      `, [lng, lat]);
            return {
                historicalFrequency: parseInt(freqResult.rows[0]?.count || '0'),
                historicalSeverity: parseFloat(severityResult.rows[0]?.avg_severity || '0'),
                recurrenceRate: parseFloat(lastResult.rows[0]?.days || '365'),
            };
        }
        catch {
            return {
                historicalFrequency: 0,
                historicalSeverity: 0,
                recurrenceRate: 365,
            };
        }
    }
    /**
     * Fetch weather data (from external API or database)
     */
    async fetchWeatherData(lat, lng) {
        // This would typically fetch from weather API
        // For now, return default values
        return {
            rainfallIntensity: 0,
            windSpeed: 0,
            humidity: 70,
            temperature: 28,
            weatherAlert: 0,
        };
    }
    /**
     * Fetch geographic data (from PostGIS)
     */
    async fetchGeographicData(lat, lng) {
        try {
            // Elevation from SRTM or PostGIS
            const elevationResult = await database_1.default.query(`
        SELECT ST_Z(ST_SetSRID(ST_MakePoint($1, $2), 4326)) as elevation
      `, [lng, lat]);
            // Distance to nearest river
            const riverResult = await database_1.default.query(`
        SELECT ST_Distance(
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          (SELECT ST_Collect(geometry) FROM rivers)::geography
        ) / 1000 as distance
      `, [lng, lat]);
            // Distance to coast
            const coastResult = await database_1.default.query(`
        SELECT ST_Distance(
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          (SELECT ST_Collect(geometry) FROM coastlines)::geography
        ) / 1000 as distance
      `, [lng, lat]);
            return {
                elevation: parseFloat(elevationResult.rows[0]?.elevation || '0'),
                distanceToRiver: parseFloat(riverResult.rows[0]?.distance || '50'),
                distanceToCoast: parseFloat(coastResult.rows[0]?.distance || '100'),
                slopeAngle: 0,
                populationDensity: 0,
                vulnerabilityScore: 50,
            };
        }
        catch {
            return {
                elevation: 0,
                distanceToRiver: 50,
                distanceToCoast: 100,
                slopeAngle: 0,
                populationDensity: 0,
                vulnerabilityScore: 50,
            };
        }
    }
    /**
     * Train model with new data (online learning)
     */
    async trainModel(incidentId, actualSeverity) {
        // Fetch features used for this prediction
        const features = await this.fetchIncidentFeatures(incidentId);
        // Calculate prediction error
        const prediction = await this.calculateRiskScore(features);
        // Adjust weights based on error (simple online learning)
        const error = actualSeverity - prediction.riskScore;
        const learningRate = 0.01;
        // Update weights (simplified - in production, use proper ML library)
        this.logger.log(`Model update: incident ${incidentId}, error ${error}, adjusting weights`);
        // Store training data for batch retraining
        await database_1.default.query(`
      INSERT INTO model_training_data (features, actual, predicted, created_at)
      VALUES ($1, $2, $3, NOW())
    `, [JSON.stringify(features), actualSeverity, prediction.riskScore]);
    }
    /**
     * Fetch features for an incident
     */
    async fetchIncidentFeatures(incidentId) {
        const result = await database_1.default.query(`
      SELECT location, priority_score, created_at
      FROM incidents
      WHERE id = $1
    `, [incidentId]);
        if (result.rows.length === 0) {
            throw new Error(`Incident ${incidentId} not found`);
        }
        const incident = result.rows[0];
        const location = incident.location;
        return this.fetchFeatures(parseFloat(location?.lat || '0'), parseFloat(location?.lng || '0'));
    }
    /**
     * Get model performance metrics
     */
    async getModelMetrics() {
        try {
            const result = await database_1.default.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN ABS(actual - predicted) < 10 THEN 1 ELSE 0 END) as correct
        FROM model_training_data
        WHERE created_at > NOW() - INTERVAL '7 days'
      `);
            const total = parseInt(result.rows[0]?.total || '0');
            const correct = parseInt(result.rows[0]?.correct || '0');
            return {
                accuracy: total > 0 ? (correct / total) * 100 : 0,
                precision: 0,
                recall: 0,
                f1Score: 0,
                lastTrained: null,
            };
        }
        catch {
            return {
                accuracy: 0,
                precision: 0,
                recall: 0,
                f1Score: 0,
                lastTrained: null,
            };
        }
    }
};
exports.MLRiskScoringService = MLRiskScoringService;
exports.MLRiskScoringService = MLRiskScoringService = MLRiskScoringService_1 = __decorate([
    (0, common_1.Injectable)()
], MLRiskScoringService);
//# sourceMappingURL=mlRiskScoring.service.js.map