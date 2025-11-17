/**
 * Request ID Middleware
 * Generates unique ID for each request to track logs and debug issues
 */

const crypto = require('crypto');

/**
 * Generates a unique request ID and attaches it to the request object
 * Also adds it to response headers for client-side tracking
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 *
 * @example
 * // In server.js
 * app.use(requestIdMiddleware);
 */
const requestIdMiddleware = (req, res, next) => {
  // Check if request already has an ID from client
  const existingId = req.headers['x-request-id'];

  // Generate new ID or use existing
  const requestId = existingId || `req_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

  // Attach to request object for use in controllers/services
  req.id = requestId;

  // Add to response headers so client can track requests
  res.setHeader('X-Request-ID', requestId);

  next();
};

module.exports = requestIdMiddleware;
