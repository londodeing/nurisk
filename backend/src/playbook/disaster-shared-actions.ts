/**
 * Shared Disaster Actions
 * ======================
 * Shared actions for earthquake and volcano playbooks
 */

import { Pool } from 'pg';

interface ShakeMapResult {
  mmi_intensity: number;
  affected_area_km2: number;
  population_exposed: number;
}

interface DamageEstimation {
  damaged_buildings: number;
  collapsed_buildings: number;
  injuries: number;
  fatalities: number;
  displaced_population: number;
  sar_teams_needed: number;
  trauma_level: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CATASTROPHIC';
}

interface EvacuationZone {
  evacuation_radius_km: number;
  priority_zones: string[];
  affected_population: number;
  routes: string[];
}

// ==========================================================
// assess_structural_damage
// ==========================================================

/**
 * Query BMKG shake map for earthquake
 */
export async function queryShakeMap(
  magnitude: number,
  depthKm: number,
  lat: number,
  lng: number,
  pool: Pool
): Promise<ShakeMapResult> {
  // Calculate MMI intensity at epicenter (simplified formula)
  // In production, this would query BMKG API
  const mmiEpicenter = Math.min(12, Math.round(
    1.5 * magnitude - 0.5 * depthKm + 2.5
  ));

  // Estimate affected area based on magnitude
  const affectedAreaKm2 = Math.round(Math.pow(magnitude, 2) * 100);

  // Population exposure (simplified)
  const populationExposed = Math.round(affectedAreaKm2 * 500);

  return {
    mmi_intensity: mmiEpicenter,
    affected_area_km2: affectedAreaKm2,
    population_exposed: populationExposed,
  };
}

/**
 * Store shake map results
 */
export async function storeShakeMapResults(
  incidentId: number,
  results: ShakeMapResult,
  pool: Pool
): Promise<void> {
  await pool.query(
    `INSERT INTO incident_data (incident_id, data_type, data)
     VALUES ($1, 'shake_map', $2)`,
    [incidentId, JSON.stringify(results)]
  );
}

// ==========================================================
// Building Damage Estimation
// ==========================================================

/**
 * Estimate building damage from earthquake
 */
export async function estimateBuildingDamage(
  magnitude: number,
  mmiIntensity: number,
  buildingDensity: number,
  pool: Pool
): Promise<DamageEstimation> {
  // Simplified damage model
  // In production, would use actual building vulnerability data

  let damageRatio: number;
  if (mmiIntensity >= 10) {
    damageRatio = 0.8;
  } else if (mmiIntensity >= 8) {
    damageRatio = 0.5;
  } else if (mmiIntensity >= 7) {
    damageRatio = 0.3;
  } else if (mmiIntensity >= 6) {
    damageRatio = 0.15;
  } else {
    damageRatio = 0.05;
  }

  const totalBuildings = Math.round(buildingDensity * 10); // estimate
  const damagedBuildings = Math.round(totalBuildings * damageRatio);
  const collapsedBuildings = Math.round(damagedBuildings * 0.2);

  // Injuries: 10% of affected population in damaged buildings
  const injuries = Math.round(damagedBuildings * 0.1);
  const fatalities = Math.round(injuries * 0.05);
  const displacedPopulation = Math.round(damagedBuildings * 0.3 * 4); // avg 4 per household

  // SAR teams needed: 1 team per 50 collapsed buildings
  const sarTeamsNeeded = Math.max(1, Math.ceil(collapsedBuildings / 50));

  // Trauma level
  let traumaLevel: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CATASTROPHIC';
  if (injuries > 1000 || magnitude >= 7) {
    traumaLevel = 'CATASTROPHIC';
  } else if (injuries > 100 || magnitude >= 6) {
    traumaLevel = 'MAJOR';
  } else if (injuries > 10) {
    traumaLevel = 'MODERATE';
  } else {
    traumaLevel = 'MINOR';
  }

  return {
    damaged_buildings: damagedBuildings,
    collapsed_buildings: collapsedBuildings,
    injuries,
    fatalities,
    displaced_population: displacedPopulation,
    sar_teams_needed: sarTeamsNeeded,
    trauma_level: traumaLevel,
  };
}

// ==========================================================
// coordinate_search_rescue
// ==========================================================

/**
 * Find and deploy nearest SAR assets
 */
