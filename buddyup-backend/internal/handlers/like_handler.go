package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	expo "github.com/oliveroneill/exponent-server-sdk-golang/sdk"
	"github.com/shivansh/buddyup-backend/internal/models"
	"github.com/shivansh/buddyup-backend/internal/repository"
)

type LikeHandler struct {
	likeRepo   *repository.LikeRepo
	userRepo   *repository.UserRepo
	pushClient *expo.PushClient
}

func NewLikeHandler(likeRepo *repository.LikeRepo, userRepo *repository.UserRepo, pushClient *expo.PushClient) *LikeHandler {
	return &LikeHandler{likeRepo: likeRepo, userRepo: userRepo, pushClient: pushClient}
}

// POST /api/v1/likes  body: {"liked_id": "..."}
func (h *LikeHandler) Like(c *gin.Context) {
	likerID := c.GetString("user_id")
	var body struct {
		LikedID string `json:"liked_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if likerID == body.LikedID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot like yourself"})
		return
	}

	isMatch, matchID, err := h.likeRepo.Like(c.Request.Context(), likerID, body.LikedID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// When the liked user is a seed/dummy, auto-"accept" by creating the reciprocal like so it becomes a match
	if !isMatch {
		if isSeed, _ := h.userRepo.IsSeedUser(c.Request.Context(), body.LikedID); isSeed {
			isMatch, matchID, _ = h.likeRepo.Like(c.Request.Context(), body.LikedID, likerID)
		}
	}

	if isMatch && h.pushClient != nil {
		token, _ := h.userRepo.GetPushTokenByUserID(c.Request.Context(), body.LikedID)
		if token != nil && *token != "" {
			if pushToken, err := expo.NewExponentPushToken(*token); err == nil {
				likerName, _ := h.userRepo.GetDisplayNameByUserID(c.Request.Context(), likerID)
				if likerName == "" {
					likerName = "Someone"
				}
				h.pushClient.Publish(&expo.PushMessage{
					To:    []expo.ExponentPushToken{pushToken},
					Title: "You have a new match!",
					Body:  likerName + " matched with you. Say hi!",
					Sound: "default",
					Data:  map[string]string{"matchId": matchID, "userName": likerName},
				})
			}
		}
	}

	resp := gin.H{"is_match": isMatch}
	if isMatch {
		resp["match_id"] = matchID
	}
	c.JSON(http.StatusOK, resp)
}

// GET /api/v1/likes/me  — who liked me (not yet matched)
func (h *LikeHandler) WhoLikedMe(c *gin.Context) {
	userID := c.GetString("user_id")
	users, err := h.likeRepo.WhoLikedMe(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if users == nil {
		users = []models.User{}
	}
	c.JSON(http.StatusOK, gin.H{"users": users})
}

// GET /api/v1/matches
func (h *LikeHandler) Matches(c *gin.Context) {
	userID := c.GetString("user_id")
	matches, err := h.likeRepo.Matches(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if matches == nil {
		matches = []models.Match{}
	}
	c.JSON(http.StatusOK, gin.H{"matches": matches})
}
