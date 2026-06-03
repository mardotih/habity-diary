const router = require('express').Router();
const { body } = require('express-validator');
const {
  getHabits, getHabit, createHabit, updateHabit,
  deleteHabit, toggleComplete, getStats
} = require('../controllers/habitController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

const habitValidation = [
  body('title').trim().notEmpty().withMessage('Título é obrigatório.').isLength({ max: 200 }),
  body('frequency').optional().isIn(['daily', 'weekly']).withMessage('Frequência inválida.'),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Cor inválida.'),
  body('target_days').optional().isInt({ min: 1, max: 7 })
];

router.get('/stats/summary', getStats);
router.get('/', getHabits);
router.get('/:id', getHabit);
router.post('/', habitValidation, createHabit);
router.put('/:id', habitValidation, updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/complete', toggleComplete);

module.exports = router;
