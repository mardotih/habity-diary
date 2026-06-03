const { validationResult } = require('express-validator');
const { query } = require('../config/database');

// GET /api/reminders
const getReminders = async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*, h.title as habit_title, h.icon as habit_icon
       FROM reminders r
       LEFT JOIN habits h ON h.id = r.habit_id
       WHERE r.user_id = $1
       ORDER BY r.reminder_time ASC`,
      [req.user.id]
    );
    res.json({ reminders: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar lembretes.' });
  }
};

// POST /api/reminders
const createReminder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { habit_id, label, reminder_time, days_of_week } = req.body;

  try {
    if (habit_id) {
      const habit = await query(
        'SELECT id FROM habits WHERE id=$1 AND user_id=$2 AND is_active=true',
        [habit_id, req.user.id]
      );
      if (!habit.rows.length) return res.status(404).json({ error: 'Hábito não encontrado.' });
    }

    const result = await query(
      `INSERT INTO reminders (user_id, habit_id, label, reminder_time, days_of_week)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, habit_id || null, label || null, reminder_time, days_of_week || '1,2,3,4,5,6,7']
    );
    res.status(201).json({ message: 'Lembrete criado!', reminder: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar lembrete.' });
  }
};

// PUT /api/reminders/:id
const updateReminder = async (req, res) => {
  const { label, reminder_time, days_of_week, is_active } = req.body;
  try {
    const result = await query(
      `UPDATE reminders SET label=$1, reminder_time=$2, days_of_week=$3, is_active=$4
       WHERE id=$5 AND user_id=$6 RETURNING *`,
      [label, reminder_time, days_of_week, is_active, req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Lembrete não encontrado.' });
    res.json({ message: 'Lembrete actualizado!', reminder: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao actualizar lembrete.' });
  }
};

// DELETE /api/reminders/:id
const deleteReminder = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM reminders WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Lembrete não encontrado.' });
    res.json({ message: 'Lembrete eliminado.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao eliminar lembrete.' });
  }
};

module.exports = { getReminders, createReminder, updateReminder, deleteReminder };
