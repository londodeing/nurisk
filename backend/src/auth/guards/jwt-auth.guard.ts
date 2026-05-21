import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Observable } from 'rxjs';

/**
 * JWT Authentication Guard
 * Extends Passport's JWT strategy with proper error responses
 * Returns 401 for unauthenticated, 403 for unauthorized
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: Error | null, user: TUser, info: Error | null): TUser {
    // Handle different error scenarios
    if (err) {
      if (err.message === 'Unauthorized') {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Token tidak valid atau sudah kedaluwarsa',
          error: 'Unauthorized',
        });
      }
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Autentikasi gagal',
        error: 'Unauthorized',
      });
    }

    if (info) {
      // Token expired or invalid
      if (info.message.includes('jwt expired') || info.message.includes('Token expired')) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Token sudah kedaluwarsa. Silakan login ulang.',
          error: 'TokenExpired',
        });
      }
      if (info.message.includes('jwt') || info.message.includes('No auth token')) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Token autentikasi tidak ditemukan',
          error: 'NoToken',
        });
      }
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Token tidak valid',
        error: 'InvalidToken',
      });
    }

    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'User tidak ditemukan',
        error: 'UserNotFound',
      });
    }

    return user;
  }

  /**
   * Override to customize 403 response for authorization failures
   */
  handleRequestError(err: any): never {
    // Re-throw with proper NestJS exception
    if (err.status === 403) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk resource ini.',
        error: 'Forbidden',
      });
    }
    throw new UnauthorizedException({
      statusCode: 401,
      message: 'Autentikasi diperlukan',
      error: 'Unauthorized',
    });
  }
}