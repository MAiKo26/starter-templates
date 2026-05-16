package service

import (
	"context"
	"fmt"

	"golang-http-server/internal/core"
	"golang-http-server/internal/core/errors"
	"golang-http-server/internal/db/models"
	"golang-http-server/internal/dto"
	"golang-http-server/internal/repository"
)

type AttachmentService struct {
	repo     *repository.AttachmentRepository
	s3Client *core.S3Client
}

func NewAttachmentService(repo *repository.AttachmentRepository, s3Client *core.S3Client) *AttachmentService {
	return &AttachmentService{
		repo:     repo,
		s3Client: s3Client,
	}
}

func (s *AttachmentService) List(ctx context.Context, taskID string, limit, offset int) ([]dto.AttachmentResponse, core.PaginationMeta, error) {
	logger := core.GetLogger()
	logger.Debug("listing attachments", "task_id", taskID, "limit", limit, "offset", offset)

	attachments, total, err := s.repo.ListByTask(ctx, taskID, limit, offset)
	if err != nil {
		return nil, core.PaginationMeta{}, err
	}

	meta := core.BuildPaginationMeta(total, limit, offset)
	responses := make([]dto.AttachmentResponse, len(attachments))
	for i, a := range attachments {
		responses[i] = attachmentToResponse(a)
	}

	return responses, meta, nil
}

func (s *AttachmentService) FindByID(ctx context.Context, id string) (*dto.AttachmentResponse, error) {
	logger := core.GetLogger()
	logger.Debug("finding attachment by ID", "id", id)

	attachment, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if attachment == nil {
		return nil, errors.NewNotFoundError("Attachment")
	}

	response := attachmentToResponse(*attachment)
	return &response, nil
}

func (s *AttachmentService) Create(ctx context.Context, taskID string, params dto.AttachmentCreate) (*dto.AttachmentUploadResponse, error) {
	logger := core.GetLogger()
	logger.Info("creating attachment", "file_name", params.FileName, "task_id", taskID)

	if err := params.Validate(); err != nil {
		return nil, err
	}

	fileKey := fmt.Sprintf("tasks/%s/%s", taskID, params.FileName)

	attachment, err := s.repo.Create(ctx, taskID, params.FileName, fileKey, params.MimeType, params.FileSize, nil)
	if err != nil {
		return nil, err
	}

	uploadURL, err := s.s3Client.GetPresignedPutURL(fileKey, 3600)
	if err != nil {
		return nil, fmt.Errorf("get presigned upload URL: %w", err)
	}

	response := attachmentToResponse(*attachment)
	return &dto.AttachmentUploadResponse{
		UploadURL:  uploadURL,
		Attachment: response,
	}, nil
}

func (s *AttachmentService) GetDownloadURL(ctx context.Context, id string) (string, error) {
	logger := core.GetLogger()
	logger.Info("getting download URL", "id", id)

	attachment, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return "", err
	}
	if attachment == nil {
		return "", errors.NewNotFoundError("Attachment")
	}

	downloadURL, err := s.s3Client.GetPresignedURL(attachment.FileKey, 3600)
	if err != nil {
		return "", fmt.Errorf("get presigned download URL: %w", err)
	}

	return downloadURL, nil
}

func (s *AttachmentService) Delete(ctx context.Context, id string) error {
	logger := core.GetLogger()
	logger.Info("deleting attachment", "id", id)

	exists, err := s.repo.Exists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return errors.NewNotFoundError("Attachment")
	}

	return s.repo.Delete(ctx, id)
}

func (s *AttachmentService) HealthCheck(ctx context.Context) bool {
	count, err := s.repo.Count(ctx, "")
	return err == nil && count >= 0
}

func attachmentToResponse(a models.Attachment) dto.AttachmentResponse {
	resp := dto.AttachmentResponse{
		ID:        a.ID,
		TaskID:    a.TaskID,
		FileName:  a.FileName,
		FileKey:   a.FileKey,
		MimeType:  a.MimeType,
		FileSize:  a.FileSize,
		CreatedAt: a.CreatedAt,
	}
	if a.UploadedBy.Valid {
		resp.UploadedBy = &a.UploadedBy.String
	}
	return resp
}
