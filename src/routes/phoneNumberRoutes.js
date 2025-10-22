/**
 * Rotas de PhoneNumbers
 */

const express = require('express');
const router = express.Router();
const phoneNumberController = require('../controllers/phoneNumberController');

// GET /api/phone_number - Lista todos os números
// GET /api/phone_number?id=phone_number_id - Busca número específico
router.get('/', (req, res) => {
  if (req.query.id) {
    return phoneNumberController.getById(req, res);
  }
  return phoneNumberController.getAll(req, res);
});

// POST /api/phone_number - Cria novos números
router.post('/', phoneNumberController.create);

// PUT /api/phone_number?id=phone_number_id - Atualiza número
router.put('/', phoneNumberController.update);

// DELETE /api/phone_number?id=phone_number_id - Remove número
router.delete('/', phoneNumberController.delete);

module.exports = router;
