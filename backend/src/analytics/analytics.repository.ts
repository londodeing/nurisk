import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsRepository {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(startDate?: string, endDate?: string, region?: string) {
    const incidentWhere: Prisma.IncidentWhereInput = {};

    if (startDate && endDate) {
      incidentWhere.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (region) {
      incidentWhere.region = region;
    }

    // Run all independent queries in parallel
    const [incidents, statusCounts, volunteerCounts, assetStats] = await Promise.all([
      this.prisma.incident.aggregate({
        where: incidentWhere,
        _count: true,
        _avg: { priorityScore: true },
      }),
      this.prisma.incident.groupBy({
        by: ['status'],
        where: incidentWhere,
        _count: true,
      }),
      this.prisma.volunteer.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.asset.aggregate({
        where: { status: 'available' },
        _sum: { quantity: true },
        _count: true,
      }),
    ]);

    const statusMap = Object.fromEntries(statusCounts.map((s) => [s.status, s._count]));
    const volunteerMap = Object.fromEntries(volunteerCounts.map((v) => [v.status, v._count]));

    return {
      incidents: {
        total_incidents: incidents._count || 0,
        reported: statusMap['REPORTED'] || 0,
        verified: statusMap['VERIFIED'] || 0,
        assessed: statusMap['ASSESSED'] || 0,
        commanded: statusMap['COMMANDED'] || 0,
        in_action: statusMap['ACTION'] || 0,
        completed: statusMap['COMPLETED'] || 0,
        critical: statusMap['CRITICAL'] || 0,
        avg_priority: incidents._avg.priorityScore || 0,
      },
      volunteers: {
        total_volunteers: volunteerCounts.reduce((sum, v) => sum + v._count, 0),
        active: volunteerMap['approved'] || 0,
        pending: volunteerMap['pending'] || 0,
      },
      assets: {
        total_items: assetStats._sum.quantity || 0,
        total_types: assetStats._count || 0,
      },
    };
  }

  async getRegionalStats(region: string) {
    const result = await this.prisma.incident.aggregate({
      where: { region },
      _count: true,
      _sum: { priorityScore: true },
    });

    const statusCounts = await this.prisma.incident.groupBy({
      by: ['status'],
      where: { region },
      _count: true,
    });

    return {
      total_incidents: result._count || 0,
      completed: statusCounts.find((s) => s.status === 'RESOLVED')?._count || 0,
      total_affected: result._sum.priorityScore || 0,
    };
  }

  async getTrendData(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const incidents = await this.prisma.incident.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        disasterType: true,
      },
      orderBy: { createdAt: 'asc' },
      take: 5000,
    });

    // Group by date
    const dateMap = new Map<string, any>();
    for (const incident of incidents) {
      const dateKey = incident.createdAt.toISOString().split('T')[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { date: dateKey, count: 0, banjir: 0, tanah_longsor: 0, gempa: 0 });
      }
      const entry = dateMap.get(dateKey);
      if (entry && incident.disasterType) {
        entry.count++;
        if (incident.disasterType === 'BANJIR') entry.banjir++;
        if (incident.disasterType === 'LONGSOR') entry.tanah_longsor++;
        if (incident.disasterType === 'GEMPA') entry.gempa++;
      }
    }

    return Array.from(dateMap.values());
  }

  async getDisasterTypeDistribution(region?: string) {
    const where: Prisma.IncidentWhereInput = {};

    if (region) {
      where.region = region;
    }

    const result = await this.prisma.incident.groupBy({
      by: ['disasterType'],
      where,
      _count: {
        id: true,
      },
    });

    return result.map((r) => ({
      disaster_type: r.disasterType,
      count: r._count.id,
    }));
  }

  async getAuditLogs(limit: number = 100) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { actor: { select: { id: true, username: true, fullName: true } } },
    });
  }
}

// Import PrismaClient
import { PrismaClient } from '@prisma/client';