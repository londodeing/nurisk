import { Injectable } from '@nestjs/common';
import { Prisma, Asset, AssetTransaction, AssetTransactionStatus } from '@prisma/client';
import { PaginationRequest, ListResponse } from '@nurisk/shared-types/api';
import { PrismaService } from '../prisma/prisma.service';

export interface AssetFilter {
  category?: string;
  status?: string;
  region?: string;
  search?: string;
}

@Injectable()
export class AssetsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    category?: string;
    quantity?: number;
    unit?: string;
    location?: string;
    warehouseId?: string;
    qrCode?: string;
    status?: string;
  }): Promise<Asset> {
    const qrCode = data.qrCode || `PUSDATIN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return this.prisma.asset.create({
      data: {
        name: data.name,
        category: data.category as any,
        quantity: data.quantity || 0,
        unit: data.unit,
        region: data.location,
        warehouseId: data.warehouseId,
        qrCode,
        status: data.status || 'available',
      },
    });
  }

  async findById(id: string): Promise<Asset | null> {
    return this.prisma.asset.findUnique({ where: { id } });
  }

  async findByQrCode(qrCode: string): Promise<Asset | null> {
    return this.prisma.asset.findUnique({ where: { qrCode } });
  }

  async findAll(
    filters: AssetFilter = {},
    options: PaginationRequest
  ): Promise<ListResponse<Asset>> {
    const { category, status, region, search } = filters;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const where: Prisma.AssetWhereInput = {};

    if (category) {
      where.category = category as any;
    }

    if (status) {
      where.status = status;
    }

    if (region) {
      where.region = { contains: region, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { qrCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.asset.count({ where });

    const skip = (page - 1) * limit;
    const validSortFields = ['id', 'name', 'category', 'status', 'quantity', 'createdAt', 'updatedAt'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const data = await this.prisma.asset.findMany({
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
      category: string;
      quantity: number;
      unit: string;
      location: string;
      warehouseId: string;
      qrCode: string;
      status: string;
    }>
  ): Promise<Asset | null> {
    const updateData: Prisma.AssetUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.category !== undefined) updateData.category = data.category as any;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.location !== undefined) updateData.region = data.location;
    if (data.warehouseId !== undefined) updateData.warehouse = { connect: { id: data.warehouseId } };
    if (data.qrCode !== undefined) updateData.qrCode = data.qrCode;
    if (data.status !== undefined) updateData.status = data.status;

    try {
      return await this.prisma.asset.update({
        where: { id },
        data: updateData,
      });
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.asset.delete({ where: { id } }).catch(() => {});
  }

  async createTransaction(data: {
    assetId: string;
    incidentId?: string;
    volunteerId?: string;
    quantity: number;
    type: string;
    status?: string;
  }): Promise<AssetTransaction> {
    return this.prisma.assetTransaction.create({
      data: {
        assetId: data.assetId,
        incidentId: data.incidentId,
        volunteerId: data.volunteerId,
        quantity: data.quantity,
        type: data.type as any,
        status: (data.status ?? 'PENDING') as AssetTransactionStatus,
      },
    });
  }

  async getTransactions(assetId: string): Promise<AssetTransaction[]> {
    return this.prisma.assetTransaction.findMany({
      where: { assetId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

// Import PrismaClient
import { PrismaClient } from '@prisma/client';