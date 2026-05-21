import { EventEmitter2 } from 'eventemitter2';
import { z } from 'zod';
import { ShelterFilter } from '@nurisk/shared-types/shelter';
import { SheltersRepository } from './shelters.repository';
import { PaginationRequest, ListResponse } from '@nurisk/shared-types/api';
import { createShelterSchema, updateShelterSchema } from '@nurisk/validation/shelter';
export { createShelterSchema, updateShelterSchema };
export type CreateShelterDTO = z.infer<typeof createShelterSchema>;
export type UpdateShelterDTO = z.infer<typeof updateShelterSchema>;
export declare class SheltersService {
    private sheltersRepository;
    private eventEmitter;
    constructor(sheltersRepository: SheltersRepository, eventEmitter: EventEmitter2);
    create(dto: CreateShelterDTO): Promise<any>;
    findById(id: string): Promise<any>;
    findAll(filters: ShelterFilter | undefined, options: PaginationRequest): Promise<ListResponse<any>>;
    update(id: string, dto: UpdateShelterDTO): Promise<any>;
    delete(id: string): Promise<any>;
    findByIncident(incidentId: string): Promise<any>;
}
//# sourceMappingURL=shelters.service.d.ts.map