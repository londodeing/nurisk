import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../services/audit.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only audit mutating requests
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const actorId = request.user?.id || null;
    const urlPath = request.route?.path || request.url || '';

    // Skip auth routes to avoid double-logging (auth service audits manually)
    if (urlPath.startsWith('/auth/')) {
      return next.handle();
    }

    const pathParts = urlPath.split('/').filter(Boolean);
    const entityType = pathParts[0] || 'unknown';
    const entityId = request.params?.id || null;
    const body = request.body || {};

    return next.handle().pipe(
      tap({
        next: (response: unknown) => {
          const action = method === 'POST' ? 'CREATE' :
                         method === 'PUT' ? 'UPDATE' :
                         method === 'PATCH' ? 'UPDATE' : 'DELETE';

          const responseId = (response as any)?.data?.id || (response as any)?.id || entityId;

          this.auditService.log(
            actorId,
            action as any,
            entityType,
            responseId?.toString(),
            method !== 'POST' ? body : undefined,
            method !== 'DELETE' ? body : undefined,
          );
        },
      }),
    );
  }
}
