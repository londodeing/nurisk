import { BriefingService } from './briefing.service';
export declare class BriefingController {
    private readonly service;
    constructor(service: BriefingService);
    generate(body: any): Promise<{
        summary: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        title: string;
        status: import("@prisma/client").$Enums.BriefingStatus;
        incidentId: string | null;
        audience: string | null;
        metrics: import("@prisma/client/runtime/library").JsonValue | null;
        recommendations: string[];
        generatedAt: Date;
        validUntil: Date | null;
        preparedBy: string | null;
    }>;
    list(query: any): Promise<{
        summary: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        title: string;
        status: import("@prisma/client").$Enums.BriefingStatus;
        incidentId: string | null;
        audience: string | null;
        metrics: import("@prisma/client/runtime/library").JsonValue | null;
        recommendations: string[];
        generatedAt: Date;
        validUntil: Date | null;
        preparedBy: string | null;
    }[]>;
    getLatest(): Promise<{
        summary: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        title: string;
        status: import("@prisma/client").$Enums.BriefingStatus;
        incidentId: string | null;
        audience: string | null;
        metrics: import("@prisma/client/runtime/library").JsonValue | null;
        recommendations: string[];
        generatedAt: Date;
        validUntil: Date | null;
        preparedBy: string | null;
    }>;
    getMetrics(): Promise<{
        totalIncidents: number;
        activeIncidents: number;
        totalVolunteers: number;
        deployedVolunteers: number;
        totalShelters: number;
        availableCapacity: number;
        resourcesDeployed: number;
        affectedPopulation: number;
        lastUpdated: string;
    }>;
    getById(id: string): Promise<{
        summary: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        title: string;
        status: import("@prisma/client").$Enums.BriefingStatus;
        incidentId: string | null;
        audience: string | null;
        metrics: import("@prisma/client/runtime/library").JsonValue | null;
        recommendations: string[];
        generatedAt: Date;
        validUntil: Date | null;
        preparedBy: string | null;
    }>;
}
//# sourceMappingURL=briefing.controller.d.ts.map