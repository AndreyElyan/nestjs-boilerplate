# Quick Start Guide

Get up and running with the NestJS Boilerplate in 5 minutes.

## Prerequisites

- Node.js 20+ installed
- Docker and Docker Compose installed (recommended)
- PostgreSQL (if not using Docker)

## Option 1: Docker (Recommended)

### 1. Clone and Setup
```bash
cd nestjs-boilerplate
cp .env.docker .env
```

### 2. Start Services
```bash
docker-compose up -d
```

This starts:
- **NestJS App**: http://localhost:3000/api
- **PostgreSQL**: localhost:5432
- **Adminer** (DB Admin): http://localhost:8080

### 3. Run Migrations
```bash
docker-compose exec app npm run migration:run
```

### 4. Test the API

Health Check:
```bash
curl http://localhost:3000/api/health
```

Create User:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

List Users:
```bash
curl http://localhost:3000/api/users
```

### 5. View API Docs
Open http://localhost:3000/api/docs in your browser

### 6. View Logs
```bash
docker-compose logs -f app
```

## Option 2: Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials.

### 3. Start PostgreSQL
Make sure PostgreSQL is running and create the database:
```sql
CREATE DATABASE nestjs_boilerplate;
```

### 4. Run Migrations
```bash
npm run migration:run
```

### 5. Start Development Server
```bash
npm run start:dev
```

The API will be available at http://localhost:3000/api

## Next Steps

### Development Workflow

1. **Create a new feature**:
   ```bash
   # Follow the structure in src/
   # domain -> application -> infrastructure -> presentation
   ```

2. **Generate migration**:
   ```bash
   make migration-generate name=CreateMyTable
   # or
   npm run migration:generate -- src/infrastructure/database/migrations/CreateMyTable
   ```

3. **Run tests**:
   ```bash
   npm test              # Unit tests
   npm run test:e2e      # E2E tests
   npm run test:cov      # Coverage
   ```

4. **Format and lint**:
   ```bash
   npm run format
   npm run lint
   ```

### Common Tasks

#### View Database
- **With Docker**: http://localhost:8080 (Adminer)
- **Credentials**: See `.env` file

#### Stop Services
```bash
docker-compose down
```

#### Restart Services
```bash
docker-compose restart
```

#### View All Logs
```bash
docker-compose logs -f
```

#### Clean Start
```bash
docker-compose down -v  # Remove volumes
docker-compose up --build
```

## Project Structure

```
nestjs-boilerplate/
├── src/
│   ├── domain/              # Business entities & rules
│   ├── application/         # Use cases & DTOs
│   ├── infrastructure/      # DB, logging, config
│   ├── presentation/        # Controllers, filters
│   └── shared/              # Common utilities
├── test/                    # E2E tests
├── docs/                    # Documentation
├── docker-compose.yml       # Docker services
├── Dockerfile               # App container
└── README.md               # Full documentation
```

## Available Endpoints

### Health
- `GET /api/health` - Health check

### Users
- `POST /api/users` - Create user
- `GET /api/users` - List users (paginated)
- `GET /api/users/:id` - Get user by ID

### API Documentation
- `GET /api/docs` - Swagger UI

## Environment Variables

Key variables in `.env`:

```env
PORT=3000
DB_HOST=localhost          # Use 'postgres' for Docker
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=nestjs_boilerplate
LOG_LEVEL=debug
LOG_FORMAT=json
```

## Troubleshooting

### Database Connection Issues
- Check PostgreSQL is running
- Verify credentials in `.env`
- For Docker: Use `DB_HOST=postgres`
- For local: Use `DB_HOST=localhost`

### Port Already in Use
```bash
# Change PORT in .env to another port
PORT=3001
```

### Migration Errors
```bash
# Reset database (caution: deletes all data)
docker-compose down -v
docker-compose up -d
docker-compose exec app npm run migration:run
```

### Docker Issues
```bash
# Rebuild containers
docker-compose build --no-cache
docker-compose up -d
```

## Examples

### Creating a User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com"
  }'
```

Response:
```json
{
  "id": "uuid",
  "name": "Alice Smith",
  "email": "alice@example.com",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Listing Users
```bash
curl "http://localhost:3000/api/users?page=1&limit=10"
```

Response:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

## Learning Resources

- **Clean Architecture**: See `docs/ARCHITECTURE.md`
- **Contributing**: See `CONTRIBUTING.md`
- **Full Docs**: See `README.md`
- **NestJS Docs**: https://docs.nestjs.com
- **TypeORM Docs**: https://typeorm.io

## Getting Help

- Check `README.md` for detailed documentation
- Review `docs/ARCHITECTURE.md` for design decisions
- Check existing tests for usage examples
- Open an issue for questions

## What's Next?

1. Explore the codebase structure
2. Read `docs/ARCHITECTURE.md` to understand design decisions
3. Add your own features following the existing patterns
4. Write tests for your code
5. Check `CONTRIBUTING.md` for guidelines

Happy coding!
