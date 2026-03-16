package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shivansh/buddyup-backend/internal/models"
	"github.com/shivansh/buddyup-backend/internal/repository"
)

type EventHandler struct {
	eventRepo *repository.EventRepo
}

func NewEventHandler(eventRepo *repository.EventRepo) *EventHandler {
	return &EventHandler{eventRepo: eventRepo}
}

// POST /api/v1/events
func (h *EventHandler) CreateEvent(c *gin.Context) {
	userID := c.GetString("user_id")
	var req models.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	event, err := h.eventRepo.CreateEvent(c.Request.Context(), userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"event": event})
}

// GET /api/v1/events
func (h *EventHandler) ListEvents(c *gin.Context) {
	activityType := c.Query("activity_type")
	lat, _ := strconv.ParseFloat(c.Query("latitude"), 64)
	lng, _ := strconv.ParseFloat(c.Query("longitude"), 64)
	radiusKm, _ := strconv.ParseFloat(c.Query("radius_km"), 64)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	var fromTime time.Time
	if ft := c.Query("from_time"); ft != "" {
		fromTime, _ = time.Parse(time.RFC3339, ft)
	}

	events, err := h.eventRepo.ListEvents(c.Request.Context(), activityType, lat, lng, radiusKm, fromTime, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if events == nil {
		events = []models.Event{}
	}
	c.JSON(http.StatusOK, gin.H{"events": events})
}

// GET /api/v1/events/:id
func (h *EventHandler) GetEvent(c *gin.Context) {
	userID := c.GetString("user_id")
	eventID := c.Param("id")

	event, err := h.eventRepo.GetEvent(c.Request.Context(), eventID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"event": event})
}

// DELETE /api/v1/events/:id
func (h *EventHandler) DeleteEvent(c *gin.Context) {
	userID := c.GetString("user_id")
	eventID := c.Param("id")

	if err := h.eventRepo.DeleteEvent(c.Request.Context(), eventID, userID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "event deleted"})
}

// POST /api/v1/events/:id/rsvp
func (h *EventHandler) RSVPEvent(c *gin.Context) {
	userID := c.GetString("user_id")
	eventID := c.Param("id")

	var req models.RSVPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.eventRepo.RSVP(c.Request.Context(), eventID, userID, req.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "rsvp recorded"})
}

// GET /api/v1/events/:id/rsvps
func (h *EventHandler) GetRSVPs(c *gin.Context) {
	eventID := c.Param("id")
	rsvps, err := h.eventRepo.GetRSVPs(c.Request.Context(), eventID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if rsvps == nil {
		rsvps = []models.EventRSVP{}
	}
	c.JSON(http.StatusOK, gin.H{"rsvps": rsvps})
}

// GET /api/v1/me/events
func (h *EventHandler) GetMyEvents(c *gin.Context) {
	userID := c.GetString("user_id")
	events, err := h.eventRepo.GetUserEvents(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if events == nil {
		events = []models.Event{}
	}
	c.JSON(http.StatusOK, gin.H{"events": events})
}
