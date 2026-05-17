# FastAPI Starter Template

Project management API with tasks and file attachments, built with FastAPI.

## Prerequisites

- Python 3.14+
- `uv` package manager
- Docker & Docker Compose (for local services)

## Quick Start

1. **Install dependencies:**
   ```bash
   uv sync
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   ```

3. **Start infrastructure:**
   ```bash
   docker compose up -d
   ```

4. **Run dev server:**
   ```bash
   uv run fastapi dev src/main.py
   ```
   Or use the commands runner:
   ```bash
   python commands.py --dev
   ```

5. **Open API docs:**
   Navigate to `http://localhost:8000/docs`

## Commands

```bash
python commands.py --test          # Run tests with coverage
python commands.py --fullcheck     # Run lint, typecheck, test, and format
python commands.py --dev           # Run FastAPI dev server
python commands.py --lint          # Run linting
python commands.py --format        # Run code formatting
python commands.py --typecheck     # Run type checking
```

## Project Structure

```
src/
├── core/           # Config, logging, pagination, errors, S3 client
├── db/             # SQLAlchemy models and async session management
├── schemas/        # Pydantic request/response schemas
├── repositories/   # Data access layer with generic base
├── services/       # Business logic layer with DI functions
├── routes/         # FastAPI routers matching hono-node structure
└── middleware/     # CORS, error handling, rate limiting
```

## Architecture

- **Repository Pattern**: Generic base repository with feature-specific implementations
- **Service Layer**: Business logic with dependency injection functions
- **Dependency Injection**: Each service has a `get_*_service()` function at the bottom
- **Async SQLAlchemy**: Full async support with `asyncpg` driver
- **Pydantic v2**: Request/response validation and serialization
- **OpenAPI**: Auto-generated docs at `/docs` and spec at `/openapi.json`

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
