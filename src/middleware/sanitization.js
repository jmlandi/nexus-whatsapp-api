/**
 * Input Sanitization Middleware
 * Sanitizes user input to prevent XSS, SQL injection, and other attacks
 */

const { sanitizeString } = require('../utils/validators');

/**
 * Recursively sanitizes an object's string values
 *
 * @param {*} obj - Object to sanitize
 * @returns {*} Sanitized object
 */
function sanitizeObject(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Middleware to sanitize request body, query, and params
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function sanitizeInput(req, res, next) {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }

  next();
}

/**
 * Prevents common injection patterns
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function preventInjection(req, res, next) {
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
    /(\bor\b|\band\b).*?[=<>]/gi // SQL injection patterns
  ];

  const checkForDangerousContent = value => {
    if (typeof value !== 'string') return false;
    return dangerousPatterns.some(pattern => pattern.test(value));
  };

  const checkObject = obj => {
    if (!obj || typeof obj !== 'object') return false;

    for (const value of Object.values(obj)) {
      if (typeof value === 'string' && checkForDangerousContent(value)) {
        return true;
      }
      if (typeof value === 'object' && checkObject(value)) {
        return true;
      }
    }
    return false;
  };

  // Check body, query, params for dangerous content
  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    return res.status(400).json({
      success: false,
      error: 'Conteúdo inválido',
      message: 'A requisição contém conteúdo potencialmente perigoso'
    });
  }

  next();
}

module.exports = {
  sanitizeInput,
  preventInjection,
  sanitizeObject
};
