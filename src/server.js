/**
 * Configuração principal do servidor Express
 * Inicializa middlewares, rotas e serviços
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const routes = require('./routes');
const { startCronJobs } = require('./jobs/cronJobs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para gerar nonce único por requisição (CSP segura)
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

// Middlewares de segurança com CSP rigorosa
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      scriptSrcAttr: ["'none'"], // Bloqueia event handlers inline (onclick, onsubmit, etc)
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // CSS inline e Google Fonts
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"], // Google Fonts
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(cors());

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

// Rate limiting - previne abuso da API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
});
app.use('/api/', limiter);

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log de requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
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

// Redireciona root para a interface de login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Tratamento de rota não encontrada (Geral)
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.path
  });
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  logger.error(`Erro: ${err.message}`, { stack: err.stack });
  
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Inicialização do servidor
app.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  
  // Inicia os cron jobs
  startCronJobs();
  logger.info('⏰ Cron jobs iniciados');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});

module.exports = app;
