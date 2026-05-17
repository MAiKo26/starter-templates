from fastapi import APIRouter, Depends

from src.schemas.attachment_schemas import (
    AttachmentCreate,
    AttachmentListResponse,
    AttachmentResponse,
    AttachmentUploadResponse,
)
from src.schemas.common_schemas import ErrorResponse
from src.services.attachment_service import AttachmentService, get_attachment_service

router = APIRouter(prefix="/tasks/{task_id}/attachments", tags=["Attachments"])


@router.get(
    "",
    response_model=AttachmentListResponse,
    summary="List attachments for a task",
)
async def list_attachments(
    task_id: str,
    limit: int = 20,
    offset: int = 0,
    service: AttachmentService = Depends(get_attachment_service),
) -> AttachmentListResponse:
    from uuid import UUID

    items, meta = await service.list(
        task_id=UUID(task_id),
        limit=limit,
        offset=offset,
    )
    return AttachmentListResponse(
        data=[
            AttachmentResponse(
                id=a.id,
                task_id=a.task_id,
                file_name=a.file_name,
                file_key=a.file_key,
                mime_type=a.mime_type,
                file_size=a.file_size,
                uploaded_by=a.uploaded_by,
                created_at=a.created_at,
            )
            for a in items
        ],
        meta=meta,
    )


@router.post(
    "",
    response_model=AttachmentUploadResponse,
    status_code=201,
    summary="Create attachment (returns presigned upload URL)",
)
async def create_attachment(
    task_id: str,
    params: AttachmentCreate,
    service: AttachmentService = Depends(get_attachment_service),
) -> AttachmentUploadResponse:
    from uuid import UUID

    attachment, upload_url = await service.create(
        task_id=UUID(task_id),
        params=params,
    )
    return AttachmentUploadResponse(
        upload_url=upload_url,
        attachment=AttachmentResponse(
            id=attachment.id,
            task_id=attachment.task_id,
            file_name=attachment.file_name,
            file_key=attachment.file_key,
            mime_type=attachment.mime_type,
            file_size=attachment.file_size,
            uploaded_by=attachment.uploaded_by,
            created_at=attachment.created_at,
        ),
    )


@router.get(
    "/{id}/download",
    response_model=dict[str, str],
    summary="Get presigned download URL",
    responses={404: {"model": ErrorResponse}},
)
async def get_download_url(
    id: str,
    service: AttachmentService = Depends(get_attachment_service),
) -> dict[str, str]:
    from uuid import UUID

    download_url = await service.get_download_url(UUID(id))
    return {"downloadUrl": download_url}
