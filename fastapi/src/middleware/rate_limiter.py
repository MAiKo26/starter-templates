from slowapi import Limiter
from slowapi.util import get_remote_address

from src.core.config import Settings


def create_rate_limiter(settings: Settings) -> Limiter:
    window_seconds = settings.rate_limit_window_ms / 1000
    return Limiter(
        key_func=get_remote_address,
        default_limits=[f"{settings.rate_limit_max_requests}/{window_seconds}s"],
    )
