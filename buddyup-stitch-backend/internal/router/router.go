package router

import (
	"buddyup-stitch-backend/internal/handlers"
	"buddyup-stitch-backend/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// CORS Setup
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Auth routes — public
	auth := r.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
		auth.POST("/google", handlers.GoogleAuth)
		auth.POST("/apple", handlers.AppleAuth)
		auth.GET("/me", middleware.AuthRequired(), handlers.GetMe)
	}

	// API v1 grouping — protected by JWT
	api := r.Group("/api/v1")
	api.Use(middleware.AuthRequired())
	{
		// Users & Friends
		api.GET("/users", handlers.GetUsers)
		api.GET("/friends", handlers.GetFriends)
		api.GET("/profile", handlers.GetProfile)
		api.PUT("/profile", handlers.UpdateProfile)

		// Interests
		api.GET("/interests", handlers.GetInterests)
		api.PUT("/interests", handlers.UpdateUserInterests)

		// Activities (supports ?category=Gym filter)
		api.GET("/activities", handlers.GetActivities)
		api.GET("/activities/:id", handlers.GetActivity)
		api.POST("/activities", handlers.CreateActivity)
		api.POST("/activities/:id/join", handlers.JoinActivity)

		// Chat & Conversations
		api.GET("/conversations", handlers.GetConversations)
		api.GET("/messages", handlers.GetMessages)
		api.POST("/messages", handlers.SendMessage)

		// Notifications
		api.GET("/notifications", handlers.GetNotifications)
		api.PUT("/notifications/read", handlers.MarkNotificationsRead)

		// Leaderboard
		api.GET("/leaderboard", handlers.GetLeaderboard)

		// Events & Tickets
		api.GET("/events", handlers.GetEvents)
		api.GET("/events/:id", handlers.GetEvent)
		api.GET("/tickets", handlers.GetMyTickets)
		api.GET("/tickets/:ticketId", handlers.GetTicket)

		// Friend Requests & Discovery
		api.GET("/friend-requests", handlers.GetFriendRequests)
		api.POST("/friend-requests", handlers.SendFriendRequest)
		api.PUT("/friend-requests/:id", handlers.RespondFriendRequest)
		api.GET("/friend-suggestions", handlers.GetFriendSuggestions)
	}

	return r
}
