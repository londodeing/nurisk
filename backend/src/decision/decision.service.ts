import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DecisionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.decision.create({ data });
  }

  async list(filter: any) {
    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.category) where.category = filter.category;
    if (filter.incidentId) where.incidentId = filter.incidentId;
    return this.prisma.decision.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async getById(id: string) {
    const decision = await this.prisma.decision.findUnique({ where: { id } });
    if (!decision || decision.deletedAt) throw new NotFoundException('Decision not found');
    return decision;
  }

  async update(id: string, data: any) {
    await this.getById(id);
    return this.prisma.decision.update({ where: { id }, data });
  }

  async approve(id: string, selectedOption: string, rationale: string) {
    const decision = await this.getById(id);
    if (decision.status !== 'PENDING') throw new BadRequestException('Decision is not in PENDING status');
    return this.prisma.decision.update({
      where: { id },
      data: {
        status: 'APPROVED' as any,
        selectedOption,
        rationale,
        decidedAt: new Date(),
      },
    });
  }

  async getStats() {
    const [total, pending, approved, rejected, deferred] = await Promise.all([
      this.prisma.decision.count(),
      this.prisma.decision.count({ where: { status: 'PENDING' } }),
      this.prisma.decision.count({ where: { status: 'APPROVED' } }),
      this.prisma.decision.count({ where: { status: 'REJECTED' } }),
      this.prisma.decision.count({ where: { status: 'DEFERRED' } }),
    ]);
    return { total, pending, approved, rejected, deferred, avgDecisionTime: 0, byCategory: {} };
  }
}
