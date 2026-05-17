from uuid import UUID

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.errors.not_found_error import NotFoundError
from src.core.logger import get_logger
from src.core.pagination import PaginationMeta, build_pagination_meta
from src.db import get_db
from src.db.models.project import Project
from src.repositories.project_repository import ProjectRepository, get_project_repository
from src.schemas.project_schemas import ProjectCreate, ProjectUpdate


class ProjectService:
    def __init__(self, repository: ProjectRepository) -> None:
        self._repository = repository

    async def list(
        self,
        *,
        search: str | None = None,
        status: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[Project], PaginationMeta]:
        logger = get_logger()
        logger.debug("Listing projects", search=search, status=status, limit=limit, offset=offset)

        items, total = await self._repository.list_with_filters(
            search=search, status=status, limit=limit, offset=offset
        )

        meta = build_pagination_meta(total, limit, offset)
        return items, meta

    async def find_by_id(self, id: UUID) -> Project:
        logger = get_logger()
        logger.debug("Finding project by ID", id=str(id))

        project = await self._repository.get_by_id(id)
        if project is None:
            raise NotFoundError("Project")
        return project

    async def create(self, params: ProjectCreate, owner_id: UUID | None = None) -> Project:
        logger = get_logger()
        logger.info("Creating project", name=params.name)

        return await self._repository.create(
            name=params.name,
            description=params.description,
            status=params.status,
            owner_id=owner_id,
        )

    async def update(self, id: UUID, params: ProjectUpdate) -> Project:
        logger = get_logger()
        logger.info("Updating project", id=str(id))

        project = await self.find_by_id(id)

        updates: dict[str, str | None] = {}
        if params.name is not None:
            updates["name"] = params.name
        if params.description is not None:
            updates["description"] = params.description
        if params.status is not None:
            updates["status"] = params.status

        return await self._repository.update(project, **updates)

    async def delete(self, id: UUID) -> bool:
        logger = get_logger()
        logger.info("Deleting project", id=str(id))

        project = await self.find_by_id(id)
        await self._repository.delete(project)
        return True

    async def health_check(self) -> bool:
        try:
            await self._repository.count()
            return True
        except Exception:
            return False


def get_project_service(session: AsyncSession = Depends(get_db)) -> ProjectService:
    repository = get_project_repository(session)
    return ProjectService(repository)
