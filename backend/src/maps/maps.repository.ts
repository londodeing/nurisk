import { Injectable } from '@nestjs/common';
import { Prisma, HistoricalDisaster, Incident } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MapsRepository {
  constructor(private prisma: PrismaService) {}

  async getHistoricalDisasters(
    region?: string,
    disasterType?: string,
    startDate?: string,
    endDate?: string,
    limit: number = 1000
  ): Promise<HistoricalDisaster[]> {
    const where: Prisma.HistoricalDisasterWhereInput = {};

    if (region) {
      where.region = { contains: region, mode: 'insensitive' };
    }

    if (disasterType) {
      where.disasterType = disasterType as any;
    }

    if (startDate) {
      where.eventDate = { gte: new Date(startDate) };
    }

    if (endDate) {
      where.eventDate = { ...where.eventDate as object, lte: new Date(endDate) };
    }

    return this.prisma.historicalDisaster.findMany({
      where,
      orderBy: { eventDate: 'desc' },
      take: limit,
    });
  }

  async getIncidentsGeoJSON(region?: string, status?: string) {
    const where: Prisma.IncidentWhereInput = {
      deletedAt: null,
    };

    if (region) {
      where.region = { contains: region, mode: 'insensitive' };
    }

    if (status) {
      where.status = status as any;
    }

    const incidents = await this.prisma.incident.findMany({
      where,
      select: {
        id: true,
        title: true,
        disasterType: true,
        status: true,
        priorityLevel: true,
        region: true,
        createdAt: true,
        location: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    // Convert to GeoJSON - location is PostGIS geography
    // This is simplified - actual implementation would extract coordinates from PostGIS
    const features = incidents.map((incident) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0], // Would extract from PostGIS geography
      },
      properties: {
        id: incident.id,
        title: incident.title,
        disaster_type: incident.disasterType,
        status: incident.status,
        priority_level: incident.priorityLevel,
        region: incident.region,
        created_at: incident.createdAt,
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  async getRegionBoundary(region: string) {
    const result = await this.prisma.incident.findFirst({
      where: { region: { contains: region, mode: 'insensitive' } },
      select: { region: true },
    });
    return result;
  }

  async getWmsConfig() {
    return {
      layers: [
        {
          name: 'Batas Desa',
          url: 'https://inarisk1.bnpb.go.id:8443/geoserver/raster/wms',
          layers: 'raster:batas_desa',
        },
        {
          name: 'Banjir',
          url: 'https://inarisk1.bnpb.go.id:8443/geoserver/raster/wms',
          layers: 'raster:banjir',
        },
        {
          name: 'Tanah Longsor',
          url: 'https://inarisk1.bnpb.go.id:8443/geoserver/raster/wms',
          layers: 'raster:tanah_longsor',
        },
      ],
    };
  }
}

// Import PrismaClient
import { PrismaClient } from '@prisma/client';