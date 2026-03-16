package main

import (
	"context"
	"log"
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

	r := gin.Default()

	// CORS
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api/v1")
	{
		// Public
		api.POST("/auth/register", authH.Register)
		api.POST("/auth/login", authH.Login)
		api.GET("/characters", charH.List)

		// Protected
		protected := api.Group("")
		protected.Use(middleware.AuthRequired())
		{
			protected.GET("/me", authH.Me)
			protected.POST("/me/ensure-seed-matches", authH.EnsureSeedMatches)
			protected.PUT("/auth/push-token", authH.UpdatePushToken)
			protected.PUT("/location", discoverH.UpdateLocation)
			protected.GET("/discover", discoverH.Discover)

			protected.POST("/likes", likeH.Like)
			protected.GET("/likes/me", likeH.WhoLikedMe)
			protected.GET("/matches", likeH.Matches)

			protected.GET("/chats/:matchId", chatH.GetHistory)
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
