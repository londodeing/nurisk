import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';

// Define the type for the overridden res.end function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OverriddenEndFunction = ((
  chunk?: any,
  encoding?: any,
  cb?: any
) => any) & ((cb?: () => void) => any);

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Generate correlation ID
    const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
    (req as any).correlationId = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    // Capture original end to log after response
    const originalEnd = res.end.bind(res);
    const self = this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (res.end as any) = function (
      chunk?: Buffer | string,
      encoding?: BufferEncoding,
      cb?: () => void
    ) {
      res.end = originalEnd;
      res.end(chunk, encoding || 'utf-8', cb);

      // Async audit log (non-blocking)
      setImmediate(() => {
        self.logAuditEntry(req, res.statusCode, chunk);
      });
    };

    next();
  }

  private async logAuditEntry(req: Request, statusCode: number, responseBody: any) {
    try {
      // Only log mutations (POST, PUT, PATCH, DELETE)
      const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
      if (!mutatingMethods.includes(req.method)) {
        return;
      }

      const userId = (req as any).user?.id || null;
      const ipAddress = req.ip || (req as any).connection?.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || '';

      // Parse response body
      let parsedResponse = null;
      if (responseBody) {
        try {
          parsedResponse = JSON.parse(responseBody.toString());
        } catch {
          parsedResponse = responseBody.toString();
        }
      }

      await pool.query(
        `INSERT INTO audit_logs (
          correlation_id, user_id, method, path, body, query, 
          status_code, response_body, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          (req as any).correlationId,
          userId,
          req.method,
          (req as any).originalUrl || req.url,
          JSON.stringify(req.body || {}),
          JSON.stringify(req.query || {}),
          statusCode,
          parsedResponse,
          ipAddress,
          userAgent
        ]
      );
    } catch (err) {
      console.error('[AUDIT] Failed to log:', (err as Error).message);
    }
  }
}