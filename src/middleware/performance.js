/**
 * Performance Monitoring Middleware
 * Tracks response times and performance metrics
 */

const logger = require('../utils/logger');

/**
 * Response time tracking middleware
 * Logs slow requests and tracks performance metrics
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function responseTimeMiddleware(req, res, next) {
  const startTime = Date.now();

  // Intercept response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.id,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn('Slow request detected', logData);
    } else if (duration > 500) {
      logger.info('Request took longer than expected', logData);
    }

    // Log all requests in debug mode
    if (process.env.LOG_LEVEL === 'debug') {
      logger.debug('Request completed', logData);
    }
  });

  next();
}

/**
 * Memory usage monitoring
 * Returns current memory usage statistics
 */
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`, // Resident Set Size
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(usage.external / 1024 / 1024)}MB`,
    arrayBuffers: `${Math.round((usage.arrayBuffers || 0) / 1024 / 1024)}MB`
  };
}

/**
 * System metrics monitoring
 * Returns various system metrics
 */
function getSystemMetrics() {
  return {
    uptime: process.uptime(),
    uptimeFormatted: formatUptime(process.uptime()),
    memory: getMemoryUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    pid: process.pid
  };
}

/**
 * Formats uptime in human-readable format
 *
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Logs periodic performance metrics
 * Call this in an interval to monitor system health
 */
function logPerformanceMetrics() {
  const metrics = getSystemMetrics();
  logger.info('Performance metrics', metrics);
}

// Log metrics every 5 minutes in production
if (process.env.NODE_ENV === 'production') {
  setInterval(logPerformanceMetrics, 5 * 60 * 1000);
}

module.exports = {
  responseTimeMiddleware,
  getMemoryUsage,
  getSystemMetrics,
  formatUptime,
  logPerformanceMetrics
};
