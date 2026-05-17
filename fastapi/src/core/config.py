from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    port: int = 8000
    node_env: str = "development"
    log_level: str = "INFO"
    log_pretty: bool = False
    database_url: str
    pg_pool_max: int = 10
    pg_pool_min: int = 1
    cors_allowed_origins: str = "http://localhost:3000"
    better_auth_secret: str
    better_auth_url: str
    auth_cookie_secure: bool = False
    auth_cookie_max_age_seconds: int = 604800
    minio_endpoint: str = "localhost"
    minio_port: int = 9000
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket_name: str = "starter-blobs"
    minio_secure: bool = False
    redis_url: str = "redis://localhost:6379"
    rate_limit_window_ms: int = 60000
    rate_limit_max_requests: int = 100

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()  # type: ignore[call-arg]
    return _settings
