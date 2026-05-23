/**
 * Structured Logging Service
 * PHASE-12: Machine-queryable logs with correlation IDs
 */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export type LogSeverity = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  route?: string;
  domain?: string;
  userId?: string;
  errorCode?: string;
  durationMs?: number;
  [key: string]: unknown;
}

export interface StructuredLog {
  timestamp: string;
  level: LogSeverity;
  message: string;
  context: LogContext;
}

@Injectable()
export class LoggerService {
  private logs: StructuredLog[] = [];
  private readonly maxLogs = 10000;

  /**
   * Create structured log entry
   */
  log(
    severity: LogSeverity,
    message: string,
    context: LogContext = {}
  ): StructuredLog {
    const entry: StructuredLog = {
      timestamp: new Date().toISOString(),
      level: severity,
      message,
      context: {
        ...context,
        // Always include requestId if available
        requestId: context.requestId || (global as any).__correlationId,
      },
    };

    // Store in memory (in production, use external log service)
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Output as JSON for machine parsing
    const output = JSON.stringify(entry);
    if (severity === 'error') {
      console.error(output);
    } else if (severity === 'warn') {
      console.warn(output);
    } else {
      console.log(output);
    }

    return entry;
  }

  /**
   * Convenience methods
   */
  debug(message: string, context?: LogContext): StructuredLog {
    return this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): StructuredLog {
    return this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): StructuredLog {
    return this.log('warn', message, context);
  }

  error(message: string, context?: LogContext): StructuredLog {
    return this.log('error', message, context);
  }

  /**
   * Get recent logs (for debugging)
   */
  getRecentLogs(limit = 100): StructuredLog[] {
    return this.logs.slice(-limit);
  }

  /**
   * Query logs by criteria
   */
  queryLogs(criteria: Partial<LogContext>): StructuredLog[] {
    return this.logs.filter((log) => {
      for (const [key, value] of Object.entries(criteria)) {
        if (log.context[key] !== value) return false;
      }
      return true;
    });
  }
}

/**
 * Middleware to attach correlation ID to requests
 */
@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || uuidv4();
    (req as any).correlationId = correlationId;
    (global as any).__correlationId = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);
    next();
  }
}