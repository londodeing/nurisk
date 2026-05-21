import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDashboardStats(startDate?: string, endDate?: string, region?: string): Promise<{
        success: boolean;
        data: {
            incidents: {
                total_incidents: number;
                reported: number;
                verified: number;
                assessed: number;
                commanded: number;
                in_action: number;
                completed: number;
                critical: number;
                avg_priority: number;
            };
            volunteers: {
                total_volunteers: number;
                active: number;
                pending: number;
            };
            assets: {
                total_items: number;
                total_types: number;
            };
        };
    }>;
    getRegionalStats(region: string): Promise<{
        success: boolean;
        data: {
            total_incidents: number;
            completed: number;
            total_affected: number;
        };
    }>;
    getTrendData(days?: string): Promise<{
        success: boolean;
        data: any[];
    }>;
    getDisasterTypeDistribution(region?: string): Promise<{
        success: boolean;
        data: {
            disaster_type: import("@prisma/client").$Enums.DisasterType | null;
            count: number;
        }[];
    }>;
    getAuditLogs(limit?: string): Promise<{
        success: boolean;
        data: ({
            actor: {
                id: string;
                fullName: string | null;
                username: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            actorId: string | null;
            action: string | null;
            entityType: string | null;
            entityId: string | null;
            oldValue: import("@prisma/client/runtime/library").JsonValue | null;
            newValue: import("@prisma/client/runtime/library").JsonValue | null;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
        })[];
        count: number;
    }>;
}
//# sourceMappingURL=analytics.controller.d.ts.map