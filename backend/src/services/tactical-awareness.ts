/**
 * Tactical Awareness Service
 * ==================
 * Aggregates live incident feeds per region for tactical awareness
 */

import { Pool } from 'pg';

export interface TacticalSnapshot {
  region_id: string;
  last_updated: Date;
  incidents: TacticalIncident[];
  deployed_units: DeployedUnit[];
  shelters: ShelterStatus[];
  weather?: WeatherOverlay;
  delta_from?: Date;
}

export interface TacticalIncident {
  id: string;
  type: string;
  status: string;
  priority: number;
  title: string;
  location: { lat: number; lng: number };
  reported_at: Date;
  assigned_units: number;
}

export interface DeployedUnit {
  id: string;
  name: string;
  type: string;
  status: string;
  location: { lat: number; lng: number };
  last_checkin: Date;
  mission_id?: string;
}

export interface ShelterStatus {
  id: string;
  name: string;
  status: string;
  capacity: number;
  current_occupancy: number;
  location: { lat: number; lng: number };
}

export interface WeatherOverlay {
  condition: string;
  temperature: number;
  wind_speed: number;
  precipitation: number;
  alert_level: string;
}

const TACTICAL_TTL = 15000; // 15 seconds

/**
 * Tactical Awareness Service
 */
export class TacticalAwarenessService {
  private pool: Pool;
  private cache: Map<string, { data: TacticalSnapshot; timestamp: number }> = new Map();

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Get tactical snapshot for region
   */
  async getSnapshot(regionId: string, since?: Date): Promise<TacticalSnapshot> {
    // Check cache
    const cached = this.cache.get(regionId);
    if (cached && Date.now() - cached.timestamp < TACTICAL_TTL) {
      if (since && cached.data.delta_from && cached.data.delta_from > since) {
        return cached.data;
      }
    }

    // Fetch fresh data
    const snapshot = await this.fetchSnapshot(regionId, since);

    // Cache it
    this.cache.set(regionId, { data: snapshot, timestamp: Date.now() });

    return snapshot;
  }

  /**
   * Fetch fresh snapshot from database
   */
  private async fetchSnapshot(regionId: string, since?: Date): Promise<TacticalSnapshot> {
    const [incidents, deployedUnits, shelters, weather] = await Promise.all([
      this.fetchIncidents(regionId, since),
      this.fetchDeployedUnits(regionId),
      this.fetchShelters(regionId),
      this.fetchWeather(regionId),
    ]);

    return {
      region_id: regionId,
      last_updated: new Date(),
      incidents,
      deployed_units: deployedUnits,
      shelters,
      weather,
      delta_from: since,
    };
  }

  /**
   * Fetch active incidents
   */
  private async fetchIncidents(regionId: string, since?: Date): Promise<TacticalIncident[]> {
    let query = `
      SELECT 
        id, type, status, priority, title,
        ST_Y(location::geometry) as lat,
        ST_X(location::geometry) as lng,
        reported_at,
        (SELECT COUNT(*) FROM mission_units mu 
         JOIN missions m ON m.id = mu.mission_id 
         WHERE m.incident_id = incidents.id) as assigned_units
      FROM incidents
      WHERE region = $1 AND status NOT IN ('RESOLVED', 'CLOSED')
    `;

    const params: string[] = [regionId];

    if (since) {
      query += ` AND reported_at > $2`;
      params.push(since.toISOString());
    }

    query += ` ORDER BY priority DESC, reported_at DESC LIMIT 50`;

    const result = await this.pool.query(query, params);
    return result.rows.map((row) => ({
      id: row.id,
      type: row.type,
      status: row.status,
      priority: row.priority,
      title: row.title,
      location: { lat: parseFloat(row.lat), lng: parseFloat(row.lng) },
      reported_at: row.reported_at,
      assigned_units: parseInt(row.assigned_units),
    }));
  }

