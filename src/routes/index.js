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

// Rotas públicas
router.use('/auth', authRoutes);

// Registra rotas de cada recurso
router.use('/customer', customerRoutes);
router.use('/phone_number', phoneNumberRoutes);
router.use('/report', reportRoutes);
router.use('/document', documentRoutes);
router.use('/message', messageRoutes);
router.use('/chat', chatRoutes);
router.use('/template', templateRoutes);
router.use('/webchat', webChatRoutes);

module.exports = router;
