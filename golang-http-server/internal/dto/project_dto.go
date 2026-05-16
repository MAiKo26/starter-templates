package dto

import (
	"time"

	"golang-http-server/internal/core"
)

type ProjectResponse struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description *string    `json:"description"`
	Status      string     `json:"status"`
	OwnerID     *string    `json:"owner_id"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type ProjectCreate struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
	Status      string  `json:"status"`
}

func (p *ProjectCreate) Validate() error {
	if p.Name == "" {
		return &ValidationError{Field: "name", Message: "name is required"}
	}
	if len(p.Name) > 255 {
		return &ValidationError{Field: "name", Message: "name must be 255 characters or less"}
	}
	if p.Description != nil && len(*p.Description) > 1000 {
		return &ValidationError{Field: "description", Message: "description must be 1000 characters or less"}
	}
	if p.Status == "" {
		p.Status = "active"
	}
	return nil
}

type ProjectUpdate struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	Status      *string `json:"status"`
}

func (p *ProjectUpdate) Validate() error {
	if p.Name != nil {
		if *p.Name == "" {
			return &ValidationError{Field: "name", Message: "name cannot be empty"}
		}
		if len(*p.Name) > 255 {
			return &ValidationError{Field: "name", Message: "name must be 255 characters or less"}
		}
	}
	if p.Description != nil && len(*p.Description) > 1000 {
		return &ValidationError{Field: "description", Message: "description must be 1000 characters or less"}
	}
	return nil
}

type ProjectListQuery struct {
	core.PaginationQuery
	Search *string `json:"search"`
	Status *string `json:"status"`
}

type ProjectListResponse struct {
	Data []ProjectResponse   `json:"data"`
	Meta core.PaginationMeta `json:"meta"`
}
