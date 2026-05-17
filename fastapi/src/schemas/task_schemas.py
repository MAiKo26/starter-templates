from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from src.core.pagination import PaginationMeta, PaginationQuery


class TaskResponse(BaseModel):
    id: UUID = Field(description="Task ID")
    project_id: UUID = Field(description="Parent project ID")
    title: str = Field(description="Task title", examples=["Design homepage"])
    description: str | None = Field(default=None, description="Task description")
    status: str = Field(description="Task status", examples=["todo"])
    priority: str = Field(description="Task priority", examples=["high"])
    assignee_id: UUID | None = Field(default=None, description="Assignee user ID")
    due_date: datetime | None = Field(default=None, description="Due date")
    created_at: datetime = Field(description="Creation timestamp")
    updated_at: datetime = Field(description="Last update timestamp")


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255, description="Task title", examples=["Design homepage mockup"])
    description: str | None = Field(default=None, max_length=2000, description="Task description")
    status: str = Field(
        default="todo",
        description="Task status",
    )
    priority: str = Field(
        default="medium",
        description="Task priority",
    )
    assignee_id: UUID | None = Field(default=None, description="Assignee user ID")
    due_date: datetime | None = Field(default=None, description="Due date (ISO 8601)")


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255, description="Task title")
    description: str | None = Field(default=None, max_length=2000, description="Task description")
    status: str | None = Field(default=None, description="Task status")
    priority: str | None = Field(default=None, description="Task priority")
    assignee_id: UUID | None = Field(default=None, description="Assignee user ID")
    due_date: datetime | None = Field(default=None, description="Due date (ISO 8601)")


class TaskListQuery(PaginationQuery):
    status: str | None = Field(default=None, description="Filter by status")
    priority: str | None = Field(default=None, description="Filter by priority")
    assignee_id: UUID | None = Field(default=None, description="Filter by assignee")


class TaskListResponse(BaseModel):
    data: list[TaskResponse]
    meta: PaginationMeta
