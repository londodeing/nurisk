import { HazardService } from './hazard.service';
export declare class HazardController {
    private readonly service;
    constructor(service: HazardService);
    createZone(body: any): Promise<any>;
    listZones(query: any): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        severity: import("@prisma/client").$Enums.HazardSeverity;
        incidentId: string | null;
        regionId: string | null;
        hazardType: import("@prisma/client").$Enums.DisasterType;
        population: number | null;
        area: number | null;
    }[]>;
    getZoneById(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        severity: import("@prisma/client").$Enums.HazardSeverity;
        incidentId: string | null;
        regionId: string | null;
        hazardType: import("@prisma/client").$Enums.DisasterType;
        population: number | null;
        area: number | null;
    }>;
    updateZone(id: string, body: any): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        severity: import("@prisma/client").$Enums.HazardSeverity;
        incidentId: string | null;
        regionId: string | null;
        hazardType: import("@prisma/client").$Enums.DisasterType;
        population: number | null;
        area: number | null;
    }>;
    deleteZone(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        severity: import("@prisma/client").$Enums.HazardSeverity;
        incidentId: string | null;
        regionId: string | null;
        hazardType: import("@prisma/client").$Enums.DisasterType;
        population: number | null;
        area: number | null;
    }>;
    createVulnerability(body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        hazardZoneId: string;
        regionId: string | null;
        recommendations: string | null;
        score: number;
        factors: import("@prisma/client/runtime/library").JsonValue | null;
        assessedAt: Date;
        assessedBy: string | null;
    }>;
    listVulnerability(query: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        hazardZoneId: string;
        regionId: string | null;
        recommendations: string | null;
        score: number;
        factors: import("@prisma/client/runtime/library").JsonValue | null;
        assessedAt: Date;
        assessedBy: string | null;
    }[]>;
    getVulnerabilityByRegion(regionId: string, hazardZoneId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        hazardZoneId: string;
        regionId: string | null;
        recommendations: string | null;
        score: number;
        factors: import("@prisma/client/runtime/library").JsonValue | null;
        assessedAt: Date;
        assessedBy: string | null;
    }>;
    getHeatmap(): Promise<any[]>;
}
//# sourceMappingURL=hazard.controller.d.ts.map