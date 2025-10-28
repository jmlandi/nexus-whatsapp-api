const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');

/**
 * @route POST /api/document/upload
 * @desc Upload de documento PDF para um cliente
 * @access Private
 */
router.post(
  '/upload',
  authenticate,
  documentController.upload.single('file'),
  documentController.uploadDocument
);

/**
 * @route GET /api/document
 * @desc Lista todos os documentos
 * @access Private
 */
router.get('/', authenticate, documentController.getAllDocuments);

/**
 * @route GET /api/document/customer/:customerId
 * @desc Lista documentos de um cliente específico
 * @access Private
 */
router.get('/customer/:customerId', authenticate, documentController.getCustomerDocuments);

/**
 * @route DELETE /api/document/:id
 * @desc Deleta um documento (soft delete)
 * @access Private
 */
router.delete('/:id', authenticate, documentController.deleteDocument);

module.exports = router;
