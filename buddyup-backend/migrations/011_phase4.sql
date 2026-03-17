-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  provider TEXT,
  provider_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boosts
CREATE TABLE IF NOT EXISTS boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  boost_type TEXT NOT NULL DEFAULT 'standard'
);

-- Super like packs
CREATE TABLE IF NOT EXISTS super_like_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  provider_transaction_id TEXT
);

-- Track available super likes from packs
ALTER TABLE users ADD COLUMN IF NOT EXISTS super_likes_available INT NOT NULL DEFAULT 0;

-- Sponsored groups
CREATE TABLE IF NOT EXISTS sponsored_groups (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  sponsor_name TEXT NOT NULL,
  sponsor_logo_url TEXT,
  active_until TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (group_id)
);
