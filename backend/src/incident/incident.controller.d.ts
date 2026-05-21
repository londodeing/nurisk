import { CreateIncidentDTO, IncidentService, UpdateIncidentDTO } from './incident.service';
export declare class IncidentController {
    private incidentService;
    constructor(incidentService: IncidentService);
    /**
     * POST /incidents - Create new incident
     */
    create(dto: CreateIncidentDTO): Promise<any>;
    /**
     * GET /incidents - Get all incidents with pagination
     */
    findAll(page?: string, limit?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC', status?: string, priority?: string, disasterType?: string, region?: string, startDate?: string, endDate?: string, search?: string, includeDeleted?: string): Promise<import("@nurisk/shared-types/api").ListResponse<any>>;
    /**
     * GET /incidents/geo - Get incidents as GeoJSON
     */
    findAllGeoJSON(status?: string, priority?: string, disasterType?: string): Promise<any>;
    /**
     * GET /incidents/:id - Get incident by ID
     */
    findById(id: string, includeDeleted?: string): Promise<any>;
    /**
     * PATCH /incidents/:id - Update incident
     */
    update(id: string, dto: UpdateIncidentDTO, includeDeleted?: string): Promise<any>;
    /**
     * DELETE /incidents/:id - Soft delete incident
     */
    delete(id: string): Promise<any>;
    /**
     * POST /incidents/:id/restore - Restore soft-deleted incident
     */
    restore(id: string): Promise<any>;
}
//# sourceMappingURL=incident.controller.d.ts.map