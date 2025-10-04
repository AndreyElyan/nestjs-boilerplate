# NestJS Boilerplate

Modern, scalable NestJS boilerplate following Clean Architecture, Domain-Driven Design (DDD), SOLID principles, and Clean Code best practices.

## Features

- **Clean Architecture & DDD**: Separation of concerns with domain, application, infrastructure, and presentation layers
- **TypeScript**: Full type safety with strict configuration
- **Swagger/OpenAPI**: Comprehensive API documentation
- **Global Logger**: JSON structured logging with context, requestId, and metadata
- **Exception Handling**: Centralized error handling with standardized responses
- **Request Tracking**: Automatic request ID generation and correlation
- **Performance Monitoring**: Execution time tracking and slow request detection
- **Validation**: Global validation pipes with class-validator
- **Database**: PostgreSQL with TypeORM and migration support
- **Testing**: Unit and E2E tests with Jest
- **Code Quality**: ESLint and Prettier configured
- **Docker**: Multi-stage builds with docker-compose
- **Health Check**: Ready-to-use health check endpoint

## Architecture

```
src/
├── domain/                    # Business logic & entities
│   ├── entities/              # Domain entities
│   ├── value-objects/         # Value objects
│   └── repositories/          # Repository interfaces
├── application/               # Use cases & DTOs
│   ├── use-cases/             # Application use cases
│   └── dtos/                  # Data transfer objects
├── infrastructure/            # External concerns
│   ├── database/              # Database implementation
│   │   ├── typeorm/           # TypeORM configuration
│   │   └── repositories/      # Repository implementations
│   ├── config/                # Configuration files
│   └── logging/               # Logger implementation
├── presentation/              # API layer
│   ├── controllers/           # REST controllers
│   ├── filters/               # Exception filters
│   ├── interceptors/          # Request/Response interceptors
│   ├── middlewares/           # Middlewares
│   ├── pipes/                 # Validation pipes
│   └── modules/               # Feature modules
├── shared/                    # Shared utilities
│   ├── interfaces/            # Shared interfaces
│   └── utils/                 # Utility functions
├── app.module.ts
└── main.ts
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (optional)
- PostgreSQL (if not using Docker)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nestjs-boilerplate
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration.

### Running with Docker

```bash
# Start all services (app + PostgreSQL + Adminer)
docker-compose up

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

Services:
- **App**: http://localhost:3000/api
- **Swagger**: http://localhost:3000/api/docs
- **Adminer**: http://localhost:8080

### Running Locally

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

## Database

### Migrations

```bash
# Generate migration
npm run migration:generate -- src/infrastructure/database/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### TypeORM Configuration

TypeORM is configured with:
- Entities auto-discovery
- Migration support
- Connection pooling
- Logging (configurable via environment)

## API Documentation

Swagger documentation is available at `/api/docs` when the application is running.

### Example Endpoints

#### Health Check
```bash
GET /api/health
```

#### Users
```bash
# Create user
POST /api/users
{
  "name": "John Doe",
  "email": "john@example.com"
}

# List users
GET /api/users?page=1&limit=10

# Get user by ID
GET /api/users/:id
```

## Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Code Quality

```bash
# Lint
npm run lint

# Format
npm run format
```

## Logging

The application uses a custom logger service with structured JSON logging:

```typescript
// In any service
constructor(private readonly logger: AppLoggerService) {
  this.logger.setContext('MyService');
}

// Basic logging
this.logger.log('User created');

// With context
this.logger.log('User created', {
  requestId: 'xxx',
  userId: 'yyy',
  metadata: { email: 'user@example.com' }
});

// Error logging
this.logger.error('Failed to create user', error.stack, context);
```

Log format (JSON):
```json
{
  "timestamp": "2025-01-01T00:00:00.000Z",
  "level": "info",
  "message": "User created",
  "context": "CreateUserUseCase",
  "requestId": "xxx",
  "metadata": {}
}
```

## Error Handling

All exceptions are caught by the global exception filter and return a standardized response:

```json
{
  "statusCode": 400,
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/users",
  "method": "POST",
  "message": "Validation failed",
  "error": "ValidationError",
  "details": {
    "email": ["email must be a valid email"]
  },
  "requestId": "xxx"
}
```

## Performance Monitoring

The performance interceptor automatically tracks:
- Request execution time
- Slow requests (> 1 second threshold)
- Request metadata (method, path, status)

All logged with requestId for correlation.

## Request ID

Every request automatically gets a unique request ID:
- Generated via UUID v4
- Added to response headers (`X-Request-Id`)
- Included in all logs
- Available in exception responses

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Application port | `3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_DATABASE` | Database name | `nestjs_boilerplate` |
| `DB_SYNCHRONIZE` | Auto-sync schema (dev only) | `false` |
| `DB_LOGGING` | Enable database logging | `true` |
| `LOG_LEVEL` | Log level (error/warn/info/debug/verbose) | `info` |
| `LOG_FORMAT` | Log format (json/text) | `json` |
| `SWAGGER_ENABLED` | Enable Swagger docs | `true` |

## Project Structure Guidelines

### Domain Layer
- Contains business logic and rules
- No dependencies on other layers
- Pure TypeScript classes

### Application Layer
- Orchestrates use cases
- Depends only on domain layer
- Contains DTOs and business workflows

### Infrastructure Layer
- Implements technical concerns
- Database, external APIs, etc.
- Adapts domain interfaces to concrete implementations

### Presentation Layer
- HTTP layer (controllers, filters, interceptors)
- Depends on application layer
- Handles requests/responses

## Best Practices

1. **Use dependency injection**: All dependencies injected via constructor
2. **Follow SOLID principles**: Single responsibility, open/closed, etc.
3. **Write tests**: Unit tests for use cases, E2E for APIs
4. **Use DTOs**: Validate and transform data at boundaries
5. **Domain entities**: Keep business logic in domain layer
6. **Repository pattern**: Abstract data access
7. **Value objects**: Encapsulate domain concepts (e.g., Email)
8. **Error handling**: Use specific exceptions, let filter handle responses
9. **Logging**: Add context to all logs (requestId, userId, etc.)
10. **Documentation**: Keep Swagger annotations up to date

## Adding a New Feature

1. Create domain entity and repository interface in `domain/`
2. Create use cases in `application/use-cases/`
3. Create DTOs in `application/dtos/`
4. Implement repository in `infrastructure/database/repositories/`
5. Create TypeORM entity in `infrastructure/database/typeorm/entities/`
6. Create controller in `presentation/controllers/`
7. Create module in `presentation/modules/`
8. Register module in `app.module.ts`
9. Write tests (unit + e2e)
10. Update Swagger documentation

## Contributing

1. Follow the existing code structure
2. Write tests for new features
3. Run linter and tests before committing
4. Keep commits atomic and descriptive

## License

MIT
