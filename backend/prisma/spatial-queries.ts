import { PrismaClient } from '@prisma/client';

function pointExpr(): string {
  return 'ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography';
}

export interface IncidentSpatialResult {
  id: string;
  title: string | null;
  disasterType: string | null;
  status: string;
  severity: string | null;
  lng: number;
  lat: number;
  distanceMeters: number;
}

export async function findWithinRadius(
  prisma: PrismaClient,
  lat: number,
  lng: number,
  meters: number,
): Promise<IncidentSpatialResult[]> {
  const p = pointExpr();
  return prisma.$queryRawUnsafe<IncidentSpatialResult[]>(
    `SELECT id, title, "disasterType", status, severity,
            ST_X(location::geometry) AS lng,
            ST_Y(location::geometry) AS lat,
            ST_Distance(location, ${p}) AS "distanceMeters"
     FROM "Incident"
     WHERE "deletedAt" IS NULL
       AND location IS NOT NULL
       AND ST_DWithin(location, ${p}, $3)
     ORDER BY location <-> ${p}`,
    lng, lat, meters,
  );
}

export async function findNearest(
  prisma: PrismaClient,
  lat: number,
  lng: number,
  limit: number = 10,
): Promise<IncidentSpatialResult[]> {
  const p = pointExpr();
  return prisma.$queryRawUnsafe<IncidentSpatialResult[]>(
    `SELECT id, title, "disasterType", status, severity,
            ST_X(location::geometry) AS lng,
            ST_Y(location::geometry) AS lat,
            ST_Distance(location, ${p}) AS "distanceMeters"
     FROM "Incident"
     WHERE "deletedAt" IS NULL
       AND location IS NOT NULL
     ORDER BY location <-> ${p}
     LIMIT $3`,
    lng, lat, limit,
  );
}

export async function isInsidePolygon(
  prisma: PrismaClient,
  lat: number,
  lng: number,
  polygonId: string,
): Promise<boolean> {
  const p = pointExpr();
  const rows = await prisma.$queryRawUnsafe<{ inside: boolean }[]>(
    `SELECT EXISTS(
       SELECT 1 FROM "Region"
       WHERE id = $3 AND "coverageArea" IS NOT NULL
         AND ST_Contains("coverageArea", ${p})
     ) OR EXISTS(
       SELECT 1 FROM "Zone"
       WHERE id = $3 AND "coverageArea" IS NOT NULL
         AND ST_Contains("coverageArea", ${p})
     ) AS inside`,
    lng, lat, polygonId,
  );
  return rows[0]?.inside ?? false;
}
