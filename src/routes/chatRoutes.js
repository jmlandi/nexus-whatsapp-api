/**
 * Rotas de Chats
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

// Todas as rotas de chat requerem autenticação
router.use(authenticate);

// GET /api/chat - Lista todos os chats
router.get('/', chatController.getAll);

// GET /api/chat/:id - Busca chat específico
router.get('/:id', chatController.getById);

// POST /api/chat/close-chat - Fecha um chat
router.post('/close-chat', chatController.closeChat);

// POST /api/chat/send-template - Envia template e inicia chat
router.post('/send-template', chatController.sendTemplate);

// POST /api/chat/send-message - Envia mensagem de texto via WhatsApp
router.post('/send-message', chatController.sendMessage);

module.exports = router;
