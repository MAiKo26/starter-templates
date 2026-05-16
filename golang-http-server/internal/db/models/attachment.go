package models

import (
	"database/sql"
	"time"
)

type Attachment struct {
	ID         string         `json:"id"`
	TaskID     string         `json:"task_id"`
	FileName   string         `json:"file_name"`
	FileKey    string         `json:"file_key"`
	MimeType   string         `json:"mime_type"`
	FileSize   int            `json:"file_size"`
	UploadedBy sql.NullString `json:"uploaded_by"`
	CreatedAt  time.Time      `json:"created_at"`
}
