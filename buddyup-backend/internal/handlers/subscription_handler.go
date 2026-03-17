package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shivansh/buddyup-backend/internal/models"
	"github.com/shivansh/buddyup-backend/internal/repository"
)

type SubscriptionHandler struct {
	subRepo *repository.SubscriptionRepo
}

func NewSubscriptionHandler(subRepo *repository.SubscriptionRepo) *SubscriptionHandler {
	return &SubscriptionHandler{subRepo: subRepo}
}

// GET /api/v1/me/subscription
func (h *SubscriptionHandler) GetSubscription(c *gin.Context) {
	userID := c.GetString("user_id")
	sub, err := h.subRepo.GetSubscription(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"subscription": sub})
}

// POST /api/v1/me/subscription/verify
func (h *SubscriptionHandler) VerifySubscription(c *gin.Context) {
	userID := c.GetString("user_id")
	var req models.VerifySubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Stub: accept the payload and store it (real provider verification out of scope)
	var expiresAt *time.Time
	if req.Plan == "buddypass_monthly" {
		t := time.Now().AddDate(0, 1, 0)
		expiresAt = &t
	} else if req.Plan == "buddypass_annual" {
		t := time.Now().AddDate(1, 0, 0)
		expiresAt = &t
	}
	sub, err := h.subRepo.UpsertSubscription(c.Request.Context(), userID, req.Plan, "active", req.Provider, req.Receipt, expiresAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"subscription": sub, "message": "subscription verified"})
}

// POST /api/v1/me/boost
func (h *SubscriptionHandler) ActivateBoost(c *gin.Context) {
	userID := c.GetString("user_id")
	isPremium, _ := h.subRepo.IsPremium(c.Request.Context(), userID)
	if !isPremium {
		c.JSON(http.StatusPaymentRequired, gin.H{"error": "BuddyPass required to boost"})
		return
	}
	boost, err := h.subRepo.ActivateBoost(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"boost": boost})
}

// GET /api/v1/me/boost
func (h *SubscriptionHandler) GetBoostStatus(c *gin.Context) {
	userID := c.GetString("user_id")
	boost, _ := h.subRepo.GetActiveBoost(c.Request.Context(), userID)
	if boost == nil {
		c.JSON(http.StatusOK, gin.H{"boost": nil, "is_active": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"boost": boost, "is_active": true})
}

// POST /api/v1/me/super-like-packs
func (h *SubscriptionHandler) PurchaseSuperLikePack(c *gin.Context) {
	userID := c.GetString("user_id")
	var req models.PurchaseSuperLikePackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.subRepo.AddSuperLikePack(c.Request.Context(), userID, req.Provider, req.TransactionID, req.Quantity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	available, _ := h.subRepo.GetSuperLikesAvailable(c.Request.Context(), userID)
	c.JSON(http.StatusCreated, gin.H{"message": "pack added", "super_likes_available": available})
}
