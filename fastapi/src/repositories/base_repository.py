from typing import Any, Generic, TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    def __init__(self, session: AsyncSession, model: type[ModelT]) -> None:
        self._session = session
        self._model = model

    async def get_by_id(self, id: Any) -> ModelT | None:
        result = await self._session.get(self._model, id)
        return result

    async def list(
        self,
        *,
        limit: int = 20,
        offset: int = 0,
        order_by: Any | None = None,
        **filters: Any,
    ) -> tuple[list[ModelT], int]:
        query = select(self._model)
        count_query = select(func.count()).select_from(self._model)

        for key, value in filters.items():
            if value is not None:
                query = query.where(getattr(self._model, key) == value)
                count_query = count_query.where(getattr(self._model, key) == value)

        if order_by is not None:
            query = query.order_by(order_by)

        query = query.limit(limit).offset(offset)

        items_result = await self._session.execute(query)
        total_result = await self._session.execute(count_query)

        items = list(items_result.scalars().all())
        total = total_result.scalar_one()

        return items, total

    async def create(self, **kwargs: Any) -> ModelT:
        instance = self._model(**kwargs)
        self._session.add(instance)
        await self._session.flush()
        await self._session.refresh(instance)
        return instance

    async def update(self, instance: ModelT, **kwargs: Any) -> ModelT:
        for key, value in kwargs.items():
            setattr(instance, key, value)
        await self._session.flush()
        await self._session.refresh(instance)
        return instance

    async def delete(self, instance: ModelT) -> None:
        await self._session.delete(instance)
        await self._session.flush()

    async def count(self, **filters: Any) -> int:
        query = select(func.count()).select_from(self._model)
        for key, value in filters.items():
            if value is not None:
                query = query.where(getattr(self._model, key) == value)
        result = await self._session.execute(query)
        return result.scalar_one()
