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
var ExecutiveBriefingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutiveBriefingService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = __importDefault(require("../config/database"));
let ExecutiveBriefingService = ExecutiveBriefingService_1 = class ExecutiveBriefingService {
    logger = new common_1.Logger(ExecutiveBriefingService_1.name);
    /**
     * Generate executive briefing
     */
    async generate(period = 'daily') {
        const { start, end } = this.getPeriodRange(period);
        const [situation, metrics, actions] = await Promise.all([
            this.getSituationSummary(start, end),
            this.getKeyMetrics(start, end),
            this.getRecommendedActions(start, end),
        ]);
        return {
            id: `briefing-${Date.now()}`,
            title: `Executive Briefing - ${period.toUpperCase()}`,
            period: { start, end },
            situation,
            metrics,
            actions,
            generatedAt: new Date(),
        };
    }
    /**
     * Get period range
     */
    getPeriodRange(period) {
        const end = new Date();
        const start = new Date();
        switch (period) {
            case 'daily':
                start.setDate(start.getDate() - 1);
                break;
            case 'weekly':
                start.setDate(start.getDate() - 7);
                break;
            case 'monthly':
                start.setMonth(start.getMonth() - 1);
                break;
        }
        return { start, end };
    }
    /**
     * Get situation summary
     */
    async getSituationSummary(start, end) {
        try {
            // Get incident counts by region
            const result = await database_1.default.query(`
        SELECT 
          COALESCE(region, 'UNKNOWN') as region,
          COUNT(*) as count,
          SUM(CASE WHEN status NOT IN ('RESOLVED', 'CLOSED') THEN 1 ELSE 0 END) as active
        FROM incidents
        WHERE created_at BETWEEN $1 AND $2
        GROUP BY region
        ORDER BY count DESC
      `, [start, end]);
            const regions = [];
            let totalIncidents = 0;
            for (const row of result.rows) {
                const count = parseInt(row.count);
                totalIncidents += count;
                regions.push({
                    region: row.region,
                    status: count > 10 ? 'emergency' : count > 5 ? 'warning' : count > 0 ? 'watch' : 'normal',
                    incidents: count,
                    trend: 'stable',
                });
            }
            // Determine overall status
            const activeIncidents = regions.reduce((sum, r) => sum + r.incidents, 0);
            let overall;
            let headline;
            if (activeIncidents > 20) {
                overall = 'emergency';
                headline = `Multiple active incidents across ${regions.length} regions`;
            }
            else if (activeIncidents > 10) {
                overall = 'critical';
                headline = `Elevated incident activity detected`;
            }
            else if (activeIncidents > 5) {
                overall = 'elevated';
                headline = `Moderate incident activity`;
            }
            else {
                overall = 'normal';
                headline = `No significant incidents reported`;
            }
            return {
                overall,
                headline,
                details: [
                    `${totalIncidents} total incidents`,
                    `${activeIncidents} active incidents`,
                    `${regions.length} regions affected`,
                ],
                regions,
            };
        }
        catch (error) {
            this.logger.warn(`Failed to get situation: ${error}`);
            return {
                overall: 'normal',
                headline: 'System operational',
                details: [],
                regions: [],
            };
        }
    }
    /**
     * Get key metrics
     */
    async getKeyMetrics(start, end) {
        try {
            const [totalResult, activeResult, resolvedResult, responseResult, volunteerResult] = await Promise.all([
                database_1.default.query(`SELECT COUNT(*) as count FROM incidents WHERE created_at BETWEEN $1 AND $2`, [start, end]),
                database_1.default.query(`SELECT COUNT(*) as count FROM incidents WHERE status NOT IN ('RESOLVED', 'CLOSED')`),
                database_1.default.query(`SELECT COUNT(*) as count FROM incidents WHERE status = 'RESOLVED' AND updated_at BETWEEN $1 AND $2`, [start, end]),
                database_1.default.query(`
            SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) as avg
            FROM incidents
            WHERE resolved_at IS NOT NULL AND created_at BETWEEN $1 AND $2
          `, [start, end]),
                database_1.default.query(`SELECT COUNT(*) as count FROM volunteers WHERE status = 'ACTIVE'`),
            ]);
            const totalIncidents = parseInt(totalResult.rows[0]?.count || '0');
            const activeIncidents = parseInt(activeResult.rows[0]?.count || '0');
            const resolvedIncidents = parseInt(resolvedResult.rows[0]?.count || '0');
            const avgResponseTime = parseFloat(responseResult.rows[0]?.avg || '0');
            const volunteerCount = parseInt(volunteerResult.rows[0]?.count || '0');
            // Get resource utilization
            const resourceResult = await database_1.default.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active
        FROM resources
      `);
            const totalResources = parseInt(resourceResult.rows[0]?.total || '1');
            const activeResources = parseInt(resourceResult.rows[0]?.active || '0');
            const resourceUtilization = totalResources > 0 ? activeResources / totalResources : 0;
            // Get verification rate
            const verificationResult = await database_1.default.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN verification_status = 'VERIFIED' THEN 1 ELSE 0 END) as verified
        FROM reports
        WHERE created_at BETWEEN $1 AND $2
      `, [start, end]);
            const totalReports = parseInt(verificationResult.rows[0]?.total || '1');
            const verifiedReports = parseInt(verificationResult.rows[0]?.verified || '0');
            const verificationRate = totalReports > 0 ? verifiedReports / totalReports : 0;
            return {
                totalIncidents,
                activeIncidents,
                resolvedIncidents,
                avgResponseTime: Math.round(avgResponseTime / 60), // Convert to minutes
                volunteerCount,
                resourceUtilization: Math.round(resourceUtilization * 100),
                verificationRate: Math.round(verificationRate * 100),
                trend: {
                    incidents: totalIncidents > 10 ? 'increasing' : 'stable',
                    response: avgResponseTime < 1800 ? 'improving' : 'stable',
                },
            };
        }
        catch (error) {
            this.logger.warn(`Failed to get metrics: ${error}`);
            return {
                totalIncidents: 0,
                activeIncidents: 0,
                resolvedIncidents: 0,
                avgResponseTime: 0,
                volunteerCount: 0,
                resourceUtilization: 0,
                verificationRate: 0,
                trend: {},
            };
        }
    }
    /**
     * Get recommended actions
     */
    async getRecommendedActions(start, end) {
        const actions = [];
        try {
            // Get high-priority incidents
            const result = await database_1.default.query(`
        SELECT id, title, priority, region
        FROM incidents
        WHERE created_at BETWEEN $1 AND $2
          AND priority IN ('CRITICAL', 'HIGH')
          AND status NOT IN ('RESOLVED', 'CLOSED')
        ORDER BY priority, created_at
        LIMIT 5
      `, [start, end]);
            for (const row of result.rows) {
                actions.push({
                    priority: row.priority === 'CRITICAL' ? 'critical' : 'high',
                    title: `Address: ${row.title}`,
                    description: `Incident requires attention in ${row.region}`,
                    type: 'coordination',
                    affectedRegions: [row.region],
                });
            }
            // Check resource utilization
            const resourceResult = await database_1.default.query(`
        SELECT COUNT(*) as count FROM resources WHERE status = 'ACTIVE'
      `);
            const activeResources = parseInt(resourceResult.rows[0]?.count || '0');
            if (activeResources < 5) {
                actions.push({
                    priority: 'high',
                    title: 'Resource deployment needed',
                    description: 'Low active resource count may impact response capability',
                    type: 'resource',
                    affectedRegions: [],
                });
            }
        }
        catch (error) {
            this.logger.warn(`Failed to get actions: ${error}`);
        }
        return actions;
    }
    /**
     * Get briefing history
     */
    async getHistory(limit = 10) {
        // In production, fetch from database
        return [];
    }
};
exports.ExecutiveBriefingService = ExecutiveBriefingService;
exports.ExecutiveBriefingService = ExecutiveBriefingService = ExecutiveBriefingService_1 = __decorate([
    (0, common_1.Injectable)()
], ExecutiveBriefingService);
//# sourceMappingURL=executiveBriefingService.js.map