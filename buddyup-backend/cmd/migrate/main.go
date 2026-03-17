package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

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

	// Ensure the migrations tracking table exists.
	_, err = pool.Exec(context.Background(), `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			filename TEXT PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		log.Fatalf("Failed to create schema_migrations table: %v", err)
	}

	// Determine the directory where migration files are located.
	// Prefer an explicit MIGRATIONS_DIR env var, and fall back to a
	// "migrations" directory next to the executable.
	migrationsDir := os.Getenv("MIGRATIONS_DIR")
	if migrationsDir == "" {
		exePath, err := os.Executable()
		if err != nil {
			log.Fatalf("Unable to determine executable path: %v", err)
		}
		migrationsDir = filepath.Join(filepath.Dir(exePath), "migrations")
	}

	migrations := []string{
		"migrations/001_initial_schema.sql",
		"migrations/002_seed_characters.sql",
		"migrations/003_add_push_token.sql",
		"migrations/004_seed_dummy_users.sql",
		"migrations/005_add_passes.sql",
		"migrations/006_activity_groups.sql",
		"migrations/007_bulletin_board.sql",
		"migrations/008_events.sql",
		"migrations/009_social_features.sql",
		"migrations/010_phase3.sql",
		"migrations/011_phase4.sql",
	}

	for _, m := range migrations {
		// Skip already-applied migrations.
		var applied bool
		err = pool.QueryRow(context.Background(),
			`SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE filename = $1)`, m,
		).Scan(&applied)
		if err != nil {
			log.Fatalf("Error checking migration status for %s: %v", m, err)
		}
		if applied {
			fmt.Printf("Skipping (already applied): %s\n", m)
			continue
		}

		fmt.Printf("Running migration: %s\n", m)
		migrationPath := filepath.Join(migrationsDir, filepath.Base(m))
		content, err := os.ReadFile(migrationPath)
		if err != nil {
			log.Fatalf("Unable to read migration %s from %s: %v", m, migrationPath, err)
		}

		// Wrap each migration in a transaction for atomicity.
		tx, err := pool.Begin(context.Background())
		if err != nil {
			log.Fatalf("Failed to begin transaction for %s: %v", m, err)
		}

		if _, err = tx.Exec(context.Background(), string(content)); err != nil {
			_ = tx.Rollback(context.Background())
			log.Fatalf("Error executing migration %s: %v", m, err)
		}

		// Record the migration as applied within the same transaction.
		if _, err = tx.Exec(context.Background(),
			`INSERT INTO schema_migrations (filename) VALUES ($1)`, m,
		); err != nil {
			_ = tx.Rollback(context.Background())
			log.Fatalf("Error recording migration %s: %v", m, err)
		}

		if err = tx.Commit(context.Background()); err != nil {
			log.Fatalf("Failed to commit transaction for %s: %v", m, err)
		}
		fmt.Printf("Successfully applied %s\n", m)
	}
}
