const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório.').isLength({ min: 2, max: 100 }),
  body('email').isEmail().withMessage('Email inválido.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres.')
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Email inválido.').normalizeEmail(),
  body('password').notEmpty().withMessage('Senha é obrigatória.')
], login);

router.get('/me', authenticate, getMe);

router.put('/profile', authenticate, [
  body('name').trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('password').optional().isLength({ min: 6 })
], updateProfile);

module.exports = router;
