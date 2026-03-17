package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shivansh/buddyup-backend/internal/models"
	"github.com/shivansh/buddyup-backend/internal/repository"
)

type PersonaHandler struct {
	personaRepo *repository.PersonaRepo
}

func NewPersonaHandler(personaRepo *repository.PersonaRepo) *PersonaHandler {
	return &PersonaHandler{personaRepo: personaRepo}
}

// GET /api/v1/me/personas
func (h *PersonaHandler) ListPersonas(c *gin.Context) {
	userID := c.GetString("user_id")
	personas, err := h.personaRepo.ListPersonas(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"personas": personas})
}

// POST /api/v1/me/personas
func (h *PersonaHandler) CreatePersona(c *gin.Context) {
	userID := c.GetString("user_id")
	var req models.CreatePersonaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	persona, err := h.personaRepo.CreatePersona(c.Request.Context(), userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"persona": persona})
}

// PUT /api/v1/me/personas/:id/activate
func (h *PersonaHandler) ActivatePersona(c *gin.Context) {
	userID := c.GetString("user_id")
	personaID := c.Param("id")
	if err := h.personaRepo.ActivatePersona(c.Request.Context(), personaID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "persona activated"})
}
