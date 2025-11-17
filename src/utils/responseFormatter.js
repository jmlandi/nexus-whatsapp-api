/**
 * Response Formatter Utilities
 * Standardized response formatting for consistent API responses
 */

/**
 * Formats a success response
 *
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Formatted response object
 *
 * @example
 * res.json(formatSuccess(customer, 'Cliente criado com sucesso'));
 */
const formatSuccess = (data, message = null) => {
  const response = { success: true };

  if (message) response.message = message;
  if (data !== null && data !== undefined) response.data = data;

  return response;
};

/**
 * Formats an error response
 *
 * @param {string} error - Error type/title
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Object} Formatted error object
 *
 * @example
 * res.status(400).json(formatError('Validação falhou', 'Email é obrigatório'));
 */
const formatError = (error, message, details = null) => {
  const response = {
    success: false,
    error,
    message
  };

  if (details) response.details = details;

  return response;
};

/**
 * Formats a paginated response
 *
 * @param {Array} data - Array of items
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {string} dataKey - Key name for data array
 * @returns {Object} Formatted paginated response
 *
 * @example
 * res.json(formatPaginatedResponse(customers, 100, 1, 20, 'customers'));
 */
const formatPaginatedResponse = (data, total, page, limit, dataKey = 'data') => {
  return {
    [dataKey]: data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Formats validation errors
 *
 * @param {Array} errors - Array of validation errors
 * @returns {Object} Formatted validation error response
 *
 * @example
 * const errors = [{ field: 'email', message: 'Email inválido' }];
 * res.status(400).json(formatValidationErrors(errors));
 */
const formatValidationErrors = errors => {
  return {
    success: false,
    error: 'Erro de validação',
    message: 'Um ou mais campos contêm erros',
    details: errors
  };
};

module.exports = {
  formatSuccess,
  formatError,
  formatPaginatedResponse,
  formatValidationErrors
};
