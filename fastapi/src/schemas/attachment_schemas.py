from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from src.core.pagination import PaginationMeta, PaginationQuery


class AttachmentResponse(BaseModel):
    id: UUID = Field(description="Attachment ID")
    task_id: UUID = Field(description="Parent task ID")
    file_name: str = Field(description="Original file name", examples=["report.pdf"])
    file_key: str = Field(description="S3 object key")
    mime_type: str = Field(description="MIME type", examples=["application/pdf"])
    file_size: int = Field(description="File size in bytes", examples=[1024])
    uploaded_by: UUID | None = Field(default=None, description="Uploader user ID")
    created_at: datetime = Field(description="Upload timestamp")


class AttachmentCreate(BaseModel):
    file_name: str = Field(min_length=1, max_length=255, description="Original file name", examples=["report.pdf"])
    mime_type: str = Field(min_length=1, max_length=128, description="MIME type", examples=["application/pdf"])
    file_size: int = Field(gt=0, description="File size in bytes", examples=[1024])


class AttachmentListQuery(PaginationQuery):
    pass


class AttachmentListResponse(BaseModel):
    data: list[AttachmentResponse]
    meta: PaginationMeta


class AttachmentUploadResponse(BaseModel):
    upload_url: str = Field(description="Presigned URL for uploading the file")
    attachment: AttachmentResponse
