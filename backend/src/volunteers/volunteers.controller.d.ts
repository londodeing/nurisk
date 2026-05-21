import { CreateVolunteerDTO, DeployVolunteerDTO, UpdateVolunteerDTO, VolunteersService } from './volunteers.service';
export declare class VolunteersController {
    private volunteersService;
    constructor(volunteersService: VolunteersService);
    /**
     * POST /volunteers - Create new volunteer profile
     */
    create(dto: CreateVolunteerDTO): Promise<import("./dto/volunteer.dto").SafeVolunteer>;
    /**
     * GET /volunteers - Get all volunteers with pagination
     */
    findAll(page?: string, limit?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC', status?: string, region?: string, expertise?: string, search?: string): Promise<import("@nurisk/shared-types/api").ListResponse<any>>;
    /**
     * GET /volunteers/:id - Get volunteer by ID
     */
    findById(id: string): Promise<import("./dto/volunteer.dto").SafeVolunteer>;
    /**
     * PATCH /volunteers/:id - Update volunteer profile
     */
    update(id: string, dto: UpdateVolunteerDTO): Promise<import("./dto/volunteer.dto").SafeVolunteer>;
    /**
     * DELETE /volunteers/:id - Delete volunteer profile
     */
    delete(id: string): Promise<any>;
    /**
     * GET /volunteers/nearby - Find nearby volunteers
     */
    findNearby(lat: string, lng: string, radius?: string, expertise?: string): Promise<any>;
    /**
     * GET /volunteers/region/:region - Find volunteers by region
     */
    findByRegion(region: string): Promise<any>;
    /**
     * POST /volunteers/deploy - Deploy volunteer to incident
     */
    deploy(dto: DeployVolunteerDTO): Promise<any>;
    /**
     * GET /volunteers/:id/deployments - Get volunteer deployments
     */
    getDeployments(id: string): Promise<any>;
    /**
     * POST /volunteers/:id/availability - Set availability schedule
     */
    setAvailability(id: string, body: {
        date: string;
        shift_start?: string;
        shift_end?: string;
        status?: string;
    }): Promise<any>;
    /**
     * GET /volunteers/:id/availability - Get availability schedule
     */
    getAvailability(id: string, startDate?: string, endDate?: string): Promise<any>;
}
//# sourceMappingURL=volunteers.controller.d.ts.map