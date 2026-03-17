package handlers

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shivansh/buddyup-backend/internal/models"
	"github.com/shivansh/buddyup-backend/internal/repository"
)

type SocialHandler struct {
	socialRepo *repository.SocialRepo
	userRepo   *repository.UserRepo
}

func NewSocialHandler(socialRepo *repository.SocialRepo, userRepo *repository.UserRepo) *SocialHandler {
	return &SocialHandler{socialRepo: socialRepo, userRepo: userRepo}
}

// POST /api/v1/users/:id/block
func (h *SocialHandler) BlockUser(c *gin.Context) {
	blockerID := c.GetString("user_id")
	blockedID := c.Param("id")
	if blockerID == blockedID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot block yourself"})
		return
	}
	if err := h.socialRepo.BlockUser(c.Request.Context(), blockerID, blockedID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user blocked"})
}

// DELETE /api/v1/users/:id/block
func (h *SocialHandler) UnblockUser(c *gin.Context) {
	blockerID := c.GetString("user_id")
	blockedID := c.Param("id")
	if err := h.socialRepo.UnblockUser(c.Request.Context(), blockerID, blockedID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user unblocked"})
}

// GET /api/v1/me/blocked
func (h *SocialHandler) GetBlockedUsers(c *gin.Context) {
	userID := c.GetString("user_id")
	users, err := h.socialRepo.GetBlockedUsers(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if users == nil {
		users = []models.User{}
	}
	c.JSON(http.StatusOK, gin.H{"blocked_users": users})
}

// POST /api/v1/users/:id/report
func (h *SocialHandler) ReportUser(c *gin.Context) {
	reporterID := c.GetString("user_id")
	reportedID := c.Param("id")
	if reporterID == reportedID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot report yourself"})
		return
	}

	var req models.ReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.socialRepo.ReportUser(c.Request.Context(), reporterID, reportedID, req.Reason, req.Details); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "report submitted"})
}

// POST /api/v1/super-connects
func (h *SocialHandler) SendSuperConnect(c *gin.Context) {
	senderID := c.GetString("user_id")
	var req models.SendSuperConnectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if senderID == req.ReceiverID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot super connect with yourself"})
		return
	}

	sc, err := h.socialRepo.SendSuperConnect(c.Request.Context(), senderID, req.ReceiverID, req.Message)
	if err != nil {
		if errors.Is(err, repository.ErrDailySuperConnectLimitReached) {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"super_connect": sc})
}

// GET /api/v1/me/super-connects
func (h *SocialHandler) GetSuperConnectsReceived(c *gin.Context) {
	userID := c.GetString("user_id")
	scs, err := h.socialRepo.GetSuperConnectsReceived(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if scs == nil {
		scs = []models.SuperConnect{}
	}
	count, _ := h.socialRepo.GetDailySuperConnectCount(c.Request.Context(), userID)
	c.JSON(http.StatusOK, gin.H{"super_connects": scs, "daily_sent": count})
}

// PUT /api/v1/me/ghost-mode
func (h *SocialHandler) SetGhostMode(c *gin.Context) {
	userID := c.GetString("user_id")
	var req models.SetGhostModeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.socialRepo.SetGhostMode(c.Request.Context(), userID, req.IsDiscoverable); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "ghost mode updated", "is_discoverable": req.IsDiscoverable})
}

// PUT /api/v1/me/vibe-tags
func (h *SocialHandler) SetVibeTags(c *gin.Context) {
	userID := c.GetString("user_id")
	var req models.SetVibeTagsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Tags) > 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "maximum 5 vibe tags allowed"})
		return
	}
	if err := h.socialRepo.SetVibeTags(c.Request.Context(), userID, req.Tags); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "vibe tags updated", "tags": req.Tags})
}

// PUT /api/v1/me/travel-mode
func (h *SocialHandler) SetTravelMode(c *gin.Context) {
	userID := c.GetString("user_id")
	var req models.SetTravelModeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	expiresHours := req.ExpiresHours
	if expiresHours <= 0 {
		expiresHours = 24
	}
	expiresAt := time.Now().Add(time.Duration(expiresHours) * time.Hour)
	if err := h.socialRepo.SetTravelMode(c.Request.Context(), userID, req.Latitude, req.Longitude, expiresAt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "travel mode set", "expires_at": expiresAt})
}

// DELETE /api/v1/me/travel-mode
func (h *SocialHandler) ClearTravelMode(c *gin.Context) {
	userID := c.GetString("user_id")
	if err := h.socialRepo.ClearTravelMode(c.Request.Context(), userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "travel mode cleared"})
}

// POST /api/v1/users/:id/vouch
func (h *SocialHandler) VouchForUser(c *gin.Context) {
	voucherID := c.GetString("user_id")
	vouchedID := c.Param("id")
	if voucherID == vouchedID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot vouch for yourself"})
		return
	}
	if err := h.socialRepo.VouchForUser(c.Request.Context(), voucherID, vouchedID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "vouch recorded"})
}

// GET /api/v1/users/:id/vouches
func (h *SocialHandler) GetVouches(c *gin.Context) {
	userID := c.Param("id")
	vouches, count, err := h.socialRepo.GetVouches(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"vouches": vouches, "count": count})
}

// GET /api/v1/users/:id/badges
func (h *SocialHandler) GetBadges(c *gin.Context) {
	userID := c.Param("id")
	badges, err := h.socialRepo.GetBadges(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"badges": badges})
}
