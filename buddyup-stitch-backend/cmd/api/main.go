package main

import (
	"log"

	"buddyup-stitch-backend/internal/db"
	"buddyup-stitch-backend/internal/handlers"
	"buddyup-stitch-backend/internal/router"
)

func main() {
	if err := handlers.InitJWTSecret(); err != nil {
		log.Fatal(err)
	}

	log.Println("Initializing Database...")
	db.InitDB()

	log.Println("Setting up Router...")
	r := router.SetupRouter()

	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}
