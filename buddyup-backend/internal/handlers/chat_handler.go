package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
"github.com/shivansh/buddyup-backend/internal/models"

	"github.com/gorilla/websocket"
	"github.com/shivansh/buddyup-backend/internal/auth"
	"github.com/shivansh/buddyup-backend/internal/repository"
	"github.com/shivansh/buddyup-backend/internal/ws"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type ChatHandler struct {
	chatRepo *repository.ChatRepo
	likeRepo *repository.LikeRepo
	hub      *ws.Hub
}

func NewChatHandler(chatRepo *repository.ChatRepo, likeRepo *repository.LikeRepo, hub *ws.Hub) *ChatHandler {
	return &ChatHandler{chatRepo: chatRepo, likeRepo: likeRepo, hub: hub}
}

// GET /api/v1/chats/:matchId
func (h *ChatHandler) GetHistory(c *gin.Context) {
	userID := c.GetString("user_id")
	matchID := c.Param("matchId")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	if err := h.likeRepo.VerifyMatch(c.Request.Context(), matchID, userID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	msgs, err := h.chatRepo.GetHistory(c.Request.Context(), matchID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if msgs == nil {
		msgs = []models.Message{}
	}
	c.JSON(http.StatusOK, gin.H{"messages": msgs})
}

// WS /ws/chat/:matchId?token=xxx
func (h *ChatHandler) ServeWS(c *gin.Context) {
	matchID := c.Param("matchId")

	// Auth via query param token (WS doesn't support custom headers easily)
	tokenStr := c.Query("token")
	var userID string
	if tokenStr != "" {
		claims, err := auth.ValidateToken(tokenStr)
		if err == nil {
			userID = claims.UserID
		}
	}
	if userID == "" {
		userID = c.GetString("user_id") // fallback from middleware
	}
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := h.likeRepo.VerifyMatch(c.Request.Context(), matchID, userID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	h.hub.ServeClient(conn, matchID, userID)
}
