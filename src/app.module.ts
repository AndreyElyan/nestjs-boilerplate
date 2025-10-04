import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

// Configuration
import databaseConfig from '@infrastructure/config/database.config';

// Modules
import { LoggerModule } from '@infrastructure/logging/logger.module';
import { DatabaseModule } from '@infrastructure/database/typeorm/database.module';
import { UserModule } from '@presentation/modules/user.module';

// Filters, Interceptors, Pipes, Middlewares
import { AllExceptionsFilter } from '@presentation/filters/all-exceptions.filter';
import { LoggingInterceptor } from '@presentation/interceptors/logging.interceptor';
import { PerformanceInterceptor } from '@presentation/interceptors/performance.interceptor';
import { ValidationPipe } from '@presentation/pipes/validation.pipe';
import { RequestIdMiddleware } from '@presentation/middlewares/request-id.middleware';

// Controllers
import { HealthController } from '@presentation/controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
    }),
    LoggerModule,
    DatabaseModule,
    UserModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
