package repository

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shivansh/buddyup-backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type UserRepo struct {
	db *pgxpool.Pool
}

func NewUserRepo(db *pgxpool.Pool) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) CreateUser(ctx context.Context, req models.RegisterRequest) (*models.User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	var args []interface{}
	args = append(args, req.Email, string(hash), req.DisplayName, req.Bio, req.CharacterID, req.Interests)

	latIndex := "NULL"
	lngIndex := "NULL"

	if req.Latitude != nil && req.Longitude != nil {
		args = append(args, *req.Latitude, *req.Longitude)
		latIndex = fmt.Sprintf("$%d", len(args)-1)
		lngIndex = fmt.Sprintf("$%d", len(args))
	}

	query := fmt.Sprintf(`
		INSERT INTO users (email, password_hash, display_name, bio, avatar_character_id, interests, latitude, longitude)
		VALUES ($1, $2, $3, $4, $5, $6, %s, %s)
		RETURNING id, email, display_name, bio, avatar_character_id, interests, created_at
	`, latIndex, lngIndex)

	row := r.db.QueryRow(ctx, query, args...)
	var u models.User
	err = row.Scan(&u.ID, &u.Email, &u.DisplayName, &u.Bio, &u.AvatarCharacterID, &u.Interests, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	row := r.db.QueryRow(ctx, `
		SELECT id, email, password_hash, display_name, bio, avatar_character_id, interests, created_at
		FROM users WHERE email = $1
	`, email)
	var u models.User
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.DisplayName, &u.Bio, &u.AvatarCharacterID, &u.Interests, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) GetUserByID(ctx context.Context, id string) (*models.User, error) {
	row := r.db.QueryRow(ctx, `
		SELECT u.id, u.email, u.display_name, u.bio, u.avatar_character_id, u.interests, u.created_at,
		       u.latitude AS lat, u.longitude AS lng,
		       u.is_discoverable, COALESCE(u.vibe_tags, '{}'),
		       c.id, c.name, c.type, c.franchise, c.image_url
		FROM users u
		LEFT JOIN characters c ON c.id = u.avatar_character_id
		WHERE u.id = $1
	`, id)
	var u models.User
	var char models.Character
	var clat, clng *float64
	var cID *int
	var cName, cType, cFranchise, cImageURL *string
	err := row.Scan(
		&u.ID, &u.Email, &u.DisplayName, &u.Bio, &u.AvatarCharacterID, &u.Interests, &u.CreatedAt,
		&clat, &clng,
		&u.IsDiscoverable, &u.VibeTags,
		&cID, &cName, &cType, &cFranchise, &cImageURL,
	)
	if err != nil {
		return nil, err
	}
	u.Latitude = clat
	u.Longitude = clng
	if cID != nil {
		char.ID = *cID
		char.Name = *cName
		char.Type = *cType
		char.Franchise = *cFranchise
		char.ImageURL = *cImageURL
		u.Avatar = &char
	}
	return &u, nil
}

func (r *UserRepo) UpdateProfile(ctx context.Context, userID string, req models.UpdateProfileRequest) error {
	setClauses := []string{"updated_at = NOW()"}
	args := []interface{}{userID}

	if req.DisplayName != nil {
		args = append(args, *req.DisplayName)
		setClauses = append(setClauses, fmt.Sprintf("display_name = $%d", len(args)))
	}
	if req.Bio != nil {
		args = append(args, *req.Bio)
		setClauses = append(setClauses, fmt.Sprintf("bio = $%d", len(args)))
	}
	if req.Interests != nil {
		args = append(args, req.Interests)
		setClauses = append(setClauses, fmt.Sprintf("interests = $%d", len(args)))
	}
	if req.AvatarCharacterID != nil {
		args = append(args, *req.AvatarCharacterID)
		setClauses = append(setClauses, fmt.Sprintf("avatar_character_id = $%d", len(args)))
	}

	query := fmt.Sprintf("UPDATE users SET %s WHERE id = $1", strings.Join(setClauses, ", "))
	_, err := r.db.Exec(ctx, query, args...)
	return err
}

func (r *UserRepo) UpdateLocation(ctx context.Context, userID string, lat, lng float64) error {
	_, err := r.db.Exec(ctx, `
		UPDATE users SET latitude = $2, longitude = $3, updated_at = NOW()
		WHERE id = $1
	`, userID, lat, lng)
	return err
}

func (r *UserRepo) UpdatePushToken(ctx context.Context, userID string, token string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE users SET push_token = $2, updated_at = NOW()
		WHERE id = $1
	`, userID, token)
	return err
}

func (r *UserRepo) GetPushTokenByUserID(ctx context.Context, userID string) (*string, error) {
	var token *string
	err := r.db.QueryRow(ctx, "SELECT push_token FROM users WHERE id = $1", userID).Scan(&token)
	return token, err
}

func (r *UserRepo) GetDisplayNameByUserID(ctx context.Context, userID string) (string, error) {
	var name string
	err := r.db.QueryRow(ctx, "SELECT display_name FROM users WHERE id = $1", userID).Scan(&name)
	return name, err
}

func (r *UserRepo) IsSeedUser(ctx context.Context, userID string) (bool, error) {
	var email string
	err := r.db.QueryRow(ctx, "SELECT email FROM users WHERE id = $1", userID).Scan(&email)
	if err != nil {
		return false, err
	}
	return strings.HasPrefix(email, "seed_") && strings.HasSuffix(email, "@buddyup.local"), nil
}

func (r *UserRepo) GetSeedUserIDs(ctx context.Context, limit int) ([]string, error) {
	if limit <= 0 {
		limit = 3
	}
	rows, err := r.db.Query(ctx, `
		SELECT id FROM users WHERE email LIKE 'seed\_%@buddyup.local' ESCAPE '\' ORDER BY created_at ASC LIMIT $1
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var ids []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			continue
		}
		ids = append(ids, id)
	}
	return ids, nil
}

