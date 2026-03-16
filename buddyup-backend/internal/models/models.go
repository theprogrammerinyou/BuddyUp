package models

import (
	"time"
)

type Character struct {
	ID        int    `json:"id" db:"id"`
	Name      string `json:"name" db:"name"`
	Type      string `json:"type" db:"type"` // anime | movie | book
	Franchise string `json:"franchise" db:"franchise"`
	ImageURL  string `json:"image_url" db:"image_url"`
}

type User struct {
	ID                UUID       `json:"id" db:"id"`
	Email             string     `json:"email" db:"email"`
	PasswordHash      string     `json:"-" db:"password_hash"`
	DisplayName       string     `json:"display_name" db:"display_name"`
	Bio               string     `json:"bio" db:"bio"`
	AvatarCharacterID *int       `json:"avatar_character_id" db:"avatar_character_id"`
	Avatar            *Character `json:"avatar,omitempty"`
	Interests         []string   `json:"interests" db:"interests"`
	Latitude          *float64   `json:"latitude,omitempty"`
	Longitude         *float64   `json:"longitude,omitempty"`
	PushToken         *string    `json:"push_token,omitempty" db:"push_token"`
	IsDiscoverable    bool       `json:"is_discoverable" db:"is_discoverable"`
	VibeTags          []string   `json:"vibe_tags,omitempty" db:"vibe_tags"`
	CreatedAt         time.Time  `json:"created_at" db:"created_at"`
}

type UUID = string

type Like struct {
	LikerID   string    `json:"liker_id" db:"liker_id"`
	LikedID   string    `json:"liked_id" db:"liked_id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type Match struct {
	ID        string    `json:"id" db:"id"`
	User1ID   string    `json:"user1_id" db:"user1_id"`
	User2ID   string    `json:"user2_id" db:"user2_id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	OtherUser *User     `json:"other_user,omitempty"`
}

type Message struct {
	ID        string    `json:"id" db:"id"`
	MatchID   string    `json:"match_id" db:"match_id"`
	SenderID  string    `json:"sender_id" db:"sender_id"`
	Content   string    `json:"content" db:"content"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// Request / Response DTOs

type RegisterRequest struct {
	Email       string   `json:"email" binding:"required,email"`
	Password    string   `json:"password" binding:"required,min=6"`
	DisplayName string   `json:"display_name" binding:"required"`
	Bio         string   `json:"bio"`
	CharacterID *int     `json:"avatar_character_id"`
	Interests   []string `json:"interests"`
	Latitude    *float64 `json:"latitude"`
	Longitude   *float64 `json:"longitude"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type UpdateLocationRequest struct {
	Latitude  float64 `json:"latitude" binding:"required"`
	Longitude float64 `json:"longitude" binding:"required"`
}

type UpdatePushTokenRequest struct {
	Token string `json:"token" binding:"required"`
}

type UpdateProfileRequest struct {
	DisplayName       *string  `json:"display_name"`
	Bio               *string  `json:"bio"`
	Interests         []string `json:"interests"`
	AvatarCharacterID *int     `json:"avatar_character_id"`
}

type PassRequest struct {
	PassedID string `json:"passed_id" binding:"required"`
}

type DiscoverQuery struct {
	Latitude  float64 `form:"latitude"`
	Longitude float64 `form:"longitude"`
	RadiusKm  float64 `form:"radius_km"`
}

type DiscoverUser struct {
	User
	Distance        float64  `json:"distance_km"`
	CommonInterests int      `json:"common_interests"`
	VibeTags        []string `json:"vibe_tags,omitempty"`
}

type Group struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	ActivityType  string    `json:"activity_type"`
	CreatorID     string    `json:"creator_id"`
	CoverImageURL string    `json:"cover_image_url,omitempty"`
	MaxMembers    int       `json:"max_members"`
	IsPublic      bool      `json:"is_public"`
	MemberCount   int       `json:"member_count,omitempty"`
	IsMember      bool      `json:"is_member,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}

type CreateGroupRequest struct {
	Name          string `json:"name" binding:"required"`
	Description   string `json:"description"`
	ActivityType  string `json:"activity_type" binding:"required"`
	CoverImageURL string `json:"cover_image_url"`
	MaxMembers    int    `json:"max_members"`
	IsPublic      bool   `json:"is_public"`
}

type UpdateGroupRequest struct {
	Name          *string `json:"name"`
	Description   *string `json:"description"`
	CoverImageURL *string `json:"cover_image_url"`
	MaxMembers    *int    `json:"max_members"`
	IsPublic      *bool   `json:"is_public"`
}

type Post struct {
	ID            string     `json:"id"`
	AuthorID      string     `json:"author_id"`
	Author        *User      `json:"author,omitempty"`
	Content       string     `json:"content"`
	ActivityType  string     `json:"activity_type,omitempty"`
	Latitude      *float64   `json:"latitude,omitempty"`
	Longitude     *float64   `json:"longitude,omitempty"`
	EventTime     *time.Time `json:"event_time,omitempty"`
	IsActive      bool       `json:"is_active"`
	ExpiresAt     *time.Time `json:"expires_at,omitempty"`
	ResponseCount int        `json:"response_count,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
}

