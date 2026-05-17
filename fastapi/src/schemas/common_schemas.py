from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    error: str = Field(description="Error message", examples=["Something went wrong"])


class HealthResponse(BaseModel):
    status: str = Field(examples=["ok"])
    timestamp: str = Field(description="Current server timestamp")
    services: dict[str, str] = Field(examples=[{"database": "connected", "storage": "connected"}])
