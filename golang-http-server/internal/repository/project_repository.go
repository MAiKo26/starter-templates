package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"golang-http-server/internal/db/models"
)

type ProjectRepository struct {
	*BaseRepository
}

func NewProjectRepository(db *sql.DB) *ProjectRepository {
	return &ProjectRepository{
		BaseRepository: NewBaseRepository(db, "projects"),
	}
}

func (r *ProjectRepository) Create(ctx context.Context, name string, description *string, status string, ownerID *string) (*models.Project, error) {
	query := `
		INSERT INTO projects (id, name, description, status, owner_id, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $5)
		RETURNING id, name, description, status, owner_id, created_at, updated_at
	`

	now := time.Now().UTC()
	var project models.Project
	err := r.db.QueryRowContext(ctx, query, name, description, status, ownerID, now).Scan(
		&project.ID,
		&project.Name,
		&project.Description,
		&project.Status,
		&project.OwnerID,
		&project.CreatedAt,
		&project.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create project: %w", err)
	}

	return &project, nil
}

func (r *ProjectRepository) GetByID(ctx context.Context, id string) (*models.Project, error) {
	query := `
		SELECT id, name, description, status, owner_id, created_at, updated_at
		FROM projects WHERE id = $1
	`

	var project models.Project
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&project.ID,
		&project.Name,
		&project.Description,
		&project.Status,
		&project.OwnerID,
		&project.CreatedAt,
		&project.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get project by id: %w", err)
	}

	return &project, nil
}

func (r *ProjectRepository) List(ctx context.Context, search *string, status *string, limit, offset int) ([]models.Project, int, error) {
	query := `
		SELECT id, name, description, status, owner_id, created_at, updated_at
		FROM projects
	`
	countQuery := `SELECT COUNT(*) FROM projects`

	var conditions []string
	var args []any
	argIdx := 1

	if search != nil && *search != "" {
		conditions = append(conditions, fmt.Sprintf("name ILIKE $%d", argIdx))
		args = append(args, "%"+*search+"%")
		argIdx++
	}
	if status != nil && *status != "" {
		conditions = append(conditions, fmt.Sprintf("status = $%d", argIdx))
		args = append(args, *status)
		argIdx++
	}

	if len(conditions) > 0 {
		where := " WHERE " + strings.Join(conditions, " AND ")
		query += where
		countQuery += where
	}

	query += " ORDER BY created_at DESC"
	args = append(args, limit, offset)
	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argIdx, argIdx+1)

	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args[:len(args)-2]...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("count projects: %w", err)
	}

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list projects: %w", err)
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		var p models.Project
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Status, &p.OwnerID, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, 0, fmt.Errorf("scan project: %w", err)
		}
		projects = append(projects, p)
	}

	return projects, total, nil
}

func (r *ProjectRepository) Update(ctx context.Context, id string, name *string, description *string, status *string) (*models.Project, error) {
	setClauses := []string{"updated_at = $1"}
	var args []any
	args = append(args, time.Now().UTC())
	argIdx := 2

	if name != nil {
		setClauses = append(setClauses, fmt.Sprintf("name = $%d", argIdx))
		args = append(args, *name)
		argIdx++
	}
	if description != nil {
		setClauses = append(setClauses, fmt.Sprintf("description = $%d", argIdx))
		args = append(args, *description)
		argIdx++
	}
	if status != nil {
		setClauses = append(setClauses, fmt.Sprintf("status = $%d", argIdx))
		args = append(args, *status)
		argIdx++
	}

	args = append(args, id)
	query := fmt.Sprintf(`
		UPDATE projects SET %s WHERE id = $%d
		RETURNING id, name, description, status, owner_id, created_at, updated_at
	`, strings.Join(setClauses, ", "), argIdx)

	var project models.Project
	err := r.db.QueryRowContext(ctx, query, args...).Scan(
		&project.ID,
		&project.Name,
		&project.Description,
		&project.Status,
		&project.OwnerID,
		&project.CreatedAt,
		&project.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("update project: %w", err)
	}

	return &project, nil
}
