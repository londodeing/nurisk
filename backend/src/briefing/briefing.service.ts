import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BriefingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.executiveBriefing.create({ data });
  }

  async list(filter: any) {
    const where: any = {};
    if (filter.incidentId) where.incidentId = filter.incidentId;
    if (filter.status) where.status = filter.status;
    if (filter.audience) where.audience = filter.audience;
    return this.prisma.executiveBriefing.findMany({
      where,
      orderBy: { generatedAt: 'desc' },
      take: filter.limit ? Math.min(filter.limit, 100) : 50,
    });
  }

  async getById(id: string) {
    const briefing = await this.prisma.executiveBriefing.findUnique({ where: { id } });
    if (!briefing || briefing.deletedAt) throw new NotFoundException('ExecutiveBriefing not found');
    return briefing;
  }

  async getLatest() {
    const briefing = await this.prisma.executiveBriefing.findFirst({
      where: { status: 'PUBLISHED' },
      orderBy: { generatedAt: 'desc' },
    });
    if (!briefing) throw new NotFoundException('No published briefing found');
    return briefing;
  }

  async getMetrics() {
    const [totalIncidents, totalVolunteers, totalShelters] = await Promise.all([
      this.prisma.incident.count().catch(() => 0),
      this.prisma.volunteer.count().catch(() => 0),
      this.prisma.shelter.count().catch(() => 0),
    ]);
    return {
      totalIncidents,
      activeIncidents: 0,
      totalVolunteers,
      deployedVolunteers: 0,
      totalShelters,
      availableCapacity: 0,
      resourcesDeployed: 0,
      affectedPopulation: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}
