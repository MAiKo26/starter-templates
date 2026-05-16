package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"golang-http-server/internal/db/models"
)

type AttachmentRepository struct {
	*BaseRepository
}

func NewAttachmentRepository(db *sql.DB) *AttachmentRepository {
	return &AttachmentRepository{
		BaseRepository: NewBaseRepository(db, "attachments"),
	}
}

func (r *AttachmentRepository) Create(ctx context.Context, taskID, fileName, fileKey, mimeType string, fileSize int, uploadedBy *string) (*models.Attachment, error) {
	query := `
		INSERT INTO attachments (id, task_id, file_name, file_key, mime_type, file_size, uploaded_by, created_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
		RETURNING id, task_id, file_name, file_key, mime_type, file_size, uploaded_by, created_at
	`

	now := time.Now().UTC()
	var attachment models.Attachment
	err := r.db.QueryRowContext(ctx, query, taskID, fileName, fileKey, mimeType, fileSize, uploadedBy, now).Scan(
		&attachment.ID,
		&attachment.TaskID,
		&attachment.FileName,
		&attachment.FileKey,
		&attachment.MimeType,
		&attachment.FileSize,
		&attachment.UploadedBy,
		&attachment.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create attachment: %w", err)
	}

	return &attachment, nil
}

func (r *AttachmentRepository) GetByID(ctx context.Context, id string) (*models.Attachment, error) {
	query := `
		SELECT id, task_id, file_name, file_key, mime_type, file_size, uploaded_by, created_at
		FROM attachments WHERE id = $1
	`

	var attachment models.Attachment
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&attachment.ID,
		&attachment.TaskID,
		&attachment.FileName,
		&attachment.FileKey,
		&attachment.MimeType,
		&attachment.FileSize,
		&attachment.UploadedBy,
		&attachment.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get attachment by id: %w", err)
	}

	return &attachment, nil
}

func (r *AttachmentRepository) ListByTask(ctx context.Context, taskID string, limit, offset int) ([]models.Attachment, int, error) {
	query := `
		SELECT id, task_id, file_name, file_key, mime_type, file_size, uploaded_by, created_at
		FROM attachments WHERE task_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	countQuery := `SELECT COUNT(*) FROM attachments WHERE task_id = $1`

	var total int
	err := r.db.QueryRowContext(ctx, countQuery, taskID).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("count attachments: %w", err)
	}

	rows, err := r.db.QueryContext(ctx, query, taskID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list attachments: %w", err)
	}
	defer rows.Close()

	var attachments []models.Attachment
	for rows.Next() {
		var a models.Attachment
		if err := rows.Scan(&a.ID, &a.TaskID, &a.FileName, &a.FileKey, &a.MimeType, &a.FileSize, &a.UploadedBy, &a.CreatedAt); err != nil {
			return nil, 0, fmt.Errorf("scan attachment: %w", err)
		}
		attachments = append(attachments, a)
	}

	return attachments, total, nil
}
