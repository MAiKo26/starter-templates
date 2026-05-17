from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.attachment import Attachment
from src.repositories.base_repository import BaseRepository


class AttachmentRepository(BaseRepository[Attachment]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Attachment)

    async def list_by_task(
        self,
        *,
        task_id: str,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[Attachment], int]:
        where_clause = Attachment.task_id == task_id

        query = select(Attachment).where(where_clause).order_by(Attachment.created_at).limit(limit).offset(offset)

        count_query = select(func.count()).select_from(Attachment).where(where_clause)

        items_result = await self._session.execute(query)
        total_result = await self._session.execute(count_query)

        items = list(items_result.scalars().all())
        total = total_result.scalar_one()

        return items, total


def get_attachment_repository(session: AsyncSession) -> AttachmentRepository:
    return AttachmentRepository(session)
