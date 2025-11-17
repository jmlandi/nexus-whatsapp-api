/**
 * Configuração principal do servidor Express
 * Inicializa middlewares, rotas e serviços
 */

require('dotenv').config();

// Validate environment variables before starting the application
const { validateEnvironment } = require('./utils/envValidator');
validateEnvironment(true); // Exit on error

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const crypto = require('crypto');
const logger = require('./utils/logger');
const routes = require('./routes');
const { startCronJobs } = require('./jobs/cronJobs');
const { errorHandler } = require('./middleware/errorHandler');
const requestIdMiddleware = require('./middleware/requestId');
const { getCorsOptions } = require('./config/cors');
const { generalLimiter } = require('./config/rateLimits');
const { sanitizeInput, preventInjection } = require('./middleware/sanitization');
const { responseTimeMiddleware } = require('./middleware/performance');
const { setupGracefulShutdown } = require('./utils/gracefulShutdown');

const app = express();
const PORT = process.env.PORT || 3000;

// Log ALL incoming requests FIRST
app.use((req, res, next) => {
  console.log('========== INCOMING REQUEST ==========');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Path:', req.path);
  console.log('IP:', req.ip);
  console.log('======================================');
  next();
});

// Compression middleware - gzip responses
app.use(compression());

// Request ID middleware - track all requests with unique IDs
app.use(requestIdMiddleware);

// Performance monitoring - track response times
app.use(responseTimeMiddleware);

// Middleware para gerar nonce único por requisição (CSP segura)
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

// Middlewares de segurança com CSP rigorosa
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          (req, res) => `'nonce-${res.locals.nonce}'`,
          "'unsafe-eval'", // Necessário para Vue em modo dev
          'https://cdn.tailwindcss.com',
          'https://unpkg.com'
        ],
        scriptSrcAttr: ["'none'"], // Bloqueia event handlers inline (onclick, onsubmit, etc)
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.tailwindcss.com'], // CSS inline e Google Fonts
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'], // Google Fonts
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"],
        upgradeInsecureRequests: []
      }
    }
  })
);
app.use(cors(getCorsOptions()));

// Input sanitization and security
app.use(sanitizeInput);
app.use(preventInjection);

// Middleware para injetar nonce em arquivos HTML
app.use((req, res, next) => {
  if (req.path.endsWith('.html')) {
    const filePath = path.join(__dirname, '../public', req.path);

    if (fs.existsSync(filePath)) {
      let html = fs.readFileSync(filePath, 'utf-8');
      // Injeta o nonce em todos os scripts inline
      html = html.replace(/<script(?!.*src=)/g, `<script nonce="${res.locals.nonce}"`);

      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    }
  }
  next();
});

// Servir arquivos estáticos (interface web)
app.use(express.static(path.join(__dirname, '../public')));

// Rate limiting - general protection for all API routes
app.use('/api/', generalLimiter);

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log de requisições com request ID
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.id,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Rota de health check expandida
app.get('/health', async (req, res) => {
  const { getSystemMetrics } = require('./middleware/performance');
  const { getConfigSummary } = require('./utils/envValidator');
  const prisma = require('./utils/prisma');

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    system: getSystemMetrics(),
    config: getConfigSummary(),
    services: {
      database: 'unknown',
      whatsapp: 'unknown',
      s3: 'unknown',
      anthropic: 'unknown'
    }
  };

  // Test database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'connected';
  } catch (error) {
    health.services.database = 'disconnected';
    health.status = 'degraded';
    logger.error('Health check: Database connection failed', { error: error.message });
  }

  // Check service configurations
  health.services.whatsapp = process.env.WHATSAPP_ACCESS_TOKEN ? 'configured' : 'not_configured';
  health.services.s3 =
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? 'configured' : 'not_configured';
  health.services.anthropic = process.env.ANTHROPIC_API_KEY ? 'configured' : 'not_configured';

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Rota para interface web de chat
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/chat.html'));
});

// Rotas da API
app.use('/api', routes);

// Tratamento de rota não encontrada (API)
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path
  });
});

// Redireciona root para o SPA
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Serve o SPA para todas as rotas não-API (SPA routing)
app.get('*', (req, res, next) => {
  // Se for uma rota de API, passa para o próximo handler
  if (req.path.startsWith('/api')) {
    return next();
  }

  // Se for um arquivo estático, deixa o express.static servir
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return next();
  }

  // Serve o index.html para todas as outras rotas (SPA)
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Tratamento de rota não encontrada (API apenas)
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path
  });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

// Inicialização do servidor
const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);

  // Inicia os cron jobs
  startCronJobs();
  logger.info('⏰ Cron jobs iniciados');
});

// Setup graceful shutdown handlers
setupGracefulShutdown(server);

module.exports = app;
