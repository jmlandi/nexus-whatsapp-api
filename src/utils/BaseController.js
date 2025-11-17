/**
 * BaseController - Base class for all controllers
 * Provides common functionality: pagination, error handling, response formatting
 *
 * @class BaseController
 * @description Extend this class in your controllers to inherit common methods
 *
 * @example
 * class CustomerController extends BaseController {
 *   async getAll(req, res) {
 *     return this.handleRequest(req, res, async () => {
 *       const pagination = this.parsePagination(req);
 *       // ... your logic
 *       return this.paginatedResponse(res, data, total, pagination);
 *     });
 *   }
 * }
 */

const logger = require('./logger');

class BaseController {
  constructor() {
    // Automatically bind all methods to preserve 'this' context when used as Express route handlers
    const prototype = Object.getPrototypeOf(this);
    const methodNames = Object.getOwnPropertyNames(prototype).filter(
      name => name !== 'constructor' && typeof this[name] === 'function'
    );

    methodNames.forEach(name => {
      this[name] = this[name].bind(this);
    });
  }

  /**
   * Parses pagination parameters from request query
   *
   * @param {Object} req - Express request object
   * @param {Object} options - Pagination options
   * @param {number} options.defaultLimit - Default page size
   * @param {number} options.maxLimit - Maximum allowed page size
   * @returns {Object} Pagination object with page, limit, skip, pageSize
   *
   * @example
   * const pagination = this.parsePagination(req);
   * // { page: 1, limit: 20, skip: 0, pageSize: 20 }
   */
  parsePagination(req, options = {}) {
    const defaultLimit = options.defaultLimit || parseInt(process.env.DEFAULT_PAGE_SIZE) || 20;
    const maxLimit = options.maxLimit || parseInt(process.env.MAX_PAGE_SIZE) || 100;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = parseInt(req.query.limit) || defaultLimit;
    const pageSize = Math.min(limit, maxLimit);
    const skip = (page - 1) * pageSize;

    return {
      page,
      limit: pageSize,
      skip,
      pageSize
    };
  }

  /**
   * Sends a standardized paginated response
   *
   * @param {Object} res - Express response object
   * @param {Array} data - Array of data items
   * @param {number} total - Total count of items
   * @param {Object} pagination - Pagination object from parsePagination
   * @param {string} dataKey - Key name for data in response (default: 'data')
   * @returns {Object} Express response
   *
   * @example
   * return this.paginatedResponse(res, customers, total, pagination, 'customers');
   */
  paginatedResponse(res, data, total, pagination, dataKey = 'data') {
    const response = {
      [dataKey]: data,
      pagination: {
        page: pagination.page,
        limit: pagination.pageSize,
        total,
        totalPages: Math.ceil(total / pagination.pageSize)
      }
    };

    return res.json(response);
  }

  /**
   * Sends a standardized success response
   *
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {string} message - Optional success message
   * @param {number} statusCode - HTTP status code (default: 200)
   * @returns {Object} Express response
   *
   * @example
   * return this.successResponse(res, customer, 'Cliente criado com sucesso', 201);
   */
  successResponse(res, data, message = null, statusCode = 200) {
    const response = { success: true };

    if (message) response.message = message;
    if (data !== null && data !== undefined) response.data = data;

    return res.status(statusCode).json(response);
  }

  /**
   * Sends a standardized error response
   *
   * @param {Object} res - Express response object
   * @param {string} error - Error title/type
   * @param {string} message - Detailed error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {Object} details - Additional error details
   * @returns {Object} Express response
   *
   * @example
   * return this.errorResponse(res, 'Validação falhou', 'Email é obrigatório', 400);
   */
  errorResponse(res, error, message, statusCode = 500, details = null) {
    const response = {
      success: false,
      error,
      message
    };

    if (details) response.details = details;

    return res.status(statusCode).json(response);
  }

  /**
   * Handles async request execution with automatic error handling
   * Wraps controller logic to catch errors and send appropriate responses
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} handler - Async handler function
   * @param {string} context - Context description for logging
   * @returns {Promise<Object>} Express response
   *
   * @example
   * async getAll(req, res) {
   *   return this.handleRequest(req, res, async () => {
   *     // Your logic here
   *   }, 'listar clientes');
   * }
   */
  async handleRequest(req, res, handler, context = 'processar requisição') {
    try {
      return await handler();
    } catch (error) {
      logger.error(`Erro ao ${context}`, {
        error: error.message,
        stack: error.stack,
        requestId: req.id
      });

      return this.errorResponse(res, 'Erro no servidor', `Ocorreu um erro ao ${context}`, 500);
    }
  }

  /**
   * Validates required fields in request body
   *
   * @param {Object} body - Request body
   * @param {Array<string>} requiredFields - Array of required field names
   * @returns {Object|null} Validation error object or null if valid
   *
   * @example
   * const error = this.validateRequiredFields(req.body, ['email', 'password']);
   * if (error) return this.errorResponse(res, error.error, error.message, 400);
   */
  validateRequiredFields(body, requiredFields) {
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return {
        error: 'Dados incompletos',
        message: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`
      };
    }

    return null;
  }

  /**
   * Validates UUID format
   *
   * @param {string} id - UUID string to validate
   * @returns {boolean} True if valid UUID
   *
   * @example
   * if (!this.isValidUUID(req.params.id)) {
   *   return this.errorResponse(res, 'ID inválido', 'Formato de ID incorreto', 400);
   * }
   */
  isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Extracts filter from query parameters
   *
   * @param {Object} query - Request query object
   * @param {Array<string>} allowedFields - Allowed filter fields
   * @returns {Object} Filter object for Prisma where clause
   *
   * @example
   * const filter = this.extractFilters(req.query, ['customerId', 'status']);
   */
  extractFilters(query, allowedFields = []) {
    const filters = { isActive: true };

    allowedFields.forEach(field => {
      if (query[field]) {
        filters[field] = query[field];
      }
    });

    return filters;
  }
}

module.exports = BaseController;
