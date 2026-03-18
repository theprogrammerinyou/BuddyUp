package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shivansh/buddyup-backend/internal/repository"
)

func main() {
	dbURL := "postgres://9dad91e409f72ac425336efd4702b01f2b7b7c9acbbfdfe87d59b12abbe05b85:sk_sZ01ZLs3UZchfod96Ce9B@db.prisma.io:5432/postgres?sslmode=require"
	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	repo := repository.NewUserRepo(pool)

	var userID string
	err = pool.QueryRow(context.Background(), "SELECT id FROM users LIMIT 1").Scan(&userID)
	if err != nil {
		log.Printf("Failed to get a user: %v", err)
	} else {
		log.Printf("Using userID: %s", userID)
		users, err := repo.Discover(context.Background(), userID, 28.6139, 77.209, 50, "")
		if err != nil {
			fmt.Println("DISCOVER ERROR:", err)
			os.Exit(1)
		}
		fmt.Printf("Success! Length of users: %d\n", len(users))
	}
}
