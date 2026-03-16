package repository

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shivansh/buddyup-backend/internal/models"
)

type GroupRepo struct {
	db *pgxpool.Pool
}

func NewGroupRepo(db *pgxpool.Pool) *GroupRepo {
	return &GroupRepo{db: db}
}

func (r *GroupRepo) CreateGroup(ctx context.Context, creatorID string, req models.CreateGroupRequest) (*models.Group, error) {
	maxMembers := req.MaxMembers
	if maxMembers <= 0 {
		maxMembers = 50
	}

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	var g models.Group
	err = tx.QueryRow(ctx, `
		INSERT INTO groups (name, description, activity_type, creator_id, cover_image_url, max_members, is_public)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, name, description, activity_type, creator_id, COALESCE(cover_image_url,''), max_members, is_public, created_at
	`, req.Name, req.Description, req.ActivityType, creatorID, req.CoverImageURL, maxMembers, req.IsPublic).Scan(
		&g.ID, &g.Name, &g.Description, &g.ActivityType, &g.CreatorID,
		&g.CoverImageURL, &g.MaxMembers, &g.IsPublic, &g.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'creator')
	`, g.ID, creatorID)
	if err != nil {
		return nil, err
	}

	if err = tx.Commit(ctx); err != nil {
		return nil, err
	}

	g.MemberCount = 1
	g.IsMember = true
	return &g, nil
}

func (r *GroupRepo) GetGroup(ctx context.Context, groupID, callerID string) (*models.Group, error) {
	var g models.Group
	err := r.db.QueryRow(ctx, `
		SELECT g.id, g.name, g.description, g.activity_type, g.creator_id,
		       COALESCE(g.cover_image_url,''), g.max_members, g.is_public, g.created_at,
		       (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS member_count,
		       EXISTS(SELECT 1 FROM group_members gm2 WHERE gm2.group_id = g.id AND gm2.user_id = $2) AS is_member
		FROM groups g
		WHERE g.id = $1
	`, groupID, callerID).Scan(
		&g.ID, &g.Name, &g.Description, &g.ActivityType, &g.CreatorID,
		&g.CoverImageURL, &g.MaxMembers, &g.IsPublic, &g.CreatedAt,
		&g.MemberCount, &g.IsMember,
	)
	if err != nil {
		return nil, err
	}
	return &g, nil
}

func (r *GroupRepo) ListGroups(ctx context.Context, activityType string, limit, offset int) ([]models.Group, error) {
	if limit <= 0 {
		limit = 20
	}

	args := []interface{}{}
	where := ""
	if activityType != "" {
		args = append(args, activityType)
		where = fmt.Sprintf("WHERE g.activity_type = $%d", len(args))
	}
	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT g.id, g.name, g.description, g.activity_type, g.creator_id,
		       COALESCE(g.cover_image_url,''), g.max_members, g.is_public, g.created_at,
		       (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS member_count
		FROM groups g
		%s
		ORDER BY g.created_at DESC
		LIMIT $%d OFFSET $%d
	`, where, len(args)-1, len(args)), args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.Group
	for rows.Next() {
		var g models.Group
		if err := rows.Scan(
			&g.ID, &g.Name, &g.Description, &g.ActivityType, &g.CreatorID,
			&g.CoverImageURL, &g.MaxMembers, &g.IsPublic, &g.CreatedAt,
			&g.MemberCount,
		); err != nil {
			return nil, err
		}
		result = append(result, g)
	}
	return result, nil
}

func (r *GroupRepo) JoinGroup(ctx context.Context, groupID, userID string) error {
	var maxMembers, currentCount int
	err := r.db.QueryRow(ctx, `
		SELECT g.max_members, (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id)
		FROM groups g WHERE g.id = $1
	`, groupID).Scan(&maxMembers, &currentCount)
	if err != nil {
		return err
	}
	if currentCount >= maxMembers {
		return fmt.Errorf("group is full")
	}

	_, err = r.db.Exec(ctx, `
		INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'member')
		ON CONFLICT DO NOTHING
	`, groupID, userID)
	return err
}

