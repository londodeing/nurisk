import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EarlyWarningService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.warning.create({ data });
  }

  async list(filter: any) {
    const where: any = {};
    if (filter.severity) where.severity = filter.severity;
    if (filter.status) where.status = filter.status;
    if (filter.incidentId) where.incidentId = filter.incidentId;
    if (filter.regionId) where.regionId = filter.regionId;
    if (filter.source) where.source = filter.source;
    if (filter.createdBy) where.createdBy = filter.createdBy;
    return this.prisma.warning.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async getById(id: string) {
    const warning = await this.prisma.warning.findUnique({ where: { id } });
    if (!warning || warning.deletedAt) throw new NotFoundException('Warning not found');
    return warning;
  }

  async update(id: string, data: any) {
    await this.getById(id);
    return this.prisma.warning.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.getById(id);
    return this.prisma.warning.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
