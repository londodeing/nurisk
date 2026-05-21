import { EventEmitter2 } from 'eventemitter2';
import { AnalyticsRepository } from './analytics.repository';
export declare class AnalyticsService {
    private analyticsRepository;
    private eventEmitter;
    constructor(analyticsRepository: AnalyticsRepository, eventEmitter: EventEmitter2);
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
    getTrendData(days?: number): Promise<{
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
    getAuditLogs(limit?: number): Promise<{
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
//# sourceMappingURL=analytics.service.d.ts.map