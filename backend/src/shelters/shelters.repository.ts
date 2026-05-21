import { Injectable } from '@nestjs/common';
import { Prisma, Shelter } from '@prisma/client';

import { ShelterFilter } from '@nurisk/shared-types/shelter';
import { PaginationRequest, ListResponse } from '@nurisk/shared-types/api';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SheltersRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
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
  }): Promise<Shelter> {
    return this.prisma.shelter.create({
      data: {
        name: data.name,
        region: data.region,
        address: data.address,
        status: data.status as any || 'AKTIF',
        score: data.score || 100,
        refugeeCount: data.refugeeCount || 0,
        stockStatus: data.stockStatus || 'AMAN',
        incidentId: data.incidentId,
      },
    });
  }

  async findById(id: string): Promise<Shelter | null> {
    return this.prisma.shelter.findUnique({ where: { id } });
  }

  async findAll(
    filters: ShelterFilter = {},
    options: PaginationRequest
  ): Promise<ListResponse<Shelter>> {
    const { status, region, incidentId } = filters;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const where: Prisma.ShelterWhereInput = {};

    if (status) {
      where.status = status as any;
    }

    if (region) {
      where.region = { contains: region, mode: 'insensitive' };
    }

    if (incidentId) {
      where.incidentId = incidentId;
    }

    const total = await this.prisma.shelter.count({ where });

    const skip = (page - 1) * limit;
    const validSortFields = ['id', 'name', 'region', 'status', 'score', 'createdAt', 'updatedAt'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const data = await this.prisma.shelter.findMany({
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

  async update(
    id: string,
    data: Partial<{
      name: string;
      region: string;
      status: string;
      score: number;
      refugeeCount: number;
      stockStatus: string;
      address: string;
    }>
  ): Promise<Shelter | null> {
    const updateData: Prisma.ShelterUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.region !== undefined) updateData.region = data.region;
    if (data.status !== undefined) updateData.status = data.status as any;
    if (data.score !== undefined) updateData.score = data.score;
    if (data.refugeeCount !== undefined) updateData.refugeeCount = data.refugeeCount;
    if (data.stockStatus !== undefined) updateData.stockStatus = data.stockStatus;
    if (data.address !== undefined) updateData.address = data.address;

    try {
      return await this.prisma.shelter.update({
        where: { id },
        data: updateData,
      });
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.shelter.delete({ where: { id } }).catch(() => {});
  }

  async findByIncident(incidentId: string): Promise<Shelter[]> {
    return this.prisma.shelter.findMany({
      where: { incidentId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

// Import PrismaClient
import { PrismaClient } from '@prisma/client';