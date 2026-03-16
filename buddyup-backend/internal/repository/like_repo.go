package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shivansh/buddyup-backend/internal/models"
)

type LikeRepo struct {
	db *pgxpool.Pool
}

func NewLikeRepo(db *pgxpool.Pool) *LikeRepo {
	return &LikeRepo{db: db}
}

// Like records that likerID liked likedID.
// Returns (isMatch, matchID, error).
func (r *LikeRepo) Like(ctx context.Context, likerID, likedID string) (bool, string, error) {
	// Insert the like (ignore duplicate)
	_, err := r.db.Exec(ctx, `
		INSERT INTO likes (liker_id, liked_id) VALUES ($1, $2)
		ON CONFLICT DO NOTHING
	`, likerID, likedID)
	if err != nil {
		return false, "", err
	}

	// Check for mutual like
	var exists bool
	err = r.db.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM likes WHERE liker_id = $1 AND liked_id = $2)
	`, likedID, likerID).Scan(&exists)
	if err != nil || !exists {
		return false, "", err
	}

	// Create match (ensure deterministic order for the unique constraint)
	u1, u2 := likerID, likedID
	if u1 > u2 {
		u1, u2 = u2, u1
	}
	var matchID string
	err = r.db.QueryRow(ctx, `
		INSERT INTO matches (user1_id, user2_id) VALUES ($1, $2)
		ON CONFLICT (user1_id, user2_id) DO UPDATE SET user1_id = EXCLUDED.user1_id
		RETURNING id
	`, u1, u2).Scan(&matchID)
	if err != nil {
		return false, "", err
	}
	return true, matchID, nil
}

// WhoLikedMe returns users who liked the given user but are not yet matched with them
func (r *LikeRepo) WhoLikedMe(ctx context.Context, userID string) ([]models.User, error) {
	rows, err := r.db.Query(ctx, `
		SELECT u.id, u.display_name, u.bio, u.avatar_character_id, u.interests,
		       c.id, c.name, c.type, c.franchise, c.image_url
		FROM likes l
		JOIN users u ON u.id = l.liker_id
		LEFT JOIN characters c ON c.id = u.avatar_character_id
		WHERE l.liked_id = $1
		  AND NOT EXISTS (
		     SELECT 1 FROM matches m
		     WHERE (m.user1_id = $1 AND m.user2_id = l.liker_id)
		        OR (m.user2_id = $1 AND m.user1_id = l.liker_id)
		  )
		ORDER BY l.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanUsers(rows)
}

// Matches returns the matched users for a given user
func (r *LikeRepo) Matches(ctx context.Context, userID string) ([]models.Match, error) {
	rows, err := r.db.Query(ctx, `
		SELECT m.id, m.user1_id, m.user2_id, m.created_at,
		       u.id, u.display_name, u.bio, u.avatar_character_id, u.interests,
		       c.id, c.name, c.type, c.franchise, c.image_url
		FROM matches m
		JOIN users u ON u.id = CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END
		LEFT JOIN characters c ON c.id = u.avatar_character_id
		WHERE m.user1_id = $1 OR m.user2_id = $1
		ORDER BY m.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matches []models.Match
	for rows.Next() {
		var m models.Match
		var u models.User
		var char models.Character
		var cID *int
		var cName, cType, cFranchise, cImageURL *string

		err = rows.Scan(
			&m.ID, &m.User1ID, &m.User2ID, &m.CreatedAt,
			&u.ID, &u.DisplayName, &u.Bio, &u.AvatarCharacterID, &u.Interests,
			&cID, &cName, &cType, &cFranchise, &cImageURL,
		)
		if err != nil {
			return nil, err
		}
		if cID != nil {
			char.ID = *cID
			char.Name = *cName
			char.Type = *cType
			char.Franchise = *cFranchise
			char.ImageURL = *cImageURL
			u.Avatar = &char
		}
		m.OtherUser = &u
		matches = append(matches, m)
	}
	return matches, nil
}

// VerifyMatch checks that a match exists and involves userID
func (r *LikeRepo) VerifyMatch(ctx context.Context, matchID, userID string) error {
	var exists bool
	err := r.db.QueryRow(ctx, `
		SELECT EXISTS(
		  SELECT 1 FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
		)
	`, matchID, userID).Scan(&exists)
	if err != nil {
		return err
	}
	if !exists {
		return errors.New("match not found or access denied")
	}
	return nil
}

func scanUsers(rows pgx.Rows) ([]models.User, error) {
	var users []models.User
	for rows.Next() {
		var u models.User
		var char models.Character
		var cID *int
		var cName, cType, cFranchise, cImageURL *string
		err := rows.Scan(
			&u.ID, &u.DisplayName, &u.Bio, &u.AvatarCharacterID, &u.Interests,
			&cID, &cName, &cType, &cFranchise, &cImageURL,
		)
		if err != nil {
			return nil, err
		}
		if cID != nil {
			char.ID = *cID
			char.Name = *cName
			char.Type = *cType
			char.Franchise = *cFranchise
			char.ImageURL = *cImageURL
			u.Avatar = &char
		}
		users = append(users, u)
	}
	return users, nil
}
