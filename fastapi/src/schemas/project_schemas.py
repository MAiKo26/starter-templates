from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from src.core.pagination import PaginationMeta, PaginationQuery


class ProjectResponse(BaseModel):
    id: UUID = Field(description="Project ID")
    name: str = Field(description="Project name", examples=["Website Redesign"])
    description: str | None = Field(default=None, description="Project description", examples=["Complete overhaul"])
    status: str = Field(description="Project status", examples=["active"])
    owner_id: UUID | None = Field(default=None, description="Owner user ID")
    created_at: datetime = Field(description="Creation timestamp")
    updated_at: datetime = Field(description="Last update timestamp")


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255, description="Project name", examples=["Website Redesign"])
    description: str | None = Field(
        default=None,
        max_length=1000,
        description="Project description",
        examples=["Complete overhaul of the company website"],
    )
    status: str = Field(
        default="active",
        description="Project status",
        examples=["active"],
    )


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255, description="Project name")
    description: str | None = Field(default=None, max_length=1000, description="Project description")
    status: str | None = Field(default=None, description="Project status")


class ProjectListQuery(PaginationQuery):
    search: str | None = Field(default=None, description="Search by name")
    status: str | None = Field(default=None, description="Filter by status")


class ProjectListResponse(BaseModel):
    data: list[ProjectResponse]
    meta: PaginationMeta
