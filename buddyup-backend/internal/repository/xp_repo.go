package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shivansh/buddyup-backend/internal/models"
)

type XPRepo struct {
	db *pgxpool.Pool
}

func NewXPRepo(db *pgxpool.Pool) *XPRepo {
	return &XPRepo{db: db}
}

// AwardXP inserts an XP event and updates the user's total_xp and level atomically.
// Level formula: level = floor(total_xp / 100) + 1
func (r *XPRepo) AwardXP(ctx context.Context, userID, eventType string, amount int) error {
	if amount <= 0 {
		amount = 10
	}
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `
		INSERT INTO xp_events (user_id, event_type, xp_amount) VALUES ($1, $2, $3)
	`, userID, eventType, amount)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, `
		UPDATE users SET
			total_xp = total_xp + $2,
			level = floor((total_xp + $2) / 100.0)::int + 1,
			updated_at = NOW()
		WHERE id = $1
	`, userID, amount)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (r *XPRepo) GetUserXP(ctx context.Context, userID string) (*models.UserXP, error) {
	var xp models.UserXP
	err := r.db.QueryRow(ctx, `SELECT total_xp, level FROM users WHERE id = $1`, userID).
		Scan(&xp.TotalXP, &xp.Level)
	if err != nil {
		return nil, err
	}

	rows, err := r.db.Query(ctx, `
		SELECT id, user_id, event_type, xp_amount, created_at FROM xp_events
		WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var e models.XPEvent
		if err := rows.Scan(&e.ID, &e.UserID, &e.EventType, &e.XPAmount, &e.CreatedAt); err != nil {
			continue
		}
		xp.RecentEvents = append(xp.RecentEvents, e)
	}
	if xp.RecentEvents == nil {
		xp.RecentEvents = []models.XPEvent{}
	}
	return &xp, nil
}

func (r *XPRepo) GetLeaderboard(ctx context.Context, city string, period string, limit int) ([]models.LeaderboardEntry, error) {
	if limit <= 0 {
		limit = 20
	}
	// city and period filtering is reserved for future implementation;
	// current leaderboard ranks all users by total_xp globally.
	rows, err := r.db.Query(ctx, `
		SELECT u.id, u.display_name, u.total_xp, u.level,
		       RANK() OVER (ORDER BY u.total_xp DESC) AS rank
		FROM users u
		WHERE u.total_xp > 0
		ORDER BY u.total_xp DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []models.LeaderboardEntry
	for rows.Next() {
		var e models.LeaderboardEntry
		if err := rows.Scan(&e.UserID, &e.DisplayName, &e.TotalXP, &e.Level, &e.Rank); err != nil {
			continue
		}
		result = append(result, e)
	}
	if result == nil {
		result = []models.LeaderboardEntry{}
	}
	return result, nil
}
