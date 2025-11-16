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
