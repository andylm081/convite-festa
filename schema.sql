-- ============================================================
-- SCHEMA PostgreSQL — Convite Anderson & Arthur
-- Execute no Vercel Postgres: Dashboard → Storage → seu banco → Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Admin
CREATE TABLE IF NOT EXISTS admin_users (
  id             SERIAL PRIMARY KEY,
  email          VARCHAR(500) UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Configurações do evento
CREATE TABLE IF NOT EXISTS event_settings (
  id                        SERIAL PRIMARY KEY,
  title                     TEXT DEFAULT 'Você foi convocado!',
  subtitle                  TEXT DEFAULT 'Comemoração do aniversário de Anderson 24 anos e Arthur 23 anos',
  honoree_1_name            TEXT DEFAULT 'Anderson',
  honoree_1_age             INTEGER DEFAULT 24,
  honoree_2_name            TEXT DEFAULT 'Arthur',
  honoree_2_age             INTEGER DEFAULT 23,
  event_date                TEXT DEFAULT '13/06/2026',
  start_time_text           TEXT DEFAULT 'a partir das 15h',
  match_text                TEXT DEFAULT 'Transmissão do jogo Brasil x Marrocos às 19h',
  drinks_text               TEXT DEFAULT 'Cada convidado é responsável por levar sua própria bebida',
  dress_code_text           TEXT DEFAULT 'Camisa da seleção ou camisa amarela, verde ou azul',
  party_items_text          TEXT DEFAULT 'Leve corneta, vuvuzela, bandeira e adereços de torcida',
  address_text              TEXT DEFAULT 'Rua da Linha, 30 — 51150-630',
  maps_url                  TEXT DEFAULT 'https://www.google.com/maps/search/?api=1&query=Rua%20da%20Linha%2C%2030%2C%2051150-630',
  confirmation_success_text TEXT DEFAULT 'Presença confirmada! Te esperamos para torcer com a gente!',
  cancellation_success_text TEXT DEFAULT 'Resposta registrada. Obrigado por avisar.',
  open_audio_url            TEXT DEFAULT '/sounds/envelope-open.wav',
  celebration_audio_url     TEXT DEFAULT '/sounds/celebration.wav',
  cancellation_audio_url    TEXT DEFAULT '/sounds/cancellation.wav',
  theme_name                TEXT DEFAULT 'copa',
  is_active                 BOOLEAN DEFAULT TRUE,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- Convidados
CREATE TABLE IF NOT EXISTS guests (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT        NOT NULL,
  nickname      TEXT        DEFAULT '',
  phone         TEXT        DEFAULT '',
  notes         TEXT        DEFAULT '',
  slug          TEXT        UNIQUE,
  invite_link   TEXT        DEFAULT '',
  status        TEXT        DEFAULT 'pending',
  response_name TEXT,
  responded_at  TIMESTAMPTZ,
  source        TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Logs RSVP
CREATE TABLE IF NOT EXISTS rsvp_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id      UUID        REFERENCES guests(id) ON DELETE SET NULL,
  guest_name    TEXT,
  action        TEXT,
  response_name TEXT,
  source        TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── SEED: admin (senha: festa2026) ──
INSERT INTO admin_users (email, hashed_password)
SELECT
  'admin@festa.com',
  '$2b$12$W9YmvYTPQcQ01W5/XpKZzunM1pzLFiRG9meOq9UGnINFuutYQ/JCO'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users WHERE email = 'admin@festa.com'
);

-- ── SEED: configurações iniciais do evento ──
INSERT INTO event_settings (is_active)
SELECT TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM event_settings WHERE is_active = TRUE
);
