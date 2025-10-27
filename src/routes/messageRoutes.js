/**
 * Rotas de Messages
 */

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// GET /api/message - Múltiplas funcionalidades
// 1. Verifica webhook do WhatsApp (com query params hub.mode, hub.verify_token, hub.challenge)
// 2. Lista mensagens de um chat (com query param chat_id)
// 3. Busca mensagem específica (com query param id)
router.get('/', (req, res) => {
  // Verifica se é uma requisição de verificação do webhook do WhatsApp
  if (req.query['hub.mode'] && req.query['hub.verify_token']) {
    return messageController.verifyWebhook(req, res);
  }
  
  if (req.query.id) {
    return messageController.getById(req, res);
  }
  if (req.query.chat_id) {
    return messageController.getByChatId(req, res);
  }
  return res.status(400).json({ error: 'chat_id ou id é obrigatório' });
});

// POST /api/message - Webhook do WhatsApp (recebe mensagens e eventos)
router.post('/', messageController.create);

// DELETE /api/message?id=message_id - Remove mensagem
router.delete('/', messageController.delete);

module.exports = router;
