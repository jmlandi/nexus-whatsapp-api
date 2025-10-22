/**
 * Rotas de Reports
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// GET /api/report - Lista todos os relatórios
// GET /api/report?id=report_id - Busca relatório específico
router.get('/', (req, res) => {
  if (req.query.id) {
    return reportController.getById(req, res);
  }
  return reportController.getAll(req, res);
});

// POST /api/report - Cria novos relatórios
router.post('/', reportController.create);

// PUT /api/report?id=report_id - Atualiza relatório
router.put('/', reportController.update);

// DELETE /api/report?id=report_id - Remove relatório
router.delete('/', reportController.delete);

module.exports = router;
