import { CreateShelterDTO, UpdateShelterDTO, SheltersService } from './shelters.service';
export declare class SheltersController {
    private sheltersService;
    constructor(sheltersService: SheltersService);
    create(dto: CreateShelterDTO): Promise<any>;
    findAll(page?: string, limit?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC', status?: string, region?: string, incidentId?: string): Promise<import("@nurisk/shared-types/api").ListResponse<any>>;
    findById(id: string): Promise<any>;
    update(id: string, dto: UpdateShelterDTO): Promise<any>;
    delete(id: string): Promise<any>;
    findByIncident(incidentId: string): Promise<any>;
}
//# sourceMappingURL=shelters.controller.d.ts.map