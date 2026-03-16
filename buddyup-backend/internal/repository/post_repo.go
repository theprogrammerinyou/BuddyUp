package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shivansh/buddyup-backend/internal/models"
)

type PostRepo struct {
	db *pgxpool.Pool
}

func NewPostRepo(db *pgxpool.Pool) *PostRepo {
	return &PostRepo{db: db}
}

func (r *PostRepo) CreatePost(ctx context.Context, authorID string, req models.CreatePostRequest) (*models.Post, error) {
	expiresHours := req.ExpiresHours
	if expiresHours <= 0 {
		expiresHours = 168 // 7 days
	}
	expiresAt := time.Now().Add(time.Duration(expiresHours) * time.Hour)

	var p models.Post
	err := r.db.QueryRow(ctx, `
		INSERT INTO posts (author_id, content, activity_type, latitude, longitude, event_time, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, author_id, content, COALESCE(activity_type,''), latitude, longitude, event_time,
		          is_active, expires_at, created_at
	`, authorID, req.Content, req.ActivityType, req.Latitude, req.Longitude, req.EventTime, expiresAt).Scan(
		&p.ID, &p.AuthorID, &p.Content, &p.ActivityType, &p.Latitude, &p.Longitude, &p.EventTime,
		&p.IsActive, &p.ExpiresAt, &p.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PostRepo) ListPosts(ctx context.Context, activityType string, lat, lng, radiusKm float64, limit, offset int) ([]models.Post, error) {
	if limit <= 0 {
		limit = 20
	}

	args := []interface{}{}
	conditions := []string{"p.is_active = TRUE", "(p.expires_at IS NULL OR p.expires_at > NOW())"}

	if activityType != "" {
		args = append(args, activityType)
		conditions = append(conditions, fmt.Sprintf("p.activity_type = $%d", len(args)))
	}

	if lat != 0 && lng != 0 && radiusKm > 0 {
		degreeRadius := radiusKm / 111.0
		args = append(args, lat, lng, degreeRadius)
		latIdx := len(args) - 2
		lngIdx := len(args) - 1
		radIdx := len(args)
		conditions = append(conditions, fmt.Sprintf(
			"p.latitude IS NOT NULL AND p.latitude BETWEEN $%d - $%d AND $%d + $%d AND p.longitude BETWEEN $%d - ($%d / cos(radians($%d))) AND $%d + ($%d / cos(radians($%d)))",
			latIdx, radIdx, latIdx, radIdx,
			lngIdx, radIdx, latIdx,
			lngIdx, radIdx, latIdx,
		))
	}

	where := ""
	for i, c := range conditions {
		if i == 0 {
			where = "WHERE " + c
		} else {
			where += " AND " + c
		}
	}

	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT p.id, p.author_id, p.content, COALESCE(p.activity_type,''), p.latitude, p.longitude,
		       p.event_time, p.is_active, p.expires_at, p.created_at,
		       (SELECT COUNT(*) FROM post_responses pr WHERE pr.post_id = p.id) AS response_count,
		       u.id, u.display_name, u.bio, u.avatar_character_id, u.interests, u.created_at
		FROM posts p
		JOIN users u ON u.id = p.author_id
		%s
		ORDER BY p.created_at DESC
		LIMIT $%d OFFSET $%d
	`, where, len(args)-1, len(args)), args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.Post
	for rows.Next() {
		var p models.Post
		var author models.User
		if err := rows.Scan(
			&p.ID, &p.AuthorID, &p.Content, &p.ActivityType, &p.Latitude, &p.Longitude,
			&p.EventTime, &p.IsActive, &p.ExpiresAt, &p.CreatedAt,
			&p.ResponseCount,
			&author.ID, &author.DisplayName, &author.Bio, &author.AvatarCharacterID, &author.Interests, &author.CreatedAt,
		); err != nil {
			return nil, err
		}
		p.Author = &author
		result = append(result, p)
	}
	return result, nil
}

func (r *PostRepo) GetPost(ctx context.Context, postID string) (*models.Post, error) {
	var p models.Post
	var author models.User
	err := r.db.QueryRow(ctx, `
		SELECT p.id, p.author_id, p.content, COALESCE(p.activity_type,''), p.latitude, p.longitude,
		       p.event_time, p.is_active, p.expires_at, p.created_at,
		       (SELECT COUNT(*) FROM post_responses pr WHERE pr.post_id = p.id) AS response_count,
		       u.id, u.display_name, u.bio, u.avatar_character_id, u.interests, u.created_at
		FROM posts p
		JOIN users u ON u.id = p.author_id
		WHERE p.id = $1
	`, postID).Scan(
		&p.ID, &p.AuthorID, &p.Content, &p.ActivityType, &p.Latitude, &p.Longitude,
		&p.EventTime, &p.IsActive, &p.ExpiresAt, &p.CreatedAt,
		&p.ResponseCount,
		&author.ID, &author.DisplayName, &author.Bio, &author.AvatarCharacterID, &author.Interests, &author.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	p.Author = &author
	return &p, nil
}

func (r *PostRepo) RespondToPost(ctx context.Context, postID, responderID, message string) (*models.PostResponse, error) {
	var pr models.PostResponse
	err := r.db.QueryRow(ctx, `
		INSERT INTO post_responses (post_id, responder_id, message)
		VALUES ($1, $2, $3)
		RETURNING id, post_id, responder_id, message, created_at
	`, postID, responderID, message).Scan(
		&pr.ID, &pr.PostID, &pr.ResponderID, &pr.Message, &pr.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &pr, nil
}

func (r *PostRepo) GetPostResponses(ctx context.Context, postID string) ([]models.PostResponse, error) {
	rows, err := r.db.Query(ctx, `
		SELECT pr.id, pr.post_id, pr.responder_id, pr.message, pr.created_at,
		       u.id, u.display_name, u.bio, u.avatar_character_id, u.interests, u.created_at
		FROM post_responses pr
		JOIN users u ON u.id = pr.responder_id
		WHERE pr.post_id = $1
		ORDER BY pr.created_at ASC
	`, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.PostResponse
	for rows.Next() {
		var pr models.PostResponse
		var responder models.User
		if err := rows.Scan(
			&pr.ID, &pr.PostID, &pr.ResponderID, &pr.Message, &pr.CreatedAt,
			&responder.ID, &responder.DisplayName, &responder.Bio, &responder.AvatarCharacterID, &responder.Interests, &responder.CreatedAt,
		); err != nil {
			return nil, err
		}
		pr.Responder = &responder
		result = append(result, pr)
	}
	return result, nil
}

func (r *PostRepo) DeletePost(ctx context.Context, postID, requesterID string) error {
	result, err := r.db.Exec(ctx, `
		UPDATE posts SET is_active = FALSE, updated_at = NOW()
		WHERE id = $1 AND author_id = $2
	`, postID, requesterID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("post not found or permission denied")
	}
	return nil
}

func (r *PostRepo) GetUserPosts(ctx context.Context, userID string) ([]models.Post, error) {
	rows, err := r.db.Query(ctx, `
		SELECT p.id, p.author_id, p.content, COALESCE(p.activity_type,''), p.latitude, p.longitude,
		       p.event_time, p.is_active, p.expires_at, p.created_at,
		       (SELECT COUNT(*) FROM post_responses pr WHERE pr.post_id = p.id) AS response_count
		FROM posts p
		WHERE p.author_id = $1 AND p.is_active = TRUE
		ORDER BY p.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.Post
	for rows.Next() {
		var p models.Post
		if err := rows.Scan(
			&p.ID, &p.AuthorID, &p.Content, &p.ActivityType, &p.Latitude, &p.Longitude,
			&p.EventTime, &p.IsActive, &p.ExpiresAt, &p.CreatedAt,
			&p.ResponseCount,
		); err != nil {
			return nil, err
		}
		result = append(result, p)
	}
	return result, nil
}
