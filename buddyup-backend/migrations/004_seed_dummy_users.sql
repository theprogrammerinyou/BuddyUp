-- Seed dummy users for Discover and default matches (password: password123)
-- bcrypt hash for "password123" (cost 10)
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

INSERT INTO users (id, email, password_hash, display_name, bio, avatar_character_id, interests, latitude, longitude, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'seed_1@buddyup.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Aarav', 'Tech enthusiast. Always learning something new. Let''s grab coffee! ☕', 1, ARRAY['Gym','Coding','Coffee Hangouts'], 28.6139, 77.209, NOW(), NOW()),
  (gen_random_uuid(), 'seed_2@buddyup.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Diya', 'Yoga mornings and Netflix evenings. 🧘‍♀️🎬', 2, ARRAY['Yoga','Travel','Coffee Hangouts'], 28.65, 77.15, NOW(), NOW()),
  (gen_random_uuid(), 'seed_3@buddyup.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Arjun', 'Code by day, game by night. 🎮 Send me your best memes.', 3, ARRAY['Gaming','Coding','Coffee Hangouts'], 28.58, 77.25, NOW(), NOW()),
  (gen_random_uuid(), 'seed_4@buddyup.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ananya', 'Foodie, photographer, and weekend hiker. 📸🏔️', 4, ARRAY['Travel','Hiking','Gym'], 28.70, 77.10, NOW(), NOW()),
  (gen_random_uuid(), 'seed_5@buddyup.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Rohan', 'Gym freak 💪 and avid traveler ✈️. Looking for workout buddies.', 5, ARRAY['Gym','Running','Travel'], 28.55, 77.28, NOW(), NOW()),
  (gen_random_uuid(), 'seed_6@buddyup.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Kiara', 'Just moved here! Looking to explore the city and find chill people. 🌆', 6, ARRAY['Coffee Hangouts','Travel','Badminton'], 28.62, 77.18, NOW(), NOW()),
  (gen_random_uuid(), 'seed_7@buddyup.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Aditya', 'Music lover 🎸 and casual gamer. Always down for a jam session.', 7, ARRAY['Gaming','Cricket','Coffee Hangouts'], 28.68, 77.22, NOW(), NOW()),
  (gen_random_uuid(), 'seed_8@buddyup.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Myra', 'Books, bikes, and baking. 📚🚲🧁 Let''s exchange recipes!', 8, ARRAY['Running','Travel','Coffee Hangouts'], 28.60, 77.26, NOW(), NOW()),
  (gen_random_uuid(), 'seed_9@buddyup.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Kabir', 'Startup grind. 💼 Looking for co-founders or just smart people to talk to.', 9, ARRAY['Coding','Coffee Hangouts','Football'], 28.72, 77.08, NOW(), NOW()),
  (gen_random_uuid(), 'seed_10@buddyup.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sanya', 'Always planning the next trip. 🌍 Wanderlust.', 10, ARRAY['Travel','Hiking','Yoga'], 28.52, 77.30, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
