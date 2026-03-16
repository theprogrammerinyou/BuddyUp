package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shivansh/buddyup-backend/internal/models"
)

type PersonaRepo struct {
	db *pgxpool.Pool
}

func NewPersonaRepo(db *pgxpool.Pool) *PersonaRepo {
	return &PersonaRepo{db: db}
}

func (r *PersonaRepo) ListPersonas(ctx context.Context, userID string) ([]models.Persona, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, user_id, display_name, COALESCE(bio,''), COALESCE(interests,'{}'), COALESCE(vibe_tags,'{}'), is_active, created_at
		FROM personas WHERE user_id = $1 ORDER BY created_at ASC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []models.Persona
	for rows.Next() {
		var p models.Persona
		if err := rows.Scan(&p.ID, &p.UserID, &p.DisplayName, &p.Bio, &p.Interests, &p.VibeTags, &p.IsActive, &p.CreatedAt); err != nil {
			continue
		}
		result = append(result, p)
	}
	if result == nil {
		result = []models.Persona{}
	}
	return result, nil
}

func (r *PersonaRepo) CreatePersona(ctx context.Context, userID string, req models.CreatePersonaRequest) (*models.Persona, error) {
	var p models.Persona
	err := r.db.QueryRow(ctx, `
		INSERT INTO personas (user_id, display_name, bio, interests, vibe_tags)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, user_id, display_name, COALESCE(bio,''), COALESCE(interests,'{}'), COALESCE(vibe_tags,'{}'), is_active, created_at
	`, userID, req.DisplayName, req.Bio, req.Interests, req.VibeTags).Scan(
		&p.ID, &p.UserID, &p.DisplayName, &p.Bio, &p.Interests, &p.VibeTags, &p.IsActive, &p.CreatedAt,
	)
	return &p, err
}

func (r *PersonaRepo) ActivatePersona(ctx context.Context, personaID, userID string) error {
	var ownerID string
	err := r.db.QueryRow(ctx, `SELECT user_id FROM personas WHERE id = $1`, personaID).Scan(&ownerID)
	if err != nil || ownerID != userID {
		return errors.New("persona not found")
	}
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	_, err = tx.Exec(ctx, `UPDATE personas SET is_active = FALSE WHERE user_id = $1`, userID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `UPDATE personas SET is_active = TRUE WHERE id = $1`, personaID)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}
