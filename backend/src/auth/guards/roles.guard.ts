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

/**
 * Role hierarchy for permission escalation
 * Higher index = more privileges
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  RELAWAN: 40,
  FIELD_STAFF: 50,
  STAFF_PCNU: 60,
  ADMIN_PCNU: 70,
  COMMANDER: 75,
  STAFF_PWNU: 80,
  PWNU: 85,
  ADMIN_PWNU: 90,
  SUPER_ADMIN: 100,
};

/**
 * Check if role A includes role B (hierarchy check)
 */
function roleIncludes(requiredRole: UserRole, userRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Roles Guard for route-level access control
 * Validates user role against required roles from @Roles decorator
 * 
 * Returns 403 Forbidden if user role is not in required roles
 * Returns 401 Unauthorized if no user attached to request
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No roles required - allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from request (attached by JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // No user attached - require authentication first
    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Autentikasi diperlukan untuk mengakses resource ini',
        error: 'Unauthorized',
      });
    }

    const userRole = user.role as UserRole;

    // Validate user role exists in our role definitions
    if (!this.isValidRole(userRole)) {
      throw new ForbiddenException({
        statusCode: 403,
        message: `Role tidak valid: ${userRole}`,
        error: 'InvalidRole',
      });
    }

    // Check if user's role is in required roles OR has higher privilege
    const hasAccess = requiredRoles.some((requiredRole) =>
      roleIncludes(requiredRole, userRole),
    );

    if (!hasAccess) {
      throw new ForbiddenException({
        statusCode: 403,
        message: `Akses ditolak. Role '${userRole}' tidak memiliki izin untuk resource ini.`,
        error: 'Forbidden',
        requiredRoles,
        userRole,
      });
    }

    return true;
  }

  /**
   * Check if role is valid
   */
  private isValidRole(role: string): role is UserRole {
    return role in ROLE_HIERARCHY;
  }
}