package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	expo "github.com/oliveroneill/exponent-server-sdk-golang/sdk"
	"github.com/shivansh/buddyup-backend/internal/handlers"
	"github.com/shivansh/buddyup-backend/internal/middleware"
	"github.com/shivansh/buddyup-backend/internal/repository"
	"github.com/shivansh/buddyup-backend/internal/ws"
)

func main() {
	_ = godotenv.Load()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL not set")
	}

	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("unable to connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("database ping failed: %v", err)
	}
	log.Println("✅ Database connected")

	// Repos
	userRepo := repository.NewUserRepo(pool)
	charRepo := repository.NewCharacterRepo(pool)
	likeRepo := repository.NewLikeRepo(pool)
	chatRepo := repository.NewChatRepo(pool)
	passRepo := repository.NewPassRepo(pool)
	groupRepo := repository.NewGroupRepo(pool)
	postRepo := repository.NewPostRepo(pool)
	eventRepo := repository.NewEventRepo(pool)
	socialRepo := repository.NewSocialRepo(pool)

	// Push notifications client (shared by hub and like handler)
	pushClient := expo.NewPushClient(nil)

	// WebSocket Hub
	hub := ws.NewHub(chatRepo, userRepo, pushClient)

	// Handlers
	authH := handlers.NewAuthHandler(userRepo, likeRepo)
	discoverH := handlers.NewDiscoverHandler(userRepo)
	likeH := handlers.NewLikeHandler(likeRepo, userRepo, pushClient)
	chatH := handlers.NewChatHandler(chatRepo, likeRepo, hub)
	charH := handlers.NewCharacterHandler(charRepo)
	passH := handlers.NewPassHandler(passRepo)
	userH := handlers.NewUserHandler(userRepo)
	groupH := handlers.NewGroupHandler(groupRepo)
	postH := handlers.NewPostHandler(postRepo)
	eventH := handlers.NewEventHandler(eventRepo)
	socialH := handlers.NewSocialHandler(socialRepo, userRepo)

	r := gin.New()
	r.Use(gin.Logger())

	// Global middlewares
	r.Use(middleware.ErrorHandler())
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Health check (no rate limit)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "buddyup-backend",
			"version": "1.0.0",
		})
	})

	api := r.Group("/api/v1")
	api.Use(middleware.RateLimit())
	{
		// Public — stricter rate limit for auth endpoints
		auth := api.Group("/auth")
		auth.Use(middleware.RateLimitStrict())
		{
			auth.POST("/register", authH.Register)
			auth.POST("/login", authH.Login)
		}
		api.GET("/characters", charH.List)

		// Protected
		protected := api.Group("")
		protected.Use(middleware.AuthRequired())
		{
			protected.GET("/me", authH.Me)
			protected.PUT("/me", authH.UpdateProfile)
			protected.POST("/me/ensure-seed-matches", authH.EnsureSeedMatches)
			protected.PUT("/auth/push-token", authH.UpdatePushToken)
			protected.PUT("/location", discoverH.UpdateLocation)
			protected.GET("/discover", discoverH.Discover)

			protected.POST("/likes", likeH.Like)
			protected.GET("/likes/me", likeH.WhoLikedMe)
			protected.GET("/matches", likeH.Matches)

			protected.POST("/passes", passH.Pass)

			protected.GET("/users/:id", userH.GetProfile)

			protected.GET("/chats/:matchId", chatH.GetHistory)

			// Groups
			protected.POST("/groups", groupH.CreateGroup)
			protected.GET("/groups", groupH.ListGroups)
			protected.GET("/groups/:id", groupH.GetGroup)
			protected.PUT("/groups/:id", groupH.UpdateGroup)
			protected.DELETE("/groups/:id", groupH.DeleteGroup)
			protected.POST("/groups/:id/join", groupH.JoinGroup)
			protected.POST("/groups/:id/leave", groupH.LeaveGroup)
			protected.GET("/groups/:id/members", groupH.GetGroupMembers)
			protected.GET("/me/groups", groupH.GetMyGroups)

			// Posts (Bulletin Board)
			protected.POST("/posts", postH.CreatePost)
			protected.GET("/posts", postH.ListPosts)
			protected.GET("/posts/:id", postH.GetPost)
			protected.DELETE("/posts/:id", postH.DeletePost)
			protected.POST("/posts/:id/respond", postH.RespondToPost)
			protected.GET("/posts/:id/responses", postH.GetPostResponses)
			protected.GET("/me/posts", postH.GetMyPosts)

			// Events
			protected.POST("/events", eventH.CreateEvent)
			protected.GET("/events", eventH.ListEvents)
			protected.GET("/events/:id", eventH.GetEvent)
			protected.DELETE("/events/:id", eventH.DeleteEvent)
			protected.POST("/events/:id/rsvp", eventH.RSVPEvent)
			protected.GET("/events/:id/rsvps", eventH.GetRSVPs)
			protected.GET("/me/events", eventH.GetMyEvents)

			// Social
			protected.POST("/users/:id/block", socialH.BlockUser)
			protected.DELETE("/users/:id/block", socialH.UnblockUser)
			protected.GET("/me/blocked", socialH.GetBlockedUsers)
			protected.POST("/users/:id/report", socialH.ReportUser)
			protected.POST("/super-connects", socialH.SendSuperConnect)
			protected.GET("/me/super-connects", socialH.GetSuperConnectsReceived)
			protected.PUT("/me/ghost-mode", socialH.SetGhostMode)
			protected.PUT("/me/vibe-tags", socialH.SetVibeTags)
			protected.PUT("/me/travel-mode", socialH.SetTravelMode)
			protected.DELETE("/me/travel-mode", socialH.ClearTravelMode)
		}
	}

	// WebSocket (auth via ?token= query param)
	r.GET("/ws/chat/:matchId", chatH.ServeWS)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 BuddyUp backend listening on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