func (r *UserRepo) GetPushTokenAndNameForMatchRecipient(ctx context.Context, matchID, senderID string) (*string, string, error) {
	var token *string
	var senderName string

	// Get sender's name
	_ = r.db.QueryRow(ctx, "SELECT display_name FROM users WHERE id = $1", senderID).Scan(&senderName)

	err := r.db.QueryRow(ctx, `
		SELECT u.push_token 
		FROM matches m 
		JOIN users u ON (u.id = m.user1_id OR u.id = m.user2_id) AND u.id != $1
		WHERE m.id = $2
	`, senderID, matchID).Scan(&token)
	
	if senderName == "" {
		senderName = "Someone"
	}
	return token, senderName, err
}

func (r *UserRepo) CheckPassword(user *models.User, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	return err == nil
}

func (r *UserRepo) AddVisitedCity(ctx context.Context, userID, cityName, countryCode string) (*models.VisitedCity, error) {
	var city models.VisitedCity
	err := r.db.QueryRow(ctx, `
		INSERT INTO visited_cities (user_id, city_name, country_code)
		VALUES ($1, $2, $3)
		RETURNING id, user_id, city_name, COALESCE(country_code,''), visited_at
	`, userID, cityName, countryCode).Scan(&city.ID, &city.UserID, &city.CityName, &city.CountryCode, &city.VisitedAt)
	if err != nil {
		return nil, err
	}
	return &city, nil
}

func (r *UserRepo) GetVisitedCities(ctx context.Context, userID string) ([]models.VisitedCity, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, user_id, city_name, COALESCE(country_code,''), visited_at
		FROM visited_cities WHERE user_id = $1 ORDER BY visited_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []models.VisitedCity
	for rows.Next() {
		var city models.VisitedCity
		if err := rows.Scan(&city.ID, &city.UserID, &city.CityName, &city.CountryCode, &city.VisitedAt); err != nil {
			continue
		}
		result = append(result, city)
	}
	if result == nil {
		result = []models.VisitedCity{}
	}
	return result, nil
}

func (r *UserRepo) SetLocalGuide(ctx context.Context, userID string, isLocalGuide bool) error {
	_, err := r.db.Exec(ctx, `
		UPDATE users SET is_local_guide = $2, updated_at = NOW() WHERE id = $1
	`, userID, isLocalGuide)
	return err
}

func (r *UserRepo) DiscoverCoTravel(ctx context.Context, destination string) ([]models.User, error) {
	rows, err := r.db.Query(ctx, `
		SELECT DISTINCT u.id, u.display_name, u.bio, u.avatar_character_id, u.interests, u.created_at
		FROM users u
		JOIN visited_cities vc ON vc.user_id = u.id
		WHERE LOWER(vc.city_name) = LOWER($1)
		ORDER BY u.display_name ASC
		LIMIT 50
	`, destination)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.DisplayName, &u.Bio, &u.AvatarCharacterID, &u.Interests, &u.CreatedAt); err != nil {
			continue
		}
		result = append(result, u)
	}
	if result == nil {
		result = []models.User{}
	}
	return result, nil
}

