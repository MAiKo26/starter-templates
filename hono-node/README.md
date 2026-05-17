# Hono + Node Starter Template

A production-ready API starter built with **Hono**, **Node.js**, **Drizzle ORM**, **Better Auth**, and **MinIO/S3**. Features full CRUD with OpenAPI docs, structured logging, rate limiting, and tests.

## Features

- **Hono** - Ultrafast web framework with Zod-based OpenAPI support
- **Node.js** - Stable runtime with tsx for TypeScript execution
- **Drizzle ORM** - Type-safe PostgreSQL queries with schema migrations
- **Better Auth** - Session-based authentication with Drizzle adapter
- **MinIO/S3** - Object storage with presigned URLs for direct file uploads/downloads
- **Zod** - End-to-end type safety: request validation, response schemas, env validation
- **Pino** - Structured, high-performance logging with request ID tracing
- **Rate Limiter** - In-memory request throttling (skips health check)
- **Vitest** - Fast unit testing with mirrored directory structure
- **Docker Compose** - Local infrastructure (Postgres, MinIO)
- **Graceful Shutdown** - Clean connection draining on SIGTERM/SIGINT
- **API Versioning** - All routes under `/api/v1/`
- **Health Check** - `/health` endpoint with database + storage probes

## Prerequisites

- Node.js 22+
- Docker + Docker Compose (for local Postgres + MinIO)

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start infrastructure (Postgres, MinIO)
docker compose up -d

# Push database schema
npm run db:push

# Seed database (optional)
npm run db:seed

# Run development server
npm run dev
```

Server runs at `http://localhost:8000`

| Endpoint | Description |
|---|---|
| `http://localhost:8000/docs` | Swagger UI (OpenAPI docs) |
| `http://localhost:8000/health` | Health check |
| `http://localhost:8000/api/v1/*` | API routes |

## Project Structure

```
src/
  core/
    auth.ts                 # Better Auth instance
    errors/                 # Custom error classes (AppError, NotFound, Conflict, NotImplemented)
    hono-env.ts             # Hono environment type definitions
    logger.ts               # Pino logger
    log-level.ts            # Environment-to-Pino log level mapping
    pagination.ts           # Reusable pagination helper
    request-logger-store.ts # AsyncLocalStorage for request context
    s3-client.ts            # MinIO client with presigned URLs + bucket init
  db/
    index.ts                # Drizzle + postgres connection
    schema.ts               # Database schema (better-auth + app tables)
    seed.ts                 # Seed script
  middleware/
    auth-middleware.ts      # Auth guard + role guard
    cors-middleware.ts      # CORS configuration
    error-handler.ts        # Global error handler (AppError -> HTTP response)
    pino-middleware.ts      # Request logging with correlation IDs
    rate-limiter.ts         # In-memory rate limiting
  routes/
    index.ts                # Route aggregator + Swagger UI + OpenAPI spec
    project-routes.ts       # Project CRUD (OpenAPI)
    task-routes.ts          # Task CRUD (OpenAPI)
    attachment-routes.ts    # File attachment routes with presigned URLs
  schemas/
    common-schemas.ts       # Shared Zod schemas (pagination, error responses)
    project-schemas.ts      # Project request/response schemas
    task-schemas.ts         # Task request/response schemas
    attachment-schemas.ts   # Attachment request/response schemas
  services/
    project-service.ts      # Project CRUD operations
    task-service.ts         # Task CRUD operations
    attachment-service.ts   # MinIO operations + presigned URL generation
  env.ts                    # Validated environment variables (@t3-oss/env-core)
  index.ts                  # Entry point with graceful shutdown
__tests__/                  # Tests mirroring src/ structure
  core/
  middleware/
  services/
```

## API Endpoints

### Projects (`/api/v1/projects`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/projects` | List projects with pagination | Yes |
| GET | `/api/v1/projects/:id` | Get project by ID | Yes |
| POST | `/api/v1/projects` | Create project | Yes |
| PATCH | `/api/v1/projects/:id` | Update project | Yes |
| DELETE | `/api/v1/projects/:id` | Delete project | Yes |

### Tasks (`/api/v1/tasks`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/tasks` | List tasks with pagination | Yes |
| GET | `/api/v1/tasks/:id` | Get task by ID | Yes |
| POST | `/api/v1/tasks` | Create task | Yes |
| PATCH | `/api/v1/tasks/:id` | Update task | Yes |
| DELETE | `/api/v1/tasks/:id` | Delete task | Yes |

### Attachments (`/api/v1/attachments`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/attachments` | Create attachment (returns presigned upload URL) | Yes |
| GET | `/api/v1/attachments/:id/download` | Get presigned download URL | Yes |
| DELETE | `/api/v1/attachments/:id` | Delete attachment (DB + S3) | Yes |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health check (database + storage) |

## File Upload Flow

1. **Create attachment** - `POST /api/v1/attachments`
   - Returns `{ uploadUrl, attachment }`
2. **Upload file** - `PUT` to the presigned `uploadUrl`
   - Direct upload to MinIO/S3 (bypasses server)
3. **Download file** - `GET /api/v1/attachments/:id/download`
   - Returns presigned download URL
   - Client fetches file directly from storage

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript (tsc) |
| `npm run start` | Run production build |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run typecheck` | TypeScript type check |
| `npm run fullcheck` | Lint + typecheck + test + format |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:push` | Push schema to database (dev only) |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed database |

## Environment Variables

All variables are validated at startup via `src/env.ts`. See `.env.example` for defaults.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8000` | Server port |
| `DATABASE_URL` | _(required)_ | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | _(required)_ | 32+ char secret for session signing |
| `BETTER_AUTH_URL` | `http://localhost:8000` | Public API origin |
| `MINIO_ENDPOINT` | `localhost` | MinIO host |
| `MINIO_PORT` | `9000` | MinIO port |
| `MINIO_ACCESS_KEY` | `minioadmin` | MinIO access key |
| `MINIO_SECRET_KEY` | `minioadmin` | MinIO secret key |
| `MINIO_BUCKET_NAME` | `attachments` | Default bucket name |
| `MINIO_USE_SSL` | `false` | Use HTTPS for MinIO |
| `NODE_ENV` | `development` | Environment (development/production/test) |
| `LOG_LEVEL` | `debug` | Pino log level |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window (1 min) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |

## Testing

Tests mirror the `src/` directory structure inside `__tests__/`:

```
src/services/project-service.ts  ->  __tests__/services/project-service.test.ts
src/middleware/auth-middleware.ts -> __tests__/middleware/auth-middleware.test.ts
```

Run tests:
```bash
npm run test
```

## Docker Compose

```bash
# Start Postgres + MinIO
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down

# Stop + remove volumes
docker compose down -v
```

MinIO console: `http://localhost:9001` (minioadmin / minioadmin)

## Production Deployment

```bash
# Build Docker image
docker build -t hono-node-app .

# Run container
docker run -p 8000:8000 --env-file .env hono-node-app
```

Or use docker-compose for full stack:
```bash
docker compose up -d
```

## Architecture Notes

- **Presigned URLs**: File uploads/downloads bypass the server, going directly to S3/MinIO
- **Structured Logging**: Pino with request correlation IDs via `X-Request-ID` header
- **Type Safety**: Zod schemas validate all inputs/outputs, Drizzle provides type-safe queries
- **Error Handling**: Centralized error handler converts `AppError` subclasses to proper HTTP responses
- **Pagination**: Consistent cursor-based pagination across all list endpoints
