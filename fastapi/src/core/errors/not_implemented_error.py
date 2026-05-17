from src.core.errors.app_error import AppError


class NotImplementedError(AppError):
    def __init__(self, message: str = "Not implemented") -> None:
        super().__init__(message, 501)
