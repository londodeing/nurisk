import { SetMetadata } from '@nestjs/common';

// Role types - inline to avoid monorepo path issues in tests
type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN_PWNU'
  | 'PWNU'
  | 'STAFF_PWNU'
  | 'COMMANDER'
  | 'ADMIN_PCNU'
  | 'STAFF_PCNU'
  | 'FIELD_STAFF'
  | 'RELAWAN';

export const ROLES_KEY = 'roles';

/**
 * Roles decorator for route-level access control
 * @Roles('ADMIN_PWNU', 'PWNU') - allows multiple roles
 * 
 * Usage:
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('ADMIN_PWNU', 'PWNU')
 * @Get('incidents')
 * getIncidents() {}
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);