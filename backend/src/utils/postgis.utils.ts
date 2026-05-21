import { Prisma } from '@prisma/client';
import pool from '../config/database';

/**
 * PostGIS utility functions for spatial queries
 */
export class PostGISUtils {
  /**
   * Find records within a radius of a point
   * @param lat Latitude
   * @param lng Longitude
   * @param radiusKm Radius in kilometers
   * @param table Table name
   * @param column Column name (default: 'location')
   */
  static async findWithinRadius(
    lat: number,
    lng: number,
    radiusKm: number,
    table: string,
    column = 'location'
  ): Promise<any[]> {
    const result = await pool.query(`
      SELECT * FROM ${table}
      WHERE ST_DWithin(
        ${column}::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3 * 1000
      )
    `, [lng, lat, radiusKm]);

    return result.rows;
  }

  /**
   * Find records within a polygon (WKT format)
   * @param wkt Well-known text polygon (e.g., 'POLYGON((...))')
   * @param table Table name
   * @param column Column name
   */
  static async findWithinPolygon(
    wkt: string,
    table: string,
    column = 'location'
  ): Promise<any[]> {
    const result = await pool.query(`
      SELECT * FROM ${table}
      WHERE ST_Contains(
        ST_SetSRID(ST_GeomFromText($1, 4326), 4326),
        ${column}
      )
    `, [wkt]);

    return result.rows;
  }

  /**
   * Find nearest records to a point
   * @param lat Latitude
   * @param lng Longitude
   * @param limit Number of results
   * @param table Table name
   * @param column Column name
   */
  static async findNearest(
    lat: number,
    lng: number,
    limit = 10,
    table: string,
    column = 'location'
  ): Promise<any[]> {
    const result = await pool.query(`
      SELECT *, ST_Distance(
        ${column}::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      ) as distance
      FROM ${table}
      ORDER BY ${column} <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
      LIMIT $3
    `, [lng, lat, limit]);

    return result.rows;
  }

  /**
   * Calculate distance between two points
   * @param lat1 Latitude of point 1
   * @param lng1 Longitude of point 1
   * @param lat2 Latitude of point 2
   * @param lng2 Longitude of point 2
   * @returns Distance in kilometers
   */
  static async calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): Promise<number> {
    const result = await pool.query(`
      SELECT ST_Distance(
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
      ) / 1000 as distance_km
    `, [lng1, lat1, lng2, lat2]);

    return parseFloat(result.rows[0].distance_km);
  }

  /**
   * Convert JSON coordinates to PostGIS geometry
   * @param coords { lat, lng } object
   */
  static toGeometry(coords: { lat: number; lng: number }): string {
    return `ST_SetSRID(ST_MakePoint(${coords.lng}, ${coords.lat}), 4326)`;
  }

  /**
   * Extract coordinates from PostGIS geometry
   * @param geometry PostGIS geometry
   */
  static fromGeometry(geometry: any): { lat: number; lng: number } | null {
    if (!geometry) return null;
    return {
      lat: parseFloat(geometry.y),
      lng: parseFloat(geometry.x),
    };
  }
}

/**
 * Prisma raw query wrapper for PostGIS
 */
export class PrismaPostGIS {
  constructor(private prisma: Prisma.TransactionClient) {}

  /**
   * Find incidents within radius
   */
  async findIncidentsWithinRadius(
    lat: number,
    lng: number,
    radiusKm: number
  ): Promise<any[]> {
    const result = await this.prisma.$queryRawUnsafe(`
      SELECT * FROM "Incident"
      WHERE ST_DWithin(
        location::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3 * 1000
      )
    `, lng, lat, radiusKm);

    return result as any[];
  }

  /**
   * Find nearest incidents
   */
  async findNearestIncidents(
    lat: number,
    lng: number,
    limit = 10
  ): Promise<any[]> {
    const result = await this.prisma.$queryRawUnsafe(`
      SELECT *, ST_Distance(
        location::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      ) as distance
      FROM "Incident"
      ORDER BY location <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
      LIMIT $3
    `, lng, lat, limit);

    return result as any[];
  }
}