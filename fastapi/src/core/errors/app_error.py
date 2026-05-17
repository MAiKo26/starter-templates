class AppError(Exception):
    def __init__(self, message: str, status_code: int, is_operational: bool = True) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.is_operational = is_operational