  /**
   * Fetch deployed units
   */
  private async fetchDeployedUnits(regionId: string): Promise<DeployedUnit[]> {
    const result = await this.pool.query(`
      SELECT 
        v.id, v.name, v.expertise as type, v.status,
        ST_Y(v.last_location::geometry) as lat,
        ST_X(v.last_location::geometry) as lng,
        v.last_checkin,
        mu.mission_id
      FROM volunteers v
      LEFT JOIN mission_units mu ON mu.volunteer_id = v.id
      WHERE v.region = $1 AND v.status = 'DEPLOYED'
      ORDER BY v.last_checkin DESC
      LIMIT 100
    `, [regionId]);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      status: row.status,
      location: { lat: parseFloat(row.lat), lng: parseFloat(row.lng) },
      last_checkin: row.last_checkin,
      mission_id: row.mission_id,
    }));
  }

  /**
   * Fetch shelter status
   */
  private async fetchShelters(regionId: string): Promise<ShelterStatus[]> {
    const result = await this.pool.query(`
      SELECT 
        id, name, status, capacity, current_occupancy,
        ST_Y(location::geometry) as lat,
        ST_X(location::geometry) as lng
      FROM shelters
      WHERE region = $1
      ORDER BY current_occupancy DESC
      LIMIT 50
    `, [regionId]);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      capacity: row.capacity,
      current_occupancy: row.current_occupancy,
      location: { lat: parseFloat(row.lat), lng: parseFloat(row.lng) },
    }));
  }

  /**
   * Fetch weather overlay
   */
  private async fetchWeather(regionId: string): Promise<WeatherOverlay | undefined> {
    try {
      const result = await this.pool.query(`
        SELECT condition, temperature, wind_speed, precipitation, alert_level
        FROM weather_data
        WHERE region = $1
        ORDER BY observed_at DESC
        LIMIT 1
      `, [regionId]);

      if (result.rows.length === 0) {
        return undefined;
      }

      return result.rows[0];
    } catch {
      return undefined;
    }
  }

  /**
   * Get GeoJSON for map display
   */
  async getGeoJSON(regionId: string): Promise<{
    type: string;
    features: Array<{
      type: string;
      properties: Record<string, unknown>;
      geometry: { type: string; coordinates: number[] };
    }>;
    last_updated: Date;
  }> {
    const snapshot = await this.getSnapshot(regionId);

    const features: Array<{
      type: string;
      properties: Record<string, unknown>;
      geometry: { type: string; coordinates: number[] };
    }> = [];

    // Add incident points
    for (const incident of snapshot.incidents) {
      features.push({
        type: 'Feature',
        properties: {
          id: incident.id,
          category: 'incident',
          type: incident.type,
          status: incident.status,
          priority: incident.priority,
          title: incident.title,
        },
        geometry: {
          type: 'Point',
          coordinates: [incident.location.lng, incident.location.lat],
        },
      });
    }

    // Add unit points
    for (const unit of snapshot.deployed_units) {
      features.push({
        type: 'Feature',
        properties: {
          id: unit.id,
          category: 'unit',
          type: unit.type,
          status: unit.status,
          name: unit.name,
        },
        geometry: {
          type: 'Point',
          coordinates: [unit.location.lng, unit.location.lat],
        },
      });
    }

    // Add shelter points
    for (const shelter of snapshot.shelters) {
      features.push({
        type: 'Feature',
        properties: {
          id: shelter.id,
          category: 'shelter',
          name: shelter.name,
          status: shelter.status,
          capacity: shelter.capacity,
          occupancy: shelter.current_occupancy,
        },
        geometry: {
          type: 'Point',
          coordinates: [shelter.location.lng, shelter.location.lat],
        },
      });
    }

    return {
      type: 'FeatureCollection',
      features,
      last_updated: snapshot.last_updated,
    };
  }

  /**
   * Clear cache for region
   */
  clearCache(regionId: string): void {
    this.cache.delete(regionId);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }
};