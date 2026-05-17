from datetime import datetime
import uuid
from uuid import UUID

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.errors.not_found_error import NotFoundError
from src.core.logger import get_logger
from src.core.pagination import PaginationMeta, build_pagination_meta
from src.db import get_db
from src.db.models.task import Task
from src.repositories.task_repository import TaskRepository, get_task_repository
from src.schemas.task_schemas import TaskCreate, TaskUpdate


class TaskService:
    def __init__(self, repository: TaskRepository) -> None:
        self._repository = repository

    async def list(
        self,
        *,
        project_id: UUID,
        status: str | None = None,
        priority: str | None = None,
        assignee_id: UUID | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[Task], PaginationMeta]:
        logger = get_logger()
        logger.debug(
            "Listing tasks",
            project_id=str(project_id),
            status=status,
            priority=priority,
            limit=limit,
            offset=offset,
        )

        items, total = await self._repository.list_by_project(
            project_id=str(project_id),
            status=status,
            priority=priority,
            assignee_id=str(assignee_id) if assignee_id else None,
            limit=limit,
            offset=offset,
        )

        meta = build_pagination_meta(total, limit, offset)
        return items, meta

    async def find_by_id(self, id: UUID) -> Task:
        logger = get_logger()
        logger.debug("Finding task by ID", id=str(id))

        task = await self._repository.get_by_id(id)
        if task is None:
            raise NotFoundError("Task")
        return task

    async def create(self, project_id: UUID, params: TaskCreate) -> Task:
        logger = get_logger()
        logger.info("Creating task", title=params.title, project_id=str(project_id))

        return await self._repository.create(
            id=uuid.uuid4(),
            project_id=project_id,
            title=params.title,
            description=params.description,
            status=params.status,
            priority=params.priority,
            assignee_id=params.assignee_id,
            due_date=params.due_date,
        )

    async def update(self, id: UUID, params: TaskUpdate) -> Task:
        logger = get_logger()
        logger.info("Updating task", id=str(id))

        task = await self.find_by_id(id)

        updates: dict[str, str | UUID | datetime | None] = {}
        if params.title is not None:
            updates["title"] = params.title
        if params.description is not None:
            updates["description"] = params.description
        if params.status is not None:
            updates["status"] = params.status
        if params.priority is not None:
            updates["priority"] = params.priority
        if params.assignee_id is not None:
            updates["assignee_id"] = params.assignee_id
        if params.due_date is not None:
            updates["due_date"] = params.due_date

        return await self._repository.update(task, **updates)

    async def delete(self, id: UUID) -> bool:
        logger = get_logger()
        logger.info("Deleting task", id=str(id))

        task = await self.find_by_id(id)
        await self._repository.delete(task)
        return True


def get_task_service(session: AsyncSession = Depends(get_db)) -> TaskService:
    repository = get_task_repository(session)
    return TaskService(repository)
