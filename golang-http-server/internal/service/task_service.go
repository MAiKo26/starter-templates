package service

import (
	"context"

	"golang-http-server/internal/core"
	"golang-http-server/internal/core/errors"
	"golang-http-server/internal/db/models"
	"golang-http-server/internal/dto"
	"golang-http-server/internal/repository"
)

type TaskService struct {
	repo *repository.TaskRepository
}

func NewTaskService(repo *repository.TaskRepository) *TaskService {
	return &TaskService{repo: repo}
}

func (s *TaskService) List(ctx context.Context, projectID string, status, priority, assigneeID *string, limit, offset int) ([]dto.TaskResponse, core.PaginationMeta, error) {
	logger := core.GetLogger()
	logger.Debug("listing tasks", "project_id", projectID, "status", status, "priority", priority, "limit", limit, "offset", offset)

	tasks, total, err := s.repo.ListByProject(ctx, projectID, status, priority, assigneeID, limit, offset)
	if err != nil {
		return nil, core.PaginationMeta{}, err
	}

	meta := core.BuildPaginationMeta(total, limit, offset)
	responses := make([]dto.TaskResponse, len(tasks))
	for i, t := range tasks {
		responses[i] = taskToResponse(t)
	}

	return responses, meta, nil
}

func (s *TaskService) FindByID(ctx context.Context, id string) (*dto.TaskResponse, error) {
	logger := core.GetLogger()
	logger.Debug("finding task by ID", "id", id)

	task, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if task == nil {
		return nil, errors.NewNotFoundError("Task")
	}

	response := taskToResponse(*task)
	return &response, nil
}

func (s *TaskService) Create(ctx context.Context, projectID string, params dto.TaskCreate) (*dto.TaskResponse, error) {
	logger := core.GetLogger()
	logger.Info("creating task", "title", params.Title, "project_id", projectID)

	if err := params.Validate(); err != nil {
		return nil, err
	}

	task, err := s.repo.Create(ctx, projectID, params.Title, params.Description, params.Status, params.Priority, params.AssigneeID, params.DueDate)
	if err != nil {
		return nil, err
	}

	response := taskToResponse(*task)
	return &response, nil
}

func (s *TaskService) Update(ctx context.Context, id string, params dto.TaskUpdate) (*dto.TaskResponse, error) {
	logger := core.GetLogger()
	logger.Info("updating task", "id", id)

	if err := params.Validate(); err != nil {
		return nil, err
	}

	task, err := s.repo.Update(ctx, id, params.Title, params.Description, params.Status, params.Priority, params.AssigneeID, params.DueDate)
	if err != nil {
		return nil, err
	}
	if task == nil {
		return nil, errors.NewNotFoundError("Task")
	}

	response := taskToResponse(*task)
	return &response, nil
}

func (s *TaskService) Delete(ctx context.Context, id string) error {
	logger := core.GetLogger()
	logger.Info("deleting task", "id", id)

	exists, err := s.repo.Exists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return errors.NewNotFoundError("Task")
	}

	return s.repo.Delete(ctx, id)
}

func taskToResponse(t models.Task) dto.TaskResponse {
	resp := dto.TaskResponse{
		ID:        t.ID,
		ProjectID: t.ProjectID,
		Title:     t.Title,
		Status:    t.Status,
		Priority:  t.Priority,
		CreatedAt: t.CreatedAt,
		UpdatedAt: t.UpdatedAt,
	}
	if t.Description.Valid {
		resp.Description = &t.Description.String
	}
	if t.AssigneeID.Valid {
		resp.AssigneeID = &t.AssigneeID.String
	}
	if t.DueDate.Valid {
		resp.DueDate = &t.DueDate.Time
	}
	return resp
}
