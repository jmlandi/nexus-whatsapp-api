/**
 * Rotas principais da API
 * Agrupa todas as rotas de recursos
 */

const express = require('express');
const router = express.Router();

const customerRoutes = require('./customerRoutes');
const phoneNumberRoutes = require('./phoneNumberRoutes');
const reportRoutes = require('./reportRoutes');
const messageRoutes = require('./messageRoutes');
const chatRoutes = require('./chatRoutes');
const templateRoutes = require('./templateRoutes');

// Registra rotas de cada recurso
router.use('/customer', customerRoutes);
router.use('/phone_number', phoneNumberRoutes);
router.use('/report', reportRoutes);
router.use('/message', messageRoutes);
router.use('/chat', chatRoutes);
router.use('/template', templateRoutes);

module.exports = router;
