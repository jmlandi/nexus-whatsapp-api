/**
 * Rotas de PhoneNumbers
 */

const express = require('express');
const router = express.Router();
const phoneNumberController = require('../controllers/phoneNumberController');

// GET /api/phone_number - Lista todos os números
router.get('/', phoneNumberController.getAll);

// GET /api/phone_number/:id - Busca número específico
router.get('/:id', phoneNumberController.getById);

// POST /api/phone_number - Cria novos números
router.post('/', phoneNumberController.create);

// PUT /api/phone_number/:id - Atualiza número
router.put('/:id', phoneNumberController.update);

// DELETE /api/phone_number/:id - Remove número
router.delete('/:id', phoneNumberController.delete);

module.exports = router;
