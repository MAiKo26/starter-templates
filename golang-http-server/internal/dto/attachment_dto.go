package dto

import (
	"time"

	"golang-http-server/internal/core"
)

type AttachmentResponse struct {
	ID         string    `json:"id"`
	TaskID     string    `json:"task_id"`
	FileName   string    `json:"file_name"`
	FileKey    string    `json:"file_key"`
	MimeType   string    `json:"mime_type"`
	FileSize   int       `json:"file_size"`
	UploadedBy *string   `json:"uploaded_by"`
	CreatedAt  time.Time `json:"created_at"`
}

type AttachmentCreate struct {
	FileName  string `json:"file_name"`
	MimeType  string `json:"mime_type"`
	FileSize  int    `json:"file_size"`
}

func (a *AttachmentCreate) Validate() error {
	if a.FileName == "" {
		return &ValidationError{Field: "file_name", Message: "file_name is required"}
	}
	if len(a.FileName) > 255 {
		return &ValidationError{Field: "file_name", Message: "file_name must be 255 characters or less"}
	}
	if a.MimeType == "" {
		return &ValidationError{Field: "mime_type", Message: "mime_type is required"}
	}
	if len(a.MimeType) > 128 {
		return &ValidationError{Field: "mime_type", Message: "mime_type must be 128 characters or less"}
	}
	if a.FileSize <= 0 {
		return &ValidationError{Field: "file_size", Message: "file_size must be greater than 0"}
	}
	return nil
}

type AttachmentListQuery struct {
	core.PaginationQuery
}

type AttachmentListResponse struct {
	Data []AttachmentResponse `json:"data"`
	Meta core.PaginationMeta  `json:"meta"`
}

type AttachmentUploadResponse struct {
	UploadURL  string             `json:"upload_url"`
	Attachment AttachmentResponse `json:"attachment"`
}
