import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { z } from 'zod';
import { Incident } from '@prisma/client';
import { IncidentFilter, PaginationRequest, ListResponse } from './incident.types';

import { IncidentRepository } from './incident.repository';
import { createIncidentSchema, updateIncidentSchema } from '@nurisk/validation/incident';
export { createIncidentSchema, updateIncidentSchema };

export type CreateIncidentDTO = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentDTO = z.infer<typeof updateIncidentSchema>;

/**
 * Map snake_case API properties to camelCase for repository
 */
function mapToRepositoryIncident(data: CreateIncidentDTO): {
  location: { lat: number; lng: number; address?: string };
  disasterType: string;
  priorityLevel: string;
  description: string;
  source?: string;
  reportedBy?: string;
} {
  // Location is a GeoJSON Point: { type: 'Point', coordinates: [lng, lat] }
  const locationData = data.location as unknown as { type: 'Point'; coordinates: [number, number] };
  return {
    location: {
      lat: locationData.coordinates[1],
      lng: locationData.coordinates[0],
      address: data.specificAddress,
    },
    disasterType: data.disasterType,
    priorityLevel: data.priorityLevel || 'MEDIUM',
    description: data.description || '',
    source: data.source,
    reportedBy: data.reporterName,
  };
}

/**
 * Map snake_case update properties to camelCase for repository
 */
function mapToRepositoryUpdate(data: UpdateIncidentDTO): Partial<{
  disasterType: string;
  priorityLevel: string;
  description: string;
  source: string;
  status: string;
  region: string;
  priorityScore: number;
}> {
  const result: Partial<{
    disasterType: string;
    priorityLevel: string;
    description: string;
    source: string;
    status: string;
    region: string;
    priorityScore: number;
  }> = {};

  if (data.disasterType !== undefined) result.disasterType = data.disasterType;
  if (data.priorityLevel !== undefined) result.priorityLevel = data.priorityLevel;
  if (data.description !== undefined) result.description = data.description;
  if (data.status !== undefined) result.status = data.status;
  if (data.region !== undefined) result.region = data.region;
  if (data.priorityScore !== undefined) result.priorityScore = data.priorityScore;

  return result;
}

// Status transition map
const STATUS_TRANSITIONS: Record<string, string[]> = {
  REPORTED: ['VERIFIED', 'REJECTED', 'DISMISSED'],
  VERIFIED: ['ASSESSED', 'REJECTED', 'DISMISSED'],
  ASSESSED: ['COMMANDED', 'REJECTED'],
  COMMANDED: ['ACTION', 'COMPLETED'],
  ACTION: ['COMPLETED'],
  COMPLETED: [],
  REJECTED: [],
  DISMISSED: [],
};

@Injectable()
export class IncidentService {
  constructor(
    public incidentRepository: IncidentRepository,
    public eventEmitter: EventEmitter2
  ) {}

  /**
   * Validate status transition
   */
  private validateStatusTransition(currentStatus: string, newStatus: string): boolean {
    const allowed = STATUS_TRANSITIONS[currentStatus] || [];
    return allowed.includes(newStatus);
  }

  /**
   * Create new incident
   */
  async create(dto: CreateIncidentDTO, userId?: string): Promise<any> {
    const parsed = createIncidentSchema.parse(dto);

    // Map DTO to repository format
    const incidentData = mapToRepositoryIncident(parsed);

    const incident = await this.incidentRepository.create(incidentData);

    // Emit event for downstream handlers
    this.eventEmitter.emit('incident.created', incident);

    return {
      success: true,
      message: 'Laporan kejadian berhasil dibuat',
      data: incident,
    };
  }

  /**
   * Get incident by ID
   */
  async findById(id: string, includeDeleted = false): Promise<any> {
    // Convert number to string at service boundary
    const idStr = String(id);

    const incident = await this.incidentRepository.findById(idStr, includeDeleted);

    if (!incident) {
      throw new NotFoundException('Kejadian tidak ditemukan');
    }

    return {
      success: true,
      data: {
        ...incident,
        incident_number: incident.incidentCode,
        priority: incident.priorityLevel,
      },
    };
  }

  /**
   * Get all incidents with pagination
   */
  async findAll(
    options: PaginationRequest = {},
    filters: IncidentFilter = {},
    includeDeleted = false
  ): Promise<ListResponse<any>> {
    const result = await this.incidentRepository.findAll(options, filters, includeDeleted);
    return {
      ...result,
      items: result.items.map(item => ({
        ...item,
        incident_number: item.incidentCode,
        priority: item.priorityLevel,
        disaster_type: item.disasterType,
        // Map location for frontend compatibility
        latitude: ((item as any).location as any)?.coordinates?.[1] || 0,
        longitude: ((item as any).location as any)?.coordinates?.[0] || 0,
      })),
    };
  }

  /**
   * Get all incidents as GeoJSON
   */
  async findAllGeoJSON(filters: IncidentFilter = {}): Promise<any> {
    return this.incidentRepository.findAllGeoJSON(filters);
  }

  /**
   * Update incident
   */
  async update(id: string, dto: UpdateIncidentDTO, includeDeleted = false): Promise<any> {
    // Convert number to string at service boundary
    const idStr = String(id);

    const parsed = updateIncidentSchema.parse(dto);

    // Get current incident
    const current = await this.incidentRepository.findById(idStr, includeDeleted);
    if (!current) {
      throw new NotFoundException('Kejadian tidak ditemukan');
    }

    // Validate status transition if status is being changed
    if (parsed.status && parsed.status !== current.status) {
      if (!this.validateStatusTransition(current.status, parsed.status)) {
        throw new BadRequestException(
          `Tidak dapat mengubah status dari ${current.status} ke ${parsed.status}`
        );
      }
    }

    // Store previous values for audit
    const previousValues = { ...current } as Record<string, unknown>;

    // Map DTO to repository format
    const updateData = mapToRepositoryUpdate(parsed);

    const updated = await this.incidentRepository.update(idStr, updateData, includeDeleted);

    // Store audit log with previous values
    await this.incidentRepository.createAuditLog({
      incidentId: idStr,
      action: 'UPDATE',
      oldValue: previousValues,
      newValue: updated as Record<string, unknown>,
    });

    // Emit event for downstream handlers
    this.eventEmitter.emit('incident.updated', {
      previous: previousValues,
      current: updated,
    });

    return {
      success: true,
      message: 'Kejadian berhasil diperbarui',
      data: updated,
    };
  }

  /**
   * Soft delete incident
   */
  async delete(id: string): Promise<any> {
    // Convert number to string at service boundary
    const idStr = String(id);

    const incident = await this.incidentRepository.findById(idStr, false);

    if (!incident) {
      throw new NotFoundException('Kejadian tidak ditemukan');
    }

    const deleted = await this.incidentRepository.softDelete(idStr);

    // Emit event for cache invalidation
    this.eventEmitter.emit('incident.deleted', { id: idStr });

    return {
      success: true,
      message: 'Kejadian berhasil dihapus',
      data: deleted,
    };
  }

  /**
   * Restore soft-deleted incident
   */
  async restore(id: string): Promise<any> {
    // Convert number to string at service boundary
    const idStr = String(id);

    const incident = await this.incidentRepository.findById(idStr, true);

    if (!incident) {
      throw new NotFoundException('Kejadian tidak ditemukan');
    }

    if (!incident.deletedAt) {
      throw new BadRequestException('Kejadian tidak dalam status terhapus');
    }

    const restored = await this.incidentRepository.restore(idStr);

    return {
      success: true,
      message: 'Kejadian berhasil dipulihkan',
      data: restored,
    };
  }
}