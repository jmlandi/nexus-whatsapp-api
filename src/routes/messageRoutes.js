/**
 * Rotas de Messages
 */

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// GET /api/message?chat_id=chat_id - Lista mensagens de um chat
// GET /api/message?id=message_id - Busca mensagem específica
router.get('/', (req, res) => {
  if (req.query.id) {
    return messageController.getById(req, res);
  }
  if (req.query.chat_id) {
    return messageController.getByChatId(req, res);
  }
  return res.status(400).json({ error: 'chat_id ou id é obrigatório' });
});

// POST /api/message - Webhook do Twilio (recebe mensagens)
router.post('/', messageController.create);

// DELETE /api/message?id=message_id - Remove mensagem
router.delete('/', messageController.delete);

module.exports = router;
