import { EventEmitter2 } from 'eventemitter2';
import { z } from 'zod';
import type { VolunteerFilter } from '@nurisk/shared-types';
import { VolunteersRepository } from './volunteers.repository';
import { PaginationRequest, ListResponse } from '@nurisk/shared-types/api';
import { createVolunteerSchema, updateVolunteerSchema, deployVolunteerSchema } from '@nurisk/validation/volunteer';
export { createVolunteerSchema, updateVolunteerSchema, deployVolunteerSchema };
export type CreateVolunteerDTO = z.infer<typeof createVolunteerSchema>;
export type UpdateVolunteerDTO = z.infer<typeof updateVolunteerSchema>;
export type DeployVolunteerDTO = z.infer<typeof deployVolunteerSchema>;
export declare class VolunteersService {
    private volunteersRepository;
    private eventEmitter;
    constructor(volunteersRepository: VolunteersRepository, eventEmitter: EventEmitter2);
    /**
     * Create new volunteer profile
     */
    create(dto: CreateVolunteerDTO, userId?: string): Promise<any>;
    /**
     * Get volunteer by ID
     */
    findById(id: string): Promise<any>;
    /**
     * Get all volunteers with pagination and filters
     */
    findAll(filters: VolunteerFilter | undefined, options: PaginationRequest): Promise<ListResponse<any>>;
    /**
     * Update volunteer profile
     */
    update(id: string, dto: UpdateVolunteerDTO): Promise<any>;
    /**
     * Delete volunteer profile (soft delete)
     */
    delete(id: string): Promise<any>;
    /**
     * Find volunteers by user ID
     */
    findByUserId(userId: string): Promise<any>;
    /**
     * Find nearby volunteers
     */
    findNearby(lat: number, lng: number, radiusKm?: number, expertise?: string): Promise<any>;
    /**
     * Find volunteers by region
     */
    findByRegion(region: string): Promise<any>;
    /**
     * Deploy volunteer to incident
     */
    deploy(dto: DeployVolunteerDTO): Promise<any>;
    /**
     * Get volunteer deployments
     */
    getDeployments(volunteerId: string): Promise<any>;
    /**
     * Set availability schedule
     */
    setAvailability(volunteerId: string, date: string, shiftStart?: string, shiftEnd?: string, status?: string): Promise<any>;
    /**
     * Get availability schedule
     */
    getAvailability(volunteerId: string, startDate?: string, endDate?: string): Promise<any>;
}
//# sourceMappingURL=volunteers.service.d.ts.map