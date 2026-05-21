import { Shelter } from '@prisma/client';
import { ShelterFilter } from '@nurisk/shared-types/shelter';
import { PaginationRequest, ListResponse } from '@nurisk/shared-types/api';
import { PrismaService } from '../prisma/prisma.service';
export declare class SheltersRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        incidentId?: string;
        name?: string;
        region?: string;
        status?: string;
        score?: number;
        refugeeCount?: number;
        stockStatus?: string;
        latitude?: number;
        longitude?: number;
        address?: string;
    }): Promise<Shelter>;
    findById(id: string): Promise<Shelter | null>;
    findAll(filters: ShelterFilter | undefined, options: PaginationRequest): Promise<ListResponse<Shelter>>;
    update(id: string, data: Partial<{
        name: string;
        region: string;
        status: string;
        score: number;
        refugeeCount: number;
        stockStatus: string;
        address: string;
    }>): Promise<Shelter | null>;
    delete(id: string): Promise<void>;
    findByIncident(incidentId: string): Promise<Shelter[]>;
}
//# sourceMappingURL=shelters.repository.d.ts.map