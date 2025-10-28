const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

/**
 * @route POST /api/auth/login
 * @desc Login de usuário
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/register
 * @desc Registro de novo usuário
 * @access Public (considere proteger em produção)
 */
router.post('/register', authController.register);

/**
 * @route GET /api/auth/me
 * @desc Retorna dados do usuário autenticado
 * @access Private
 */
router.get('/me', authenticate, authController.me);

module.exports = router;
