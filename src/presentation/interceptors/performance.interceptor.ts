import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AppLoggerService } from '@infrastructure/logging/logger.service';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly performanceThreshold = 1000; // 1 second

  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext('Performance');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const requestId = request.headers['x-request-id'] as string;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const executionTime = Date.now() - startTime;

        if (executionTime > this.performanceThreshold) {
          this.logger.warn(`Slow request detected: ${method} ${url} - ${executionTime}ms`, {
            requestId,
            metadata: {
              method,
              url,
              executionTime,
              threshold: this.performanceThreshold,
            },
          });
        }
      }),
    );
  }
}