func (r *GroupRepo) LeaveGroup(ctx context.Context, groupID, userID string) error {
	_, err := r.db.Exec(ctx, `
		DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 AND role != 'creator'
	`, groupID, userID)
	return err
}

func (r *GroupRepo) GetGroupMembers(ctx context.Context, groupID string) ([]models.User, error) {
	rows, err := r.db.Query(ctx, `
		SELECT u.id, u.display_name, u.bio, u.avatar_character_id, u.interests, u.created_at
		FROM users u
		JOIN group_members gm ON gm.user_id = u.id
		WHERE gm.group_id = $1
		ORDER BY gm.joined_at ASC
	`, groupID)
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

func (r *GroupRepo) GetUserGroups(ctx context.Context, userID string) ([]models.Group, error) {
	rows, err := r.db.Query(ctx, `
		SELECT g.id, g.name, g.description, g.activity_type, g.creator_id,
		       COALESCE(g.cover_image_url,''), g.max_members, g.is_public, g.created_at,
		       (SELECT COUNT(*) FROM group_members gm2 WHERE gm2.group_id = g.id) AS member_count
		FROM groups g
		JOIN group_members gm ON gm.group_id = g.id
		WHERE gm.user_id = $1
		ORDER BY gm.joined_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.Group
	for rows.Next() {
		var g models.Group
		if err := rows.Scan(
			&g.ID, &g.Name, &g.Description, &g.ActivityType, &g.CreatorID,
			&g.CoverImageURL, &g.MaxMembers, &g.IsPublic, &g.CreatedAt,
			&g.MemberCount,
		); err != nil {
			return nil, err
		}
		g.IsMember = true
		result = append(result, g)
	}
	return result, nil
}

func (r *GroupRepo) DeleteGroup(ctx context.Context, groupID, requesterID string) error {
	result, err := r.db.Exec(ctx, `DELETE FROM groups WHERE id = $1 AND creator_id = $2`, groupID, requesterID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("group not found or permission denied")
	}
	return nil
}

func (r *GroupRepo) UpdateGroup(ctx context.Context, groupID, requesterID string, req models.UpdateGroupRequest) (*models.Group, error) {
	setClauses := []string{"updated_at = NOW()"}
	args := []interface{}{groupID, requesterID}

	if req.Name != nil {
		args = append(args, *req.Name)
		setClauses = append(setClauses, fmt.Sprintf("name = $%d", len(args)))
	}
	if req.Description != nil {
		args = append(args, *req.Description)
		setClauses = append(setClauses, fmt.Sprintf("description = $%d", len(args)))
	}
	if req.CoverImageURL != nil {
		args = append(args, *req.CoverImageURL)
		setClauses = append(setClauses, fmt.Sprintf("cover_image_url = $%d", len(args)))
	}
	if req.MaxMembers != nil {
		args = append(args, *req.MaxMembers)
		setClauses = append(setClauses, fmt.Sprintf("max_members = $%d", len(args)))
	}
	if req.IsPublic != nil {
		args = append(args, *req.IsPublic)
		setClauses = append(setClauses, fmt.Sprintf("is_public = $%d", len(args)))
	}

	query := fmt.Sprintf(`
		UPDATE groups SET %s WHERE id = $1 AND creator_id = $2
		RETURNING id, name, description, activity_type, creator_id,
		          COALESCE(cover_image_url,''), max_members, is_public, created_at
	`, strings.Join(setClauses, ", "))

	var g models.Group
	err := r.db.QueryRow(ctx, query, args...).Scan(
		&g.ID, &g.Name, &g.Description, &g.ActivityType, &g.CreatorID,
		&g.CoverImageURL, &g.MaxMembers, &g.IsPublic, &g.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &g, nil
}
