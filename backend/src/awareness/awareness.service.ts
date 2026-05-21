import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AwarenessService {
  constructor(private readonly prisma: PrismaService) {}

  async createRoute(data: any) {
    const { route, ...fields } = data;
    if (route) {
      const rows = await this.prisma.$queryRawUnsafe<any[]>(
        `INSERT INTO "EvacuationRoute" (name, description, route, "originId", origin, "destinationId", destination, distance, "estimatedTime", status, "incidentId")
         VALUES ($1, $2, ST_GeomFromGeoJSON($3), $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        fields.name ?? null,
        fields.description ?? null,
        JSON.stringify(route),
        fields.originId ?? null,
        fields.origin ?? null,
        fields.destinationId ?? null,
        fields.destination ?? null,
        fields.distance ?? null,
        fields.estimatedTime ?? null,
        fields.status ?? 'ACTIVE',
        fields.incidentId ?? null,
      );
      return rows[0];
    }
    return this.prisma.evacuationRoute.create({ data: fields });
  }

  async listRoutes(filter: any) {
    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.originId) where.originId = filter.originId;
    if (filter.destinationId) where.destinationId = filter.destinationId;
    return this.prisma.evacuationRoute.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async getRouteById(id: string) {
    const route = await this.prisma.evacuationRoute.findUnique({ where: { id } });
    if (!route || route.deletedAt) throw new NotFoundException('EvacuationRoute not found');
    return route;
  }

  async createZone(data: any) {
    const { geometry, ...fields } = data;
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO "ExclusionZone" (name, geometry, radius, "restrictionType", level, description, restrictions, "effectiveFrom", "effectiveTo", "hazardZoneId", "incidentId", "regionId")
       VALUES ($1, ST_GeomFromGeoJSON($2), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      fields.name,
      JSON.stringify(geometry ?? { type: 'Polygon', coordinates: [] }),
      fields.radius ?? null,
      fields.restrictionType,
      fields.level,
      fields.description ?? null,
      fields.restrictions ?? [],
      fields.effectiveFrom,
      fields.effectiveTo ?? null,
      fields.hazardZoneId ?? null,
      fields.incidentId ?? null,
      fields.regionId ?? null,
    );
    return rows[0];
  }

  async listZones(filter: any) {
    const where: any = {};
    if (filter.restrictionType) where.restrictionType = filter.restrictionType;
    if (filter.level) where.level = filter.level;
    if (filter.incidentId) where.incidentId = filter.incidentId;
    if (filter.regionId) where.regionId = filter.regionId;
    return this.prisma.exclusionZone.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async getZoneById(id: string) {
    const zone = await this.prisma.exclusionZone.findUnique({ where: { id } });
    if (!zone || (zone as any).deletedAt) throw new NotFoundException('ExclusionZone not found');
    return zone;
  }

  async updateZone(id: string, data: any) {
    await this.getZoneById(id);
    const { geometry, ...fields } = data;
    if (geometry) {
      await this.prisma.$queryRawUnsafe(
        `UPDATE "ExclusionZone" SET geometry = ST_GeomFromGeoJSON($1), "updatedAt" = NOW() WHERE id = $2`,
        JSON.stringify(geometry),
        id,
      );
    }
    return this.prisma.exclusionZone.update({ where: { id }, data: fields });
  }

  async getTactical(incidentId: string) {
    const tac = await this.prisma.tacticalData.findUnique({ where: { incidentId } });
    if (!tac) throw new NotFoundException('TacticalData not found for this incident');
    return tac;
  }
}
