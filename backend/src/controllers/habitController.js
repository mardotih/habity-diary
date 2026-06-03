// ──────────────────────────────────────────────────────────────────────────────
//  Controlador de Habitos
//  Passo a passo:
//    1. getHabits   -> lista todos os habitos ativos do utilizador
//    2. getHabit    -> busca um habito especifico + ultimas 30 conclusoes
//    3. createHabit -> cria um novo habito com validacao de dados
//    4. updateHabit -> atualiza um habito existente
//    5. deleteHabit -> soft delete (marca is_active=false)
//    6. toggleComplete -> marca/desmarca check-in de um dia
//    7. getStats   -> estatisticas: total, hoje, semana, streak, mensal
// ──────────────────────────────────────────────────────────────────────────────

const { validationResult } = require('express-validator');
const { query } = require('../config/database');

// ─── 1. Listar todos os habitos do utilizador ─────────────────────────────────
//     GET /api/habits
//     Devolve cada habito com total de conclusoes, ultima data e se foi
//     concluido hoje
const getHabits = async (req, res) => {
  try {
    const result = await query(
      `SELECT h.*,
        COUNT(DISTINCT hc.id) AS total_completions,
        MAX(hc.completed_date) AS last_completed,
        CASE WHEN MAX(hc.completed_date) = CURRENT_DATE THEN true ELSE false END AS completed_today
       FROM habits h
       LEFT JOIN habit_completions hc ON hc.habit_id = h.id AND hc.user_id = h.user_id
       WHERE h.user_id = $1 AND h.is_active = true
       GROUP BY h.id
       ORDER BY h.created_at ASC`,
      [req.user.id]
    );
    res.json({ habits: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar habitos.' });
  }
};

// ─── 2. Buscar um habito especifico ───────────────────────────────────────────
//     GET /api/habits/:id
//     Devolve o habito + as ultimas 30 conclusoes registadas
const getHabit = async (req, res) => {
  try {
    // 2a: buscar o habito (apenas se pertencer ao user e estiver ativo)
    const result = await query(
      'SELECT * FROM habits WHERE id = $1 AND user_id = $2 AND is_active = true',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Habito nao encontrado.' });

    // 2b: buscar as ultimas 30 conclusoes para mostrar no grafico
    const completions = await query(
      `SELECT completed_date, note FROM habit_completions
       WHERE habit_id = $1 ORDER BY completed_date DESC LIMIT 30`,
      [req.params.id]
    );

    res.json({ habit: result.rows[0], completions: completions.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar habito.' });
  }
};

// ─── 3. Criar um novo habito ─────────────────────────────────────────────────
//     POST /api/habits
//     Valida os campos obrigatorios antes de inserir na BD
const createHabit = async (req, res) => {
  // 3a: validar campos com express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { title, description, icon, color, frequency, target_days } = req.body;

  try {
    // 3b: inserir na base de dados e devolver o registo criado
    const result = await query(
      `INSERT INTO habits (user_id, title, description, icon, color, frequency, target_days)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, title.trim(), description || null, icon || '✅',
       color || '#6366f1', frequency || 'daily', target_days || 7]
    );
    res.status(201).json({ message: 'Habito criado!', habit: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar habito.' });
  }
};

// ─── 4. Atualizar um habito existente ─────────────────────────────────────────
//     PUT /api/habits/:id
const updateHabit = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { title, description, icon, color, frequency, target_days } = req.body;

  try {
    const result = await query(
      `UPDATE habits
       SET title=$1, description=$2, icon=$3, color=$4, frequency=$5, target_days=$6, updated_at=NOW()
       WHERE id=$7 AND user_id=$8 AND is_active=true
       RETURNING *`,
      [title.trim(), description || null, icon || '✅', color || '#6366f1',
       frequency || 'daily', target_days || 7, req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Habito nao encontrado.' });
    res.json({ message: 'Habito actualizado!', habit: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao actualizar habito.' });
  }
};

// ─── 5. Remover um habito (soft delete) ──────────────────────────────────────
//     DELETE /api/habits/:id
//     Em vez de apagar, marca is_active=false para preservar o historico
const deleteHabit = async (req, res) => {
  try {
    const result = await query(
      'UPDATE habits SET is_active=false, updated_at=NOW() WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Habito nao encontrado.' });
    res.json({ message: 'Habito eliminado com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao eliminar habito.' });
  }
};

// ─── 6. Marcar/Desmarcar check-in diario ────────────────────────────────────
//     POST /api/habits/:id/complete
//     Se ja existe check-in para hoje, remove (toggle). Senao, cria.
const toggleComplete = async (req, res) => {
  const habitId = req.params.id;
  const userId = req.user.id;
  const date = req.body.date || new Date().toISOString().split('T')[0];

  try {
    // 6a: verificar se o habito existe
    const habit = await query(
      'SELECT id FROM habits WHERE id=$1 AND user_id=$2 AND is_active=true',
      [habitId, userId]
    );
    if (!habit.rows.length) return res.status(404).json({ error: 'Habito nao encontrado.' });

    // 6b: verificar se ja foi concluido nesta data
    const existing = await query(
      'SELECT id FROM habit_completions WHERE habit_id=$1 AND completed_date=$2',
      [habitId, date]
    );

    if (existing.rows.length) {
      // 6c: ja existe -> remover (desmarcar check-in)
      await query('DELETE FROM habit_completions WHERE habit_id=$1 AND completed_date=$2', [habitId, date]);
      return res.json({ completed: false, message: 'Check-in removido.' });
    } else {
      // 6d: nao existe -> criar novo check-in
      await query(
        'INSERT INTO habit_completions (habit_id, user_id, completed_date, note) VALUES ($1,$2,$3,$4)',
        [habitId, userId, date, req.body.note || null]
      );
      return res.json({ completed: true, message: 'Habito concluido!' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registar conclusao.' });
  }
};

// ─── 7. Estatisticas do utilizador ─────────────────────────────────────────
//     GET /api/habits/stats/summary
//     Devolve: total de habitos, conclusoes hoje, esta semana,
//     melhor sequencia (streak), dados mensais para grafico
const getStats = async (req, res) => {
  const userId = req.user.id;
  try {
    // 7a: total de habitos ativos
    const totalHabits = await query(
      'SELECT COUNT(*) FROM habits WHERE user_id=$1 AND is_active=true', [userId]
    );

    // 7b: conclusoes de hoje
    const todayCompletions = await query(
      `SELECT COUNT(*) FROM habit_completions WHERE user_id=$1 AND completed_date=CURRENT_DATE`, [userId]
    );

    // 7c: conclusoes dos ultimos 7 dias (para grafico semanal)
    const weekCompletions = await query(
      `SELECT completed_date, COUNT(*) as count
       FROM habit_completions
       WHERE user_id=$1 AND completed_date >= CURRENT_DATE - INTERVAL '6 days'
       GROUP BY completed_date ORDER BY completed_date`, [userId]
    );

    // 7d: melhor streak (habito com mais conclusoes nos ultimos 30 dias)
    const streakData = await query(
      `SELECT habit_id, COUNT(*) as streak
       FROM habit_completions
       WHERE user_id=$1 AND completed_date >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY habit_id ORDER BY streak DESC LIMIT 1`, [userId]
    );

    // 7e: dados mensais dos ultimos 5 meses (para grafico de tendencia)
    const monthlyData = await query(
      `SELECT DATE_TRUNC('month', completed_date) as month, COUNT(*) as total
       FROM habit_completions WHERE user_id=$1
       AND completed_date >= CURRENT_DATE - INTERVAL '5 months'
       GROUP BY month ORDER BY month`, [userId]
    );

    res.json({
      total_habits: parseInt(totalHabits.rows[0].count),
      today_completions: parseInt(todayCompletions.rows[0].count),
      week_completions: weekCompletions.rows,
      best_streak: streakData.rows[0]?.streak || 0,
      monthly_data: monthlyData.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar estatisticas.' });
  }
};

module.exports = { getHabits, getHabit, createHabit, updateHabit, deleteHabit, toggleComplete, getStats };
