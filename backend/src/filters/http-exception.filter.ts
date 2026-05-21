import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';

const STATUS_CODE_MAP: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
  [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
};

function getStatusCode(status: number): string {
  return STATUS_CODE_MAP[status] || 'HTTP_ERROR';
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Handle Zod validation errors
    if (exception instanceof ZodError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: exception.issues.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        },
      });
    }

    // Handle NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // If the response is already in the standardized format, pass through
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        (exceptionResponse as any).success === false
      ) {
        return response.status(status).json(exceptionResponse);
      }

      return response.status(status).json({
        success: false,
        error: {
          code: getStatusCode(status),
          message:
            typeof exceptionResponse === 'string'
              ? exceptionResponse
              : (exceptionResponse as any).message || exception.message,
          details:
            typeof exceptionResponse === 'object'
              ? (exceptionResponse as any).details
              : undefined,
        },
      });
    }

    // Handle JWT errors
    const errorName = (exception as any).name;
    if (errorName === 'JsonWebTokenError' || errorName === 'NotBeforeError') {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
        },
      });
    }

    if (errorName === 'TokenExpiredError') {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token has expired',
        },
      });
    }

    // Handle Prisma/database errors
    const errorMessage = (exception as Error).message || '';
    if (errorMessage.includes('P2002')) {
      return response.status(HttpStatus.CONFLICT).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Record already exists',
        },
      });
    }

    if (errorMessage.includes('P2025')) {
      return response.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found',
        },
      });
    }

    // Default internal server error
    console.error('🔥 ERROR:', exception);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal Server Error',
      },
    });
  }
}
