/**
 * Rotas de Web Chat
 */

const express = require('express');
const router = express.Router();
const webChatController = require('../controllers/webChatController');

// POST /api/webchat/session - Cria nova sessão de chat web
router.post('/session', webChatController.createSession);

// POST /api/webchat/message - Envia mensagem e recebe resposta da IA
router.post('/message', webChatController.sendMessage);

// GET /api/webchat/history/:sessionId - Busca histórico de mensagens
router.get('/history/:sessionId', webChatController.getHistory);

// POST /api/webchat/end - Encerra sessão de chat
router.post('/end', webChatController.endSession);

module.exports = router;
