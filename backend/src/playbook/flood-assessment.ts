/**
 * Flood Assessment Actions
 * ==================
 * Actions for flood assessment step
 */

import { Pool } from 'pg';

interface AssessmentResult {
  rainfall_24h: number;
  river_level: number;
  flood_extent_km2: number;
  affected_population: number;
  shelter_capacity: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

/**
 * Query rainfall data for a region
 */
export async function queryRainfallData(
  region: string,
  pool: Pool
): Promise<{ rainfall_mm: number; duration_hours: number }> {
  // Query weather stations in region
  const result = await pool.query(
    `SELECT 
       AVG(rainfall_mm) as avg_rainfall,
       MAX(rainfall_duration) as max_duration
     FROM weather_readings
     WHERE region = $1 
       AND reading_time >= NOW() - INTERVAL '24 hours'
     GROUP BY region`,
    [region]
  );

  if (result.rows.length === 0) {
    return { rainfall_mm: 0, duration_hours: 0 };
  }

  return {
    rainfall_mm: parseFloat(result.rows[0].avg_rainfall) || 0,
    duration_hours: parseFloat(result.rows[0].max_duration) || 0,
  };
}

/**
 * Query river water levels for a basin
 */
export async function queryRiverLevels(
  riverBasin: string,
  pool: Pool
): Promise<{ level_m: number; trend: 'rising' | 'stable' | 'falling'; critical_threshold: number }> {
  const result = await pool.query(
    `SELECT 
       water_level_m,
       trend,
       critical_level_m
     FROM river_gauges
     WHERE river_basin = $1
     ORDER BY reading_time DESC
     LIMIT 1`,
    [riverBasin]
  );

  if (result.rows.length === 0) {
    return { level_m: 0, trend: 'stable', critical_threshold: 10 };
  }

  const row = result.rows[0];
  return {
    level_m: parseFloat(row.water_level_m) || 0,
    trend: row.trend || 'stable',
    critical_threshold: parseFloat(row.critical_level_m) || 10,
  };
}

/**
 * Run flood propagation simulation
 * Simplified simulation based on rainfall and river levels
 */
export async function runFloodSimulation(
  rainfallMm: number,
  riverLevelM: number,
  areaKm2: number,
  pool: Pool
): Promise<{
  flood_extent_km2: number;
  affected_population: number;
  shelter_capacity: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}> {
  // Simplified flood model
  // In production, this would call an external simulation service
  
  const floodFactor = Math.min(1, (rainfallMm / 200) + (riverLevelM / 10));
  const floodExtentKm2 = Math.round(areaKm2 * floodFactor * 0.3);
  
  // Population density estimate (would come from demographic data in production)
  const populationDensity = 500; // people per km2
  const affectedPopulation = Math.round(floodExtentKm2 * populationDensity);
  
  // Shelter capacity: 20% of affected population needs shelter
  const shelterCapacity = Math.round(affectedPopulation * 0.2);
  
  // Risk level based on flood extent
  let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  if (floodExtentKm2 < 10 || affectedPopulation < 1000) {
    riskLevel = 'LOW';
  } else if (floodExtentKm2 < 50 || affectedPopulation < 10000) {
    riskLevel = 'MODERATE';
  } else if (floodExtentKm2 < 200 || affectedPopulation < 50000) {
    riskLevel = 'HIGH';
  } else {
    riskLevel = 'CRITICAL';
  }

  return {
    flood_extent_km2: floodExtentKm2,
    affected_population: affectedPopulation,
    shelter_capacity: shelterCapacity,
    risk_level: riskLevel,
  };
}

/**
 * Get assessment for flood incident
 */
export async function performFloodAssessment(
  incidentId: number,
  pool: Pool
): Promise<AssessmentResult> {
  // Get incident details
  const incidentResult = await pool.query(
    'SELECT region, river_basin, affected_area, severity FROM incidents WHERE id = $1',
    [incidentId]
  );

  if (incidentResult.rows.length === 0) {
    throw new Error(`Incident ${incidentId} not found`);
  }

  const incident = incidentResult.rows[0];
  const region = incident.region;
  const riverBasin = incident.river_basin;
  const areaKm2 = parseFloat(incident.affected_area) || 100;

  // Query rainfall
  const rainfall = await queryRainfallData(region, pool);

  // Query river levels
  const river = await queryRiverLevels(riverBasin, pool);

  // Run simulation
  const simulation = await runFloodSimulation(
    rainfall.rainfall_mm,
    river.level_m,
    areaKm2,
    pool
  );

  return {
    rainfall_24h: rainfall.rainfall_mm,
    river_level: river.level_m,
    flood_extent_km2: simulation.flood_extent_km2,
    affected_population: simulation.affected_population,
    shelter_capacity: simulation.shelter_capacity,
    risk_level: simulation.risk_level,
  };
}

/**
 * Store assessment results
 */
export async function storeAssessmentResults(
  executionId: number,
  stepExecutionId: number,
  results: AssessmentResult,
  pool: Pool
): Promise<void> {
  await pool.query(
    `INSERT INTO step_outputs (step_execution_id, execution_id, output_type, output_data)
     VALUES ($1, $2, 'assessment', $3)`,
    [stepExecutionId, executionId, JSON.stringify(results)]
  );
}