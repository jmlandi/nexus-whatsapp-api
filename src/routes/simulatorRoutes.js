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
  console.log('========== SIMULATOR CHAT REQUEST ==========');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Time:', new Date().toISOString());

  try {
    const { customerId, message, history = [] } = req.body;

    console.log('Validating request...');
    if (!customerId || !message) {
      console.log('❌ Validation failed - missing customerId or message');
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'customerId e message são obrigatórios'
      });
    }

    console.log('✅ Request validated');
    console.log('Calling aiService.generateSimulatedResponse...');
    console.log('CustomerId:', customerId);
    console.log('Message length:', message.length);
    console.log('History length:', history.length);

    // Gera resposta usando o aiService
    // Como é um simulador, vamos criar um chat temporário em memória
    const response = await aiService.generateSimulatedResponse(message, customerId, history);

    console.log('✅ Response generated successfully');
    console.log('Response length:', response ? response.length : 0);
    console.log('==========================================');

    res.json({ response });
  } catch (error) {
    console.error('========== SIMULATOR ERROR ==========');
    console.error('Error message:', error.message);
    console.error('Error type:', error.constructor.name);
    console.error('Error stack:', error.stack);
    console.error('CustomerId:', req.body?.customerId);
    console.error('=====================================');

    logger.error('Erro no simulador de chat', {
      error: error.message,
      stack: error.stack,
      customerId: req.body.customerId,
      errorType: error.constructor.name
    });

    res.status(500).json({
      error: 'Erro ao processar mensagem',
      message: 'Ocorreu um erro interno. Tente novamente mais tarde.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
