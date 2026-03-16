package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shivansh/buddyup-backend/internal/models"
)

type EventRepo struct {
	db *pgxpool.Pool
}

func NewEventRepo(db *pgxpool.Pool) *EventRepo {
	return &EventRepo{db: db}
}

func (r *EventRepo) CreateEvent(ctx context.Context, organizerID string, req models.CreateEventRequest) (*models.Event, error) {
	var e models.Event
	err := r.db.QueryRow(ctx, `
		INSERT INTO events (organizer_id, title, description, activity_type, location_name, latitude, longitude,
		                    starts_at, ends_at, max_attendees, cover_image_url, is_public)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, organizer_id, title, COALESCE(description,''), activity_type, COALESCE(location_name,''),
		          latitude, longitude, starts_at, ends_at, max_attendees,
		          COALESCE(cover_image_url,''), is_public, created_at
	`, organizerID, req.Title, req.Description, req.ActivityType, req.LocationName,
		req.Latitude, req.Longitude, req.StartsAt, req.EndsAt, req.MaxAttendees,
		req.CoverImageURL, req.IsPublic).Scan(
		&e.ID, &e.OrganizerID, &e.Title, &e.Description, &e.ActivityType, &e.LocationName,
		&e.Latitude, &e.Longitude, &e.StartsAt, &e.EndsAt, &e.MaxAttendees,
		&e.CoverImageURL, &e.IsPublic, &e.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &e, nil
}

func (r *EventRepo) GetEvent(ctx context.Context, eventID, callerID string) (*models.Event, error) {
	var e models.Event
	var organizer models.User
	var userRSVP *string
	err := r.db.QueryRow(ctx, `
		SELECT e.id, e.organizer_id, e.title, COALESCE(e.description,''), e.activity_type,
		       COALESCE(e.location_name,''), e.latitude, e.longitude, e.starts_at, e.ends_at, e.max_attendees,
		       COALESCE(e.cover_image_url,''), e.is_public, e.created_at,
		       (SELECT COUNT(*) FROM event_rsvps er WHERE er.event_id = e.id) AS rsvp_count,
		       (SELECT er2.status FROM event_rsvps er2 WHERE er2.event_id = e.id AND er2.user_id = $2) AS user_rsvp,
		       u.id, u.display_name, u.bio, u.avatar_character_id, u.interests, u.created_at
		FROM events e
		JOIN users u ON u.id = e.organizer_id
		WHERE e.id = $1
	`, eventID, callerID).Scan(
		&e.ID, &e.OrganizerID, &e.Title, &e.Description, &e.ActivityType,
		&e.LocationName, &e.Latitude, &e.Longitude, &e.StartsAt, &e.EndsAt, &e.MaxAttendees,
		&e.CoverImageURL, &e.IsPublic, &e.CreatedAt,
		&e.RSVPCount, &userRSVP,
		&organizer.ID, &organizer.DisplayName, &organizer.Bio, &organizer.AvatarCharacterID, &organizer.Interests, &organizer.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	if userRSVP != nil {
		e.UserRSVP = *userRSVP
	}
	e.Organizer = &organizer
	return &e, nil
}

func (r *EventRepo) ListEvents(ctx context.Context, activityType string, lat, lng, radiusKm float64, fromTime time.Time, limit, offset int) ([]models.Event, error) {
	if limit <= 0 {
		limit = 20
	}
	if fromTime.IsZero() {
		fromTime = time.Now()
	}

	args := []interface{}{fromTime}
	conditions := []string{"e.starts_at >= $1"}

	if activityType != "" {
		args = append(args, activityType)
		conditions = append(conditions, fmt.Sprintf("e.activity_type = $%d", len(args)))
	}

	if lat != 0 && lng != 0 && radiusKm > 0 {
		degreeRadius := radiusKm / 111.0
		args = append(args, lat, lng, degreeRadius)
		conditions = append(conditions, fmt.Sprintf(
			"e.latitude IS NOT NULL AND e.latitude BETWEEN $%d - $%d AND $%d + $%d",
			len(args)-2, len(args), len(args)-2, len(args),
		))
	}

	where := "WHERE " + conditions[0]
	for _, c := range conditions[1:] {
		where += " AND " + c
	}

	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT e.id, e.organizer_id, e.title, COALESCE(e.description,''), e.activity_type,
		       COALESCE(e.location_name,''), e.latitude, e.longitude, e.starts_at, e.ends_at, e.max_attendees,
		       COALESCE(e.cover_image_url,''), e.is_public, e.created_at,
		       (SELECT COUNT(*) FROM event_rsvps er WHERE er.event_id = e.id) AS rsvp_count
		FROM events e
		%s
		ORDER BY e.starts_at ASC
		LIMIT $%d OFFSET $%d
	`, where, len(args)-1, len(args)), args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.Event
	for rows.Next() {
		var e models.Event
		if err := rows.Scan(
			&e.ID, &e.OrganizerID, &e.Title, &e.Description, &e.ActivityType,
			&e.LocationName, &e.Latitude, &e.Longitude, &e.StartsAt, &e.EndsAt, &e.MaxAttendees,
			&e.CoverImageURL, &e.IsPublic, &e.CreatedAt,
			&e.RSVPCount,
		); err != nil {
			return nil, err
		}
		result = append(result, e)
	}
	return result, nil
}

func (r *EventRepo) RSVP(ctx context.Context, eventID, userID, status string) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO event_rsvps (event_id, user_id, status)
		VALUES ($1, $2, $3)
		ON CONFLICT (event_id, user_id) DO UPDATE SET status = EXCLUDED.status, rsvped_at = NOW()
	`, eventID, userID, status)
	return err
}

func (r *EventRepo) GetRSVPs(ctx context.Context, eventID string) ([]models.EventRSVP, error) {
	rows, err := r.db.Query(ctx, `
		SELECT er.event_id, er.user_id, er.status, er.rsvped_at,
		       u.id, u.display_name, u.bio, u.avatar_character_id, u.interests, u.created_at
		FROM event_rsvps er
		JOIN users u ON u.id = er.user_id
		WHERE er.event_id = $1
		ORDER BY er.rsvped_at ASC
	`, eventID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.EventRSVP
	for rows.Next() {
		var er models.EventRSVP
		var user models.User
		if err := rows.Scan(
			&er.EventID, &er.UserID, &er.Status, &er.RSVPedAt,
			&user.ID, &user.DisplayName, &user.Bio, &user.AvatarCharacterID, &user.Interests, &user.CreatedAt,
		); err != nil {
			return nil, err
		}
		er.User = &user
		result = append(result, er)
	}
	return result, nil
}

func (r *EventRepo) GetUserEvents(ctx context.Context, userID string) ([]models.Event, error) {
	rows, err := r.db.Query(ctx, `
		SELECT e.id, e.organizer_id, e.title, COALESCE(e.description,''), e.activity_type,
		       COALESCE(e.location_name,''), e.latitude, e.longitude, e.starts_at, e.ends_at, e.max_attendees,
		       COALESCE(e.cover_image_url,''), e.is_public, e.created_at,
		       (SELECT COUNT(*) FROM event_rsvps er2 WHERE er2.event_id = e.id) AS rsvp_count
		FROM events e
		JOIN event_rsvps er ON er.event_id = e.id
		WHERE er.user_id = $1
		ORDER BY e.starts_at ASC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.Event
	for rows.Next() {
		var e models.Event
		if err := rows.Scan(
			&e.ID, &e.OrganizerID, &e.Title, &e.Description, &e.ActivityType,
			&e.LocationName, &e.Latitude, &e.Longitude, &e.StartsAt, &e.EndsAt, &e.MaxAttendees,
			&e.CoverImageURL, &e.IsPublic, &e.CreatedAt,
			&e.RSVPCount,
		); err != nil {
			return nil, err
		}
		result = append(result, e)
	}
	return result, nil
}

func (r *EventRepo) DeleteEvent(ctx context.Context, eventID, requesterID string) error {
	result, err := r.db.Exec(ctx, `DELETE FROM events WHERE id = $1 AND organizer_id = $2`, eventID, requesterID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("event not found or permission denied")
	}
	return nil
}
