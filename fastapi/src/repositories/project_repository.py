from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.project import Project
from src.repositories.base_repository import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Project)

    async def list_with_filters(
        self,
        *,
        search: str | None = None,
        status: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[Project], int]:
        conditions = []
        if search:
            conditions.append(Project.name.ilike(f"%{search}%"))
        if status:
            conditions.append(Project.status == status)

        where_clause = and_(*conditions) if conditions else None

        query = select(Project)
        if where_clause is not None:
            query = query.where(where_clause)
        query = query.order_by(Project.created_at).limit(limit).offset(offset)

        count_query = select(func.count()).select_from(Project)
        if where_clause is not None:
            count_query = count_query.where(where_clause)

        items_result = await self._session.execute(query)
        total_result = await self._session.execute(count_query)

        items = list(items_result.scalars().all())
        total = total_result.scalar_one()

        return items, total


def get_project_repository(session: AsyncSession) -> ProjectRepository:
    return ProjectRepository(session)
