import { ValidationPipe as NestValidationPipe, ValidationError } from '@nestjs/common';
import { ValidationException } from '@shared/exceptions/validation.exception';

export class ValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = this.formatErrors(errors);
        return new ValidationException(formattedErrors);
      },
    });
  }

  private formatErrors(errors: ValidationError[]): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    errors.forEach((error) => {
      if (error.constraints) {
        formatted[error.property] = Object.values(error.constraints);
      }

      if (error.children && error.children.length > 0) {
        const childErrors = this.formatErrors(error.children);
        Object.keys(childErrors).forEach((key) => {
          formatted[`${error.property}.${key}`] = childErrors[key];
        });
      }
    });

    return formatted;
  }
}