// Discover returns nearby users sorted by interest overlap then distance (using Haversine-like approximation)
func (r *UserRepo) Discover(ctx context.Context, userID string, lat, lng, radiusKm float64, activityType string) ([]models.DiscoverUser, error) {
	if radiusKm <= 0 {
		radiusKm = 50
	}

	// Check for active travel mode — use travel location if set and not expired
	var travelLat, travelLng *float64
	_ = r.db.QueryRow(ctx, `
		SELECT travel_latitude, travel_longitude FROM users
		WHERE id = $1 AND travel_expires_at IS NOT NULL AND travel_expires_at > NOW()
	`, userID).Scan(&travelLat, &travelLng)
	if travelLat != nil && travelLng != nil {
		lat = *travelLat
		lng = *travelLng
	}

	// 1 degree of latitude is roughly 111 km.
	// We use a simple bounding box for filtering first then exact distance.
	degreeRadius := radiusKm / 111.0

	activityFilter := ""
	args := []interface{}{userID, lat, lng, degreeRadius}
	if activityType != "" {
		args = append(args, activityType)
		activityFilter = fmt.Sprintf("AND $%d = ANY(u.interests)", len(args))
	}

	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		WITH me AS (SELECT interests FROM users WHERE id = $1)
		SELECT
			u.id, u.display_name, u.bio, u.avatar_character_id, u.interests,
			u.latitude AS lat,
			u.longitude AS lng,
			ROUND(( 6371 * acos( cos( radians($2) ) * cos( radians( u.latitude ) ) * cos( radians( u.longitude ) - radians($3) ) + sin( radians($2) ) * sin( radians( u.latitude ) ) ) )::numeric, 2) AS distance_km,
			array_length(ARRAY(SELECT unnest(u.interests) INTERSECT SELECT unnest(me.interests) FROM me), 1) AS common_interests,
			COALESCE(u.vibe_tags, '{}'),
			c.id, c.name, c.type, c.franchise, c.image_url
		FROM users u
		CROSS JOIN me
		LEFT JOIN characters c ON c.id = u.avatar_character_id
		WHERE u.id != $1
		  AND u.is_discoverable = TRUE
		  AND u.latitude IS NOT NULL
		  AND u.latitude BETWEEN $2 - $4 AND $2 + $4
		  AND u.longitude BETWEEN $3 - ($4 / cos(radians($2))) AND $3 + ($4 / cos(radians($2)))
		  AND NOT EXISTS (SELECT 1 FROM likes l WHERE l.liker_id = $1 AND l.liked_id = u.id)
		  AND NOT EXISTS (SELECT 1 FROM passes p WHERE p.passer_id = $1 AND p.passed_id = u.id)
		  AND NOT EXISTS (SELECT 1 FROM blocked_users b WHERE (b.blocker_id = $1 AND b.blocked_id = u.id) OR (b.blocker_id = u.id AND b.blocked_id = $1))
		  %s
		ORDER BY common_interests DESC NULLS LAST, distance_km ASC
		LIMIT 100
	`, activityFilter), args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.DiscoverUser
	for rows.Next() {
		var du models.DiscoverUser
		var char models.Character
		var clat, clng *float64
		var commonInterests *int
		var cID *int
		var cName, cType, cFranchise, cImageURL *string

		err = rows.Scan(
			&du.ID, &du.DisplayName, &du.Bio, &du.AvatarCharacterID, &du.Interests,
			&clat, &clng, &du.Distance, &commonInterests,
			&du.VibeTags,
			&cID, &cName, &cType, &cFranchise, &cImageURL,
		)
		if err != nil {
			return nil, err
		}
		du.Latitude = clat
		du.Longitude = clng
		if commonInterests != nil {
			du.CommonInterests = *commonInterests
		}
		if cID != nil {
			char.ID = *cID
			char.Name = *cName
			char.Type = *cType
			char.Franchise = *cFranchise
			char.ImageURL = *cImageURL
			du.Avatar = &char
		}
		result = append(result, du)
	}
	return result, nil
}
