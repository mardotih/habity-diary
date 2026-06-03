const { query } = require('../config/database');

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.avatar_color, u.is_active, u.created_at,
        COUNT(DISTINCT h.id) as total_habits,
        COUNT(DISTINCT hc.id) as total_completions
       FROM users u
       LEFT JOIN habits h ON h.user_id = u.id AND h.is_active = true
       LEFT JOIN habit_completions hc ON hc.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar utilizadores.' });
  }
};

// PUT /api/admin/users/:id/toggle
const toggleUserStatus = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Não pode desactivar a sua própria conta.' });
    }
    const result = await query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, name, is_active',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Utilizador não encontrado.' });
    const u = result.rows[0];
    res.json({ message: `Utilizador ${u.is_active ? 'activado' : 'desactivado'}.`, user: u });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao actualizar utilizador.' });
  }
};

// PUT /api/admin/users/:id/role
const changeUserRole = async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(422).json({ error: 'Role inválido.' });
  }
  try {
    const result = await query(
      'UPDATE users SET role=$1 WHERE id=$2 RETURNING id, name, role',
      [role, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Utilizador não encontrado.' });
    res.json({ message: 'Role actualizado!', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao actualizar role.' });
  }
};

// GET /api/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM users WHERE is_active=true) AS active_users,
        (SELECT COUNT(*) FROM habits WHERE is_active=true) AS total_habits,
        (SELECT COUNT(*) FROM habit_completions) AS total_completions,
        (SELECT COUNT(*) FROM habit_completions WHERE completed_date=CURRENT_DATE) AS today_completions,
        (SELECT COUNT(*) FROM reminders WHERE is_active=true) AS active_reminders
    `);
    const dailyActivity = await query(`
      SELECT completed_date, COUNT(*) as completions
      FROM habit_completions
      WHERE completed_date >= CURRENT_DATE - INTERVAL '29 days'
      GROUP BY completed_date ORDER BY completed_date
    `);
    res.json({ stats: stats.rows[0], daily_activity: dailyActivity.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
  }
};

module.exports = { getUsers, toggleUserStatus, changeUserRole, getAdminStats };
