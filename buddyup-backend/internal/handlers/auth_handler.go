package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shivansh/buddyup-backend/internal/auth"
	"github.com/shivansh/buddyup-backend/internal/models"
	"github.com/shivansh/buddyup-backend/internal/repository"
)

type AuthHandler struct {
	userRepo *repository.UserRepo
	likeRepo *repository.LikeRepo
}

func NewAuthHandler(userRepo *repository.UserRepo, likeRepo *repository.LikeRepo) *AuthHandler {
	return &AuthHandler{userRepo: userRepo, likeRepo: likeRepo}
}

// POST /api/v1/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Interests == nil {
		req.Interests = []string{}
	}

	user, err := h.userRepo.CreateUser(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create user: " + err.Error()})
		return
	}

	// Give new users a few default matches with seed/dummy profiles so they can try messaging
	if h.likeRepo != nil {
		seedIDs, _ := h.userRepo.GetSeedUserIDs(c.Request.Context(), 3)
		for _, seedID := range seedIDs {
			_, _, _ = h.likeRepo.Like(c.Request.Context(), seedID, user.ID)
			_, _, _ = h.likeRepo.Like(c.Request.Context(), user.ID, seedID)
		}
	}

	token, err := auth.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate token"})
		return
	}

	c.JSON(http.StatusCreated, models.AuthResponse{Token: token, User: *user})
}

// POST /api/v1/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.userRepo.GetUserByEmail(c.Request.Context(), req.Email)
	if err != nil || !h.userRepo.CheckPassword(user, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	token, err := auth.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate token"})
		return
	}

	// Fetch full user with avatar
	full, err := h.userRepo.GetUserByID(c.Request.Context(), user.ID)
	if err != nil {
		full = user
	}

	c.JSON(http.StatusOK, models.AuthResponse{Token: token, User: *full})
}

// GET /api/v1/me
func (h *AuthHandler) Me(c *gin.Context) {
	userID := c.GetString("user_id")
	user, err := h.userRepo.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// POST /api/v1/me/ensure-seed-matches — ensures current user has matches with dummy/seed profiles (for existing users who didn't get them on register)
func (h *AuthHandler) EnsureSeedMatches(c *gin.Context) {
	userID := c.GetString("user_id")
	if h.likeRepo == nil {
		c.JSON(http.StatusOK, gin.H{"message": "ok"})
		return
	}
	seedIDs, _ := h.userRepo.GetSeedUserIDs(c.Request.Context(), 5)
	for _, seedID := range seedIDs {
		_, _, _ = h.likeRepo.Like(c.Request.Context(), seedID, userID)
		_, _, _ = h.likeRepo.Like(c.Request.Context(), userID, seedID)
	}
	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

// PUT /api/v1/me
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("user_id")
	if err := h.userRepo.UpdateProfile(c.Request.Context(), userID, req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update profile: " + err.Error()})
		return
	}

	user, err := h.userRepo.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch updated profile"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// PUT /api/v1/auth/push-token
func (h *AuthHandler) UpdatePushToken(c *gin.Context) {
	var req models.UpdatePushTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("user_id")
	if err := h.userRepo.UpdatePushToken(c.Request.Context(), userID, req.Token); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update push token: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "push token updated"})
}
