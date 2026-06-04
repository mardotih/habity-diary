const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'habit_diary',
  user:     process.env.DB_USER     || 'habit_user',
  password: process.env.DB_PASSWORD || 'habit_pass_2024',
  max: 1,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 5000,
});

async function migrate() {
  try {
    console.log('A conectar à base de dados...');
    await pool.query('SELECT NOW()');

    let sqlPath = path.join(__dirname, '..', '..', 'docker', 'init.sql');
    if (!fs.existsSync(sqlPath)) {
      sqlPath = path.join(__dirname, '..', 'docker', 'init.sql');
    }

    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf-8');
      console.log('A executar migrações...');
      await pool.query(sql);
      console.log('Migrações concluídas.');
    } else {
      console.log('init.sql não encontrado, a usar schema padrão...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(150) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role VARCHAR(20) NOT NULL DEFAULT 'user', avatar_color VARCHAR(7) DEFAULT '#6366f1', is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());
        CREATE TABLE IF NOT EXISTS habits (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, title VARCHAR(200) NOT NULL, description TEXT, icon VARCHAR(10) DEFAULT '✅', color VARCHAR(7) DEFAULT '#6366f1', frequency VARCHAR(20) NOT NULL DEFAULT 'daily', target_days SMALLINT DEFAULT 7, goal_type VARCHAR(10) DEFAULT 'daily', goal_value INTEGER DEFAULT 1, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());
        CREATE TABLE IF NOT EXISTS habit_completions (id SERIAL PRIMARY KEY, habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, completed_date DATE NOT NULL, note TEXT, created_at TIMESTAMP DEFAULT NOW(), UNIQUE(habit_id, completed_date));
        CREATE TABLE IF NOT EXISTS reminders (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE, label VARCHAR(200), reminder_time TIME NOT NULL, days_of_week VARCHAR(20) DEFAULT '1,2,3,4,5,6,7', is_active BOOLEAN DEFAULT TRUE, last_triggered TIMESTAMP, created_at TIMESTAMP DEFAULT NOW());
        INSERT INTO users (name, email, password_hash, role, avatar_color) VALUES ('Administrador', 'admin@habitdiary.com', '$2a$10$mUuacQn5Wp/g5gCAN5i5bu9kimhjSsdrlVojKqvBKwPV1eorjoZT2', 'admin', '#f59e0b') ON CONFLICT DO NOTHING;
      `);
      console.log('Schema padrão aplicado.');
    }
  } catch (err) {
    console.error('Erro nas migrações:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));
