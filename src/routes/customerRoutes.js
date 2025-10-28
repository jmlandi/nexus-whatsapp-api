/**
 * Rotas de Customers
 */

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');

// Todas as rotas de customer requerem autenticação
router.use(authenticate);

// GET /api/customer - Lista todos os clientes
router.get('/', customerController.getAll);

// GET /api/customer/:id - Busca cliente específico
router.get('/:id', customerController.getById);

// POST /api/customer - Cria novos clientes
router.post('/', customerController.create);

// PUT /api/customer/:id - Atualiza cliente
router.put('/:id', customerController.update);

// DELETE /api/customer/:id - Remove cliente
router.delete('/:id', customerController.delete);

module.exports = router;
