-- Disabled PostGIS
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Characters table (anime, movie, book avatars)
CREATE TABLE characters (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    type       VARCHAR(20)  NOT NULL CHECK (type IN ('anime', 'movie', 'book')),
    franchise  VARCHAR(100) NOT NULL,
    image_url  TEXT         NOT NULL
);

-- Users table
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) UNIQUE NOT NULL,
    password_hash       TEXT NOT NULL,
    display_name        VARCHAR(80) NOT NULL,
    bio                 TEXT DEFAULT '',
    avatar_character_id INTEGER REFERENCES characters(id),
    interests           TEXT[] NOT NULL DEFAULT '{}',
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_location ON users (latitude, longitude);

-- Likes table
CREATE TABLE likes (
    liker_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    liked_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (liker_id, liked_id)
);

-- Matches table (mutual likes)
CREATE TABLE matches (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user1_id, user2_id)
);

-- Messages table
CREATE TABLE messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id   UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sender_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_match_id ON messages(match_id, created_at);
