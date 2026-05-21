/**
 * Flood Dispatch and Shelter Actions
 * ========================
 * Actions for dispatch, shelter allocation, and logistics
 */

import { Pool } from 'pg';

interface DispatchResult {
  volunteer_id: number;
  volunteer_name: string;
  distance_km: number;
  estimated_arrival_minutes: number;
}

interface ShelterInfo {
  shelter_id: number;
  shelter_name: string;
  capacity: number;
  current_occupancy: number;
  available_beds: number;
  distance_km: number;
}

/**
 * Find nearest available SAR (Search and Rescue) team
 */
export async function findNearestSARTeam(
  incidentLat: number,
  incidentLng: number,
  maxDistanceKm: number,
  pool: Pool
): Promise<DispatchResult | null> {
  // Find approved volunteers with SAR skills within max distance
  const result = await pool.query(
    `SELECT 
       v.id,
       v.name,
       ST_Distance(
         ST_SetSrid(ST_MakePoint(v.lng, v.lat), 4326),
         ST_SetSrid(ST_MakePoint($1, $2), 4326)
       ) / 1000 as distance_km
     FROM volunteers v
     WHERE v.status = 'approved'
       AND v.expertise LIKE '%SAR%'
       AND ST_DWithin(
         ST_SetSrid(ST_MakePoint(v.lng, v.lat), 4326),
         ST_SetSrid(ST_MakePoint($1, $2), 4326),
         $3 * 1000
       )
     ORDER BY distance_km ASC
     LIMIT 1`,
    [incidentLng, incidentLat, maxDistanceKm]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const volunteer = result.rows[0];
  // Estimate arrival: 40 km/h average speed in flood conditions
  const estimatedArrival = Math.round(volunteer.distance_km / 40 * 60);

  return {
    volunteer_id: volunteer.id,
    volunteer_name: volunteer.name,
    distance_km: Math.round(volunteer.distance_km),
    estimated_arrival_minutes: estimatedArrival,
  };
}

/**
 * Assign volunteer to a task
 */
export async function assignVolunteerToTask(
  volunteerId: number,
  taskId: number,
  pool: Pool
): Promise<void> {
  await pool.query(
    `UPDATE tasks 
     SET assigned_to = $1, status = 'assigned', updated_at = NOW()
     WHERE id = $2`,
    [volunteerId, taskId]
  );
}

/**
 * Find nearest shelters to an incident
 */
export async function findNearestShelters(
  incidentLat: number,
  incidentLng: number,
  requiredCapacity: number,
  pool: Pool
): Promise<ShelterInfo[]> {
  const result = await pool.query(
    `SELECT 
       s.id,
       s.name,
       s.capacity,
       COALESCE(SUM(vd.occupants), 0) as current_occupancy,
       s.capacity - COALESCE(SUM(vd.occupants), 0) as available_beds,
       ST_Distance(
         ST_SetSrid(ST_MakePoint(s.lng, s.lat), 4326),
         ST_SetSrid(ST_MakePoint($1, $2), 4326)
       ) / 1000 as distance_km
     FROM shelters s
     LEFT JOIN volunteer_deployments vd ON vd.shelter_id = s.id AND vd.status = 'active'
     WHERE s.status = 'active'
       AND s.capacity > 0
       AND ST_DWithin(
         ST_SetSrid(ST_MakePoint(s.lng, s.lat), 4326),
         ST_SetSrid(ST_MakePoint($1, $2), 4326),
         50000  -- 50km radius
       )
     GROUP BY s.id, s.name, s.capacity
     HAVING s.capacity - COALESCE(SUM(vd.occupants), 0) >= $3
     ORDER BY distance_km ASC
     LIMIT 5`,
    [incidentLng, incidentLat, requiredCapacity]
  );

  return result.rows.map((row) => ({
    shelter_id: row.id,
    shelter_name: row.name,
    capacity: parseInt(row.capacity),
    current_occupancy: parseInt(row.current_occupancy),
    available_beds: parseInt(row.available_beds),
    distance_km: Math.round(row.distance_km),
  }));
}

/**
 * Open shelters for flood evacuees
 */
export async function openShelters(
  shelterIds: number[],
  estimatedOccupants: number,
  pool: Pool
): Promise<void> {
  if (shelterIds.length === 0) return;

  for (const shelterId of shelterIds) {
    await pool.query(
      `UPDATE shelters 
       SET status = 'active', 
           updated_at = NOW()
       WHERE id = $1`,
      [shelterId]
    );
  }

  // Log shelter opening
  await pool.query(
    `INSERT INTO incident_notes (incident_id, note, created_by)
     SELECT NULL, $1, 0
     WHERE NOT EXISTS (SELECT 1 FROM incident_notes WHERE note = $1)`,
    [`Shelters opened for flood evacuees: ${shelterIds.join(', ')} (capacity: ${estimatedOccupants})`]
  );
}

/**
 * Pre-position logistics resources
 */
export async function prepositionResources(
  incidentId: number,
  resources: string[],
  pool: Pool
): Promise<void> {
  // Find available inventory
  for (const resource of resources) {
    const inventoryResult = await pool.query(
      `SELECT id, quantity_available 
       FROM inventory 
       WHERE name ILIKE $1 AND quantity_available > 0
       LIMIT 1`,
      [`%${resource}%`]
    );

    if (inventoryResult.rows.length > 0) {
      const item = inventoryResult.rows[0];
      // Reserve for incident
      await pool.query(
        `INSERT INTO resource_reservations (incident_id, inventory_id, quantity, status)
         VALUES ($1, $2, 1, 'reserved')`,
        [incidentId, item.id]
      );
    }
  }
}

/**
 * Send flood warning broadcast
 */
export async function sendFloodWarning(
  incidentLat: number,
  incidentLng: number,
  message: string,
  pool: Pool
): Promise<void> {
  // Get affected area (5km radius)
  const result = await pool.query(
    `INSERT INTO notifications (title, message, type, recipient_type, status, location)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      'Flood Warning',
      message,
      'broadcast',
      'public',
      'pending',
      `POINT(${incidentLng} ${incidentLat})`,
    ]
  );
}

/**
 * Execute flood dispatch workflow
 */
export async function executeFloodDispatch(
  incidentId: number,
  incidentLat: number,
  incidentLng: number,
  requiredCapacity: number,
  pool: Pool
): Promise<{
  dispatch: DispatchResult | null;
  shelters: ShelterInfo[];
}> {
  // Find nearest SAR team
  const dispatch = await findNearestSARTeam(incidentLat, incidentLng, 50, pool);

  // Find shelters
  const shelters = await findNearestShelters(incidentLat, incidentLng, requiredCapacity, pool);

  // Open shelters if found
  if (shelters.length > 0) {
    const shelterIds = shelters.map((s) => s.shelter_id);
    await openShelters(shelterIds, requiredCapacity, pool);
  }

  // Pre-position resources
  await prepositionResources(incidentId, ['sandbags', 'water_pumps', 'rescue_boats'], pool);

  return { dispatch, shelters };
}