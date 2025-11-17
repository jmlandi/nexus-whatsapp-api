/**
 * Rotas principais da API
 * Agrupa todas as rotas de recursos
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const customerRoutes = require('./customerRoutes');
const phoneNumberRoutes = require('./phoneNumberRoutes');
const reportRoutes = require('./reportRoutes');
const documentRoutes = require('./documentRoutes');
const messageRoutes = require('./messageRoutes');
const chatRoutes = require('./chatRoutes');
const templateRoutes = require('./templateRoutes');
const webChatRoutes = require('./webChatRoutes');
const simulatorRoutes = require('./simulatorRoutes');

// Rotas públicas
router.use('/auth', authRoutes);

// Health check endpoint - verifica configuração
router.get('/health', (req, res) => {
  const config = {
    nodeEnv: process.env.NODE_ENV,
    database: !!process.env.DATABASE_URL,
    anthropic: {
      configured: !!process.env.ANTHROPIC_API_KEY,
      keyPrefix: process.env.ANTHROPIC_API_KEY ? `${process.env.ANTHROPIC_API_KEY.substring(0, 10)}...` : 'NOT SET',
      model: process.env.ANTHROPIC_MODEL || 'default',
      maxTokens: process.env.ANTHROPIC_MAX_TOKENS || 'default'
    },
    aws: {
      configured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
      region: process.env.AWS_REGION || 'NOT SET',
      bucket: process.env.AWS_S3_BUCKET_NAME || 'NOT SET'
    },
    whatsapp: {
      configured: !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_BUSINESS_ACCOUNT_ID),
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || 'NOT SET'
    }
  };

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config
  });
});

// Registra rotas de cada recurso
router.use('/customers', customerRoutes);
router.use('/phone-numbers', phoneNumberRoutes);
router.use('/reports', reportRoutes);
router.use('/documents', documentRoutes);
router.use('/messages', messageRoutes);
router.use('/chats', chatRoutes);
router.use('/templates', templateRoutes);
router.use('/webchat', webChatRoutes);
router.use('/simulator', simulatorRoutes);

module.exports = router;