export async function coordinateSearchRescue(
  incidentLat: number,
  incidentLng: number,
  requiredTeams: number,
  pool: Pool
): Promise<{
  teams_deployed: number;
  team_details: Array<{ id: number; name: string; distance_km: number }>;
}> {
  // Find nearest SAR teams
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
       AND (v.expertise LIKE '%SAR%' OR v.expertise LIKE '%heavy_rescue%')
     ORDER BY distance_km ASC
     LIMIT $3`,
    [incidentLng, incidentLat, requiredTeams]
  );

  const teamDetails = result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    distance_km: Math.round(row.distance_km),
  }));

  return {
    teams_deployed: teamDetails.length,
    team_details: teamDetails,
  };
}

// ==========================================================
// manage_medical_triage
// ==========================================================

/**
 * Setup medical triage area
 */
export async function manageMedicalTriage(
  incidentId: number,
  estimatedInjuries: number,
  traumaLevel: string,
  pool: Pool
): Promise<{
  triage_positions: number;
  field_hospitals: number;
  ambulances_needed: number;
}> {
  // Determine triage requirements based on trauma level
  let triagePositions: number;
  let fieldHospitals: number;
  let ambulancesNeeded: number;

  switch (traumaLevel) {
    case 'CATASTROPHIC':
      triagePositions = 10;
      fieldHospitals = 5;
      ambulancesNeeded = 20;
      break;
    case 'MAJOR':
      triagePositions = 5;
      fieldHospitals = 3;
      ambulancesNeeded = 10;
      break;
    case 'MODERATE':
      triagePositions = 3;
      fieldHospitals = 1;
      ambulancesNeeded = 5;
      break;
    default:
      triagePositions = 1;
      fieldHospitals = 0;
      ambulancesNeeded = 2;
  }

  // Log triage setup
  await pool.query(
    `INSERT INTO incident_notes (incident_id, note, created_by)
     VALUES ($1, $2, 0)`,
    [
      incidentId,
      `Triage setup: ${triagePositions} positions, ${fieldHospitals} field hospitals, ${ambulancesNeeded} ambulances`,
    ]
  );

  return {
    triage_positions: triagePositions,
    field_hospitals: fieldHospitals,
    ambulances_needed: ambulancesNeeded,
  };
}

// ==========================================================
// Volcano Evacuation Calculation
// ==========================================================

/**
 * Calculate evacuation zone based on volcano parameters
 */
export async function calculateEvacuationZone(
  alertLevel: number,
  vei: number,
  eruptionColumnM: number,
  pool: Pool
): Promise<EvacuationZone> {
  // Calculate evacuation radius based on VEI and alert level
  let evacuationRadius: number;

  if (alertLevel >= 4) {
    // AWAS (eruption in progress)
    evacuationRadius = 20;
  } else if (alertLevel >= 3) {
    // SIAGA (eruption threat imminent)
    evacuationRadius = 10;
  } else {
    // SIAP (eruption possible)
    evacuationRadius = 5;
  }

  // Adjust for VEI
  if (vei >= 4) {
    evacuationRadius *= 2;
  } else if (vei >= 2) {
    evacuationRadius *= 1.5;
  }

  // Adjust for eruption column
  if (eruptionColumnM > 10000) {
    evacuationRadius *= 1.5;
  }

  // Priority zones (inner first)
  const priorityZones = ['red', 'orange', 'yellow'];
  const affectedPopulation = Math.round(Math.PI * Math.pow(evacuationRadius, 2) * 200);

  // Evacuation routes (simplified)
  const routes = ['route_north', 'route_south', 'route_east', 'route_west'];

  return {
    evacuation_radius_km: Math.round(evacuationRadius),
    priority_zones: priorityZones,
    affected_population: affectedPopulation,
    routes,
  };
}

// ==========================================================
// Ash Fall Estimation
// ==========================================================

/**
 * Estimate ash fall zone
 */
export async function estimateAshFall(
  eruptionColumnM: number,
  windSpeed: number,
  windDirection: number,
  pool: Pool
): Promise<{
  ash_fall_zone_km2: number;
  pm25_expected: number;
  so2_expected: number;
}> {
  // Simplified ash fall model
  const ashFallRadius = Math.min(100, Math.round(eruptionColumnM / 500));
  const ashFallZoneKm2 = Math.round(Math.PI * Math.pow(ashFallRadius, 2));

  // Estimate air quality impact
  const pm25Expected = Math.min(500, Math.round(eruptionColumnM / 50));
  const so2Expected = Math.min(100, Math.round(eruptionColumnM / 200));

  return {
    ash_fall_zone_km2: ashFallZoneKm2,
    pm25_expected: pm25Expected,
    so2_expected: so2Expected,
  };
}

// ==========================================================
// Execute Full Assessment
// ==========================================================

/**
 * Execute earthquake assessment workflow
 */
export async function executeEarthquakeAssessment(
  incidentId: number,
  magnitude: number,
  depthKm: number,
  lat: number,
  lng: number,
  buildingDensity: number,
  pool: Pool
): Promise<ShakeMapResult & DamageEstimation> {
  // Get shake map
  const shakeMap = await queryShakeMap(magnitude, depthKm, lat, lng, pool);

  // Estimate damage
  const damage = await estimateBuildingDamage(
    magnitude,
    shakeMap.mmi_intensity,
    buildingDensity,
    pool
  );

  // Store results
  await storeShakeMapResults(incidentId, shakeMap, pool);

  return { ...shakeMap, ...damage };
}

/**
 * Execute volcano assessment workflow
 */
export async function executeVolcanoAssessment(
  incidentId: number,
  alertLevel: number,
  vei: number,
  eruptionColumnM: number,
  windSpeed: number,
  windDirection: number,
  pool: Pool
): Promise<EvacuationZone & { ash_fall_zone_km2: number; pm25_expected: number; so2_expected: number }> {
  // Calculate evacuation zone
  const evacuation = await calculateEvacuationZone(alertLevel, vei, eruptionColumnM, pool);

  // Estimate ash fall
  const ash = await estimateAshFall(eruptionColumnM, windSpeed, windDirection, pool);

  return { ...evacuation, ...ash };
}