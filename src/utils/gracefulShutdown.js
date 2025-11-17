/**
 * Graceful Shutdown Handler
 * Handles SIGTERM and SIGINT signals for clean application shutdown
 */

const logger = require('../utils/logger');
const prisma = require('../utils/prisma');

let isShuttingDown = false;

/**
 * Graceful shutdown handler
 *
 * @param {string} signal - Signal received (SIGTERM, SIGINT, etc)
 * @param {Object} server - HTTP server instance
 */
async function gracefulShutdown(signal, server) {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress, forcing exit');
    process.exit(1);
  }

  isShuttingDown = true;
  logger.info(`${signal} received, starting graceful shutdown...`);

  // Stop accepting new connections
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        // Close database connections
        await prisma.$disconnect();
        logger.info('Database connections closed');

        // Add other cleanup tasks here:
        // - Close Redis connections
        // - Finish pending jobs
        // - Save state
        // - etc.

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', { error: error.message });
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
}

/**
 * Setup signal handlers
 *
 * @param {Object} server - HTTP server instance
 */
function setupGracefulShutdown(server) {
  // Handle SIGTERM (sent by process managers like Render, Docker, PM2)
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM', server));

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => gracefulShutdown('SIGINT', server));

  // Handle uncaught exceptions
  process.on('uncaughtException', error => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack
    });
    gracefulShutdown('UNCAUGHT_EXCEPTION', server);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason,
      promise
    });
    gracefulShutdown('UNHANDLED_REJECTION', server);
  });

  logger.info('Graceful shutdown handlers registered');
}

module.exports = {
  gracefulShutdown,
  setupGracefulShutdown
};
