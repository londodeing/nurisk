import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
export declare class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): Response<any, Record<string, any>>;
}
//# sourceMappingURL=http-exception.filter.d.ts.map