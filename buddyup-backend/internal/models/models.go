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
	ID                UUID      `json:"id" db:"id"`
	Email             string    `json:"email" db:"email"`
	PasswordHash      string    `json:"-" db:"password_hash"`
	DisplayName       string    `json:"display_name" db:"display_name"`
	Bio               string    `json:"bio" db:"bio"`
	AvatarCharacterID *int      `json:"avatar_character_id" db:"avatar_character_id"`
	Avatar            *Character `json:"avatar,omitempty"`
	Interests         []string  `json:"interests" db:"interests"`
	Latitude          *float64  `json:"latitude,omitempty"`
	Longitude         *float64  `json:"longitude,omitempty"`
	PushToken         *string   `json:"push_token,omitempty" db:"push_token"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
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

type DiscoverQuery struct {
	Latitude  float64 `form:"latitude"`
	Longitude float64 `form:"longitude"`
	RadiusKm  float64 `form:"radius_km"`
}

type DiscoverUser struct {
	User
	Distance       float64 `json:"distance_km"`
	CommonInterests int    `json:"common_interests"`
}
