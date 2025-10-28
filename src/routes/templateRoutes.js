/**
 * Rotas de Templates
 */

const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { authenticate } = require('../middleware/auth');

// Todas as rotas de template requerem autenticação
router.use(authenticate);

// GET /api/template?limit=100 - Lista todos os templates
router.get('/', templateController.getAll);

// POST /api/template - Cria novo template
router.post('/', templateController.create);

// POST /api/template/create-report-template - Cria template padrão para relatórios
router.post('/create-report-template', templateController.createReportTemplate);

// DELETE /api/template/:name - Deleta template
router.delete('/:name', templateController.delete);

module.exports = router;
