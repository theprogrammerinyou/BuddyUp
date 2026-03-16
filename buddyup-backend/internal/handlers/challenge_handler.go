package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shivansh/buddyup-backend/internal/repository"
)

type ChallengeHandler struct {
	challengeRepo *repository.ChallengeRepo
	xpRepo        *repository.XPRepo
}

func NewChallengeHandler(challengeRepo *repository.ChallengeRepo, xpRepo *repository.XPRepo) *ChallengeHandler {
	return &ChallengeHandler{challengeRepo: challengeRepo, xpRepo: xpRepo}
}

// GET /api/v1/challenges
func (h *ChallengeHandler) ListChallenges(c *gin.Context) {
	userID := c.GetString("user_id")
	challenges, err := h.challengeRepo.ListActiveChallenges(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"challenges": challenges})
}

// POST /api/v1/challenges/:id/complete
func (h *ChallengeHandler) CompleteChallenge(c *gin.Context) {
	userID := c.GetString("user_id")
	challengeID := c.Param("id")
	xpReward, err := h.challengeRepo.CompleteChallenge(c.Request.Context(), challengeID, userID)
	if err != nil {
		if errors.Is(err, repository.ErrChallengeAlreadyCompleted) {
			c.JSON(http.StatusConflict, gin.H{"error": "challenge already completed"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	_ = h.xpRepo.AwardXP(c.Request.Context(), userID, "challenge_complete", xpReward)
	c.JSON(http.StatusOK, gin.H{"message": "challenge completed", "xp_awarded": xpReward})
}
