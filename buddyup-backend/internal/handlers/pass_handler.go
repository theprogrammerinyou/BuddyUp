package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shivansh/buddyup-backend/internal/models"
	"github.com/shivansh/buddyup-backend/internal/repository"
)

type PassHandler struct {
	passRepo *repository.PassRepo
}

func NewPassHandler(passRepo *repository.PassRepo) *PassHandler {
	return &PassHandler{passRepo: passRepo}
}

// POST /api/v1/passes
func (h *PassHandler) Pass(c *gin.Context) {
	var req models.PassRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("user_id")
	if userID == req.PassedID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot pass on yourself"})
		return
	}

	if err := h.passRepo.Pass(c.Request.Context(), userID, req.PassedID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to record pass"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "passed"})
}
