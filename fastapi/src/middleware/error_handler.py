from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from src.core.errors.app_error import AppError
from src.core.logger import get_logger


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        logger = get_logger()
        logger.warning("App error", status_code=exc.status_code, message=str(exc))
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": str(exc)},
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger = get_logger()
        logger.error("Unhandled exception", exc_info=exc)
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"},
        )
