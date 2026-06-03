const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'habit_diary',
  user:     process.env.DB_USER     || 'habit_user',
  password: process.env.DB_PASSWORD || 'habit_pass_2024',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no cliente PostgreSQL:', err);
});

const query = (text, params) => pool.query(text, params);

const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Base de dados conectada:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Erro ao conectar à base de dados:', err.message);
    process.exit(1);
  }
};

module.exports = { query, pool, testConnection };
