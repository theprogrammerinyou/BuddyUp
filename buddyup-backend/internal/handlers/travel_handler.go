package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shivansh/buddyup-backend/internal/models"
	"github.com/shivansh/buddyup-backend/internal/repository"
)

type TravelHandler struct {
	userRepo *repository.UserRepo
}

func NewTravelHandler(userRepo *repository.UserRepo) *TravelHandler {
	return &TravelHandler{userRepo: userRepo}
}

// POST /api/v1/me/visited-cities
func (h *TravelHandler) AddVisitedCity(c *gin.Context) {
	userID := c.GetString("user_id")
	var req models.AddVisitedCityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	city, err := h.userRepo.AddVisitedCity(c.Request.Context(), userID, req.CityName, req.CountryCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"visited_city": city})
}

// GET /api/v1/users/:id/visited-cities
func (h *TravelHandler) GetVisitedCities(c *gin.Context) {
	userID := c.Param("id")
	cities, err := h.userRepo.GetVisitedCities(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"visited_cities": cities})
}

// PUT /api/v1/me/local-guide
func (h *TravelHandler) SetLocalGuide(c *gin.Context) {
	userID := c.GetString("user_id")
	var req models.SetLocalGuideRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.userRepo.SetLocalGuide(c.Request.Context(), userID, req.IsLocalGuide); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "local guide status updated", "is_local_guide": req.IsLocalGuide})
}

// GET /api/v1/discover/co-travel?destination=...
func (h *TravelHandler) DiscoverCoTravel(c *gin.Context) {
	destination := c.Query("destination")
	if destination == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "destination query parameter is required"})
		return
	}
	users, err := h.userRepo.DiscoverCoTravel(c.Request.Context(), destination)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"users": users})
}
