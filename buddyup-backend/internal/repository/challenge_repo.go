package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shivansh/buddyup-backend/internal/models"
)

var ErrChallengeAlreadyCompleted = errors.New("challenge already completed")

type ChallengeRepo struct {
	db *pgxpool.Pool
}

func NewChallengeRepo(db *pgxpool.Pool) *ChallengeRepo {
	return &ChallengeRepo{db: db}
}

func (r *ChallengeRepo) ListActiveChallenges(ctx context.Context, userID string) ([]models.Challenge, error) {
	rows, err := r.db.Query(ctx, `
		SELECT c.id, c.title, COALESCE(c.description,''), c.xp_reward, c.ends_at, c.created_at,
		       (uc.completed_at IS NOT NULL) AS completed
		FROM challenges c
		LEFT JOIN user_challenges uc ON uc.challenge_id = c.id AND uc.user_id = $1
		WHERE (c.ends_at IS NULL OR c.ends_at > NOW())
		ORDER BY c.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []models.Challenge
	for rows.Next() {
		var ch models.Challenge
		if err := rows.Scan(&ch.ID, &ch.Title, &ch.Description, &ch.XPReward, &ch.EndsAt, &ch.CreatedAt, &ch.Completed); err != nil {
			continue
		}
		result = append(result, ch)
	}
	if result == nil {
		result = []models.Challenge{}
	}
	return result, nil
}

func (r *ChallengeRepo) CompleteChallenge(ctx context.Context, challengeID, userID string) (int, error) {
	var count int
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM user_challenges WHERE challenge_id = $1 AND user_id = $2 AND completed_at IS NOT NULL`, challengeID, userID).Scan(&count)
	if count > 0 {
		return 0, ErrChallengeAlreadyCompleted
	}

	var xpReward int
	err := r.db.QueryRow(ctx, `SELECT xp_reward FROM challenges WHERE id = $1 AND (ends_at IS NULL OR ends_at > NOW())`, challengeID).Scan(&xpReward)
	if err != nil {
		return 0, errors.New("challenge not found or expired")
	}

	_, err = r.db.Exec(ctx, `
		INSERT INTO user_challenges (challenge_id, user_id, completed_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (challenge_id, user_id) DO UPDATE SET completed_at = NOW()
	`, challengeID, userID)
	return xpReward, err
}
