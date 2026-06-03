-- ============================================
-- Diário de Hábitos — Esquema da Base de Dados
-- ============================================

-- Tabela de Utilizadores
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role        VARCHAR(20)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_color VARCHAR(7)  DEFAULT '#6366f1',
  is_active   BOOLEAN      DEFAULT TRUE,
  created_at  TIMESTAMP    DEFAULT NOW(),
  updated_at  TIMESTAMP    DEFAULT NOW()
);

-- Tabela de Hábitos
CREATE TABLE IF NOT EXISTS habits (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  icon        VARCHAR(10)  DEFAULT '✅',
  color       VARCHAR(7)   DEFAULT '#6366f1',
  frequency   VARCHAR(20)  NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
  target_days SMALLINT     DEFAULT 7,
  is_active   BOOLEAN      DEFAULT TRUE,
  created_at  TIMESTAMP    DEFAULT NOW(),
  updated_at  TIMESTAMP    DEFAULT NOW()
);

-- Tabela de Conclusões (check-ins diários)
CREATE TABLE IF NOT EXISTS habit_completions (
  id             SERIAL PRIMARY KEY,
  habit_id       INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_date DATE    NOT NULL,
  note           TEXT,
  created_at     TIMESTAMP DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

-- Tabela de Lembretes
CREATE TABLE IF NOT EXISTS reminders (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  habit_id      INTEGER REFERENCES habits(id) ON DELETE CASCADE,
  label         VARCHAR(200),
  reminder_time TIME    NOT NULL,
  days_of_week  VARCHAR(20) DEFAULT '1,2,3,4,5,6,7',
  is_active     BOOLEAN DEFAULT TRUE,
  last_triggered TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_habits_user_id       ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_completions_user_date ON habit_completions(user_id, completed_date);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id    ON reminders(user_id);

-- Utilizador Administrador padrão (senha: Admin@123)
-- Hash gerado com bcrypt rounds=10
INSERT INTO users (name, email, password_hash, role, avatar_color)
VALUES (
  'Administrador',
  'admin@habitdiary.com',
  '$2a$10$mUuacQn5Wp/g5gCAN5i5bu9kimhjSsdrlVojKqvBKwPV1eorjoZT2',
  'admin',
  '#f59e0b'
) ON CONFLICT DO NOTHING;
