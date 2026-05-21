import { SetMetadata } from '@nestjs/common';

export const REGION_KEY = 'region';

/**
 * Region-scoped decorator for data access control
 * Restricts data to user's assigned region hierarchy
 * 
 * Usage:
 * @UseGuards(JwtAuthGuard, RegionGuard)
 * @RegionScoped()
 * @Get('incidents')
 * getIncidents() {}
 * 
 * The guard will filter queries based on user's region:
 * - PWNU (province): sees all incidents in province
 * - PCNU (regency): sees only incidents in their regency
 * - FIELD_STAFF/RELAWAN: sees incidents in their assigned area
 */
export const RegionScoped = (...regions: string[]) =>
  SetMetadata(REGION_KEY, regions);

/**
 * Region types in the hierarchy
 * Note: uses REGENCY (not SUB_DISTRICT) for the administrative model
 */
export enum RegionScope {
  PROVINCE = 'PROVINCE', // Jawa Tengah
  REGENCY = 'REGENCY',   // Kabupatens/Kota
  DISTRICT = 'DISTRICT', // Kecamatan
  VILLAGE = 'VILLAGE',   // Desa/Kelurahan
}

/**
 * Check if target region is within scope of user region
 */
export function isRegionInScope(
  userRegion: string,
  targetRegion: string,
): boolean {
  // Exact match
  if (userRegion === targetRegion) return true;
  
  // User is province-level (Jawa Tengah) - can access all
  if (userRegion.toUpperCase().includes('JAWA TENGAH')) return true;
  
  // User is regency-level - check if target is within same regency
  const userRegency = extractRegency(userRegion);
  const targetRegency = extractRegency(targetRegion);
  
  return userRegency === targetRegency;
}

function extractRegency(region: string): string {
  // Extract kabupatens from region string
  // e.g., "KABUPATEN SEMARANG" -> "SEMARANG"
  const match = region.match(/KABUPATEN\s+(\w+)/i);
  return match ? match[1].toUpperCase() : region.toUpperCase();
}