/**
 * Controller de Chats
 * Gerencia operações de chat e envio de mensagens via Twilio
 */

const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const chatService = require('../services/chatService');
const twilioService = require('../services/twilioService');

class ChatController {
  /**
   * Fecha um chat específico
   * POST /api/chat/close-chat
   * Body: { chatId }
   */
  async closeChat(req, res) {
    try {
      const { chatId } = req.body;

      if (!chatId) {
        return res.status(400).json({ error: 'chatId é obrigatório' });
      }

      // Verifica se chat existe
      const chat = await prisma.chat.findUnique({
        where: { id: chatId }
      });

      if (!chat) {
        return res.status(404).json({ error: 'Chat não encontrado' });
      }

      if (!chat.isOpen) {
        return res.status(400).json({ error: 'Chat já está fechado' });
      }

      // Fecha o chat
      const closedChat = await chatService.closeChat(chatId);

      logger.info(`Chat fechado: ${chatId}`);
      res.json({
        message: 'Chat fechado com sucesso',
        chat: closedChat
      });
    } catch (error) {
      logger.error(`Erro ao fechar chat: ${error.message}`);
      res.status(500).json({ error: 'Erro ao fechar chat' });
    }
  }

  /**
   * Inicia novo chat enviando template do WhatsApp
   * POST /api/chat/send-template
   * Body: { customerId, phoneNumberId, templateId, variables? }
   */
  async sendTemplate(req, res) {
    try {
      const { customerId, phoneNumberId, templateId, variables } = req.body;

      if (!customerId || !phoneNumberId || !templateId) {
        return res.status(400).json({ 
          error: 'customerId, phoneNumberId e templateId são obrigatórios' 
        });
      }

      // Busca cliente e número de telefone
      const [customer, phoneNumber] = await Promise.all([
        prisma.customer.findUnique({
          where: { id: customerId }
        }),
        prisma.phoneNumber.findUnique({
          where: { id: phoneNumberId }
        })
      ]);

      if (!customer) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      if (!phoneNumber) {
        return res.status(404).json({ error: 'Número de telefone não encontrado' });
      }

      // Verifica se já existe chat aberto
      let chat = await chatService.getOpenChat(customerId, phoneNumberId);
      
      if (chat) {
        return res.status(400).json({ 
          error: 'Já existe um chat aberto para este cliente e número',
          chatId: chat.id
        });
      }

      // Cria novo chat
      chat = await chatService.createChat(customerId, phoneNumberId);

      // Envia template via Twilio
      const twilioResponse = await twilioService.sendTemplate(
        phoneNumber.phoneNumber,
        templateId,
        variables
      );

      // Registra mensagem no chat
      await chatService.addMessage(
        chat.id,
        `Template enviado: ${templateId}`,
        'wa_template'
      );

      logger.info(`Template enviado para iniciar chat ${chat.id}`);

      res.status(201).json({
        message: 'Template enviado e chat iniciado com sucesso',
        chat,
        twilioResponse
      });
    } catch (error) {
      logger.error(`Erro ao enviar template: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Lista todos os chats com paginação
   * GET /api/chat
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 20;
      const maxLimit = parseInt(process.env.MAX_PAGE_SIZE) || 100;
      const isOpen = req.query.isOpen;
      const customerId = req.query.customerId;
      
      const pageSize = Math.min(limit, maxLimit);
      const skip = (page - 1) * pageSize;

      // Monta filtros
      const where = {};
      if (isOpen !== undefined) {
        where.isOpen = isOpen === 'true';
      }
      if (customerId) {
        where.customerId = customerId;
      }

      const [chats, total] = await Promise.all([
        prisma.chat.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { updatedAt: 'desc' },
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                nickname: true
              }
            },
            phoneNumber: true,
            _count: {
              select: { messages: true }
            }
          }
        }),
        prisma.chat.count({ where })
      ]);

      res.json({
        data: chats,
        pagination: {
          page,
          limit: pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    } catch (error) {
      logger.error(`Erro ao listar chats: ${error.message}`);
      res.status(500).json({ error: 'Erro ao buscar chats' });
    }
  }

  /**
   * Busca chat específico por ID
   * GET /api/chat/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const chat = await prisma.chat.findUnique({
        where: { id },
        include: {
          customer: true,
          phoneNumber: true,
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!chat) {
        return res.status(404).json({ error: 'Chat não encontrado' });
      }

      res.json(chat);
    } catch (error) {
      logger.error(`Erro ao buscar chat: ${error.message}`);
      res.status(500).json({ error: 'Erro ao buscar chat' });
    }
  }
}

module.exports = new ChatController();
