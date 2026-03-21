package handlers

import (
	"fmt"
	"log"
	"net/http"

	"buddyup-stitch-backend/internal/db"
	"buddyup-stitch-backend/internal/models"

	"github.com/gin-gonic/gin"
)

// TODO: CurrentUserID is a dev-only stub that bypasses JWT authentication.
// Every handler that uses this constant ignores the actual authenticated caller.
// This MUST be replaced with identity derived from the JWT middleware (c.Get("userID"))
// before any multi-user or production use. See router.go for the auth middleware setup.
const CurrentUserID = 5

func GetUsers(c *gin.Context) {
	var users []models.User
	if err := db.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

func GetFriends(c *gin.Context) {
	var friendships []models.Friendship
	if err := db.DB.Where("user_id = ?", CurrentUserID).Find(&friendships).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var friendIDs []uint
	for _, f := range friendships {
		friendIDs = append(friendIDs, f.FriendID)
	}

	var friends []models.User
	if len(friendIDs) > 0 {
		if err := db.DB.Where("id IN ?", friendIDs).Find(&friends).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}
	c.JSON(http.StatusOK, friends)
}

func GetProfile(c *gin.Context) {
	var user models.User
	if err := db.DB.Preload("Interests").First(&user, CurrentUserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func UpdateProfile(c *gin.Context) {
	var input struct {
		Name     string `json:"name"`
		Bio      string `json:"bio"`
		Location string `json:"location"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}
	if input.Name != "" {
		updates["name"] = input.Name
	}
	if input.Bio != "" {
		updates["bio"] = input.Bio
	}

	if err := db.DB.Model(&models.User{}).Where("id = ?", CurrentUserID).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	db.DB.Preload("Interests").First(&user, CurrentUserID)
	c.JSON(http.StatusOK, user)
}

func GetActivities(c *gin.Context) {
	var activities []models.Activity
	query := db.DB.Preload("Host").Preload("Attendees")

	category := c.Query("category")
	if category != "" {
		query = query.Where("category = ?", category)
	}

	if err := query.Find(&activities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, activities)
}

func CreateActivity(c *gin.Context) {
	var input struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
		Category    string `json:"category"`
		Location    string `json:"location"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	activity := models.Activity{
		HostID:      CurrentUserID,
		Title:       input.Title,
		Description: input.Description,
		Category:    input.Category,
		Location:    input.Location,
	}

	if err := db.DB.Create(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Created Activity: %s", activity.Title)
	c.JSON(http.StatusCreated, activity)
}

func GetActivity(c *gin.Context) {
	activityID := c.Param("id")
	var activity models.Activity
	if err := db.DB.Preload("Host").Preload("Attendees").First(&activity, activityID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Activity not found"})
		return
	}
	c.JSON(http.StatusOK, activity)
}

func JoinActivity(c *gin.Context) {
	activityID := c.Param("id")
	var activity models.Activity
	if err := db.DB.First(&activity, activityID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Activity not found"})
		return
	}

	var user models.User
	db.DB.First(&user, CurrentUserID)

	if err := db.DB.Model(&activity).Association("Attendees").Append(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Joined activity successfully"})
}

func GetMessages(c *gin.Context) {
	var messages []models.Message
	if err := db.DB.Where("receiver_id = ? OR sender_id = ?", CurrentUserID, CurrentUserID).Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, messages)
}

func SendMessage(c *gin.Context) {
	var input struct {
		ReceiverID uint   `json:"receiverId" binding:"required"`
		Content    string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	message := models.Message{
		SenderID:   CurrentUserID,
		ReceiverID: input.ReceiverID,
		Content:    input.Content,
	}
	if err := db.DB.Create(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, message)
}

func GetConversations(c *gin.Context) {
	var conversations []models.Conversation
	if err := db.DB.Preload("User1").Preload("User2").
		Where("user1_id = ? OR user2_id = ?", CurrentUserID, CurrentUserID).
		Order("updated_at desc").
		Find(&conversations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, conversations)
}

func GetNotifications(c *gin.Context) {
	var notifs []models.Notification
	if err := db.DB.Where("user_id = ?", CurrentUserID).Order("created_at desc").Find(&notifs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, notifs)
}

func MarkNotificationsRead(c *gin.Context) {
	if err := db.DB.Model(&models.Notification{}).Where("user_id = ?", CurrentUserID).Update("is_read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "All notifications marked as read"})
}

func GetLeaderboard(c *gin.Context) {
	var users []models.User
	// Return all users sorted by points so the frontend can compute any user's rank
	if err := db.DB.Preload("Interests").Order("points desc").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

// --- Events ---

func GetEvents(c *gin.Context) {
	var events []models.Event
	if err := db.DB.Preload("Organizer").Preload("Attendees").Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, events)
}

func GetEvent(c *gin.Context) {
	eventID := c.Param("id")
	var event models.Event
	if err := db.DB.Preload("Organizer").Preload("Attendees").First(&event, eventID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}
	c.JSON(http.StatusOK, event)
}

func GetMyTickets(c *gin.Context) {
	var tickets []models.EventTicket
	if err := db.DB.Preload("Event").Preload("Event.Organizer").Where("user_id = ?", CurrentUserID).Find(&tickets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tickets)
}

func GetTicket(c *gin.Context) {
	ticketID := c.Param("ticketId")
	var ticket models.EventTicket
	if err := db.DB.Preload("Event").Preload("Event.Organizer").Where("ticket_id = ? AND user_id = ?", ticketID, CurrentUserID).First(&ticket).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}
	c.JSON(http.StatusOK, ticket)
}

// --- Friend Requests ---

func GetFriendRequests(c *gin.Context) {
	var requests []models.FriendRequest
	if err := db.DB.Preload("Sender").Where("receiver_id = ? AND status = 'pending'", CurrentUserID).Order("created_at desc").Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, requests)
}

func SendFriendRequest(c *gin.Context) {
	var input struct {
		ReceiverID uint `json:"receiverId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.ReceiverID == CurrentUserID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot send friend request to yourself"})
		return
	}

	req := models.FriendRequest{
		SenderID:   CurrentUserID,
		ReceiverID: input.ReceiverID,
		Status:     "pending",
	}
	if err := db.DB.Create(&req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, req)
}

func RespondFriendRequest(c *gin.Context) {
	requestID := c.Param("id")
	var input struct {
		Action string `json:"action" binding:"required"` // accept or ignore
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var req models.FriendRequest
	if err := db.DB.First(&req, requestID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Friend request not found"})
		return
	}

	if req.ReceiverID != CurrentUserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not your friend request"})
		return
	}

	if input.Action == "accept" {
		req.Status = "accepted"
		db.DB.Save(&req)

		// Create bidirectional friendships
		db.DB.Create(&models.Friendship{UserID: CurrentUserID, FriendID: req.SenderID, Status: "accepted"})
		db.DB.Create(&models.Friendship{UserID: req.SenderID, FriendID: CurrentUserID, Status: "accepted"})

		c.JSON(http.StatusOK, gin.H{"message": "Friend request accepted"})
	} else {
		req.Status = "ignored"
		db.DB.Save(&req)
		c.JSON(http.StatusOK, gin.H{"message": "Friend request ignored"})
	}
}

// --- Friend Suggestions ---

func GetFriendSuggestions(c *gin.Context) {
	// Get current user's friend IDs
	var friendships []models.Friendship
	db.DB.Where("user_id = ?", CurrentUserID).Find(&friendships)

	friendIDs := []uint{CurrentUserID}
	for _, f := range friendships {
		friendIDs = append(friendIDs, f.FriendID)
	}

	// Get users who are NOT already friends
	var suggestions []models.User
	if err := db.DB.Where("id NOT IN ?", friendIDs).Limit(10).Find(&suggestions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, suggestions)
}

// --- Interests ---

func GetInterests(c *gin.Context) {
	var interests []models.Interest
	if err := db.DB.Find(&interests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, interests)
}

func UpdateUserInterests(c *gin.Context) {
	var input struct {
		InterestIDs []uint `json:"interestIds" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := db.DB.First(&user, CurrentUserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var interests []models.Interest
	db.DB.Where("id IN ?", input.InterestIDs).Find(&interests)

	if err := db.DB.Model(&user).Association("Interests").Replace(interests); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to update interests: %v", err)})
		return
	}

	db.DB.Preload("Interests").First(&user, CurrentUserID)
	c.JSON(http.StatusOK, user)
}
