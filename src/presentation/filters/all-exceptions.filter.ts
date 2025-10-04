import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLoggerService } from '@infrastructure/logging/logger.service';
import { IHttpExceptionResponse } from '@shared/interfaces/http-exception-response.interface';

interface IRequestWithUser extends Request {
  user?: { id: string };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext('AllExceptionsFilter');
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, error, details } = this.getExceptionDetails(exception);
    const requestId = request.headers['x-request-id'] as string;

    const errorResponse: IHttpExceptionResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
      details,
      requestId,
    };

    // Log the error
    const logContext = {
      requestId,
      userId: (request as IRequestWithUser).user?.id,
      metadata: {
        statusCode: status,
        path: request.url,
        method: request.method,
        query: request.query,
        body: this.sanitizeBody(request.body),
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      },
    };

    if (status >= 500) {
      this.logger.error(
        `Internal Server Error: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
        logContext,
      );
    } else {
      this.logger.warn(`Client Error: ${message}`, logContext);
    }

    response.status(status).json(errorResponse);
  }

  private getExceptionDetails(exception: unknown): {
    status: number;
    message: string | string[];
    error: string;
    details?: unknown;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        return {
          status,
          message: exceptionResponse,
          error: exception.name,
        };
      }

      const response = exceptionResponse as Record<string, unknown>;
      return {
        status,
        message: (response.message as string | string[]) || exception.message,
        error: (response.error as string) || exception.name,
        details: response.details,
      };
    }

    // Handle unknown errors
    const error = exception instanceof Error ? exception : new Error(String(exception));

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: error.name || 'InternalServerError',
      details:
        process.env.NODE_ENV === 'development'
          ? {
              message: error.message,
              stack: error.stack,
            }
          : undefined,
    };
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body } as Record<string, unknown>;
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'accessToken'];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
