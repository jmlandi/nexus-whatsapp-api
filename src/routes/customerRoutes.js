/**
 * Rotas de Customers
 */

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// GET /api/customer - Lista todos os clientes
// GET /api/customer?id=customer_id - Busca cliente específico
router.get('/', (req, res) => {
  if (req.query.id) {
    return customerController.getById(req, res);
  }
  return customerController.getAll(req, res);
});

// POST /api/customer - Cria novos clientes
router.post('/', customerController.create);

// PUT /api/customer?id=customer_id - Atualiza cliente
router.put('/', customerController.update);

// DELETE /api/customer?id=customer_id - Remove cliente
router.delete('/', customerController.delete);

module.exports = router;
