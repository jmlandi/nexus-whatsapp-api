/**
 * Audit Logger
 * Logs critical operations for security and compliance
 */

const logger = require('../utils/logger');
// const prisma = require('../utils/prisma'); // Reserved for future database audit trail

/**
 * Log audit event
 *
 * @param {Object} params - Audit parameters
 * @param {string} params.action - Action performed
 * @param {string} params.resource - Resource type (customer, report, user, etc)
 * @param {string} params.resourceId - Resource ID
 * @param {Object} params.user - User who performed the action
 * @param {Object} params.changes - Changes made (before/after)
 * @param {Object} params.metadata - Additional metadata
 * @param {Object} params.req - Express request object
 */
async function logAudit({ action, resource, resourceId, user, changes, metadata, req }) {
  const auditLog = {
    timestamp: new Date().toISOString(),
    action,
    resource,
    resourceId,
    userId: user?.id || 'anonymous',
    userEmail: user?.email || 'unknown',
    ip: req?.ip || 'unknown',
    userAgent: req?.get('user-agent') || 'unknown',
    requestId: req?.id,
    changes: changes || null,
    metadata: metadata || null
  };

  // Log to Winston
  logger.info('Audit log', auditLog);

  // In production, you might want to:
  // 1. Store in separate audit database table
  // 2. Send to external logging service (DataDog, Splunk, etc)
  // 3. Write to append-only file

  return auditLog;
}

/**
 * Audit middleware for Express routes
 * Usage: router.post('/resource', auditMiddleware('CREATE', 'resource'), handler)
 *
 * @param {string} action - Action type (CREATE, UPDATE, DELETE, etc)
 * @param {string} resource - Resource type
 * @returns {Function} Express middleware
 */
function auditMiddleware(action, resource) {
  return async (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      // Log after successful response
      if (res.statusCode < 400) {
        logAudit({
          action,
          resource,
          resourceId: data?.data?.id || data?.id || req.params.id,
          user: req.user,
          changes: {
            body: req.body,
            params: req.params
          },
          req
        }).catch(err => {
          logger.error('Failed to log audit', { error: err.message });
        });
      }

      return originalJson(data);
    };

    next();
  };
}

/**
 * Logs critical actions (CREATE, UPDATE, DELETE)
 */
const AUDITABLE_ACTIONS = {
  // User management
  USER_LOGIN: 'USER_LOGIN',
  USER_REGISTER: 'USER_REGISTER',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',

  // Customer management
  CUSTOMER_CREATE: 'CUSTOMER_CREATE',
  CUSTOMER_UPDATE: 'CUSTOMER_UPDATE',
  CUSTOMER_DELETE: 'CUSTOMER_DELETE',

  // Report management
  REPORT_CREATE: 'REPORT_CREATE',
  REPORT_UPDATE: 'REPORT_UPDATE',
  REPORT_DELETE: 'REPORT_DELETE',
  REPORT_SEND: 'REPORT_SEND',

  // WhatsApp operations
  WHATSAPP_TEMPLATE_SEND: 'WHATSAPP_TEMPLATE_SEND',
  WHATSAPP_MESSAGE_SEND: 'WHATSAPP_MESSAGE_SEND',

  // Chat management
  CHAT_CLOSE: 'CHAT_CLOSE',
  CHAT_CREATE: 'CHAT_CREATE'
};

module.exports = {
  logAudit,
  auditMiddleware,
  AUDITABLE_ACTIONS
};
