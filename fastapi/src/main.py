from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from datetime import UTC, datetime

from fastapi import Depends, FastAPI

from src.core.config import Settings, get_settings
from src.core.logger import get_logger, setup_logging
from src.core.s3_client import S3Client, get_s3_client
from src.db import close_db, get_db, init_db
from src.middleware.cors import add_cors_middleware
from src.middleware.error_handler import register_error_handlers
from src.middleware.rate_limiter import create_rate_limiter
from src.routes.attachment_routes import router as attachment_router
from src.routes.project_routes import router as project_router
from src.routes.task_routes import router as task_router
from src.schemas.common_schemas import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    settings = app.state.settings
    setup_logging(settings)

    logger = get_logger()
    logger.info("Starting up")

    await init_db(settings)

    s3_client = get_s3_client(settings)
    s3_client.ensure_bucket_exists()

    logger.info("Server started", port=settings.port)
    logger.info(f"API docs: http://localhost:{settings.port}/docs")

    yield

    logger.info("Shutting down gracefully...")
    await close_db(settings)
    logger.info("Server closed")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Starter API",
        version="1.0.0",
        description="Project management API with tasks and file attachments",
        docs_url="/docs",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    app.state.settings = settings

    add_cors_middleware(app, settings)

    rate_limiter = create_rate_limiter(settings)
    app.state.limiter = rate_limiter

    register_error_handlers(app)

    app.include_router(project_router, prefix="/api/v1")
    app.include_router(task_router, prefix="/api/v1")
    app.include_router(attachment_router, prefix="/api/v1")

    @app.get("/health", response_model=HealthResponse)
    async def health_check(
        settings: Settings = Depends(get_settings),
        s3_client: S3Client = Depends(get_s3_client),
    ) -> HealthResponse:
        from src.services.project_service import get_project_service

        db_ok = False
        storage_ok = False

        try:
            async for session in get_db(settings):
                service = get_project_service(session)
                db_ok = await service.health_check()
                break
        except Exception:
            db_ok = False

        try:
            storage_ok = s3_client.bucket_exists()
        except Exception:
            storage_ok = False

        status = "ok" if db_ok and storage_ok else "degraded"

        return HealthResponse(
            status=status,
            timestamp=datetime.now(UTC).isoformat(),
            services={
                "database": "connected" if db_ok else "disconnected",
                "storage": "connected" if storage_ok else "disconnected",
            },
        )

    return app


app = create_app()


def run() -> None:
    import uvicorn

    settings = get_settings()
    uvicorn.run("src.main:app", host="0.0.0.0", port=settings.port, reload=True)
