package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shivansh/buddyup-backend/internal/models"
	"github.com/shivansh/buddyup-backend/internal/repository"
)

type XPHandler struct {
	xpRepo *repository.XPRepo
}

func NewXPHandler(xpRepo *repository.XPRepo) *XPHandler {
	return &XPHandler{xpRepo: xpRepo}
}

// GET /api/v1/me/xp
func (h *XPHandler) GetMyXP(c *gin.Context) {
	userID := c.GetString("user_id")
	xp, err := h.xpRepo.GetUserXP(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, xp)
}

// POST /api/v1/xp (internal — award XP to a user)
func (h *XPHandler) AwardXP(c *gin.Context) {
	var req models.AwardXPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.xpRepo.AwardXP(c.Request.Context(), req.UserID, req.EventType, req.XPAmount); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "xp awarded"})
}

// GET /api/v1/leaderboard
func (h *XPHandler) Leaderboard(c *gin.Context) {
	city := c.Query("city")
	period := c.Query("period")
	entries, err := h.xpRepo.GetLeaderboard(c.Request.Context(), city, period, 20)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"leaderboard": entries})
}
