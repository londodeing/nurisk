import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class IncidentService {
    private prisma;
    constructor(prisma: PrismaService);
    /**
     * Migrated Severity Scoring Engine (Ref Section 5.6 PRD)
     * Mengonversi data dampak menjadi skor prioritas terpadu.
     */
    private calculateAIScore;
    /**
     * Memproses update assessment menggunakan Prisma
     */
    updateAssessment(id: number, data: any): Promise<{
        region: string | null;
        priorityScore: number | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        incidentCode: string;
        title: string | null;
        description: string | null;
        disasterType: import("@prisma/client").$Enums.DisasterType | null;
        status: import("@prisma/client").$Enums.IncidentStatus;
        severity: import("@prisma/client").$Enums.IncidentSeverity | null;
        priorityLevel: string | null;
        kecamatan: string | null;
        desa: string | null;
        alamatSpesifik: string | null;
        eventDate: Date | null;
        dampakManusia: Prisma.JsonValue | null;
        dampakRumah: Prisma.JsonValue | null;
        dampakFasum: Prisma.JsonValue | null;
        dampakVital: Prisma.JsonValue | null;
        dampakLingkungan: Prisma.JsonValue | null;
        needsNumeric: Prisma.JsonValue | null;
        kondisiMutakhir: string | null;
        hasShelter: boolean;
        isAiGenerated: boolean;
        reporterName: string | null;
        whatsappNumber: string | null;
        photoData: string | null;
        probabilityScore: number | null;
        aiFeatures: Prisma.JsonValue | null;
        createdBy: string | null;
        userId: string | null;
    }>;
}
//# sourceMappingURL=incident.service.d.ts.map