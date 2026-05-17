from pydantic import BaseModel, Field


class PaginationQuery(BaseModel):
    limit: int = Field(default=20, ge=1, le=100, description="Number of items per page")
    offset: int = Field(default=0, ge=0, description="Number of items to skip")


class PaginationMeta(BaseModel):
    total: int
    limit: int
    offset: int


def build_pagination_meta(total: int, limit: int, offset: int) -> PaginationMeta:
    return PaginationMeta(total=total, limit=limit, offset=offset)
