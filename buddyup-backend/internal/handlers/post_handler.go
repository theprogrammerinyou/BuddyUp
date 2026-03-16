package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/shivansh/buddyup-backend/internal/models"
	"github.com/shivansh/buddyup-backend/internal/repository"
)

type PostHandler struct {
	postRepo *repository.PostRepo
}

func NewPostHandler(postRepo *repository.PostRepo) *PostHandler {
	return &PostHandler{postRepo: postRepo}
}

// POST /api/v1/posts
func (h *PostHandler) CreatePost(c *gin.Context) {
	userID := c.GetString("user_id")
	var req models.CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	post, err := h.postRepo.CreatePost(c.Request.Context(), userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"post": post})
}

// GET /api/v1/posts
func (h *PostHandler) ListPosts(c *gin.Context) {
	activityType := c.Query("activity_type")
	lat, _ := strconv.ParseFloat(c.Query("latitude"), 64)
	lng, _ := strconv.ParseFloat(c.Query("longitude"), 64)
	radiusKm, _ := strconv.ParseFloat(c.Query("radius_km"), 64)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	posts, err := h.postRepo.ListPosts(c.Request.Context(), activityType, lat, lng, radiusKm, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if posts == nil {
		posts = []models.Post{}
	}
	c.JSON(http.StatusOK, gin.H{"posts": posts})
}

// GET /api/v1/posts/:id
func (h *PostHandler) GetPost(c *gin.Context) {
	postID := c.Param("id")
	post, err := h.postRepo.GetPost(c.Request.Context(), postID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"post": post})
}

// DELETE /api/v1/posts/:id
func (h *PostHandler) DeletePost(c *gin.Context) {
	userID := c.GetString("user_id")
	postID := c.Param("id")

	if err := h.postRepo.DeletePost(c.Request.Context(), postID, userID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "post deleted"})
}

// POST /api/v1/posts/:id/respond
func (h *PostHandler) RespondToPost(c *gin.Context) {
	userID := c.GetString("user_id")
	postID := c.Param("id")

	var req models.RespondToPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := h.postRepo.RespondToPost(c.Request.Context(), postID, userID, req.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"response": resp})
}

// GET /api/v1/posts/:id/responses
func (h *PostHandler) GetPostResponses(c *gin.Context) {
	postID := c.Param("id")
	responses, err := h.postRepo.GetPostResponses(c.Request.Context(), postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if responses == nil {
		responses = []models.PostResponse{}
	}
	c.JSON(http.StatusOK, gin.H{"responses": responses})
}

// GET /api/v1/me/posts
func (h *PostHandler) GetMyPosts(c *gin.Context) {
	userID := c.GetString("user_id")
	posts, err := h.postRepo.GetUserPosts(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if posts == nil {
		posts = []models.Post{}
	}
	c.JSON(http.StatusOK, gin.H{"posts": posts})
}
