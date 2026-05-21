import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Define pagination interface
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Define response data interface
interface ResponseData {
  success?: boolean;
  pagination?: PaginationMeta;
  data?: any;
}

@Injectable()
export class ResponseInterceptor implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = (data: ResponseData) => {
      const correlationId = (req as any).correlationId || req.headers['x-correlation-id'];

      // Check if already wrapped (avoid double wrapping)
      if (data && data.success !== undefined) {
        return originalJson(data);
      }

      // Check for pagination in response
      let meta: {
        timestamp: string;
        path: string;
        correlationId: string | undefined;
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
      } = {
        timestamp: new Date().toISOString(),
        path: (req as any).originalUrl || req.url,
        correlationId
      };

      // If data has pagination, extract it
      if (data && data.pagination) {
        meta = {
          ...meta,
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        };
        // Return data.data if paginated
        return originalJson({
          success: true,
          data: data.data,
          meta
        });
      }

      return originalJson({
        success: true,
        data,
        meta
      });
    };

    next();
  }
}