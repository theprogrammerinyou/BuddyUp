package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PassRepo struct {
	db *pgxpool.Pool
}

func NewPassRepo(db *pgxpool.Pool) *PassRepo {
	return &PassRepo{db: db}
}

// Pass records that passerID passed on passedID.
func (r *PassRepo) Pass(ctx context.Context, passerID, passedID string) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO passes (passer_id, passed_id) VALUES ($1, $2)
		ON CONFLICT DO NOTHING
	`, passerID, passedID)
	return err
}
