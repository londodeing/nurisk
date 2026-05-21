import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private store = new Map<string, RateLimitEntry>();

  private readonly maxRequests = 100;
  private readonly windowMs = 60_000; // 1 minute

  constructor() {
    // Periodic cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60_000);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const key = req.ip || 'unknown';
    const now = Date.now();

    let entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + this.windowMs };
      this.store.set(key, entry);
    }

    entry.count++;

    const remaining = this.maxRequests - entry.count;
    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

    if (entry.count > this.maxRequests) {
      res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        success: false,
        message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
      });
      return;
    }

    next();
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
