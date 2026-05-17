from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import Settings


def add_cors_middleware(app: FastAPI, settings: Settings) -> None:
    origins = [origin.strip() for origin in settings.cors_allowed_origins.split(",")]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
        max_age=86400,
    )
