package dto

import (
	"time"

	"golang-http-server/internal/core"
)

type TaskResponse struct {
	ID          string     `json:"id"`
	ProjectID   string     `json:"project_id"`
	Title       string     `json:"title"`
	Description *string    `json:"description"`
	Status      string     `json:"status"`
	Priority    string     `json:"priority"`
	AssigneeID  *string    `json:"assignee_id"`
	DueDate     *time.Time `json:"due_date"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type TaskCreate struct {
	Title       string     `json:"title"`
	Description *string    `json:"description"`
	Status      string     `json:"status"`
	Priority    string     `json:"priority"`
	AssigneeID  *string    `json:"assignee_id"`
	DueDate     *time.Time `json:"due_date"`
}

func (t *TaskCreate) Validate() error {
	if t.Title == "" {
		return &ValidationError{Field: "title", Message: "title is required"}
	}
	if len(t.Title) > 255 {
		return &ValidationError{Field: "title", Message: "title must be 255 characters or less"}
	}
	if t.Description != nil && len(*t.Description) > 2000 {
		return &ValidationError{Field: "description", Message: "description must be 2000 characters or less"}
	}
	if t.Status == "" {
		t.Status = "todo"
	}
	if t.Priority == "" {
		t.Priority = "medium"
	}
	return nil
}

type TaskUpdate struct {
	Title       *string    `json:"title"`
	Description *string    `json:"description"`
	Status      *string    `json:"status"`
	Priority    *string    `json:"priority"`
	AssigneeID  *string    `json:"assignee_id"`
	DueDate     *time.Time `json:"due_date"`
}

func (t *TaskUpdate) Validate() error {
	if t.Title != nil {
		if *t.Title == "" {
			return &ValidationError{Field: "title", Message: "title cannot be empty"}
		}
		if len(*t.Title) > 255 {
			return &ValidationError{Field: "title", Message: "title must be 255 characters or less"}
		}
	}
	if t.Description != nil && len(*t.Description) > 2000 {
		return &ValidationError{Field: "description", Message: "description must be 2000 characters or less"}
	}
	return nil
}

type TaskListQuery struct {
	core.PaginationQuery
	Status     *string `json:"status"`
	Priority   *string `json:"priority"`
	AssigneeID *string `json:"assignee_id"`
}

type TaskListResponse struct {
	Data []TaskResponse      `json:"data"`
	Meta core.PaginationMeta `json:"meta"`
}
