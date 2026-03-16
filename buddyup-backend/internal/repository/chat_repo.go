package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shivansh/buddyup-backend/internal/models"
)

type ChatRepo struct {
	db *pgxpool.Pool
}

func NewChatRepo(db *pgxpool.Pool) *ChatRepo {
	return &ChatRepo{db: db}
}

func (r *ChatRepo) SaveMessage(ctx context.Context, matchID, senderID, content string) (*models.Message, error) {
	var msg models.Message
	err := r.db.QueryRow(ctx, `
		INSERT INTO messages (match_id, sender_id, content)
		VALUES ($1, $2, $3)
		RETURNING id, match_id, sender_id, content, created_at
	`, matchID, senderID, content).Scan(
		&msg.ID, &msg.MatchID, &msg.SenderID, &msg.Content, &msg.CreatedAt,
	)
	return &msg, err
}

func (r *ChatRepo) GetHistory(ctx context.Context, matchID string, limit int) ([]models.Message, error) {
	if limit <= 0 {
		limit = 50
	}
	rows, err := r.db.Query(ctx, `
		SELECT id, match_id, sender_id, content, created_at
		FROM messages
		WHERE match_id = $1
		ORDER BY created_at DESC
		LIMIT $2
	`, matchID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var msgs []models.Message
	for rows.Next() {
		var m models.Message
		if err := rows.Scan(&m.ID, &m.MatchID, &m.SenderID, &m.Content, &m.CreatedAt); err != nil {
			return nil, err
		}
		msgs = append([]models.Message{m}, msgs...) // reverse to chronological
	}
	return msgs, nil
}
