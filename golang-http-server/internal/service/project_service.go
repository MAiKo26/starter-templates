package service

import (
	"context"

	"golang-http-server/internal/core"
	"golang-http-server/internal/core/errors"
	"golang-http-server/internal/db/models"
	"golang-http-server/internal/dto"
	"golang-http-server/internal/repository"
)

type ProjectService struct {
	repo *repository.ProjectRepository
}

func NewProjectService(repo *repository.ProjectRepository) *ProjectService {
	return &ProjectService{repo: repo}
}

func (s *ProjectService) List(ctx context.Context, search, status *string, limit, offset int) ([]dto.ProjectResponse, core.PaginationMeta, error) {
	logger := core.GetLogger()
	logger.Debug("listing projects", "search", search, "status", status, "limit", limit, "offset", offset)

	projects, total, err := s.repo.List(ctx, search, status, limit, offset)
	if err != nil {
		return nil, core.PaginationMeta{}, err
	}

	meta := core.BuildPaginationMeta(total, limit, offset)
	responses := make([]dto.ProjectResponse, len(projects))
	for i, p := range projects {
		responses[i] = projectToResponse(p)
	}

	return responses, meta, nil
}

func (s *ProjectService) FindByID(ctx context.Context, id string) (*dto.ProjectResponse, error) {
	logger := core.GetLogger()
	logger.Debug("finding project by ID", "id", id)

	project, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if project == nil {
		return nil, errors.NewNotFoundError("Project")
	}

	response := projectToResponse(*project)
	return &response, nil
}

func (s *ProjectService) Create(ctx context.Context, params dto.ProjectCreate, ownerID *string) (*dto.ProjectResponse, error) {
	logger := core.GetLogger()
	logger.Info("creating project", "name", params.Name)

	if err := params.Validate(); err != nil {
		return nil, err
	}

	project, err := s.repo.Create(ctx, params.Name, params.Description, params.Status, ownerID)
	if err != nil {
		return nil, err
	}

	response := projectToResponse(*project)
	return &response, nil
}

func (s *ProjectService) Update(ctx context.Context, id string, params dto.ProjectUpdate) (*dto.ProjectResponse, error) {
	logger := core.GetLogger()
	logger.Info("updating project", "id", id)

	if err := params.Validate(); err != nil {
		return nil, err
	}

	project, err := s.repo.Update(ctx, id, params.Name, params.Description, params.Status)
	if err != nil {
		return nil, err
	}
	if project == nil {
		return nil, errors.NewNotFoundError("Project")
	}

	response := projectToResponse(*project)
	return &response, nil
}

func (s *ProjectService) Delete(ctx context.Context, id string) error {
	logger := core.GetLogger()
	logger.Info("deleting project", "id", id)

	exists, err := s.repo.Exists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return errors.NewNotFoundError("Project")
	}

	return s.repo.Delete(ctx, id)
}

func (s *ProjectService) HealthCheck(ctx context.Context) bool {
	count, err := s.repo.Count(ctx, "")
	return err == nil && count >= 0
}

func projectToResponse(p models.Project) dto.ProjectResponse {
	resp := dto.ProjectResponse{
		ID:        p.ID,
		Name:      p.Name,
		Status:    p.Status,
		CreatedAt: p.CreatedAt,
		UpdatedAt: p.UpdatedAt,
	}
	if p.Description.Valid {
		resp.Description = &p.Description.String
	}
	if p.OwnerID.Valid {
		resp.OwnerID = &p.OwnerID.String
	}
	return resp
}
