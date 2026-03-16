package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/shivansh/buddyup-backend/internal/models"
	"github.com/shivansh/buddyup-backend/internal/repository"
)

type GroupHandler struct {
	groupRepo *repository.GroupRepo
}

func NewGroupHandler(groupRepo *repository.GroupRepo) *GroupHandler {
	return &GroupHandler{groupRepo: groupRepo}
}

// POST /api/v1/groups
func (h *GroupHandler) CreateGroup(c *gin.Context) {
	userID := c.GetString("user_id")
	var req models.CreateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	group, err := h.groupRepo.CreateGroup(c.Request.Context(), userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"group": group})
}

// GET /api/v1/groups
func (h *GroupHandler) ListGroups(c *gin.Context) {
	activityType := c.Query("activity_type")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	groups, err := h.groupRepo.ListGroups(c.Request.Context(), activityType, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if groups == nil {
		groups = []models.Group{}
	}
	c.JSON(http.StatusOK, gin.H{"groups": groups})
}

// GET /api/v1/groups/:id
func (h *GroupHandler) GetGroup(c *gin.Context) {
	userID := c.GetString("user_id")
	groupID := c.Param("id")

	group, err := h.groupRepo.GetGroup(c.Request.Context(), groupID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "group not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"group": group})
}

// PUT /api/v1/groups/:id
func (h *GroupHandler) UpdateGroup(c *gin.Context) {
	userID := c.GetString("user_id")
	groupID := c.Param("id")

	var req models.UpdateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	group, err := h.groupRepo.UpdateGroup(c.Request.Context(), groupID, userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"group": group})
}

// DELETE /api/v1/groups/:id
func (h *GroupHandler) DeleteGroup(c *gin.Context) {
	userID := c.GetString("user_id")
	groupID := c.Param("id")

	if err := h.groupRepo.DeleteGroup(c.Request.Context(), groupID, userID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "group deleted"})
}

// POST /api/v1/groups/:id/join
func (h *GroupHandler) JoinGroup(c *gin.Context) {
	userID := c.GetString("user_id")
	groupID := c.Param("id")

	if err := h.groupRepo.JoinGroup(c.Request.Context(), groupID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "joined group"})
}

// POST /api/v1/groups/:id/leave
func (h *GroupHandler) LeaveGroup(c *gin.Context) {
	userID := c.GetString("user_id")
	groupID := c.Param("id")

	if err := h.groupRepo.LeaveGroup(c.Request.Context(), groupID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "left group"})
}

// GET /api/v1/groups/:id/members
func (h *GroupHandler) GetGroupMembers(c *gin.Context) {
	groupID := c.Param("id")

	members, err := h.groupRepo.GetGroupMembers(c.Request.Context(), groupID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if members == nil {
		members = []models.User{}
	}
	c.JSON(http.StatusOK, gin.H{"members": members})
}

// GET /api/v1/me/groups
func (h *GroupHandler) GetMyGroups(c *gin.Context) {
	userID := c.GetString("user_id")

	groups, err := h.groupRepo.GetUserGroups(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if groups == nil {
		groups = []models.Group{}
	}
	c.JSON(http.StatusOK, gin.H{"groups": groups})
}
