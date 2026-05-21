/**
 * Auth Middleware
 * =============
 * Express middleware for authentication and authorization
 */

import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

/**
 * JWT secret from environment
 */
const JWT_SECRET = process.env.JWT_SECRET || 'nurisk-secret-key';

/**
 * Extract and verify JWT token from request
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      statusCode: 401,
      message: 'Token autentikasi tidak ditemukan',
      error: 'NoToken',
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      statusCode: 401,
      message: 'Token tidak valid atau sudah kedaluwarsa',
      error: 'InvalidToken',
    });
  }
}

/**
 * Check if user has required permissions
 */
export function requirePermissions(permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        statusCode: 401,
        message: 'Autentikasi diperlukan',
        error: 'Unauthorized',
      });
      return;
    }

    const userPermissions = user.permissions || [];

    const hasPermission = permissions.some((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      res.status(403).json({
        statusCode: 403,
        message: 'Anda tidak memiliki izin untuk melakukan aksi ini',
        error: 'Forbidden',
      });
      return;
    }

    next();
  };
}