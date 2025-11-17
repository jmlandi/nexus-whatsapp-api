/**
 * Global Error Handler Middleware
 * Catches and processes all unhandled errors in the application
 * Provides consistent error responses and logging
 */

const logger = require('../utils/logger');

/**
 * Custom Application Error class
 * Use this to throw errors with specific status codes
 *
 * @class AppError
 * @extends Error
 *
 * @example
 * throw new AppError('Cliente não encontrado', 404);
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Distinguishes operational errors from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 * Catches all errors and sends appropriate responses
 *
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} _next - Express next function (unused in error handlers)
 */
const errorHandler = (err, req, res, _next) => {
  // Default error properties
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erro interno do servidor';
  let error = err.name || 'ServerError';
  let details = err.details || null;

  // Log error with context
  const errorContext = {
    error: message,
    stack: err.stack,
    requestId: req.id,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id
  };

  if (statusCode >= 500) {
    logger.error('Server error occurred', errorContext);
  } else {
    logger.warn('Client error occurred', errorContext);
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    error = 'Erro de validação';
    message = 'Dados fornecidos são inválidos';
    details = err.errors;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    error = 'Token inválido';
    message = 'O token de autenticação é inválido';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    error = 'Token expirado';
    message = 'O token de autenticação expirou';
  }

  // Prisma errors
  if (err.code && err.code.startsWith('P')) {
    statusCode = 400;
    error = 'Erro de banco de dados';

    if (err.code === 'P2002') {
      message = 'Já existe um registro com esses dados';
      details = { field: err.meta?.target };
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Registro não encontrado';
    } else {
      message = 'Erro ao processar operação no banco de dados';
    }
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    message = 'Ocorreu um erro interno. Tente novamente mais tarde.';
    details = null;
  }

  // Send error response
  const response = {
    success: false,
    error,
    message
  };

  if (details) response.details = details;
  if (req.id) response.requestId = req.id;

  res.status(statusCode).json(response);
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors automatically
 *
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 *
 * @example
 * router.get('/customers', asyncHandler(async (req, res) => {
 *   const customers = await prisma.customer.findMany();
 *   res.json(customers);
 * }));
 */
const asyncHandler = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler
};
