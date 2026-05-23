import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RouteLimitConfig {
  maxRequests: number;
  windowMs: number;
}

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private store = new Map<string, RateLimitEntry>();

  // Default: 100 requests per minute
  private readonly defaultConfig: RouteLimitConfig = {
    maxRequests: 100,
    windowMs: 60_000,
  };

  // Strict limits for sensitive endpoints
  private readonly routeLimits: Record<string, RouteLimitConfig> = {
    '/api/auth/login': { maxRequests: 5, windowMs: 900_000 }, // 5 per 15 min
    '/api/auth/register': { maxRequests: 3, windowMs: 900_000 }, // 3 per 15 min
    '/api/incidents/panic': { maxRequests: 3, windowMs: 60_000 }, // 3 per minute
    '/api/incidents': { maxRequests: 50, windowMs: 60_000 }, // 50 per minute
    '/api/resources': { maxRequests: 50, windowMs: 60_000 },
  };

  constructor() {
    // Periodic cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60_000);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const key = req.ip || 'unknown';
    const path = req.path;
    const now = Date.now();

    // Get route-specific config or default
    const config = this.getRouteConfig(path);
    const { maxRequests, windowMs } = config;

    let entry = this.store.get(key + path);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      this.store.set(key + path, entry);
    }

    entry.count++;

    const remaining = maxRequests - entry.count;
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

    if (entry.count > maxRequests) {
      res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
        },
      });
      return;
    }

    next();
  }

  private getRouteConfig(path: string): RouteLimitConfig {
    // Find matching route config (supports prefix matching)
    for (const [route, config] of Object.entries(this.routeLimits)) {
      if (path.startsWith(route)) {
        return config;
      }
    }
    return this.defaultConfig;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }
  }
}