type PostResponse struct {
	ID          string    `json:"id"`
	PostID      string    `json:"post_id"`
	ResponderID string    `json:"responder_id"`
	Responder   *User     `json:"responder,omitempty"`
	Message     string    `json:"message"`
	CreatedAt   time.Time `json:"created_at"`
}

type CreatePostRequest struct {
	Content      string     `json:"content" binding:"required"`
	ActivityType string     `json:"activity_type"`
	Latitude     *float64   `json:"latitude"`
	Longitude    *float64   `json:"longitude"`
	EventTime    *time.Time `json:"event_time"`
	ExpiresHours int        `json:"expires_hours"`
}

type RespondToPostRequest struct {
	Message string `json:"message" binding:"required"`
}

type Event struct {
	ID            string     `json:"id"`
	OrganizerID   string     `json:"organizer_id"`
	Organizer     *User      `json:"organizer,omitempty"`
	Title         string     `json:"title"`
	Description   string     `json:"description,omitempty"`
	ActivityType  string     `json:"activity_type"`
	LocationName  string     `json:"location_name,omitempty"`
	Latitude      *float64   `json:"latitude,omitempty"`
	Longitude     *float64   `json:"longitude,omitempty"`
	StartsAt      time.Time  `json:"starts_at"`
	EndsAt        *time.Time `json:"ends_at,omitempty"`
	MaxAttendees  *int       `json:"max_attendees,omitempty"`
	CoverImageURL string     `json:"cover_image_url,omitempty"`
	IsPublic      bool       `json:"is_public"`
	RSVPCount     int        `json:"rsvp_count,omitempty"`
	UserRSVP      string     `json:"user_rsvp,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
}

type EventRSVP struct {
	EventID  string    `json:"event_id"`
	UserID   string    `json:"user_id"`
	User     *User     `json:"user,omitempty"`
	Status   string    `json:"status"`
	RSVPedAt time.Time `json:"rsvped_at"`
}

type CreateEventRequest struct {
	Title         string     `json:"title" binding:"required"`
	Description   string     `json:"description"`
	ActivityType  string     `json:"activity_type" binding:"required"`
	LocationName  string     `json:"location_name"`
	Latitude      *float64   `json:"latitude"`
	Longitude     *float64   `json:"longitude"`
	StartsAt      time.Time  `json:"starts_at" binding:"required"`
	EndsAt        *time.Time `json:"ends_at"`
	MaxAttendees  *int       `json:"max_attendees"`
	CoverImageURL string     `json:"cover_image_url"`
	IsPublic      bool       `json:"is_public"`
}

type RSVPRequest struct {
	Status string `json:"status" binding:"required"`
}

type SuperConnect struct {
	ID         string    `json:"id"`
	SenderID   string    `json:"sender_id"`
	Sender     *User     `json:"sender,omitempty"`
	ReceiverID string    `json:"receiver_id"`
	Message    string    `json:"message,omitempty"`
	Seen       bool      `json:"seen"`
	CreatedAt  time.Time `json:"created_at"`
}

type SendSuperConnectRequest struct {
	ReceiverID string `json:"receiver_id" binding:"required"`
	Message    string `json:"message"`
}

type SetGhostModeRequest struct {
	IsDiscoverable bool `json:"is_discoverable"`
}

type SetVibeTagsRequest struct {
	Tags []string `json:"tags" binding:"required"`
}

type SetTravelModeRequest struct {
	Latitude     float64 `json:"latitude" binding:"required"`
	Longitude    float64 `json:"longitude" binding:"required"`
	ExpiresHours int     `json:"expires_hours"`
}

type ReportRequest struct {
	Reason  string `json:"reason" binding:"required"`
	Details string `json:"details"`
}

// Phase 3 models

type XPEvent struct {
	ID        string    `json:"id" db:"id"`
	UserID    string    `json:"user_id" db:"user_id"`
	EventType string    `json:"event_type" db:"event_type"`
	XPAmount  int       `json:"xp_amount" db:"xp_amount"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type UserXP struct {
	TotalXP      int       `json:"total_xp"`
	Level        int       `json:"level"`
	RecentEvents []XPEvent `json:"recent_events"`
}

type Challenge struct {
	ID          string     `json:"id" db:"id"`
	Title       string     `json:"title" db:"title"`
	Description string     `json:"description,omitempty" db:"description"`
	XPReward    int        `json:"xp_reward" db:"xp_reward"`
	EndsAt      *time.Time `json:"ends_at,omitempty" db:"ends_at"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	Completed   bool       `json:"completed,omitempty"`
}

type Vouch struct {
	VoucherID string    `json:"voucher_id" db:"voucher_id"`
	VouchedID string    `json:"vouched_id" db:"vouched_id"`
	Voucher   *User     `json:"voucher,omitempty"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type Persona struct {
	ID          string    `json:"id" db:"id"`
	UserID      string    `json:"user_id" db:"user_id"`
	DisplayName string    `json:"display_name" db:"display_name"`
	Bio         string    `json:"bio,omitempty" db:"bio"`
	Interests   []string  `json:"interests" db:"interests"`
	VibeTags    []string  `json:"vibe_tags" db:"vibe_tags"`
	IsActive    bool      `json:"is_active" db:"is_active"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

type VisitedCity struct {
	ID          string    `json:"id" db:"id"`
	UserID      string    `json:"user_id" db:"user_id"`
	CityName    string    `json:"city_name" db:"city_name"`
	CountryCode string    `json:"country_code,omitempty" db:"country_code"`
	VisitedAt   time.Time `json:"visited_at" db:"visited_at"`
}

type Badge struct {
	ID        string    `json:"id" db:"id"`
	UserID    string    `json:"user_id" db:"user_id"`
	BadgeType string    `json:"badge_type" db:"badge_type"`
	EarnedAt  time.Time `json:"earned_at" db:"earned_at"`
}

type CreatePersonaRequest struct {
	DisplayName string   `json:"display_name" binding:"required"`
	Bio         string   `json:"bio"`
	Interests   []string `json:"interests"`
	VibeTags    []string `json:"vibe_tags"`
}

type AddVisitedCityRequest struct {
	CityName    string `json:"city_name" binding:"required"`
	CountryCode string `json:"country_code"`
}

type AwardXPRequest struct {
	UserID    string `json:"user_id" binding:"required"`
	EventType string `json:"event_type" binding:"required"`
	XPAmount  int    `json:"xp_amount"`
}

type SetLocalGuideRequest struct {
	IsLocalGuide bool `json:"is_local_guide"`
}

type LeaderboardEntry struct {
	UserID      string `json:"user_id"`
	DisplayName string `json:"display_name"`
	AvatarURL   string `json:"avatar_url,omitempty"`
	TotalXP     int    `json:"total_xp"`
	Level       int    `json:"level"`
	Rank        int    `json:"rank"`
}
