/**
 * Rotas do Simulador de Chat
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * GET /api/simulator/context/:customerId
 * Obtém o contexto que a IA possui sobre um cliente
 */
router.get('/context/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    const context = await aiService.getCustomerContext(customerId);

    res.json({ context });
  } catch (error) {
    logger.error(`Erro ao buscar contexto do cliente: ${error.message}`);
    res.status(500).json({
      error: 'Erro ao buscar contexto',
      message: error.message
    });
  }
});

/**
 * POST /api/simulator/chat
 * Simula uma conversa com a IA
 */
router.post('/chat', async (req, res) => {
  try {
    const { customerId, message, history = [] } = req.body;

    if (!customerId || !message) {
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'customerId e message são obrigatórios'
      });
    }

    // Gera resposta usando o aiService
    // Como é um simulador, vamos criar um chat temporário em memória
    const response = await aiService.generateSimulatedResponse(message, customerId, history);

    res.json({ response });
  } catch (error) {
    logger.error(`Erro no simulador de chat: ${error.message}`);
    res.status(500).json({
      error: 'Erro ao processar mensagem',
      message: error.message
    });
  }
});

module.exports = router;
