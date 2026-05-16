# Go HTTP Server Starter

Project management API with tasks and file attachments, built with Go's standard library.

## Prerequisites

- Go 1.26+
- `air` for hot reload (`go install github.com/air-verse/air@latest`)
- Docker & Docker Compose (for local services)

## Quick Start

1. **Set up environment:**
   ```bash
   cp .env.example .env
   ```

2. **Start infrastructure:**
   ```bash
   docker compose up -d
   ```

3. **Install dependencies:**
   ```bash
   go mod tidy
   ```

4. **Run dev server:**
   ```bash
   make dev
   ```
   Or directly:
   ```bash
   air
   ```

5. **Open API docs:**
   Navigate to `http://localhost:8000/docs` (if Swagger is added) or test endpoints directly.

## Commands

```bash
make dev          # Run dev server with hot reload
make test         # Run tests with coverage
make lint         # Run golangci-lint
make fmt          # Format code
make build        # Build binary
make vendor       # Vendor dependencies
make fullcheck    # Run all quality checks
make clean        # Clean build artifacts
```

## Project Structure

```
golang-http-server/
├── .air.toml              # Air live-reload config
├── .env                   # Environment variables
├── docker-compose.yml     # postgres, minio, redis
├── go.mod                 # Module definition
├── main.go                # Entry point
├── Makefile               # Development commands
├── internal/
│   ├── core/              # Config, logging, pagination, errors, S3 client
│   ├── db/                # Database connection and models
│   ├── dto/               # Request/response DTOs
│   ├── middleware/        # HTTP middleware (CORS, error handler, logging, rate limit)
│   ├── repository/        # Data access layer
│   ├── routes/            # HTTP route handlers
│   └── service/           # Business logic layer
└── vendor/                # Vendored dependencies
```

## Architecture

- **Standard Library**: Uses `net/http` with no external router
- **Repository Pattern**: Data access layer with feature-specific repositories
- **Service Layer**: Business logic with dependency injection
- **DTO Layer**: Request/response validation and serialization
- **Structured Logging**: Using Go's built-in `slog`
- **Direct SQL**: All queries written by hand with `database/sql` + `pgx`

## API Endpoints

### Projects
- `GET /api/v1/projects` - List projects
- `GET /api/v1/projects/{id}` - Get project
- `POST /api/v1/projects` - Create project
- `PATCH /api/v1/projects/{id}` - Update project
- `DELETE /api/v1/projects/{id}` - Delete project

### Tasks
- `GET /api/v1/projects/{projectId}/tasks` - List tasks
- `GET /api/v1/projects/{projectId}/tasks/{id}` - Get task
- `POST /api/v1/projects/{projectId}/tasks` - Create task
- `PATCH /api/v1/projects/{projectId}/tasks/{id}` - Update task
- `DELETE /api/v1/projects/{projectId}/tasks/{id}` - Delete task

### Attachments
- `GET /api/v1/tasks/{taskId}/attachments` - List attachments
- `POST /api/v1/tasks/{taskId}/attachments` - Create attachment (presigned URL)
- `GET /api/v1/attachments/{id}/download` - Get download URL

### Health
- `GET /health` - Health check (database + storage)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 8000 |
| NODE_ENV | Environment | development |
| LOG_LEVEL | Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL) | DEBUG |
| LOG_PRETTY | Pretty print logs | true |
| DATABASE_URL | PostgreSQL connection string | - |
| PG_POOL_MAX | Max pool connections | 10 |
| PG_POOL_MIN | Min pool connections | 1 |
| CORS_ALLOWED_ORIGINS | Allowed CORS origins | http://localhost:3000 |
| MINIO_ENDPOINT | MinIO endpoint | localhost |
| MINIO_PORT | MinIO port | 9000 |
| MINIO_ACCESS_KEY | MinIO access key | minioadmin |
| MINIO_SECRET_KEY | MinIO secret key | minioadmin |
| MINIO_BUCKET_NAME | MinIO bucket name | starter-blobs |
| MINIO_SECURE | Use HTTPS for MinIO | false |
| REDIS_URL | Redis connection URL | redis://localhost:6379 |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 60000 |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |
