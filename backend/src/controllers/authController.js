const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { query } = require('../config/database');

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ error: 'Este email já está registado.' });
    }

    const colors = ['#6366f1','#ec4899','#14b8a6','#f59e0b','#22c55e','#3b82f6'];
    const avatar_color = colors[Math.floor(Math.random() * colors.length)];

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, avatar_color)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, avatar_color, created_at`,
      [name.trim(), email.toLowerCase(), hash, avatar_color]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'Conta criada com sucesso!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_color: user.avatar_color }
    });
  } catch (err) {
    console.error('Erro no registo:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const result = await query(
      'SELECT id, name, email, password_hash, role, avatar_color, is_active FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: 'Email ou senha incorrectos.' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Conta desactivada. Contacte o administrador.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou senha incorrectos.' });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login efectuado com sucesso!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_color: user.avatar_color }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, avatar_color, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { name, password } = req.body;

  try {
    let updateQuery, params;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updateQuery = `UPDATE users SET name=$1, password_hash=$2, updated_at=NOW() WHERE id=$3
                     RETURNING id, name, email, role, avatar_color`;
      params = [name.trim(), hash, req.user.id];
    } else {
      updateQuery = `UPDATE users SET name=$1, updated_at=NOW() WHERE id=$2
                     RETURNING id, name, email, role, avatar_color`;
      params = [name.trim(), req.user.id];
    }

    const result = await query(updateQuery, params);
    res.json({ message: 'Perfil actualizado!', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = { register, login, getMe, updateProfile };
