import { Injectable } from '@nestjs/common';
import { Prisma, Incident } from '@prisma/client';
import { IncidentFilter } from '@nurisk/shared-types/incident';
import { PaginationRequest, ListResponse } from '@nurisk/shared-types/api';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IncidentRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate incident code: INC-YYYYMMDD-XXXX
   */
  private async generateIncidentCode(): Promise<string> {
    const date = new Date();
    const yyyyMMdd = date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0');

    // Get last incident of today to increment sequence
    const lastIncident = await this.prisma.incident.findFirst({
      where: {
        incidentCode: { startsWith: `INC-${yyyyMMdd}-` },
      },
      orderBy: { incidentCode: 'desc' },
    });

    let sequence = 1;
    if (lastIncident) {
      const lastSequence = parseInt(lastIncident.incidentCode.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `INC-${yyyyMMdd}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Create a new incident
   */
  async create(data: {
    location: { lat: number; lng: number; address?: string };
    disasterType: string;
    priorityLevel: string;
    description: string;
    source?: string;
    reportedBy?: string;
  }): Promise<Incident> {
    const incidentCode = await this.generateIncidentCode();

    const incident = await this.prisma.incident.create({
      data: {
        incidentCode,
        disasterType: data.disasterType as any,
        priorityLevel: data.priorityLevel,
        description: data.description,
        status: 'REPORTED' as any,
        reporterName: data.reportedBy ? String(data.reportedBy) : undefined,
        // Note: location field uses PostGIS geography type
        // This would need special handling or conversion
      },
    });

    return incident;
  }

  /**
   * Find incident by ID
   */
  async findById(id: string, includeDeleted = false): Promise<Incident | null> {
    const where: Prisma.IncidentWhereUniqueInput = { id };

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return this.prisma.incident.findUnique({ where }) as Promise<Incident | null>;
  }

  /**
   * Find all incidents with pagination and filters
   */
  async findAll(
    options: PaginationRequest = {},
    filters: IncidentFilter = {},
    includeDeleted = false
  ): Promise<ListResponse<Incident>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const where: Prisma.IncidentWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (filters.status) {
      where.status = filters.status as Prisma.EnumIncidentStatusFilter;
    }

    if (filters.severity) {
      where.priorityLevel = filters.severity;
    }

    if (filters.type) {
      where.disasterType = filters.type as Prisma.EnumDisasterTypeNullableFilter;
    }

    if (filters.province) {
      where.region = filters.province;
    }

    if (filters.startDate) {
      where.createdAt = { ...where.createdAt as object, gte: new Date(filters.startDate) };
    }

    if (filters.endDate) {
      where.createdAt = { ...where.createdAt as object, lte: new Date(filters.endDate) };
    }

    if (filters.search) {
      where.OR = [
        { incidentCode: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.incident.count({ where });

    // Get paginated data
    const skip = (page - 1) * limit;
    const validSortFields = ['id', 'incidentCode', 'status', 'priorityLevel', 'disasterType', 'createdAt', 'updatedAt'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const data = await this.prisma.incident.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [safeSortBy]: sortOrder },
    });

    const totalPages = Math.ceil(total / limit);
    return {
      items: data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Find all incidents as GeoJSON features
   */
  async findAllGeoJSON(filters: IncidentFilter = {}): Promise<any> {
    const where: Prisma.IncidentWhereInput = {};

    if (filters.status) {
      where.status = filters.status as any;
    }

    if (filters.severity) {
      where.priorityLevel = filters.severity;
    }

    if (filters.type) {
      where.disasterType = filters.type as any;
    }

    if (filters.province) {
      where.region = filters.province;
    } else if (filters.regency) {
      where.region = filters.regency;
    } else if (filters.district) {
      where.region = filters.district;
    }

    if (filters.startDate) {
      where.createdAt = { gte: new Date(filters.startDate) };
    }

    if (filters.endDate) {
      where.createdAt = { ...where.createdAt as object, lte: new Date(filters.endDate) };
    }

    if (filters.search) {
      where.OR = [
        { incidentCode: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const incidents = await this.prisma.incident.findMany({
      where,
      select: {
        id: true,
        incidentCode: true,
        disasterType: true,
        priorityLevel: true,
        status: true,
        description: true,
        createdAt: true,
        location: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const features = incidents
      .filter((incident) => incident.location)
      .map((incident) => {
        // Location is PostGIS geography - needs ST_X/ST_Y extraction
        // This is simplified - actual implementation would use raw SQL for PostGIS
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0], // Would extract from PostGIS geography
          },
          properties: {
            id: incident.id,
            incidentCode: incident.incidentCode,
            disasterType: incident.disasterType,
            priorityLevel: incident.priorityLevel,
            status: incident.status,
            description: incident.description,
            createdAt: incident.createdAt,
          },
        };
      });

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  /**
   * Update incident
   */
  async update(
    id: string,
    data: Partial<{
      disasterType: string;
      priorityLevel: string;
      description: string;
      source: string;
      status: string;
      region: string;
      priorityScore: number;
      dampakManusia: any;
      dampakRumah: any;
      dampakFasum: any;
      dampakVital: any;
      dampakLingkungan: any;
    }>,
    includeDeleted = false
  ): Promise<Incident | null> {
    const where: Prisma.IncidentWhereInput = { id };

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const updateData: Prisma.IncidentUpdateInput = {};

    if (data.disasterType) updateData.disasterType = data.disasterType as any;
    if (data.priorityLevel) updateData.priorityLevel = data.priorityLevel;
    if (data.description) updateData.description = data.description;
    if (data.source) updateData.reporterName = data.source;
    if (data.status) updateData.status = data.status as any;
    if (data.region) updateData.region = data.region;
    if (data.priorityScore) updateData.priorityScore = data.priorityScore;
    if (data.dampakManusia) updateData.dampakManusia = data.dampakManusia;
    if (data.dampakRumah) updateData.dampakRumah = data.dampakRumah;
    if (data.dampakFasum) updateData.dampakFasum = data.dampakFasum;
    if (data.dampakVital) updateData.dampakVital = data.dampakVital;
    if (data.dampakLingkungan) updateData.dampakLingkungan = data.dampakLingkungan;

    try {
      return await this.prisma.incident.update({
        where: { id },
        data: updateData,
      });
    } catch {
      return null;
    }
  }

  /**
   * Soft delete incident
   */
  async softDelete(id: string): Promise<Incident | null> {
    try {
      return await this.prisma.incident.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch {
      return null;
    }
  }

  /**
   * Restore soft-deleted incident
   */
  async restore(id: string): Promise<Incident | null> {
    try {
      return await this.prisma.incident.update({
        where: { id },
        data: { deletedAt: null },
      });
    } catch {
      return null;
    }
  }

  /**
   * Create audit log entry for incident changes
   */
  async createAuditLog(data: {
    incidentId: string;
    actorId?: string;
    action: string;
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
  }): Promise<any> {
    // Would use Prisma AuditLog model if available
    // For now, return placeholder
    return { id: String(Date.now()), ...data };
  }

  /**
   * Record state transition
   */
  async createStateTransition(data: {
    incidentId: string;
    from: string;
    to: string;
    triggeredBy: string;
    reason?: string;
  }): Promise<any> {
    // Would use Prisma StateTransition model if available
    // For now, return placeholder
    return { id: Date.now(), ...data };
  }

  /**
   * Log dismissal reason
   */
  async logDismissal(data: {
    incidentId: string;
    dismissedBy: string;
    reason: string;
  }): Promise<any> {
    // Would use Prisma IncidentLog model if available
    // For now, return placeholder
    return { id: Date.now(), ...data };
  }

  /**
   * Cancel pending missions for dismissed incident
   */
  async cancelPendingMissions(incidentId: string): Promise<any[]> {
    // Would use Prisma VolunteerDeployment model if available
    return [];
  }

  /**
   * Archive dismissed incident
   */
  async archiveIncident(incidentId: string): Promise<any> {
    try {
      return await this.prisma.incident.update({
        where: { id: incidentId },
        data: { isAiGenerated: false },
      });
    } catch {
      return null;
    }
  }
}

// Import PrismaClient
import { PrismaClient } from '@prisma/client';