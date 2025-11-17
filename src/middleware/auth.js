const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'nexus-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e adiciona os dados do usuário ao request
 */
const authenticate = (req, res, next) => {
  console.log('========== AUTH MIDDLEWARE ==========');
  console.log('Path:', req.path);
  console.log('Method:', req.method);
  console.log('Has Authorization header:', !!req.headers.authorization);

  try {
    // Extrai o token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log('❌ No authorization header');
      return res.status(401).json({
        error: 'Token não fornecido',
        message: 'É necessário estar autenticado para acessar este recurso'
      });
    }

    // Formato esperado: "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log('❌ Malformed token');
      return res.status(401).json({
        error: 'Token mal formatado',
        message: 'O token deve estar no formato: Bearer <token>'
      });
    }

    const token = parts[1];

    console.log('✅ Token extracted, verifying...');

    // Verifica e decodifica o token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('❌ Token verification failed:', err.message);
        logger.warn('Token inválido ou expirado', { error: err.message });
        return res.status(401).json({
          error: 'Token inválido',
          message: 'O token fornecido é inválido ou expirou'
        });
      }

      console.log('✅ Token verified, user:', decoded.email);

      // Adiciona os dados do usuário ao request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name
      };

      console.log('✅ Auth middleware complete, calling next()');
      next();
    });
  } catch (error) {
    console.error('========== AUTH ERROR ==========');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    logger.error('Erro no middleware de autenticação', { error: error.message });
    return res.status(500).json({
      error: 'Erro na autenticação',
      message: 'Ocorreu um erro ao processar a autenticação'
    });
  }
};

/**
 * Gera um novo token JWT
 */
const generateToken = user => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifica se um token é válido sem lançar erro
 */
const verifyToken = token => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticate,
  generateToken,
  verifyToken,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
