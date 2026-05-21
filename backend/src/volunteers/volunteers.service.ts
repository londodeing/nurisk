import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { z } from 'zod';
import type { Volunteer, VolunteerFilter, VolunteerStatistics } from '@nurisk/shared-types';

import { VolunteersRepository } from './volunteers.repository';
import { PaginationRequest, ListResponse } from '@nurisk/shared-types/api';
import {
  createVolunteerSchema,
  updateVolunteerSchema,
  deployVolunteerSchema,
} from '@nurisk/validation/volunteer';
export { createVolunteerSchema, updateVolunteerSchema, deployVolunteerSchema };

export type CreateVolunteerDTO = z.infer<typeof createVolunteerSchema>;
export type UpdateVolunteerDTO = z.infer<typeof updateVolunteerSchema>;
export type DeployVolunteerDTO = z.infer<typeof deployVolunteerSchema>;

export class VolunteersService {
  constructor(
    private volunteersRepository: VolunteersRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create new volunteer profile
   */
  async create(dto: CreateVolunteerDTO, userId?: string): Promise<any> {
    const parsed = createVolunteerSchema.parse(dto);

    const volunteer = await this.volunteersRepository.create({
      ...parsed,
      userId,
    });

    this.eventEmitter.emit('volunteer.created', volunteer);

    return {
      success: true,
      message: 'Profil volunteer berhasil dibuat',
      data: volunteer,
    };
  }

  /**
   * Get volunteer by ID
   */
  async findById(id: string): Promise<any> {
    const volunteer = await this.volunteersRepository.findById(id);

    if (!volunteer) {
      throw new NotFoundException('Volunteer tidak ditemukan');
    }

    return {
      success: true,
      data: volunteer,
    };
  }

  /**
   * Get all volunteers with pagination and filters
   */
  async findAll(
    filters: VolunteerFilter = {},
    options: PaginationRequest,
  ): Promise<ListResponse<any>> {
    const result = await this.volunteersRepository.findAll(filters, options);

    return result;
  }

  /**
   * Update volunteer profile
   */
  async update(id: string, dto: UpdateVolunteerDTO): Promise<any> {
    const parsed = updateVolunteerSchema.parse(dto);

    const volunteer = await this.volunteersRepository.update(id, parsed);

    if (!volunteer) {
      throw new NotFoundException('Volunteer tidak ditemukan');
    }

    this.eventEmitter.emit('volunteer.updated', volunteer);

    return {
      success: true,
      message: 'Profil volunteer berhasil diperbarui',
      data: volunteer,
    };
  }

  /**
   * Delete volunteer profile (soft delete)
   */
  async delete(id: string): Promise<any> {
    await this.volunteersRepository.update(id, { status: 'deleted' } as any);

    this.eventEmitter.emit('volunteer.deleted', { id });

    return {
      success: true,
      message: 'Profil volunteer berhasil dihapus',
    };
  }

  /**
   * Find volunteers by user ID
   */
  async findByUserId(userId: string): Promise<any> {
    const volunteer = await this.volunteersRepository.findByUserId(userId);

    return {
      success: true,
      data: volunteer,
    };
  }

  /**
   * Find nearby volunteers
   */
  async findNearby(lat: number, lng: number, radiusKm: number = 50, expertise?: string): Promise<any> {
    const volunteers = await this.volunteersRepository.findNearby(lat, lng, radiusKm, expertise);

    return {
      success: true,
      data: volunteers,
      count: volunteers.length,
    };
  }

  /**
   * Find volunteers by region
   */
  async findByRegion(region: string): Promise<any> {
    const volunteers = await this.volunteersRepository.findByRegion(region);

    return {
      success: true,
      data: volunteers,
      count: volunteers.length,
    };
  }

  /**
   * Deploy volunteer to incident
   */
  async deploy(dto: DeployVolunteerDTO): Promise<any> {
    const parsed = deployVolunteerSchema.parse(dto);
    const { volunteer_id, incident_id, available_from, available_until, note } = parsed;

    // Check volunteer exists
    const volunteer = await this.volunteersRepository.findById(volunteer_id);
    if (!volunteer) {
      throw new NotFoundException('Volunteer tidak ditemukan');
    }

    // Map snake_case to camelCase and convert string to Date
    const availableFrom = available_from ? new Date(available_from) : undefined;
    const availableUntil = available_until ? new Date(available_until) : undefined;

    // Create deployment record
    const result = await this.volunteersRepository.deploy({
      volunteerId: volunteer_id,
      incidentId: incident_id,
      availableFrom,
      availableUntil,
      note,
    });

    this.eventEmitter.emit('volunteer.deployed', {
      volunteerId: volunteer_id,
      incidentId: incident_id,
      deployment: result,
    });

    return {
      success: true,
      message: 'Volunteer berhasil dideploy ke incident',
      data: result,
    };
  }

  /**
   * Get volunteer deployments
   */
  async getDeployments(volunteerId: string): Promise<any> {
    const deployments = await this.volunteersRepository.getDeployments(volunteerId);

    return {
      success: true,
      data: deployments,
    };
  }

  /**
   * Set availability schedule
   */
  async setAvailability(
    volunteerId: string,
    date: string,
    shiftStart?: string,
    shiftEnd?: string,
    status: string = 'available',
  ): Promise<any> {
    const result = await this.volunteersRepository.setAvailability(
      volunteerId,
      new Date(date),
      shiftStart,
      shiftEnd,
      status,
    );

    return {
      success: true,
      message: 'Jadwal ketersediaan berhasil diatur',
      data: result,
    };
  }

  /**
   * Get availability schedule
   */
  async getAvailability(
    volunteerId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const schedules = await this.volunteersRepository.getAvailability(
      volunteerId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    return {
      success: true,
      data: schedules,
    };
  }
}