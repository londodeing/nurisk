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
var ProphetForecastService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProphetForecastService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = __importDefault(require("../config/database"));
let ProphetForecastService = ProphetForecastService_1 = class ProphetForecastService {
    logger = new common_1.Logger(ProphetForecastService_1.name);
    /**
     * Generate forecast
     */
    async forecast(input) {
        const { metric, days, region } = input;
        // Get historical data
        const historical = await this.getHistoricalData(metric, region);
        // Calculate trend
        const trend = this.calculateTrend(historical);
        // Calculate seasonality
        const seasonality = this.calculateSeasonality(historical);
        // Generate predictions
        const predictions = this.generatePredictions(historical, days);
        // Calculate confidence
        const confidence = this.calculateConfidence(historical);
        return {
            metric,
            predictions,
            trend,
            seasonality,
            confidence,
            generatedAt: new Date(),
        };
    }
    /**
     * Get historical data
     */
    async getHistoricalData(metric, region) {
        const tableMap = {
            incident_volume: 'incidents',
            resource_demand: 'resource_requests',
            volunteer_availability: 'volunteers',
        };
        const table = tableMap[metric] || 'incidents';
        const whereClause = region ? `WHERE region = $1` : '';
        try {
            const result = await database_1.default.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM ${table}
        ${whereClause}
        AND created_at > NOW() - INTERVAL '90 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `, region ? [region] : []);
            return result.rows.map((row) => parseInt(row.count));
        }
        catch (error) {
            this.logger.warn(`Failed to get historical data: ${error}`);
            return this.generateMockData(90);
        }
    }
    /**
     * Calculate trend
     */
    calculateTrend(data) {
        if (data.length < 7)
            return 'stable';
        const recent = data.slice(-7);
        const previous = data.slice(-14, -7);
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const prevAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
        const change = (recentAvg - prevAvg) / prevAvg;
        if (change > 0.1)
            return 'increasing';
        if (change < -0.1)
            return 'decreasing';
        return 'stable';
    }
    /**
     * Calculate seasonality
     */
    calculateSeasonality(data) {
        const seasonality = {
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0,
            sunday: 0,
        };
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        // Group by day of week
        const dayCounts = [[], [], [], [], [], [], [], []];
        for (let i = 0; i < data.length; i++) {
            const dayIndex = i % 7;
            dayCounts[dayIndex].push(data[i]);
        }
        // Calculate averages
        for (let i = 0; i < 7; i++) {
            if (dayCounts[i].length > 0) {
                seasonality[days[i]] = dayCounts[i].reduce((a, b) => a + b, 0) / dayCounts[i].length;
            }
        }
        return seasonality;
    }
    /**
     * Generate predictions
     */
    generatePredictions(historical, days) {
        const predictions = [];
        const avg = historical.reduce((a, b) => a + b, 0) / historical.length;
        const stdDev = this.calculateStdDev(historical, avg);
        for (let i = 1; i <= days; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            // Simple prediction: average with slight variation
            const value = avg + (Math.random() - 0.5) * stdDev * 0.5;
            predictions.push({
                date,
                value: Math.max(0, Math.round(value)),
                lower: Math.max(0, Math.round(value - stdDev)),
                upper: Math.round(value + stdDev),
            });
        }
        return predictions;
    }
    /**
     * Calculate confidence
     */
    calculateConfidence(data) {
        if (data.length < 30)
            return 30;
        if (data.length < 60)
            return 50;
        if (data.length < 90)
            return 70;
        return 80;
    }
    /**
     * Calculate standard deviation
     */
    calculateStdDev(data, mean) {
        const variance = data.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / data.length;
        return Math.sqrt(variance);
    }
    /**
     * Generate mock data
     */
    generateMockData(days) {
        const data = [];
        const baseValue = 10;
        for (let i = 0; i < days; i++) {
            // Add some variation
            const dayOfWeek = i % 7;
            const weekendBoost = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1;
            const value = baseValue * weekendBoost * (0.8 + Math.random() * 0.4);
            data.push(Math.round(value));
        }
        return data;
    }
};
exports.ProphetForecastService = ProphetForecastService;
exports.ProphetForecastService = ProphetForecastService = ProphetForecastService_1 = __decorate([
    (0, common_1.Injectable)()
], ProphetForecastService);
//# sourceMappingURL=prophetForecastService.js.map