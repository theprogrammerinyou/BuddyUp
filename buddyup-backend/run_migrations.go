package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL must be set")
	}

	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer pool.Close()

	migrations := []string{
		"migrations/001_initial_schema.sql",
		"migrations/002_seed_characters.sql",
		"migrations/003_add_push_token.sql",
		"migrations/004_seed_dummy_users.sql",
	}

	for _, m := range migrations {
		fmt.Printf("Running migration: %s\n", m)
		content, err := os.ReadFile(m)
		if err != nil {
			log.Fatalf("Unable to read migration %s: %v", m, err)
		}

		_, err = pool.Exec(context.Background(), string(content))
		if err != nil {
			log.Fatalf("Error executing migration %s: %v", m, err)
		}
		fmt.Printf("Successfully applied %s\n", m)
	}
}
