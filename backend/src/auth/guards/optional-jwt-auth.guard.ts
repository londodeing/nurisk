import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Observable } from 'rxjs';

/**
 * Optional JWT Authentication Guard
 * Allows unauthenticated access when no token is present
 * If token is present, validates it and attaches user to request
 * Use this for endpoints that work with or without authentication
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // No token present - allow access without authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return true;
    }

    // Token present - validate it
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: Error | null, user: TUser, info: Error | null): TUser | null {
    // If there's an error validating the token, allow access anyway
    // This makes the guard "optional" - we don't block on token errors
    if (err || info) {
      // Token was provided but invalid - still allow access (optional auth)
      // Log for debugging but don't block
      console.debug('Optional JWT auth: token invalid or expired, allowing anonymous access');
      return null;
    }

    // Return user if token is valid, null otherwise
    return user || null;
  }

  /**
   * Override to handle request without blocking on auth errors
   */
  handleRequestError(err: any): null {
    // Don't throw - just return null and allow request to continue
    console.debug('Optional JWT auth error, allowing anonymous access:', err?.message);
    return null;
  }
}

/**
 * Helper function to get user from request regardless of guard used
 * Returns null if no user authenticated (for optional guards)
 */
export function getOptionalUser<T = any>(request: any): T | null {
  return request.user || null;
}

/**
 * Helper to check if user is authenticated (for optional auth scenarios)
 */
export function isAuthenticated(request: any): boolean {
  return !!request.user && !!request.user.id;
}