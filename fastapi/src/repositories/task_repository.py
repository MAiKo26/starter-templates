from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.task import Task
from src.repositories.base_repository import BaseRepository


class TaskRepository(BaseRepository[Task]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Task)

    async def list_by_project(
        self,
        *,
        project_id: str,
        status: str | None = None,
        priority: str | None = None,
        assignee_id: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[Task], int]:
        conditions = [Task.project_id == project_id]
        if status:
            conditions.append(Task.status == status)
        if priority:
            conditions.append(Task.priority == priority)
        if assignee_id:
            conditions.append(Task.assignee_id == assignee_id)

        where_clause = and_(*conditions)

        query = select(Task).where(where_clause).order_by(Task.created_at).limit(limit).offset(offset)

        count_query = select(func.count()).select_from(Task).where(where_clause)

        items_result = await self._session.execute(query)
        total_result = await self._session.execute(count_query)

        items = list(items_result.scalars().all())
        total = total_result.scalar_one()

        return items, total


def get_task_repository(session: AsyncSession) -> TaskRepository:
    return TaskRepository(session)
