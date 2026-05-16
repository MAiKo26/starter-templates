package models

import (
	"database/sql"
	"time"
)

type User struct {
	ID           string         `json:"id"`
	Name         sql.NullString `json:"name"`
	Email        string         `json:"email"`
	EmailVerified bool          `json:"email_verified"`
	Image        sql.NullString `json:"image"`
	Role         string         `json:"role"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
}

type Session struct {
	ID         string         `json:"id"`
	ExpiresAt  time.Time      `json:"expires_at"`
	Token      string         `json:"token"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	IPAddress  sql.NullString `json:"ip_address"`
	UserAgent  sql.NullString `json:"user_agent"`
	UserID     string         `json:"user_id"`
}

type Account struct {
	ID                    string         `json:"id"`
	AccountID             string         `json:"account_id"`
	ProviderID            string         `json:"provider_id"`
	UserID                string         `json:"user_id"`
	AccessToken           sql.NullString `json:"access_token"`
	RefreshToken          sql.NullString `json:"refresh_token"`
	IDToken               sql.NullString `json:"id_token"`
	AccessTokenExpiresAt  sql.NullTime   `json:"access_token_expires_at"`
	RefreshTokenExpiresAt sql.NullTime   `json:"refresh_token_expires_at"`
	Scope                 sql.NullString `json:"scope"`
	Password              sql.NullString `json:"password"`
	CreatedAt             time.Time      `json:"created_at"`
	UpdatedAt             time.Time      `json:"updated_at"`
}

type Verification struct {
	ID         string    `json:"id"`
	Identifier string    `json:"identifier"`
	Value      string    `json:"value"`
	ExpiresAt  time.Time `json:"expires_at"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
