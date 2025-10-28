const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const { generateToken } = require('../middleware/auth');

/**
 * Login de usuário
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'Email e senha são obrigatórios'
      });
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      logger.warn('Tentativa de login com email inexistente', { email });
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // Verifica se o usuário está ativo
    if (!user.isActive) {
      logger.warn('Tentativa de login com usuário inativo', { email });
      return res.status(401).json({
        error: 'Usuário inativo',
        message: 'Este usuário foi desativado'
      });
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn('Tentativa de login com senha incorreta', { email });
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // Gera o token
    const token = generateToken(user);

    logger.info('Login realizado com sucesso', { 
      userId: user.id, 
      email: user.email 
    });

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    logger.error('Erro ao fazer login', { error: error.message });
    res.status(500).json({
      error: 'Erro no servidor',
      message: 'Ocorreu um erro ao processar o login'
    });
  }
};

/**
 * Registro de novo usuário (apenas para desenvolvimento/setup inicial)
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validação básica
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'Email, senha e nome são obrigatórios'
      });
    }

    // Verifica se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Email já cadastrado',
        message: 'Já existe um usuário com este email'
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    // Gera o token
    const token = generateToken(user);

    logger.info('Novo usuário registrado', { 
      userId: user.id, 
      email: user.email 
    });

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    logger.error('Erro ao registrar usuário', { error: error.message });
    res.status(500).json({
      error: 'Erro no servidor',
      message: 'Ocorreu um erro ao registrar o usuário'
    });
  }
};

/**
 * Verifica se o token é válido e retorna os dados do usuário
 * GET /api/auth/me
 */
const me = async (req, res) => {
  try {
    // O middleware de autenticação já validou o token e adicionou os dados ao req.user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'O usuário autenticado não foi encontrado'
      });
    }

    res.json({
      user
    });
  } catch (error) {
    logger.error('Erro ao buscar dados do usuário', { error: error.message });
    res.status(500).json({
      error: 'Erro no servidor',
      message: 'Ocorreu um erro ao buscar os dados do usuário'
    });
  }
};

module.exports = {
  login,
  register,
  me
};
