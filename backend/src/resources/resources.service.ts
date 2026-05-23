import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResourcesService {
  private readonly logger = new Logger(ResourcesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(filters: { type?: string; status?: string; page: number; limit: number }) {
    const where: Record<string, unknown> = {};
    if (filters.type) where.category = filters.type;
    if (filters.status) where.status = filters.status;

    const total = await this.prisma.asset.count({ where: where as any });
    const items = await this.prisma.asset.findMany({
      where: where as any,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      orderBy: { createdAt: 'desc' },
    });

    const totalPages = Math.ceil(total / filters.limit);
    return {
      items,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
        hasNext: filters.page < totalPages,
        hasPrev: filters.page > 1,
      },
    };
  }

  async findById(id: string) {
    const item = await this.prisma.asset.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Resource not found');
    return item;
  }

  async create(data: Record<string, unknown>) {
    const item = await this.prisma.asset.create({
      data: {
        name: String(data.name ?? ''),
        category: data.category ? String(data.category) : undefined,
        quantity: data.quantity ? Number(data.quantity) : 0,
        unit: data.unit ? String(data.unit) : undefined,
        status: data.status ? String(data.status) : 'available',
      } as any,
    });
    return item;
  }

  async update(id: string, data: Record<string, unknown>) {
    const existing = await this.prisma.asset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Resource not found');
    return this.prisma.asset.update({ where: { id }, data: data as any });
  }

  async delete(id: string) {
    const existing = await this.prisma.asset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Resource not found');
    await this.prisma.asset.delete({ where: { id } });
    return { success: true };
  }

  async getStats() {
    const [total, available, deployed] = await Promise.all([
      this.prisma.asset.count(),
      this.prisma.asset.count({ where: { status: 'available' } }),
      this.prisma.asset.count({ where: { status: 'deployed' } }),
    ]);

    const lowStock = await this.prisma.asset.findMany({
      where: { quantity: { lte: 5 } },
      take: 10,
    });

    return {
      total,
      available,
      deployed,
      utilizationRate: total > 0 ? Math.round((deployed / total) * 100) : 0,
      lowStock,
    };
  }

  async getForecast(type?: string) {
    return [];
  }

  async getOptimization() {
    return [];
  }

  async allocate(body: { resourceId?: string; incidentId?: string; quantity?: number }) {
    return { success: true };
  }

  async deallocate(resourceId?: string, incidentId?: string) {
    return { success: true };
  }

  async transfer(body: { resourceId?: string; fromWarehouse?: string; toWarehouse?: string; quantity?: number }) {
    return { success: true };
  }
}
