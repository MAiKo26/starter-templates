package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"golang-http-server/internal/db/models"
)

type TaskRepository struct {
	*BaseRepository
}

func NewTaskRepository(db *sql.DB) *TaskRepository {
	return &TaskRepository{
		BaseRepository: NewBaseRepository(db, "tasks"),
	}
}

func (r *TaskRepository) Create(ctx context.Context, projectID, title string, description *string, status, priority string, assigneeID *string, dueDate *time.Time) (*models.Task, error) {
	query := `
		INSERT INTO tasks (id, project_id, title, description, status, priority, assignee_id, due_date, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $8)
		RETURNING id, project_id, title, description, status, priority, assignee_id, due_date, created_at, updated_at
	`

	now := time.Now().UTC()
	var task models.Task
	err := r.db.QueryRowContext(ctx, query, projectID, title, description, status, priority, assigneeID, dueDate, now).Scan(
		&task.ID,
		&task.ProjectID,
		&task.Title,
		&task.Description,
		&task.Status,
		&task.Priority,
		&task.AssigneeID,
		&task.DueDate,
		&task.CreatedAt,
		&task.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create task: %w", err)
	}

	return &task, nil
}

func (r *TaskRepository) GetByID(ctx context.Context, id string) (*models.Task, error) {
	query := `
		SELECT id, project_id, title, description, status, priority, assignee_id, due_date, created_at, updated_at
		FROM tasks WHERE id = $1
	`

	var task models.Task
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&task.ID,
		&task.ProjectID,
		&task.Title,
		&task.Description,
		&task.Status,
		&task.Priority,
		&task.AssigneeID,
		&task.DueDate,
		&task.CreatedAt,
		&task.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get task by id: %w", err)
	}

	return &task, nil
}

func (r *TaskRepository) ListByProject(ctx context.Context, projectID string, status, priority, assigneeID *string, limit, offset int) ([]models.Task, int, error) {
	query := `
		SELECT id, project_id, title, description, status, priority, assignee_id, due_date, created_at, updated_at
		FROM tasks WHERE project_id = $1
	`
	countQuery := `SELECT COUNT(*) FROM tasks WHERE project_id = $1`

	var conditions []string
	var args []any
	args = append(args, projectID)
	argIdx := 2

	if status != nil && *status != "" {
		conditions = append(conditions, fmt.Sprintf("status = $%d", argIdx))
		args = append(args, *status)
		argIdx++
	}
	if priority != nil && *priority != "" {
		conditions = append(conditions, fmt.Sprintf("priority = $%d", argIdx))
		args = append(args, *priority)
		argIdx++
	}
	if assigneeID != nil && *assigneeID != "" {
		conditions = append(conditions, fmt.Sprintf("assignee_id = $%d", argIdx))
		args = append(args, *assigneeID)
		argIdx++
	}

	if len(conditions) > 0 {
		where := " AND " + strings.Join(conditions, " AND ")
		query += where
		countQuery += where
	}

	query += " ORDER BY created_at DESC"
	args = append(args, limit, offset)
	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argIdx, argIdx+1)

	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args[:len(args)-2]...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("count tasks: %w", err)
	}

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list tasks: %w", err)
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var t models.Task
		if err := rows.Scan(&t.ID, &t.ProjectID, &t.Title, &t.Description, &t.Status, &t.Priority, &t.AssigneeID, &t.DueDate, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, 0, fmt.Errorf("scan task: %w", err)
		}
		tasks = append(tasks, t)
	}

	return tasks, total, nil
}

func (r *TaskRepository) Update(ctx context.Context, id string, title *string, description *string, status *string, priority *string, assigneeID *string, dueDate *time.Time) (*models.Task, error) {
	setClauses := []string{"updated_at = $1"}
	var args []any
	args = append(args, time.Now().UTC())
	argIdx := 2

	if title != nil {
		setClauses = append(setClauses, fmt.Sprintf("title = $%d", argIdx))
		args = append(args, *title)
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
	if priority != nil {
		setClauses = append(setClauses, fmt.Sprintf("priority = $%d", argIdx))
		args = append(args, *priority)
		argIdx++
	}
	if assigneeID != nil {
		setClauses = append(setClauses, fmt.Sprintf("assignee_id = $%d", argIdx))
		args = append(args, *assigneeID)
		argIdx++
	}
	if dueDate != nil {
		setClauses = append(setClauses, fmt.Sprintf("due_date = $%d", argIdx))
		args = append(args, *dueDate)
		argIdx++
	}

	args = append(args, id)
	query := fmt.Sprintf(`
		UPDATE tasks SET %s WHERE id = $%d
		RETURNING id, project_id, title, description, status, priority, assignee_id, due_date, created_at, updated_at
	`, strings.Join(setClauses, ", "), argIdx)

	var task models.Task
	err := r.db.QueryRowContext(ctx, query, args...).Scan(
		&task.ID,
		&task.ProjectID,
		&task.Title,
		&task.Description,
		&task.Status,
		&task.Priority,
		&task.AssigneeID,
		&task.DueDate,
		&task.CreatedAt,
		&task.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("update task: %w", err)
	}

	return &task, nil
}
