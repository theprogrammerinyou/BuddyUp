package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/shivansh/buddyup-backend/internal/models"
	"github.com/shivansh/buddyup-backend/internal/repository"
)

type DiscoverHandler struct {
	userRepo *repository.UserRepo
}

func NewDiscoverHandler(userRepo *repository.UserRepo) *DiscoverHandler {
	return &DiscoverHandler{userRepo: userRepo}
}

// GET /api/v1/discover?latitude=xx&longitude=xx&radius_km=xx&activity_type=xx
func (h *DiscoverHandler) Discover(c *gin.Context) {
	userID := c.GetString("user_id")

	lat, _ := strconv.ParseFloat(c.Query("latitude"), 64)
	lng, _ := strconv.ParseFloat(c.Query("longitude"), 64)
	radius, _ := strconv.ParseFloat(c.Query("radius_km"), 64)
	activityType := c.Query("activity_type")
	if radius == 0 {
		radius = 50
	}

	// If no location provided, use user's stored location, else fallback to default (India center) so discover still returns users
	if lat == 0 && lng == 0 {
		user, err := h.userRepo.GetUserByID(c.Request.Context(), userID)
		if err == nil && user.Latitude != nil && user.Longitude != nil {
			lat = *user.Latitude
			lng = *user.Longitude
		} else {
			lat = 28.6139
			lng = 77.209
		}
	}

	users, err := h.userRepo.Discover(c.Request.Context(), userID, lat, lng, radius, activityType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if users == nil {
		users = []models.DiscoverUser{}
	}
	c.JSON(http.StatusOK, gin.H{"users": users})
}

// PUT /api/v1/location
func (h *DiscoverHandler) UpdateLocation(c *gin.Context) {
	userID := c.GetString("user_id")
	var req models.UpdateLocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.userRepo.UpdateLocation(c.Request.Context(), userID, req.Latitude, req.Longitude); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "location updated"})
}
