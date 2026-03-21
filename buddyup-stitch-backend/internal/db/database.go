package db

import (
	"log"
	"time"

	"buddyup-stitch-backend/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open("buddyup.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database:", err)
	}

	// Migrate the schema
	err = DB.AutoMigrate(
		&models.User{},
		&models.Interest{},
		&models.Friendship{},
		&models.Activity{},
		&models.Message{},
		&models.Notification{},
		&models.Event{},
		&models.EventTicket{},
		&models.FriendRequest{},
		&models.Conversation{},
	)
	if err != nil {
		log.Fatal("failed to migrate database:", err)
	}

	SeedData(DB)
}

func SeedData(db *gorm.DB) {
	var count int64
	db.Model(&models.User{}).Count(&count)
	if count > 0 {
		return // Already seeded — delete buddyup.db to reseed
	}

	now := time.Now()

	// ── Interests ────────────────────────────────────────────────────────────
	// Index: 0=Gym 1=Coding 2=Gaming 3=Music 4=Outdoors 5=Design 6=Tech 7=Photo 8=Tennis 9=Yoga 10=Sports
	interests := []models.Interest{
		{Name: "Gym & Fitness"},
		{Name: "Coding"},
		{Name: "Gaming"},
		{Name: "Music & Raves"},
		{Name: "Outdoors"},
		{Name: "Design"},
		{Name: "Tech"},
		{Name: "Photography"},
		{Name: "Tennis"},
		{Name: "Yoga"},
		{Name: "Sports"},
	}
	db.Create(&interests)

	// ── Users ─────────────────────────────────────────────────────────────────
	// Points are calibrated so id=5 (Shivansh) lands at leaderboard rank 14
	// with 20 pts to next rank (Maya Rossi at 1020).
	users := []models.User{
		// id=1  leaderboard #2
		{Name: "Alex Rivera", Email: "alex@example.com", Bio: "Night owl. Code enthusiast. Always looking for a 5 AM gym partner. Living between code and sets.", IsOnline: true, Points: 2410, AvatarURL: "https://i.pravatar.cc/150?u=alex1"},
		// id=2  leaderboard #9
		{Name: "Mina K.", Email: "mina@example.com", Bio: "UI wizard & music visualizer coder. Always pair programming at odd hours at The Grid Cafe.", IsOnline: true, Points: 1620, AvatarURL: "https://i.pravatar.cc/150?u=mina2"},
		// id=3  leaderboard #4
		{Name: "Jordan Lee", Email: "jordan@example.com", Bio: "Basketball at midnight. Code by day. Central Park is my second home.", IsOnline: true, Points: 2100, AvatarURL: "https://i.pravatar.cc/150?u=jordan3"},
		// id=4  leaderboard #12
		{Name: "Casey Vibe", Email: "casey@example.com", Bio: "Chasing sunsets and deadlifts. Trail runner on weekends.", IsOnline: false, Points: 1380, AvatarURL: "https://i.pravatar.cc/150?u=casey4"},
		// id=5  CURRENT DEV USER — leaderboard #14
		{Name: "Shivansh", Email: "shivansh@example.com", Bio: "Building the future, one commit at a time. Always up for a late-night hackathon.", IsOnline: true, Points: 1000, AvatarURL: "https://i.pravatar.cc/150?u=shivansh5"},
		// id=6  leaderboard #1
		{Name: "Luna Spark", Email: "luna@example.com", Bio: "Techno fan & midnight cyclist. Glowing since 2020.", IsOnline: true, Points: 2450, AvatarURL: "https://i.pravatar.cc/150?u=luna6"},
		// id=7  leaderboard #3
		{Name: "Zara Neon", Email: "zara@example.com", Bio: "Techno yoga instructor. Coffee snob. Meeting at the neon pier tonight.", IsOnline: true, Points: 2385, AvatarURL: "https://i.pravatar.cc/150?u=zara7"},
		// id=8  leaderboard #10
		{Name: "Felix Code", Email: "felix@example.com", Bio: "Into cyberpunk AI and late-night raves. Age 27.", IsOnline: false, Points: 1540, AvatarURL: "https://i.pravatar.cc/150?u=felix8"},
		// id=9  leaderboard #15
		{Name: "Nico Drift", Email: "nico@example.com", Bio: "Midnight rave attendee. Age 25. Always moving.", IsOnline: true, Points: 985, AvatarURL: "https://i.pravatar.cc/150?u=nico9"},
		// id=10 leaderboard #19
		{Name: "Jamie Fox", Email: "jamie@example.com", Bio: "Gamer and night owl. Pro at Apex Legends. Sent you a friend request 2m ago.", IsOnline: true, Points: 900, AvatarURL: "https://i.pravatar.cc/150?u=jamie10"},
		// id=11 leaderboard #8
		{Name: "Sasha Vane", Email: "sasha@example.com", Bio: "Verified event host & community builder. 12 mutual friends.", IsOnline: true, Points: 1660, AvatarURL: "https://i.pravatar.cc/150?u=sasha11"},
		// id=12 leaderboard #6
		{Name: "Devon Blake", Email: "devon@example.com", Bio: "Gym beast. Street sports fanatic. Active Now.", IsOnline: true, Points: 1850, AvatarURL: "https://i.pravatar.cc/150?u=devon12"},
		// id=13 leaderboard #5
		{Name: "Miki Hayashi", Email: "miki@example.com", Bio: "Tennis pro & yoga enthusiast. Active 15 mins ago.", IsOnline: true, Points: 1980, AvatarURL: "https://i.pravatar.cc/150?u=miki13"},
		// id=14 leaderboard #7
		{Name: "Sofia Cruz", Email: "sofia@example.com", Bio: "Photographer. Designer. Music & rave scene veteran.", IsOnline: false, Points: 1720, AvatarURL: "https://i.pravatar.cc/150?u=sofia14"},
		// id=15 leaderboard #11
		{Name: "Alex Chen", Email: "alexchen@example.com", Bio: "Tennis addict. Both of us love the court. Court side sessions every weekend.", IsOnline: true, Points: 1480, AvatarURL: "https://i.pravatar.cc/150?u=alexchen15"},
		// id=16 leaderboard #13 — 20 pts above Shivansh
		{Name: "Maya Rossi", Email: "maya@example.com", Bio: "Music duo vibes. Photographer at heart.", IsOnline: false, Points: 1020, AvatarURL: "https://i.pravatar.cc/150?u=maya16"},
		// id=17 leaderboard #16
		{Name: "Axel Storm", Email: "axel@example.com", Bio: "Coder & gamer. Late-night sessions only.", IsOnline: true, Points: 960, AvatarURL: "https://i.pravatar.cc/150?u=axel17"},
		// id=18 leaderboard #17
		{Name: "Mia Chen", Email: "mia@example.com", Bio: "Outdoors, photography, design. Sunrise hiker.", IsOnline: false, Points: 940, AvatarURL: "https://i.pravatar.cc/150?u=mia18"},
		// id=19 leaderboard #18
		{Name: "Ryan Park", Email: "ryan@example.com", Bio: "Sports all day, games all night.", IsOnline: false, Points: 920, AvatarURL: "https://i.pravatar.cc/150?u=ryan19"},
		// id=20 leaderboard #20
		{Name: "Jade Kim", Email: "jade@example.com", Bio: "Zen vibes. Yoga, photography, outdoors.", IsOnline: true, Points: 880, AvatarURL: "https://i.pravatar.cc/150?u=jade20"},
	}
	db.Create(&users)

	// ── User → Interest M2M assignments ────────────────────────────────────
	// Each inner slice is 0-based indices into the `interests` array above.
	userInterestMap := [][]int{
		{0, 1, 2},   // id=1  Alex Rivera:  Gym, Coding, Gaming
		{1, 5, 6},   // id=2  Mina K.:      Coding, Design, Tech
		{10, 2, 0},  // id=3  Jordan Lee:   Sports, Gaming, Gym
		{0, 4, 9},   // id=4  Casey Vibe:   Gym, Outdoors, Yoga
		{1, 6, 2},   // id=5  Shivansh:     Coding, Tech, Gaming
		{4, 3, 9},   // id=6  Luna Spark:   Outdoors, Music, Yoga
		{3, 9, 5},   // id=7  Zara Neon:    Music, Yoga, Design
		{2, 6, 5},   // id=8  Felix Code:   Gaming, Tech, Design
		{3, 2, 4},   // id=9  Nico Drift:   Music, Gaming, Outdoors
		{2, 3, 4},   // id=10 Jamie Fox:    Gaming, Music, Outdoors
		{0, 6, 4},   // id=11 Sasha Vane:   Gym, Tech, Outdoors
		{0, 10, 2},  // id=12 Devon Blake:  Gym, Sports, Gaming
		{8, 10, 9},  // id=13 Miki Hayashi: Tennis, Sports, Yoga
		{5, 7, 3},   // id=14 Sofia Cruz:   Design, Photography, Music
		{8, 10, 0},  // id=15 Alex Chen:    Tennis, Sports, Gym
		{3, 7, 5},   // id=16 Maya Rossi:   Music, Photography, Design
		{2, 6, 1},   // id=17 Axel Storm:   Gaming, Tech, Coding
		{7, 5, 4},   // id=18 Mia Chen:     Photography, Design, Outdoors
		{10, 2, 3},  // id=19 Ryan Park:    Sports, Gaming, Music
		{9, 7, 4},   // id=20 Jade Kim:     Yoga, Photography, Outdoors
	}
	for i, idxList := range userInterestMap {
		ints := make([]models.Interest, len(idxList))
		for j, idx := range idxList {
			ints[j] = interests[idx]
		}
		db.Model(&users[i]).Association("Interests").Replace(ints)
	}

	// ── Friendships (bidirectional for Shivansh, id=5, index=4) ─────────────
	friendships := []models.Friendship{
		{UserID: 5, FriendID: 1, Status: "accepted"},  // ↔ Alex Rivera
		{UserID: 1, FriendID: 5, Status: "accepted"},
		{UserID: 5, FriendID: 3, Status: "accepted"},  // ↔ Jordan Lee
		{UserID: 3, FriendID: 5, Status: "accepted"},
		{UserID: 5, FriendID: 6, Status: "accepted"},  // ↔ Luna Spark
		{UserID: 6, FriendID: 5, Status: "accepted"},
		{UserID: 5, FriendID: 7, Status: "accepted"},  // ↔ Zara Neon
		{UserID: 7, FriendID: 5, Status: "accepted"},
		{UserID: 5, FriendID: 8, Status: "accepted"},  // ↔ Felix Code
		{UserID: 8, FriendID: 5, Status: "accepted"},
		{UserID: 5, FriendID: 9, Status: "accepted"},  // ↔ Nico Drift
		{UserID: 9, FriendID: 5, Status: "accepted"},
	}
	db.Create(&friendships)

	// ── Activities ───────────────────────────────────────────────────────────
	// StartTime offsets from now to give a sense of "live" and upcoming activities.
	activities := []models.Activity{
		// index=0  Discovery Feed hero card / Activity Details screen
		{HostID: 1, Title: "Leg Day @ The Grid", Description: "Join me for a high-intensity leg session focusing on squats and deadlifts. Looking for a partner to push limits.", Category: "Gym", Location: "The Grid Fitness", StartTime: now.Add(2 * time.Hour)},
		// index=1  Discovery Feed side card
		{HostID: 2, Title: "Build a React Native App", Description: "Working on a music visualizer. Need a UI expert to pair program tonight at The Grid Cafe.", Category: "Coding", Location: "The Grid Cafe", StartTime: now.Add(4 * time.Hour)},
		// index=2  Discovery Feed side card
		{HostID: 3, Title: "Pickup Basketball @ 6PM", Description: "Central Park courts. We have 3 people, need 2 more for full-court. Competitive vibes.", Category: "Sports", Location: "Central Park Courts", StartTime: now.Add(1 * time.Hour)},
		// index=3  Trending Gaming
		{HostID: 10, Title: "Apex Duo Night", Description: "Looking for a squad for ranked Apex Legends. Serious players only. 4 spots left.", Category: "Gaming", Location: "Online", StartTime: now.Add(30 * time.Minute)},
		// index=4  Trending Gaming
		{HostID: 8, Title: "Valo Scrims", Description: "Competitive Valorant scrimmages. Diamond+ rank preferred. 1 spot remaining.", Category: "Gaming", Location: "Online", StartTime: now.Add(45 * time.Minute)},
		// index=5  Trending Gaming
		{HostID: 17, Title: "Dota Turbo Night", Description: "Chill Dota 2 turbo games. All skill levels welcome. 2 spots open.", Category: "Gaming", Location: "Online", StartTime: now.Add(15 * time.Minute)},
		// index=6  Map View — Iron Haven HIIT
		{HostID: 12, Title: "Iron Haven HIIT", Description: "Burn 500 calories in 30 mins. Devon's signature HIIT circuit. 12 joining.", Category: "Gym", Location: "Iron Haven Gym", StartTime: now.Add(3 * time.Hour)},
		// index=7  Map View — Rust Dev Jam
		{HostID: 2, Title: "Rust Dev Jam", Description: "Building projects in Rust. All experience levels welcome. 8 slots left.", Category: "Coding", Location: "WeWork SOHO", StartTime: now.Add(5 * time.Hour)},
		// index=8  Map View — 3v3 Street Hoops
		{HostID: 3, Title: "3v3 Street Hoops", Description: "Street basketball tournament. Starts in 15 mins. Come ready to ball.", Category: "Sports", Location: "Riverside Courts", StartTime: now.Add(15 * time.Minute)},
		// index=9  Map View — Level Up eSports
		{HostID: 10, Title: "Level Up eSports", Description: "5 players online. Join the gaming hub for casual competitive esports.", Category: "Gaming", Location: "Level Up Arcade", StartTime: now.Add(20 * time.Minute)},
		// index=10 Map View — Sunset Courts
		{HostID: 15, Title: "Sunset Courts Tennis", Description: "Available until 10 PM. All levels welcome, just bring your racket.", Category: "Tennis", Location: "Sunset Courts", StartTime: now.Add(2 * time.Hour)},
		// index=11 Notification match — Midnight Cycling
		{HostID: 6, Title: "Midnight Cycling", Description: "Night ride through downtown neon streets. Join the glowing peloton.", Category: "Outdoors", Location: "Central Park", StartTime: now.Add(6 * time.Hour)},
		// index=12 Notification match — Techno Yoga
		{HostID: 7, Title: "Techno Yoga Session", Description: "Yoga to techno beats. Find your zen in the chaos. Open to all levels.", Category: "Yoga", Location: "Neon Studio, Downtown", StartTime: now.Add(7 * time.Hour)},
		// index=13 Onboarding "HOT NOW" card
		{HostID: 13, Title: "Late Night Padel", Description: "12+ people nearby. Hot game of Padel under the lights. Last spots!", Category: "Sports", Location: "The Padel Club", StartTime: now.Add(8 * time.Hour)},
	}
	db.Create(&activities)

	// Activity attendees (Shivansh = users[4], index 0-based)
	db.Model(&activities[0]).Association("Attendees").Append([]models.User{users[4], users[11]})  // Leg Day: Shivansh + Devon
	db.Model(&activities[2]).Association("Attendees").Append([]models.User{users[3], users[4]})   // Basketball: Casey + Shivansh
	db.Model(&activities[11]).Association("Attendees").Append([]models.User{users[4], users[8]})  // Midnight Cycling: Shivansh + Nico
	db.Model(&activities[12]).Association("Attendees").Append([]models.User{users[0], users[4]})  // Techno Yoga: Alex + Shivansh

	// ── Events (ticketed, with QR codes) ─────────────────────────────────────
	events := []models.Event{
		{OrganizerID: 11, Title: "Code & Coffee", Description: "A late-night coding meetup with coffee. Verified event by Sasha Vane.", Category: "Tech", Location: "Neon District Hub", Address: "404 Cyber Lane, Sector 7, Entrance B, 3rd Floor", IsVerified: true, StartTime: now.Add(3 * time.Hour)},
		{OrganizerID: 1, Title: "Glow Run 5K", Description: "Run through neon-lit streets. Confirmed for Friday night!", Category: "Fitness", Location: "Downtown Start Line", Address: "100 Neon Blvd", IsVerified: true, StartTime: now.Add(48 * time.Hour)},
	}
	db.Create(&events)

	tickets := []models.EventTicket{
		{EventID: 1, UserID: 5, TicketID: "PLS-882-X90", Status: "confirmed"},
		{EventID: 2, UserID: 5, TicketID: "PLS-441-B23", Status: "confirmed"},
	}
	db.Create(&tickets)

	// ── Friend Request ────────────────────────────────────────────────────────
	// Design: "Jamie Fox sent you a friend request 2m ago"
	friendRequests := []models.FriendRequest{
		{SenderID: 10, ReceiverID: 5, Status: "pending", CreatedAt: now.Add(-2 * time.Minute)},
	}
	db.Create(&friendRequests)

	// ── Conversations ─────────────────────────────────────────────────────────
	// Design: Messages List shows these threads, sorted by UpdatedAt desc
	conversations := []models.Conversation{
		{User1ID: 7, User2ID: 5, LastMessage: "Are we still meeting at the neon pier at 9?", UpdatedAt: now.Add(-15 * time.Minute)},
		{User1ID: 5, User2ID: 1, LastMessage: "Absolutely! Just finishing up some work. I'll be there in 20.", UpdatedAt: now.Add(-25 * time.Minute)},
		{User1ID: 6, User2ID: 5, LastMessage: "Great session! See you at midnight cycling?", UpdatedAt: now.Add(-60 * time.Minute)},
		{User1ID: 5, User2ID: 3, LastMessage: "Sent a photo", UpdatedAt: now.Add(-2 * time.Hour)},
		{User1ID: 5, User2ID: 10, LastMessage: "Great session today! Catch you later?", UpdatedAt: now.Add(-3 * time.Hour)},
	}
	db.Create(&conversations)

	// ── Messages ─────────────────────────────────────────────────────────────
	// Design: Messages___Chat.html — Alex Rivera conversation
	messages := []models.Message{
		{SenderID: 1, ReceiverID: 5, Content: "Yo! Still down for that session? Meeting for Leg Day @ The Grid in 30 mins.", IsRead: true, CreatedAt: now.Add(-25 * time.Minute)},
		{SenderID: 5, ReceiverID: 1, Content: "Absolutely! Just finishing up some work. I'll be there in 20. Don't start the squats without me!", IsRead: true, CreatedAt: now.Add(-23 * time.Minute)},
		// Zara's message thread (from Notifications design: 15m ago, unread)
		{SenderID: 7, ReceiverID: 5, Content: "Are we still meeting at the neon pier at 9?", IsRead: false, CreatedAt: now.Add(-15 * time.Minute)},
		// Luna's message thread
		{SenderID: 6, ReceiverID: 5, Content: "Great session! See you at midnight cycling?", IsRead: false, CreatedAt: now.Add(-60 * time.Minute)},
		// Jordan
		{SenderID: 5, ReceiverID: 3, Content: "Sent a photo", IsRead: true, CreatedAt: now.Add(-2 * time.Hour)},
		// Jamie
		{SenderID: 5, ReceiverID: 10, Content: "Great session today! Catch you later?", IsRead: true, CreatedAt: now.Add(-3 * time.Hour)},
	}
	db.Create(&messages)

	// ── Notifications ─────────────────────────────────────────────────────────
	// Design: Notifications_Center.html
	notifications := []models.Notification{
		// NEW MATCHES section
		{UserID: 5, Title: "Luna matched with you!", Body: "Both of you love Midnight Cycling. Say hi and start the ride!", Type: "match", IsRead: false, CreatedAt: now.Add(-2 * time.Minute)},
		{UserID: 5, Title: "Alex matched with you!", Body: "Alex wants to join your Techno Yoga session tomorrow.", Type: "match", IsRead: false, CreatedAt: now.Add(-1 * time.Hour)},
		// MESSAGES section
		{UserID: 5, Title: "Zara: new message", Body: "Are we still meeting at the neon pier at 9?", Type: "message", IsRead: false, CreatedAt: now.Add(-15 * time.Minute)},
		// ACTIVITY section
		{UserID: 5, Title: "Event Confirmed", Body: "The Glow Run 5K has been confirmed for Friday night!", Type: "activity", IsRead: true, CreatedAt: now.Add(-3 * time.Hour)},
		// Weekly recap (yesterday)
		{UserID: 5, Title: "Weekly Recap", Body: "You matched with 12 new partners this week. Keep the momentum going!", Type: "system", IsRead: true, CreatedAt: now.Add(-24 * time.Hour)},
		// Profile boost
		{UserID: 5, Title: "Your profile was boosted!", Body: "58 new people saw you in the last hour.", Type: "system", IsRead: false, CreatedAt: now.Add(-45 * time.Minute)},
	}
	db.Create(&notifications)

	log.Println("Database seeded: 20 users, 14 activities, 5 conversations, 6 messages, 6 notifications, 2 events.")
}
