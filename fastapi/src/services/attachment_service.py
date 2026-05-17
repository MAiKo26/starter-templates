import uuid
from uuid import UUID

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import Settings, get_settings
from src.core.errors.not_found_error import NotFoundError
from src.core.logger import get_logger
from src.core.pagination import PaginationMeta, build_pagination_meta
from src.core.s3_client import S3Client, get_s3_client
from src.db import get_db
from src.db.models.attachment import Attachment
from src.repositories.attachment_repository import AttachmentRepository, get_attachment_repository
from src.schemas.attachment_schemas import AttachmentCreate


class AttachmentService:
    def __init__(self, repository: AttachmentRepository, s3_client: S3Client) -> None:
        self._repository = repository
        self._s3_client = s3_client

    async def list(
        self,
        *,
        task_id: UUID,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[Attachment], PaginationMeta]:
        logger = get_logger()
        logger.debug("Listing attachments", task_id=str(task_id), limit=limit, offset=offset)

        items, total = await self._repository.list_by_task(task_id=str(task_id), limit=limit, offset=offset)

        meta = build_pagination_meta(total, limit, offset)
        return items, meta

    async def find_by_id(self, id: UUID) -> Attachment:
        logger = get_logger()
        logger.debug("Finding attachment by ID", id=str(id))

        attachment = await self._repository.get_by_id(id)
        if attachment is None:
            raise NotFoundError("Attachment")
        return attachment

    async def create(
        self,
        task_id: UUID,
        params: AttachmentCreate,
        uploaded_by: UUID | None = None,
    ) -> tuple[Attachment, str]:
        logger = get_logger()
        logger.info("Creating attachment", file_name=params.file_name)

        file_key = f"uploads/{uuid.uuid4()}-{params.file_name}"

        attachment = await self._repository.create(
            id=uuid.uuid4(),
            task_id=task_id,
            file_name=params.file_name,
            file_key=file_key,
            mime_type=params.mime_type,
            file_size=params.file_size,
            uploaded_by=uploaded_by,
        )

        upload_url = self._s3_client.get_presigned_put_url(file_key)

        return attachment, upload_url

    async def get_download_url(self, id: UUID, expires_in_sec: int = 3600) -> str:
        attachment = await self.find_by_id(id)
        return self._s3_client.get_presigned_url(attachment.file_key, expires_in_sec)

    async def delete(self, id: UUID) -> bool:
        logger = get_logger()
        logger.info("Deleting attachment", id=str(id))

        attachment = await self.find_by_id(id)
        await self._repository.delete(attachment)
        return True

    async def health_check(self) -> bool:
        try:
            await self._repository.count()
            return True
        except Exception:
            return False


def get_attachment_service(
    session: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> AttachmentService:
    repository = get_attachment_repository(session)
    s3_client = get_s3_client(settings)
    return AttachmentService(repository, s3_client)
