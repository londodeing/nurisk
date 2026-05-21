import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

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

import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

/**
 * Permission-to-Role mapping
 * Maps each role to allowed permissions
 */
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    '*', // All permissions
  ],
  ADMIN_PWNU: [
    'incident:create',
    'incident:read',
    'incident:update',
    'incident:delete',
    'incident:approve',
    'incident:assign',
    'volunteer:read',
    'volunteer:assign',
    'volunteer:deploy',
    'building:create',
    'building:read',
    'building:update',
    'building:assess',
    'logistics:create',
    'logistics:read',
    'logistics:approve',
    'logistics:dispatch',
    'user:create',
    'user:read',
    'user:update',
    'report:create',
    'report:read',
    'report:verify',
  ],
  PWNU: [
    'incident:read',
    'incident:update',
    'incident:approve',
    'incident:assign',
    'volunteer:read',
    'volunteer:assign',
    'volunteer:deploy',
    'building:read',
    'building:assess',
    'logistics:read',
    'logistics:approve',
    'logistics:dispatch',
    'user:read',
    'report:read',
    'report:verify',
  ],
  STAFF_PWNU: [
    'incident:read',
    'incident:update',
    'volunteer:read',
    'building:read',
    'building:assess',
    'logistics:read',
    'logistics:dispatch',
    'user:read',
    'report:read',
  ],
  COMMANDER: [
    'incident:read',
    'incident:update',
    'incident:assign',
    'volunteer:read',
    'volunteer:assign',
    'volunteer:deploy',
    'building:read',
    'logistics:read',
    'logistics:dispatch',
    'report:read',
  ],
  ADMIN_PCNU: [
    'incident:read',
    'incident:create',
    'incident:approve',
    'volunteer:read',
    'volunteer:assign',
    'building:read',
    'building:assess',
    'logistics:read',
    'logistics:approve',
    'user:read',
    'report:create',
    'report:read',
    'report:verify',
  ],
  STAFF_PCNU: [
    'incident:read',
    'volunteer:read',
    'building:read',
    'logistics:read',
    'user:read',
    'report:create',
    'report:read',
  ],
  FIELD_STAFF: [
    'incident:read',
    'incident:create',
    'incident:update',
    'building:read',
    'building:assess',
    'logistics:read',
    'report:create',
    'report:read',
  ],
  RELAWAN: [
    'incident:read',
    'incident:create',
    'building:read',
    'logistics:read',
    'report:create',
    'report:read',
  ],
};

/**
 * Permissions Guard for granular access control
 * Validates user has required permissions based on their role
 * 
 * Returns 403 Forbidden if user lacks required permissions
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No permissions required - allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
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

    const userRole = user.role as UserRole;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    // SUPER_ADMIN has all permissions
    if (userPermissions.includes('*')) {
      return true;
    }

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasAllPermissions) {
      const missing = requiredPermissions.filter(
        (perm) => !userPermissions.includes(perm),
      );
      throw new ForbiddenException({
        statusCode: 403,
        message: `Akses ditolak. Anda tidak memiliki izin: ${missing.join(', ')}`,
        error: 'Forbidden',
        requiredPermissions,
        userRole,
      });
    }

    return true;
  }
}

/**
 * Get permissions for a role
 */
export function getRolePermissions(role: UserRole): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes('*') || perms.includes(permission);
}