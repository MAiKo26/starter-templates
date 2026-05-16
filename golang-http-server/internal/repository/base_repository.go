package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type BaseRepository struct {
	db    *sql.DB
	table string
}

func NewBaseRepository(db *sql.DB, table string) *BaseRepository {
	return &BaseRepository{db: db, table: table}
}

func (r *BaseRepository) Count(ctx context.Context, whereClause string, args ...any) (int, error) {
	query := fmt.Sprintf("SELECT COUNT(*) FROM %s", r.table)
	if whereClause != "" {
		query += " WHERE " + whereClause
	}

	var count int
	err := r.db.QueryRowContext(ctx, query, args...).Scan(&count)
	return count, err
}

func (r *BaseRepository) Exists(ctx context.Context, id string) (bool, error) {
	query := fmt.Sprintf("SELECT EXISTS(SELECT 1 FROM %s WHERE id = $1)", r.table)

	var exists bool
	err := r.db.QueryRowContext(ctx, query, id).Scan(&exists)
	return exists, err
}

func (r *BaseRepository) Delete(ctx context.Context, id string) error {
	query := fmt.Sprintf("DELETE FROM %s WHERE id = $1", r.table)

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("record not found")
	}

	return nil
}

func (r *BaseRepository) UpdateTimestamp(ctx context.Context, id string) error {
	query := fmt.Sprintf("UPDATE %s SET updated_at = $1 WHERE id = $2", r.table)
	_, err := r.db.ExecContext(ctx, query, time.Now().UTC(), id)
	return err
}
