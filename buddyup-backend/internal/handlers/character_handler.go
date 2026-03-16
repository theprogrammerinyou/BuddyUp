package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
"github.com/shivansh/buddyup-backend/internal/models"

	"github.com/shivansh/buddyup-backend/internal/repository"
)

type CharacterHandler struct {
	charRepo *repository.CharacterRepo
}

func NewCharacterHandler(charRepo *repository.CharacterRepo) *CharacterHandler {
	return &CharacterHandler{charRepo: charRepo}
}

// GET /api/v1/characters?type=anime&search=naru
func (h *CharacterHandler) List(c *gin.Context) {
	charType := c.Query("type")   // anime | movie | book | ""
	search := c.Query("search")

	chars, err := h.charRepo.List(c.Request.Context(), charType, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if chars == nil {
		chars = []models.Character{}
	}
	c.JSON(http.StatusOK, gin.H{"characters": chars})
}
