package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shivansh/buddyup-backend/internal/models"
	"github.com/shivansh/buddyup-backend/internal/repository"
)

var (
	boyNames = []string{"Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Kabir", "Rohan", "Dev", "Dhruv", "Rishabh"}
	girlNames = []string{"Aadya", "Diya", "Ananya", "Myra", "Kiara", "Sanya", "Isha", "Ria", "Meera", "Zara"}
	
	bios = []string{
		"Tech enthusiast. Always learning something new. Let's grab coffee! ☕",
		"Gym freak 💪 and avid traveler ✈️. Looking for workout buddies.",
		"Code by day, game by night. 🎮 Send me your best memes.",
		"Foodie, photographer, and weekend hiker. 📸🏔️",
		"Just moved here! Looking to explore the city and find chill people. 🌆",
		"Yoga mornings and Netflix evenings. 🧘‍♀️🎬",
		"Music lover 🎸 and casual gamer. Always down for a jam session.",
		"Startup grind. 💼 Looking for co-founders or just smart people to talk to.",
		"Books, bikes, and baking. 📚🚲🧁 Let's exchange recipes!",
		"Always planning the next trip. 🌍 Wanderlust.",
	}

	allInterests = []string{"Gym", "Running", "Yoga", "Football", "Basketball", "Cricket", "Badminton", "Coding", "Gaming", "Hiking", "Travel", "Coffee Hangouts"}

	// Major Indian cities [lat, lng]
	cities = [][2]float64{
		{19.0760, 72.8777}, // Mumbai
		{28.7041, 77.1025}, // Delhi
		{12.9716, 77.5946}, // Bangalore
		{17.3850, 78.4867}, // Hyderabad
		{13.0827, 80.2707}, // Chennai
		{22.5726, 88.3639}, // Kolkata
		{18.5204, 73.8567}, // Pune
		{23.0225, 72.5714}, // Ahmedabad
		{26.9124, 75.7873}, // Jaipur
	}
)

func randomElements(slice []string, count int) []string {
	rand.Shuffle(len(slice), func(i, j int) {
		slice[i], slice[j] = slice[j], slice[i]
	})
	if count > len(slice) {
		count = len(slice)
	}
	result := make([]string, count)
	copy(result, slice[:count])
	return result
}

func main() {
	rand.Seed(time.Now().UnixNano())

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}
	dbpool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer dbpool.Close()

	userRepo := repository.NewUserRepo(dbpool)
	
	// Create characters to map to (assuming 1-45 exists based on DB dump)
	
	log.Println("Starting to seed Indian dummy users...")
	
	for i := 1; i <= 50; i++ {
		isBoy := rand.Intn(2) == 0
		var name string
		if isBoy {
			name = boyNames[rand.Intn(len(boyNames))]
		} else {
			name = girlNames[rand.Intn(len(girlNames))]
		}
		
		// Add some uniqueness to name
		name = fmt.Sprintf("%s %d", name, rand.Intn(100))
		email := fmt.Sprintf("seed_%d@buddyup.local", i)
		bio := bios[rand.Intn(len(bios))]
		
		// 1 to 45 character ID
		charID := rand.Intn(45) + 1
		
		interestCount := rand.Intn(4) + 2 // 2 to 5 interests
		myInterests := randomElements(append([]string{}, allInterests...), interestCount)
		
		city := cities[rand.Intn(len(cities))]
		// Add slight random offset for jittering within city (approx 10km radius max)
		latOffset := (rand.Float64() - 0.5) * 0.1
		lngOffset := (rand.Float64() - 0.5) * 0.1
		lat := city[0] + latOffset
		lng := city[1] + lngOffset

		req := models.RegisterRequest{
			Email:       email,
			Password:    "password123",
			DisplayName: name,
			Bio:         bio,
			CharacterID: &charID,
			Interests:   myInterests,
			Latitude:    &lat,
			Longitude:   &lng,
		}

		user, err := userRepo.CreateUser(context.Background(), req)
		if err != nil {
			log.Printf("Failed to create user %s: %v\n", email, err)
			continue
		}
		log.Printf("Created user: %s (ID: %s) in %v\n", user.DisplayName, user.ID, myInterests)
	}

	log.Println("Seeding complete!")
}
