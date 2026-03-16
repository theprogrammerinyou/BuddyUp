package ws

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	expo "github.com/oliveroneill/exponent-server-sdk-golang/sdk"
	"github.com/shivansh/buddyup-backend/internal/middleware"
	"github.com/shivansh/buddyup-backend/internal/models"
	"github.com/shivansh/buddyup-backend/internal/repository"
)

type IncomingMessage struct {
	Content string `json:"content"`
}

type OutgoingMessage struct {
	ID        string    `json:"id"`
	MatchID   string    `json:"match_id"`
	SenderID  string    `json:"sender_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

type Client struct {
	conn     *websocket.Conn
	matchID  string
	userID   string
	send     chan OutgoingMessage
	hub      *Hub
	chatRepo *repository.ChatRepo
}

type Hub struct {
	mu       sync.RWMutex
	rooms    map[string]map[*Client]bool // matchID -> set of clients
	chatRepo *repository.ChatRepo
	userRepo *repository.UserRepo
	push     *expo.PushClient
}

func NewHub(chatRepo *repository.ChatRepo, userRepo *repository.UserRepo, push *expo.PushClient) *Hub {
	if push == nil {
		push = expo.NewPushClient(nil)
	}
	return &Hub{
		rooms:    make(map[string]map[*Client]bool),
		chatRepo: chatRepo,
		userRepo: userRepo,
		push:     push,
	}
}

func (h *Hub) Register(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.rooms[c.matchID] == nil {
		h.rooms[c.matchID] = make(map[*Client]bool)
	}
	h.rooms[c.matchID][c] = true
}

func (h *Hub) Unregister(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if room, ok := h.rooms[c.matchID]; ok {
		delete(room, c)
		if len(room) == 0 {
			delete(h.rooms, c.matchID)
		}
	}
}

func (h *Hub) Broadcast(matchID string, msg OutgoingMessage) {
	h.mu.RLock()
	connectedRecipients := 0
	
	for c := range h.rooms[matchID] {
		if c.userID != msg.SenderID {
			connectedRecipients++
		}
		select {
		case c.send <- msg:
		default:
			// Client too slow; close
			close(c.send)
		}
	}
	h.mu.RUnlock()

	// If no recipient is online, send a push notification
	if connectedRecipients == 0 {
		h.notifyOfflineRecipient(matchID, msg.SenderID, msg.Content)
	}
}

func (h *Hub) notifyOfflineRecipient(matchID, senderID, content string) {
	token, senderName, err := h.userRepo.GetPushTokenAndNameForMatchRecipient(context.Background(), matchID, senderID)
	if err != nil || token == nil || *token == "" {
		return
	}

	pushToken, err := expo.NewExponentPushToken(*token)
	if err != nil {
		return
	}

	h.push.Publish(&expo.PushMessage{
		To:    []expo.ExponentPushToken{pushToken},
		Body:  content,
		Title: senderName + " sent a message",
		Sound: "default",
		Data:  map[string]string{"matchId": matchID, "userName": senderName},
	})
}

// ServeClient handles read/write pumps for a WebSocket client
func (h *Hub) ServeClient(conn *websocket.Conn, matchID, userID string) {
	c := &Client{
		conn:    conn,
		matchID: matchID,
		userID:  userID,
		send:    make(chan OutgoingMessage, 64),
		hub:     h,
	}
	h.Register(c)
	defer func() {
		h.Unregister(c)
		conn.Close()
	}()

	// Write pump
	go func() {
		for msg := range c.send {
			data, _ := json.Marshal(msg)
			conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
				return
			}
		}
	}()

	// Read pump
	conn.SetReadLimit(4096)
	conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, raw, err := conn.ReadMessage()
		if err != nil {
			break
		}
		var incoming IncomingMessage
		if err := json.Unmarshal(raw, &incoming); err != nil || incoming.Content == "" {
			continue
		}

		// Filter profanity
		filtered := middleware.FilterProfanity(incoming.Content)

		// Persist
		saved, err := h.chatRepo.SaveMessage(context.Background(), matchID, userID, filtered)
		if err != nil {
			log.Printf("ws: save message error: %v", err)
			continue
		}

		// Broadcast to room
		h.Broadcast(matchID, OutgoingMessage{
			ID:        saved.ID,
			MatchID:   saved.MatchID,
			SenderID:  saved.SenderID,
			Content:   saved.Content,
			CreatedAt: saved.CreatedAt,
		})
	}
}

// ToOutgoing converts a models.Message to OutgoingMessage
func ToOutgoing(m models.Message) OutgoingMessage {
	return OutgoingMessage{
		ID:        m.ID,
		MatchID:   m.MatchID,
		SenderID:  m.SenderID,
		Content:   m.Content,
		CreatedAt: m.CreatedAt,
	}
}
