package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents the core user account.
type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	Name         string `json:"name"`
	Email        string `json:"email" gorm:"uniqueIndex"`
	Bio          string `json:"bio"`
	AvatarURL    string `json:"avatarUrl"`
	IsOnline     bool   `json:"isOnline"`
	Points       int    `json:"points"` // For Leaderboard

	// Auth fields
	PasswordHash string `json:"-" gorm:"column:password_hash"`
	Provider     string `json:"provider" gorm:"default:'local'"` // local, google, apple
	ProviderID   string `json:"-" gorm:"column:provider_id"`

	// Preferences
	Interests []Interest `json:"interests" gorm:"many2many:user_interests;"`
}

// Interest represents a tag like 'Nightlife', 'Food', etc.
type Interest struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"unique"`
}

// Friendship represents the relationship between two users.
type Friendship struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"createdAt"`
	UserID    uint      `json:"userId" gorm:"index"`
	FriendID  uint      `json:"friendId" gorm:"index"`
	Status    string    `json:"status"` // pending, accepted
	
	Friend    User      `json:"friend" gorm:"foreignKey:FriendID"`
}

// Activity represents an event created by a user.
type Activity struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	HostID      uint      `json:"hostId" gorm:"index"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	StartTime   time.Time `json:"startTime"`
	Location    string    `json:"location"` // Simplified address/label
	
	Attendees []User `json:"attendees" gorm:"many2many:activity_attendees;"`
	Host      User   `json:"host" gorm:"foreignKey:HostID"`
}

// Message represents a chat message.
type Message struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"createdAt"`

	SenderID   uint   `json:"senderId" gorm:"index"`
	ReceiverID uint   `json:"receiverId" gorm:"index"`
	Content    string `json:"content"`
	IsRead     bool   `json:"isRead"`
}

// Notification represents an in-app alert.
type Notification struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"createdAt"`

	UserID uint   `json:"userId" gorm:"index"`
	Title  string `json:"title"`
	Body   string `json:"body"`
	Type   string `json:"type"` // match, message, activity, system
	IsRead bool   `json:"isRead"`
}

// Event represents a ticketed event with QR access.
type Event struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	OrganizerID uint      `json:"organizerId" gorm:"index"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	StartTime   time.Time `json:"startTime"`
	EndTime     time.Time `json:"endTime"`
	Location    string    `json:"location"`
	Address     string    `json:"address"`
	IsVerified  bool      `json:"isVerified"`

	Organizer User   `json:"organizer" gorm:"foreignKey:OrganizerID"`
	Attendees []User `json:"attendees" gorm:"many2many:event_attendees;"`
}

// EventTicket represents a user's ticket/QR access to an event.
type EventTicket struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"createdAt"`

	EventID  uint   `json:"eventId" gorm:"index"`
	UserID   uint   `json:"userId" gorm:"index"`
	TicketID string `json:"ticketId" gorm:"uniqueIndex"` // e.g. PLS-882-X90
	Status   string `json:"status"`                      // confirmed, cancelled, used

	Event Event `json:"event" gorm:"foreignKey:EventID"`
	User  User  `json:"user" gorm:"foreignKey:UserID"`
}

// FriendRequest represents a pending friend request.
type FriendRequest struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"createdAt"`

	SenderID   uint   `json:"senderId" gorm:"index"`
	ReceiverID uint   `json:"receiverId" gorm:"index"`
	Status     string `json:"status"` // pending, accepted, ignored

	Sender   User `json:"sender" gorm:"foreignKey:SenderID"`
	Receiver User `json:"receiver" gorm:"foreignKey:ReceiverID"`
}

// Conversation represents a chat thread between two users.
type Conversation struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	User1ID     uint   `json:"user1Id" gorm:"index"`
	User2ID     uint   `json:"user2Id" gorm:"index"`
	LastMessage string `json:"lastMessage"`

	User1 User `json:"user1" gorm:"foreignKey:User1ID"`
	User2 User `json:"user2" gorm:"foreignKey:User2ID"`
}
