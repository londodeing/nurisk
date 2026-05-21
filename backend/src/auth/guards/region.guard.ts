import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { REGION_KEY } from '../decorators/region-scoped.decorator';

/**
 * Region Guard for data access control
 * Filters queries based on user's assigned region hierarchy
 * 
 * - PWNU (province): sees all data in province
 * - PCNU (regency): sees only data in their regency
 * - FIELD_STAFF/RELAWAN: sees data in their assigned area
 * 
 * Returns 403 Forbidden if user tries to access data outside their region
 */
@Injectable()
export class RegionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required regions from decorator
    const requiredRegions = this.reflector.getAllAndOverride<string[]>(REGION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No region restriction - allow access
    if (!requiredRegions || requiredRegions.length === 0) {
      return true;
    }

    // Get user from request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Autentikasi diperlukan untuk mengakses resource ini',
        error: 'Unauthorized',
      });
    }

    const userRegion = user.region || user.region_id;
    const targetRegion = request.params.region || request.query.region;

    // No user region - deny access
    if (!userRegion) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Region tidak ditetapkan untuk user ini',
        error: 'NoRegion',
      });
    }

    // Check if target region is in user's scope
    if (targetRegion && !this.isRegionInScope(userRegion, targetRegion)) {
      throw new ForbiddenException({
        statusCode: 403,
        message: `Akses ditolak. Anda tidak memiliki akses ke region ${targetRegion}`,
        error: 'Forbidden',
        userRegion,
        targetRegion,
      });
    }

    // Attach user's region to request for query filtering
    request.userRegion = userRegion;
    request.regionScope = this.getRegionScope(userRegion);

    return true;
  }

  /**
   * Check if target region is within user's region scope
   */
  private isRegionInScope(userRegion: string, targetRegion: string): boolean {
    if (!userRegion || !targetRegion) return true;
    
    const userUpper = userRegion.toUpperCase();
    const targetUpper = targetRegion.toUpperCase();

    // Exact match
    if (userUpper === targetUpper) return true;

    // Province-level (PWNU) - can access all
    if (userUpper.includes('JAWA TENGAH') || userUpper === 'PROVINCE') {
      return true;
    }

    // Regency-level (PCNU) - can access same regency
    const userRegency = this.extractRegency(userUpper);
    const targetRegency = this.extractRegency(targetUpper);

    return userRegency === targetRegency;
  }

  /**
   * Extract regency from region string
   */
  private extractRegency(region: string): string {
    // Handle formats like "KABUPATEN SEMARANG", "SEMARANG", "KOTA SEMARANG"
    const match = region.match(/(?:KABUPATEN|KOTA)\s+(\w+)/i);
    return match ? match[1].toUpperCase() : region;
  }

  /**
   * Get the scope level of a region
   */
  private getRegionScope(region: string): 'province' | 'regency' | 'district' | 'village' {
    const upper = region.toUpperCase();
    
    if (upper.includes('JAWA TENGAH') || upper === 'PROVINCE') {
      return 'province';
    }
    if (upper.match(/KABUPATEN|KOTA/)) {
      return 'regency';
    }
    if (upper.match(/KECAMATAN/)) {
      return 'district';
    }
    return 'village';
  }
}

/**
 * Helper to filter query by user region
 * Use in service layer to filter database queries
 */
export function filterByRegion(
  userRegion: string,
  tableAlias: string = '',
): string {
  const prefix = tableAlias ? `${tableAlias}.` : '';
  const upper = userRegion.toUpperCase();

  // Province-level sees all
  if (upper.includes('JAWA TENGAH') || upper === 'PROVINCE') {
    return ''; // No filter
  }

  // Regency-level filter
  const regency = userRegion.match(/(?:KABUPATEN|KOTA)\s+(\w+)/i)?.[1] || userRegion;
  return `${prefix}region = $1`;
}