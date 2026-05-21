import { PrismaService } from '../prisma/prisma.service';
export declare class BriefingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
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
    list(filter: any): Promise<{
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
}
//# sourceMappingURL=briefing.service.d.ts.map