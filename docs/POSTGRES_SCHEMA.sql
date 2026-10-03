-- Language Game — Native PostgreSQL DDL
-- Source: https://docs.google.com/document/d/1qZU1vMyKrCbrq48t8lDy52PD2XzvG_WpBeSwNbHWvnk/edit?usp=sharing
-- Decoupled from Supabase / third-party Auth. Swap DATABASE_URL to migrate.

-- 1. UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Native users (replaces third-party Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- Argon2 / bcrypt
  username VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  current_scene_id VARCHAR(100) DEFAULT 'casa_italiana_dinner',
  total_active_outputs INT DEFAULT 0, -- north-star: active English outputs
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. NPC world memory (core differentiator)
CREATE TABLE IF NOT EXISTS npc_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  npc_id VARCHAR(50) NOT NULL, -- e.g. 'waiter_marco', 'emma'
  category VARCHAR(50) NOT NULL, -- 'preference' | 'mistake' | 'promise'
  memory_key VARCHAR(100) NOT NULL, -- e.g. 'dislikes_mushrooms', 'likes_italian'
  memory_text TEXT NOT NULL, -- English NL for Prompt injection
  importance INT DEFAULT 1, -- 1-5, higher = prefer inject
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_npc_memories_user_npc
  ON npc_memories (user_id, npc_id);

-- 4. Language skill graph
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_node_id VARCHAR(100) NOT NULL, -- 'order_food' | 'make_replacements' | 'refuse_politely'
  cefr_level VARCHAR(10) DEFAULT 'A1', -- 'A1' | 'A2' | 'B1'
  mastery_score INT DEFAULT 0, -- 0-100
  used_count INT DEFAULT 0,
  last_practiced_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, skill_node_id)
);

-- 5. Game sessions
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scene_id VARCHAR(100) NOT NULL, -- 'casa_italiana_dinner'
  status VARCHAR(50) DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
  settlement_data JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ
);

-- 6. Dialogue audit log
CREATE TABLE IF NOT EXISTS dialogue_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  speaker VARCHAR(50) NOT NULL, -- 'Player' | 'Waiter Marco' | 'Emma'
  player_input TEXT,
  response_text TEXT NOT NULL,
  assessment JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dialogue_logs_session
  ON dialogue_logs (session_id);
