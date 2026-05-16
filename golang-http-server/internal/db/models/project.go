package models

import (
	"database/sql"
	"time"
)

type Project struct {
	ID          string         `json:"id"`
	Name        string         `json:"name"`
	Description sql.NullString `json:"description"`
	Status      string         `json:"status"`
	OwnerID     sql.NullString `json:"owner_id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}
