package repository

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shivansh/buddyup-backend/internal/models"
)

// ErrDailySuperConnectLimitReached is returned when the user has exhausted their daily super connects.
var ErrDailySuperConnectLimitReached = errors.New("daily super connect limit reached")

type SocialRepo struct {
	db *pgxpool.Pool
}

func NewSocialRepo(db *pgxpool.Pool) *SocialRepo {
	return &SocialRepo{db: db}
}

func (r *SocialRepo) BlockUser(ctx context.Context, blockerID, blockedID string) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO blocked_users (blocker_id, blocked_id) VALUES ($1, $2)
		ON CONFLICT DO NOTHING
	`, blockerID, blockedID)
	return err
}

func (r *SocialRepo) UnblockUser(ctx context.Context, blockerID, blockedID string) error {
	_, err := r.db.Exec(ctx, `
		DELETE FROM blocked_users WHERE blocker_id = $1 AND blocked_id = $2
	`, blockerID, blockedID)
	return err
}

func (r *SocialRepo) IsBlocked(ctx context.Context, userID, otherID string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM blocked_users
			WHERE (blocker_id = $1 AND blocked_id = $2)
			   OR (blocker_id = $2 AND blocked_id = $1)
		)
	`, userID, otherID).Scan(&exists)
	return exists, err
}

func (r *SocialRepo) GetBlockedUsers(ctx context.Context, userID string) ([]models.User, error) {
	rows, err := r.db.Query(ctx, `
		SELECT u.id, u.display_name, u.bio, u.avatar_character_id, u.interests, u.created_at
		FROM users u
		JOIN blocked_users b ON b.blocked_id = u.id
		WHERE b.blocker_id = $1
		ORDER BY b.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.DisplayName, &u.Bio, &u.AvatarCharacterID, &u.Interests, &u.CreatedAt); err != nil {
			return nil, err
		}
		result = append(result, u)
	}
	return result, nil
}

func (r *SocialRepo) ReportUser(ctx context.Context, reporterID, reportedID, reason, details string) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO reports (reporter_id, reported_id, reason, details) VALUES ($1, $2, $3, $4)
	`, reporterID, reportedID, reason, details)
	return err
}

func (r *SocialRepo) GetDailySuperConnectCount(ctx context.Context, userID string) (int, error) {
	var count int
	err := r.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM super_connects
		WHERE sender_id = $1 AND created_at >= CURRENT_DATE
	`, userID).Scan(&count)
	return count, err
}

func (r *SocialRepo) SendSuperConnect(ctx context.Context, senderID, receiverID, message string) (*models.SuperConnect, error) {
	count, err := r.GetDailySuperConnectCount(ctx, senderID)
	if err != nil {
		return nil, err
	}
	if count >= 5 {
		return nil, ErrDailySuperConnectLimitReached
	}

	var sc models.SuperConnect
	err = r.db.QueryRow(ctx, `
		INSERT INTO super_connects (sender_id, receiver_id, message)
		VALUES ($1, $2, $3)
		RETURNING id, sender_id, receiver_id, COALESCE(message,''), seen, created_at
	`, senderID, receiverID, message).Scan(
		&sc.ID, &sc.SenderID, &sc.ReceiverID, &sc.Message, &sc.Seen, &sc.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &sc, nil
}

func (r *SocialRepo) GetSuperConnectsReceived(ctx context.Context, userID string) ([]models.SuperConnect, error) {
	rows, err := r.db.Query(ctx, `
		SELECT sc.id, sc.sender_id, sc.receiver_id, COALESCE(sc.message,''), sc.seen, sc.created_at,
		       u.id, u.display_name, u.bio, u.avatar_character_id, u.interests, u.created_at
		FROM super_connects sc
		JOIN users u ON u.id = sc.sender_id
		WHERE sc.receiver_id = $1
		ORDER BY sc.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.SuperConnect
	for rows.Next() {
		var sc models.SuperConnect
		var sender models.User
		if err := rows.Scan(
			&sc.ID, &sc.SenderID, &sc.ReceiverID, &sc.Message, &sc.Seen, &sc.CreatedAt,
			&sender.ID, &sender.DisplayName, &sender.Bio, &sender.AvatarCharacterID, &sender.Interests, &sender.CreatedAt,
		); err != nil {
			return nil, err
		}
		sc.Sender = &sender
		result = append(result, sc)
	}
	return result, nil
}

func (r *SocialRepo) SetGhostMode(ctx context.Context, userID string, isDiscoverable bool) error {
	_, err := r.db.Exec(ctx, `
		UPDATE users SET is_discoverable = $2, updated_at = NOW() WHERE id = $1
	`, userID, isDiscoverable)
	return err
}

func (r *SocialRepo) SetVibeTags(ctx context.Context, userID string, tags []string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE users SET vibe_tags = $2, updated_at = NOW() WHERE id = $1
	`, userID, tags)
	return err
}

func (r *SocialRepo) SetTravelMode(ctx context.Context, userID string, lat, lng float64, expiresAt time.Time) error {
	_, err := r.db.Exec(ctx, `
		UPDATE users SET travel_latitude = $2, travel_longitude = $3, travel_expires_at = $4, updated_at = NOW()
		WHERE id = $1
	`, userID, lat, lng, expiresAt)
	return err
}

func (r *SocialRepo) ClearTravelMode(ctx context.Context, userID string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE users SET travel_latitude = NULL, travel_longitude = NULL, travel_expires_at = NULL, updated_at = NOW()
		WHERE id = $1
	`, userID)
	return err
}
