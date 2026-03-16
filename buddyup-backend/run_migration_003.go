package main

import (
"context"
"log"
"os"

"github.com/jackc/pgx/v5"
)

func main() {
	dbURL := "postgres://9dad91e409f72ac425336efd4702b01f2b7b7c9acbbfdfe87d59b12abbe05b85:sk_sZ01ZLs3UZchfod96Ce9B@db.prisma.io:5432/postgres?sslmode=require"
	conn, err := pgx.Connect(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer conn.Close(context.Background())

	content, err := os.ReadFile("migrations/003_add_push_token.sql")
	if err != nil {
		log.Fatalf("Error reading file: %v\n", err)
	}
	
	_, err = conn.Exec(context.Background(), string(content))
	if err != nil {
		log.Fatalf("Error executing: %v\n", err)
	}
	log.Println("Success!")
}
