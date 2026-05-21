const pool = require('../config/database');

/**
 * IncidentRepository - Data access layer for incidents and disaster reports
 */
class IncidentRepository {

  /**
   * Create new incident
   */
  async create(data) {
    const result = await pool.query(
      `INSERT INTO incidents (
        disaster_type, title, description, location, latitude, longitude,
        severity, status, source, source_type, reported_by,
        verified_at, verified_by, region, district
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        data.disaster_type,
        data.title,
        data.description,
        data.location,
        data.latitude,
        data.longitude,
        data.severity || 'SEDANG',
        data.status || 'REPORTED',
        data.source || 'public',
        data.source_type || 'manual',
        data.reported_by,
        data.verified_at,
        data.verified_by,
        data.region,
        data.district
      ]
    );
    return result.rows[0];
  }

  /**
   * Find incident by ID
   */
  async findById(id) {
    const result = await pool.query(
      `SELECT i.*, 
             ST_AsGeoJSON(i.location) as location_geojson,
             ST_Y(i.location) as latitude,
             ST_X(i.location) as longitude
      FROM incidents i
      WHERE i.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get incidents with filters
   */
  async getIncidents(filters = {}) {
    const {
      disaster_type,
      severity,
      status,
      region,
      district,
      start_date,
      end_date,
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = filters;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (disaster_type) {
      conditions.push(`disaster_type = $${paramIndex++}`);
      params.push(disaster_type);
    }

    if (severity) {
      conditions.push(`severity = $${paramIndex++}`);
      params.push(severity);
    }

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (region) {
      conditions.push(`region = $${paramIndex++}`);
      params.push(region);
    }

    if (district) {
      conditions.push(`district = $${paramIndex++}`);
      params.push(district);
    }

    if (start_date) {
      conditions.push(`created_at >= $${paramIndex++}`);
      params.push(start_date);
    }

    if (end_date) {
      conditions.push(`created_at <= $${paramIndex++}`);
      params.push(end_date);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const offset = (page - 1) * limit;
    const validSortFields = ['created_at', 'updated_at', 'severity', 'disaster_type'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const order = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = `
      SELECT i.*, 
             ST_Y(i.location) as latitude,
             ST_X(i.location) as longitude
      FROM incidents i
      ${whereClause}
      ORDER BY ${sortField} ${order}
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total FROM incidents i ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params.slice(0, -2));

    return {
      incidents: result.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit)
    };
  }

  /**
   * Get incidents as GeoJSON for map markers
   */
  async getIncidentGeoJson(bbox, filters = {}) {
    const { disaster_type, severity, status, limit = 100 } = filters;

    // Default bbox: Indonesia
    const defaultBbox = {
      minLat: -11.0,
      maxLat: 6.0,
      minLng: 95.0,
      maxLng: 141.0
    };

    const bounds = bbox || defaultBbox;
    const conditions = [
      `ST_Y(i.location) BETWEEN $1 AND $2`,
      `ST_X(i.location) BETWEEN $3 AND $4`
    ];
    const params = [bounds.minLat, bounds.maxLat, bounds.minLng, bounds.maxLng];
    let paramIndex = 5;

    if (disaster_type) {
      conditions.push(`disaster_type = $${paramIndex++}`);
      params.push(disaster_type);
    }

    if (severity) {
      conditions.push(`severity = $${paramIndex++}`);
      params.push(severity);
    }

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    params.push(limit);

    const query = `
      SELECT 
        i.id,
        i.disaster_type,
        i.title,
        i.severity,
        i.status,
        i.created_at,
        ST_Y(i.location) as latitude,
        ST_X(i.location) as longitude
      FROM incidents i
      WHERE ${conditions.join(' AND ')}
      ORDER BY i.created_at DESC
      LIMIT $${paramIndex}
    `;

    const result = await pool.query(query, params);

    // Convert to GeoJSON FeatureCollection
    const features = result.rows.map(row => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [row.longitude, row.latitude]
      },
      properties: {
        id: row.id,
        disaster_type: row.disaster_type,
        title: row.title,
        severity: row.severity,
        status: row.status,
        created_at: row.created_at
      }
    }));

    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * Update incident
   */
  async update(id, data) {
    const updates = [];
    const params = [];
    let paramIndex = 1;

    const fields = [
      'disaster_type', 'title', 'description', 'location', 'latitude', 'longitude',
      'severity', 'status', 'verified_at', 'verified_by', 'region', 'district'
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        params.push(data[field]);
      }
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    const query = `
      UPDATE incidents 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  /**
   * Delete incident
   */
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM incidents WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get incident statistics
   */
  async getStats(filters = {}) {
    const { region, start_date, end_date } = filters;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (region) {
      conditions.push(`region = $${paramIndex++}`);
      params.push(region);
    }

    if (start_date) {
      conditions.push(`created_at >= $${paramIndex++}`);
      params.push(start_date);
    }

    if (end_date) {
      conditions.push(`created_at <= $${paramIndex++}`);
      params.push(end_date);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'REPORTED' THEN 1 END) as reported,
        COUNT(CASE WHEN status = 'VERIFIED' THEN 1 END) as verified,
        COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END) as resolved,
        COUNT(CASE WHEN severity = 'TINGGI' THEN 1 END) as tinggi,
        COUNT(CASE WHEN severity = 'SEDANG' THEN 1 END) as sedang,
        COUNT(CASE WHEN severity = 'RENDAH' THEN 1 END) as rendah,
        COUNT(CASE WHEN disaster_type = 'BANJIR' THEN 1 END) as banjir,
        COUNT(CASE WHEN disaster_type = 'GEMPA' THEN 1 END) as gempa,
        COUNT(CASE WHEN disaster_type = 'LONTSAR' THEN 1 END) as lontsar,
        COUNT(CASE WHEN disaster_type = 'KEBAKARAN' THEN 1 END) as kebakaran
      FROM incidents i
      ${whereClause}
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  /**
   * Get active incidents count
   */
  async getActiveCount() {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM incidents 
       WHERE status IN ('REPORTED', 'VERIFIED', 'DISPATCHED')`
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Find nearby incidents
   */
  async findNearby(lat, lng, radiusKm = 10) {
    const result = await pool.query(
      `SELECT i.*, 
             ST_Y(i.location) as latitude,
             ST_X(i.location) as longitude,
             ST_Distance(
               ST_MakePoint($2, $1)::geography,
               i.location::geography
             ) / 1000 as distance_km
      FROM incidents i
      WHERE ST_DWithin(
        ST_MakePoint($2, $1)::geography,
        i.location::geography,
        $3 * 1000
      )
      AND status IN ('REPORTED', 'VERIFIED')
      ORDER BY distance_km
      LIMIT 20`,
      [lat, lng, radiusKm]
    );
    return result.rows;
  }
}

module.exports = new IncidentRepository();