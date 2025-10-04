import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AppLoggerService } from '@infrastructure/logging/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, query, params } = request;
    const requestId = request.headers['x-request-id'] as string;
    const userAgent = request.headers['user-agent'];
    const ip = request.ip;

    const now = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url}`, {
      requestId,
      metadata: {
        method,
        url,
        query,
        params,
        body: this.sanitizeBody(body),
        userAgent,
        ip,
      },
    });

    return next.handle().pipe(
      tap({
        next: (_data: unknown): void => {
          const responseTime = Date.now() - now;
          this.logger.log(`Request Completed: ${method} ${url} - ${responseTime}ms`, {
            requestId,
            metadata: {
              method,
              url,
              responseTime,
              statusCode: context.switchToHttp().getResponse().statusCode,
            },
          });
        },
        error: (error: Error): void => {
          const responseTime = Date.now() - now;
          this.logger.error(`Request Failed: ${method} ${url} - ${responseTime}ms`, error.stack, {
            requestId,
            metadata: {
              method,
              url,
              responseTime,
              errorName: error.name,
              errorMessage: error.message,
            },
          });
        },
      }),
    );
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
