import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import type { ApiResponse } from '@nurisk/shared-types';

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: T) => {
        if (data && typeof data === 'object' && 'success' in (data as any)) {
          return data as unknown as ApiResponse<T>;
        }
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
