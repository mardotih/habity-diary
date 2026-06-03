// routes/reminders.js
const router = require('express').Router();
const { body } = require('express-validator');
const { getReminders, createReminder, updateReminder, deleteReminder } = require('../controllers/reminderController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getReminders);
router.post('/', [
  body('reminder_time').matches(/^\d{2}:\d{2}$/).withMessage('Hora inválida (HH:MM).')
], createReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
