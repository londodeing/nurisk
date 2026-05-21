import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HazardService {
  constructor(private readonly prisma: PrismaService) {}

  async createZone(data: any) {
    const { polygonGeometry, ...fields } = data;
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO "HazardZone" (name, "hazardType", severity, "polygonGeometry", description, population, area, "regionId", "incidentId")
       VALUES ($1, $2, $3, ST_GeomFromGeoJSON($4), $5, $6, $7, $8, $9) RETURNING *`,
      fields.name,
      fields.hazardType,
      fields.severity,
      JSON.stringify(polygonGeometry ?? { type: 'Polygon', coordinates: [] }),
      fields.description ?? null,
      fields.population ?? null,
      fields.area ?? null,
      fields.regionId ?? null,
      fields.incidentId ?? null,
    );
    return rows[0];
  }

  async listZones(filter: any) {
    const where: any = {};
    if (filter.hazardType) where.hazardType = filter.hazardType;
    if (filter.severity) where.severity = filter.severity;
    if (filter.regionId) where.regionId = filter.regionId;
    if (filter.incidentId) where.incidentId = filter.incidentId;
    return this.prisma.hazardZone.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async getZoneById(id: string) {
    const zone = await this.prisma.hazardZone.findUnique({ where: { id } });
    if (!zone || (zone as any).deletedAt) throw new NotFoundException('HazardZone not found');
    return zone;
  }

  async updateZone(id: string, data: any) {
    await this.getZoneById(id);
    const { polygonGeometry, ...fields } = data;
    if (polygonGeometry) {
      const rows = await this.prisma.$queryRawUnsafe<any[]>(
        `UPDATE "HazardZone" SET "polygonGeometry" = ST_GeomFromGeoJSON($1), "updatedAt" = NOW() WHERE id = $2 RETURNING *`,
        JSON.stringify(polygonGeometry),
        id,
      );
      if (rows.length === 0) throw new NotFoundException('HazardZone not found');
      Object.assign(fields, rows[0]);
    }
    if (Object.keys(fields).length > 0) {
      return this.prisma.hazardZone.update({ where: { id }, data: fields });
    }
    return this.getZoneById(id);
  }

  async deleteZone(id: string) {
    await this.getZoneById(id);
    return this.prisma.hazardZone.update({ where: { id }, data: { deletedAt: new Date() } as any });
  }

  async createVulnerability(data: any) {
    return this.prisma.vulnerabilityAssessment.create({ data });
  }

  async listVulnerability(filter: any) {
    const where: any = {};
    if (filter.hazardZoneId) where.hazardZoneId = filter.hazardZoneId;
    if (filter.regionId) where.regionId = filter.regionId;
    if (filter.hazardType) where.hazardType = filter.hazardType;
    return this.prisma.vulnerabilityAssessment.findMany({ where, orderBy: { score: 'desc' } });
  }

  async getVulnerabilityByRegion(regionId: string, hazardZoneId: string) {
    const assessment = await this.prisma.vulnerabilityAssessment.findFirst({
      where: { regionId, hazardZoneId },
    });
    if (!assessment) throw new NotFoundException('VulnerabilityAssessment not found');
    return assessment;
  }

  async getHeatmap() {
    const assessments = await this.prisma.vulnerabilityAssessment.findMany({
      orderBy: { score: 'desc' },
    });
    const heatmap: Record<string, any> = {};
    for (const row of assessments) {
      if (!heatmap[row.regionId ?? 'unknown']) {
        heatmap[row.regionId ?? 'unknown'] = {
          regionId: row.regionId,
          hazards: [],
        };
      }
      heatmap[row.regionId ?? 'unknown'].hazards.push({
        hazardType: row.hazardZoneId,
        vulnerabilityIndex: row.score,
      });
    }
    return Object.values(heatmap);
  }
}
