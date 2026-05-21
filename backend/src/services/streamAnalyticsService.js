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
var StreamAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const eventemitter2_1 = require("eventemitter2");
const database_1 = __importDefault(require("../config/database"));
let StreamAnalyticsService = StreamAnalyticsService_1 = class StreamAnalyticsService {
    eventEmitter;
    logger = new common_1.Logger(StreamAnalyticsService_1.name);
    buffer = [];
    alerts = [];
    config = {
        windowSize: 60,
        alertThresholds: {
            incidentRate: 10,
            responseTime: 300,
            resourceUtilization: 0.8,
        },
    };
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.startCollection();
    }
    /**
     * Start real-time data collection
     */
    startCollection() {
        setInterval(() => {
            this.collectMetrics().catch((err) => {
                this.logger.error(`Collection error: ${err}`);
            });
        }, 60000); // Every minute
    }
    /**
     * Collect current metrics
     */
    async collectMetrics() {
        const metrics = await this.calculateMetrics();
        // Add to buffer
        this.buffer.push(metrics);
        if (this.buffer.length > this.config.windowSize) {
            this.buffer.shift();
        }
        // Check for alerts
        this.checkAlerts(metrics);
        // Emit event
        this.eventEmitter.emit('stream.metrics', metrics);
    }
    /**
     * Calculate current metrics
     */
    async calculateMetrics() {
        try {
            // Incident rate (last hour)
            const incidentResult = await database_1.default.query(`
        SELECT COUNT(*) as count
        FROM incidents
        WHERE created_at > NOW() - INTERVAL '1 hour'
      `);
            const incidentRate = parseInt(incidentResult.rows[0]?.count || '0');
            // Response time (average in seconds)
            const responseResult = await database_1.default.query(`
        SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) as avg_response
        FROM incidents
        WHERE resolved_at IS NOT NULL
        AND created_at > NOW() - INTERVAL '24 hours'
      `);
            const responseTime = parseFloat(responseResult.rows[0]?.avg_response || '0');
            // Resource utilization
            const resourceResult = await database_1.default.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active
        FROM resources
      `);
            const total = parseInt(resourceResult.rows[0]?.total || '1');
            const active = parseInt(resourceResult.rows[0]?.active || '0');
            const resourceUtilization = total > 0 ? active / total : 0;
            // Active incidents
            const activeResult = await database_1.default.query(`
        SELECT COUNT(*) as count
        FROM incidents
        WHERE status NOT IN ('RESOLVED', 'CLOSED')
      `);
            const activeIncidents = parseInt(activeResult.rows[0]?.count || '0');
            // Active volunteers
            const volunteerResult = await database_1.default.query(`
        SELECT COUNT(*) as count
        FROM volunteers
        WHERE status = 'ACTIVE'
      `);
            const activeVolunteers = parseInt(volunteerResult.rows[0]?.count || '0');
            // Pending reports
            const pendingResult = await database_1.default.query(`
        SELECT COUNT(*) as count
        FROM reports
        WHERE verification_status = 'PENDING'
      `);
            const pendingReports = parseInt(pendingResult.rows[0]?.count || '0');
            // Verified reports (last hour)
            const verifiedResult = await database_1.default.query(`
        SELECT COUNT(*) as count
        FROM reports
        WHERE verification_status = 'VERIFIED'
        AND updated_at > NOW() - INTERVAL '1 hour'
      `);
            const verifiedReports = parseInt(verifiedResult.rows[0]?.count || '0');
            return {
                incidentRate,
                responseTime,
                resourceUtilization,
                activeIncidents,
                activeVolunteers,
                pendingReports,
                verifiedReports,
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.logger.warn(`Failed to calculate metrics: ${error}`);
            return this.getDefaultMetrics();
        }
    }
    /**
     * Get default metrics
     */
    getDefaultMetrics() {
        return {
            incidentRate: 0,
            responseTime: 0,
            resourceUtilization: 0,
            activeIncidents: 0,
            activeVolunteers: 0,
            pendingReports: 0,
            verifiedReports: 0,
            timestamp: new Date(),
        };
    }
    /**
     * Check for alerts
     */
    checkAlerts(metrics) {
        // Incident rate spike
        if (metrics.incidentRate > this.config.alertThresholds.incidentRate) {
            this.createAlert({
                type: 'spike',
                metric: 'incidentRate',
                value: metrics.incidentRate,
                threshold: this.config.alertThresholds.incidentRate,
                severity: metrics.incidentRate > this.config.alertThresholds.incidentRate * 2 ? 'critical' : 'high',
                message: `Incident rate spike: ${metrics.incidentRate}/hour`,
            });
        }
        // Response time threshold
        if (metrics.responseTime > this.config.alertThresholds.responseTime) {
            this.createAlert({
                type: 'threshold',
                metric: 'responseTime',
                value: metrics.responseTime,
                threshold: this.config.alertThresholds.responseTime,
                severity: metrics.responseTime > this.config.alertThresholds.responseTime * 2 ? 'critical' : 'high',
                message: `Response time exceeded: ${Math.round(metrics.responseTime)}s`,
            });
        }
        // Resource utilization
        if (metrics.resourceUtilization > this.config.alertThresholds.resourceUtilization) {
            this.createAlert({
                type: 'threshold',
                metric: 'resourceUtilization',
                value: metrics.resourceUtilization,
                threshold: this.config.alertThresholds.resourceUtilization,
                severity: metrics.resourceUtilization > 0.95 ? 'critical' : 'high',
                message: `High resource utilization: ${Math.round(metrics.resourceUtilization * 100)}%`,
            });
        }
    }
    /**
     * Create alert
     */
    createAlert(alert) {
        const fullAlert = {
            ...alert,
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
        };
        this.alerts.push(fullAlert);
        this.eventEmitter.emit('stream.alert', fullAlert);
        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts.shift();
        }
    }
    /**
     * Get current metrics
     */
    async getCurrentMetrics() {
        if (this.buffer.length === 0) {
            return this.calculateMetrics();
        }
        return this.buffer[this.buffer.length - 1];
    }
    /**
     * Get metrics history
     */
    async getMetricsHistory(minutes) {
        const cutoff = Date.now() - minutes * 60 * 1000;
        return this.buffer.filter((m) => m.timestamp.getTime() > cutoff);
    }
    /**
     * Get alerts
     */
    async getAlerts(limit = 10) {
        return this.alerts.slice(-limit);
    }
    /**
     * Get aggregated metrics
     */
    async getAggregatedMetrics(metric, window) {
        const data = this.buffer.map((m) => m[metric]);
        if (data.length === 0) {
            return { avg: 0, min: 0, max: 0, current: 0 };
        }
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const min = Math.min(...data);
        const max = Math.max(...data);
        const current = data[data.length - 1];
        return { avg, min, max, current };
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.logger.log(`Updated config: ${JSON.stringify(this.config)}`);
    }
};
exports.StreamAnalyticsService = StreamAnalyticsService;
exports.StreamAnalyticsService = StreamAnalyticsService = StreamAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [eventemitter2_1.EventEmitter2])
], StreamAnalyticsService);
//# sourceMappingURL=streamAnalyticsService.js.map