/**
 * Input Fusion Service
 * ===============
 * Aggregates and normalizes data from multiple sources
 */

const pool = require('../config/database');
const { assessFloodRisk, assessWindRisk } = require('./weatherService');

/**
 * InputFusionService - Aggregates incident, weather, resource, and agent data
 */
class InputFusionService {
  constructor() {
    this.unifiedTimestamp = new Date().toISOString();
  }

  /**
   * Fuse inputs for a specific incident
   * @param {number} incidentId - Incident ID
   * @returns {Promise<OrchestratorInput>}
   */
  async fuseInputs(incidentId) {
    console.log(`[InputFusion] Fusing inputs for incident ${incidentId}`);

    // Fetch all data in parallel
    const [incident, weather, resources, agent] = await Promise.all([
      this._fetchIncidentData(incidentId),
      this._fetchWeatherData(incidentId),
      this._fetchResourceData(incidentId),
      this._fetchAgentData(incidentId)
    ]);

    // Normalize to unified format
    const normalizedIncident = this._normalizeIncident(incident);
    const normalizedWeather = this._normalizeWeather(weather, normalizedIncident);
    const normalizedResources = this._normalizeResources(resources);
    const normalizedAgent = this._normalizeAgent(agent);

    return {
      incident: normalizedIncident,
      weather: normalizedWeather,
      resources: normalizedResources,
      agent: normalizedAgent,
      timestamp: this.unifiedTimestamp
    };
  }

  /**
   * Fetch incident data from database
   */
  async _fetchIncidentData(incidentId) {
    try {
      const result = await pool.query(
        `SELECT * FROM incidents WHERE id = $1`,
        [incidentId]
      );
      return result.rows[0] || null;
    } catch (err) {
      console.error('[InputFusion] Error fetching incident:', err.message);
      return null;
    }
  }

