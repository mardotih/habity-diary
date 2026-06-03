const cron = require('node-cron');
const { query } = require('../config/database');

const startReminderScheduler = () => {
  // Executa a cada minuto
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon ... 7=Sun

    try {
      const result = await query(
        `SELECT r.*, u.name as user_name, u.email, h.title as habit_title
         FROM reminders r
         JOIN users u ON u.id = r.user_id
         LEFT JOIN habits h ON h.id = r.habit_id
         WHERE r.is_active = true
           AND r.reminder_time = $1
           AND r.days_of_week LIKE $2`,
        [currentTime, `%${currentDay}%`]
      );

      for (const reminder of result.rows) {
        // Em produção: enviar email/push notification
        console.log(`🔔 LEMBRETE [${currentTime}] → ${reminder.user_name}: ${reminder.habit_title || reminder.label || 'Verificar hábitos!'}`);

        await query(
          'UPDATE reminders SET last_triggered = NOW() WHERE id = $1',
          [reminder.id]
        );
      }
    } catch (err) {
      console.error('Erro no scheduler de lembretes:', err.message);
    }
  });

  console.log('⏰ Scheduler de lembretes iniciado.');
};

module.exports = { startReminderScheduler };
