package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shivansh/buddyup-backend/internal/repository"
)

type UserHandler struct {
	userRepo *repository.UserRepo
}

func NewUserHandler(userRepo *repository.UserRepo) *UserHandler {
	return &UserHandler{userRepo: userRepo}
}

// GET /api/v1/users/:id — public profile of another user
func (h *UserHandler) GetProfile(c *gin.Context) {
	targetID := c.Param("id")
	user, err := h.userRepo.GetUserByID(c.Request.Context(), targetID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	// Strip sensitive fields
	user.Email = ""
	user.PasswordHash = ""
	user.PushToken = nil
	c.JSON(http.StatusOK, user)
}