  /**
   * Fetch weather data for incident location
   */
  async _fetchWeatherData(incidentId) {
    try {
      // Get incident location first
      const incident = await pool.query(
        `SELECT latitude, longitude, region FROM incidents WHERE id = $1`,
        [incidentId]
      );

      if (!incident.rows[0]) {
        return null;
      }

      const { latitude, longitude, region } = incident.rows[0];

      // For now, return basic weather data
      // In production, this would call weather API
      return {
        latitude,
        longitude,
        region: region || 'Unknown',
        temperature_c: 28,
        humidity_percent: 75,
        wind_speed_ms: 5,
        precipitation_mm: 0,
        precipitation_6h_mm: 10,
        flood_risk_level: 'LOW',
        wind_risk_level: 'NONE',
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error('[InputFusion] Error fetching weather:', err.message);
      return null;
    }
  }

  /**
   * Fetch resource availability
   */
  async _fetchResourceData(incidentId) {
    try {
      // Get incident location
      const incident = await pool.query(
        `SELECT latitude, longitude, region FROM incidents WHERE id = $1`,
        [incidentId]
      );

      if (!incident.rows[0]) {
        return { volunteers: [], assets: [], shelters: [] };
      }

      const { latitude, longitude, region } = incident.rows[0];

      // Fetch available volunteers in region
      const volunteers = await pool.query(
        `SELECT v.id, v.full_name, v.expertise, v.status, v.latitude, v.longitude
         FROM volunteers v
         WHERE v.status = 'approved'
         ORDER BY v.created_at DESC
         LIMIT 10`
      );

      // Fetch available assets
      const assets = await pool.query(
        `SELECT id, name, category, quantity, location, status
         FROM asset_inventories
         WHERE status = 'available'
         ORDER BY created_at DESC
         LIMIT 10`
      );

      // Fetch active shelters
      const shelters = await pool.query(
        `SELECT id, name, region, capacity, refugee_count as current_occupants, status
         FROM shelters
         WHERE status = 'AKTIF'
         ORDER BY score DESC
         LIMIT 10`
      );

      return {
        volunteers: volunteers.rows,
        assets: assets.rows,
        shelters: shelters.rows
      };
    } catch (err) {
      console.error('[InputFusion] Error fetching resources:', err.message);
      return { volunteers: [], assets: [], shelters: [] };
    }
  }

  /**
   * Fetch agent analysis data
   */
  async _fetchAgentData(incidentId) {
    try {
      // Check for existing agent analysis in incidents table
      const result = await pool.query(
        `SELECT kondisi_mutakhir, description FROM incidents WHERE id = $1`,
        [incidentId]
      );

      if (!result.rows[0]) {
        return null;
      }

      const { kondisi_mutakhir, description } = result.rows[0];

      if (!kondisi_mutakhir && !description) {
        return null;
      }

      return {
        analysis: kondisi_mutakhir || description,
        recommendations: { primary: 'REVIEW_SITUATION: Assess current conditions' },
        confidence: 0.7,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error('[InputFusion] Error fetching agent data:', err.message);
      return null;
    }
  }

  /**
   * Normalize incident data
   */
  _normalizeIncident(incident) {
    if (!incident) {
      return null;
    }

    return {
      id: incident.id,
      title: incident.title,
      disaster_type: incident.disaster_type,
      latitude: parseFloat(incident.latitude),
      longitude: parseFloat(incident.longitude),
      region: incident.region,
      status: incident.status,
      priority_score: incident.priority_score || 0,
      priority_level: incident.priority_level || 'LOW',
      dampak_manusia: typeof incident.dampak_manusia === 'string' 
        ? JSON.parse(incident.dampak_manusia) 
        : incident.dampak_manusia || {},
      dampak_rumah: typeof incident.dampak_rumah === 'string'
        ? JSON.parse(incident.dampak_rumah)
        : incident.dampak_rumah || {},
      dampak_fasum: typeof incident.dampak_fasum === 'string'
        ? JSON.parse(incident.dampak_fasum)
        : incident.dampak_fasum || {},
      dampak_vital: typeof incident.dampak_vital === 'string'
        ? JSON.parse(incident.dampak_vital)
        : incident.dampak_vital || {},
      dampak_lingkungan: typeof incident.dampak_lingkungan === 'string'
        ? JSON.parse(incident.dampak_lingkungan)
        : incident.dampak_lingkungan || {}
    };
  }

  /**
   * Normalize weather data
   */
  _normalizeWeather(weather, incident) {
    if (!weather) {
      return {
        latitude: incident?.latitude || 0,
        longitude: incident?.longitude || 0,
        region: incident?.region || 'Unknown',
        temperature_c: 28,
        humidity_percent: 75,
        wind_speed_ms: 5,
        precipitation_mm: 0,
        precipitation_6h_mm: 0,
        flood_risk_level: 'NONE',
        wind_risk_level: 'NONE',
        timestamp: this.unifiedTimestamp
      };
    }

    // Assess flood risk if we have precipitation data
    if (weather.precipitation_6h_mm) {
      const floodRisk = assessFloodRisk(weather.precipitation_6h_mm, 50);
      weather.flood_risk_level = floodRisk.level;
    }

    // Assess wind risk
    if (weather.wind_speed_ms) {
      const windRisk = assessWindRisk(weather.wind_speed_ms);
      weather.wind_risk_level = windRisk.level;
    }

    return {
      ...weather,
      timestamp: weather.timestamp || this.unifiedTimestamp
    };
  }

  /**
   * Normalize resource data
   */
  _normalizeResources(resources) {
    if (!resources) {
      return { volunteers: [], assets: [], shelters: [] };
    }

    return {
      volunteers: (resources.volunteers || []).map(v => ({
        id: v.id,
        full_name: v.full_name,
        expertise: v.expertise,
        status: v.status,
        latitude: parseFloat(v.latitude) || 0,
        longitude: parseFloat(v.longitude) || 0,
        distance_km: this._calculateDistance(0, 0, v.latitude, v.longitude)
      })),
      assets: (resources.assets || []).map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        quantity: a.quantity,
        location: a.location,
        status: a.status
      })),
      shelters: (resources.shelters || []).map(s => ({
        id: s.id,
        name: s.name,
        region: s.region,
        capacity: s.capacity,
        current_occupants: s.current_occupants,
        status: s.status
      }))
    };
  }

  /**
   * Normalize agent data
   */
  _normalizeAgent(agent) {
    if (!agent) {
      return null;
    }

    return {
      analysis: agent.analysis,
      recommendations: agent.recommendations,
      confidence: agent.confidence,
      timestamp: agent.timestamp || this.unifiedTimestamp
    };
  }

  /**
   * Calculate approximate distance between two points
   * Uses Haversine formula approximation
   */
  _calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat2 || !lon2) {
      return 0;
    }
    
    const R = 6371; // Earth's radius in km
    const dLat = (parseFloat(lat2) - parseFloat(lat1)) * Math.PI / 180;
    const dLon = (parseFloat(lon2) - parseFloat(lon1)) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(parseFloat(lat1) * Math.PI / 180) * Math.cos(parseFloat(lat2) * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return Math.round(R * c * 10) / 10;
  }
}

module.exports = {
  InputFusionService
};