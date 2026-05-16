package models

import (
	"database/sql"
	"time"
)

type Task struct {
	ID          string         `json:"id"`
	ProjectID   string         `json:"project_id"`
	Title       string         `json:"title"`
	Description sql.NullString `json:"description"`
	Status      string         `json:"status"`
	Priority    string         `json:"priority"`
	AssigneeID  sql.NullString `json:"assignee_id"`
	DueDate     sql.NullTime   `json:"due_date"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}
