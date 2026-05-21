import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { z } from 'zod';

import { ShelterFilter } from '@nurisk/shared-types/shelter';
import { SheltersRepository } from './shelters.repository';
import { PaginationRequest, ListResponse } from '@nurisk/shared-types/api';

import type { Shelter, ShelterOccupancy, ShelterActivation } from '@nurisk/shared-types';
import { createShelterSchema, updateShelterSchema } from '@nurisk/validation/shelter';
export { createShelterSchema, updateShelterSchema };

export type CreateShelterDTO = z.infer<typeof createShelterSchema>;
export type UpdateShelterDTO = z.infer<typeof updateShelterSchema>;

export class SheltersService {
  constructor(
    private sheltersRepository: SheltersRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateShelterDTO): Promise<any> {
    const parsed = createShelterSchema.parse(dto);

    const shelter = await this.sheltersRepository.create(parsed);

    this.eventEmitter.emit('shelter.created', shelter);

    return {
      success: true,
      message: 'Posko berhasil dibuat',
      data: shelter,
    };
  }

  async findById(id: string): Promise<any> {
    const shelter = await this.sheltersRepository.findById(id);

    if (!shelter) {
      throw new NotFoundException('Posko tidak ditemukan');
    }

    return {
      success: true,
      data: shelter,
    };
  }

  async findAll(
    filters: ShelterFilter = {},
    options: PaginationRequest,
  ): Promise<ListResponse<any>> {
    const result = await this.sheltersRepository.findAll(filters, options);

    return result;
  }

  async update(id: string, dto: UpdateShelterDTO): Promise<any> {
    const parsed = updateShelterSchema.parse(dto);

    const shelter = await this.sheltersRepository.update(id, parsed);

    if (!shelter) {
      throw new NotFoundException('Posko tidak ditemukan');
    }

    this.eventEmitter.emit('shelter.updated', shelter);

    return {
      success: true,
      message: 'Posko berhasil diperbarui',
      data: shelter,
    };
  }

  async delete(id: string): Promise<any> {
    await this.sheltersRepository.delete(id);

    this.eventEmitter.emit('shelter.deleted', { id });

    return {
      success: true,
      message: 'Posko berhasil dihapus',
    };
  }

  async findByIncident(incidentId: string): Promise<any> {
    const shelters = await this.sheltersRepository.findByIncident(incidentId);

    return {
      success: true,
      data: shelters,
      count: shelters.length,
    };
  }
}