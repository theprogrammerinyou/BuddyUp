package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shivansh/buddyup-backend/internal/models"
)

type CharacterRepo struct {
	db *pgxpool.Pool
}

func NewCharacterRepo(db *pgxpool.Pool) *CharacterRepo {
	return &CharacterRepo{db: db}
}

func (r *CharacterRepo) List(ctx context.Context, charType, search string) ([]models.Character, error) {
	query := `SELECT id, name, type, franchise, image_url FROM characters WHERE 1=1`
	var args []interface{}

	if charType != "" {
		args = append(args, charType)
		query += fmt.Sprintf(` AND type = $%d`, len(args))
	}
	if search != "" {
		args = append(args, "%"+search+"%")
		n := len(args)
		query += fmt.Sprintf(` AND (name ILIKE $%d OR franchise ILIKE $%d)`, n, n)
	}
	query += ` ORDER BY franchise, name`

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var chars []models.Character
	for rows.Next() {
		var c models.Character
		if err := rows.Scan(&c.ID, &c.Name, &c.Type, &c.Franchise, &c.ImageURL); err != nil {
			return nil, err
		}
		chars = append(chars, c)
	}
	return chars, nil
}
