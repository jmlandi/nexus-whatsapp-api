/**
 * Rate Limiting Configuration
 * Protects API from abuse with tiered rate limits
 */

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Muitas requisições deste IP. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      requestId: req.id
    });
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Muitas requisições deste IP. Tente novamente em 15 minutos.'
    });
  }
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      email: req.body.email,
      requestId: req.id
    });
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
    });
  }
});

/**
 * Moderate rate limiter for file uploads
 * 10 uploads per hour per IP
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    error: 'Upload limit exceeded',
    message: 'Limite de uploads atingido. Tente novamente em 1 hora.'
  },
  handler: (req, res) => {
    logger.warn('Upload rate limit exceeded', {
      ip: req.ip,
      userId: req.user?.id,
      requestId: req.id
    });
    res.status(429).json({
      success: false,
      error: 'Upload limit exceeded',
      message: 'Limite de uploads atingido. Tente novamente em 1 hora.'
    });
  }
});

/**
 * Strict rate limiter for WhatsApp message sending
 * 30 messages per hour per IP
 */
const whatsappLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  message: {
    success: false,
    error: 'WhatsApp rate limit exceeded',
    message: 'Limite de mensagens WhatsApp atingido. Tente novamente em 1 hora.'
  },
  handler: (req, res) => {
    logger.warn('WhatsApp rate limit exceeded', {
      ip: req.ip,
      userId: req.user?.id,
      requestId: req.id
    });
    res.status(429).json({
      success: false,
      error: 'WhatsApp rate limit exceeded',
      message: 'Limite de mensagens WhatsApp atingido. Tente novamente em 1 hora.'
    });
  }
});

/**
 * Lenient rate limiter for webhooks
 * 1000 requests per 15 minutes (WhatsApp can send many webhook events)
 */
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    error: 'Webhook rate limit exceeded',
    message: 'Limite de webhooks atingido.'
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  whatsappLimiter,
  webhookLimiter
};
