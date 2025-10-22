/**
 * Controller de Messages
 * Gerencia mensagens e integração com Twilio (webhook)
 */

const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const chatService = require('../services/chatService');
const twilioService = require('../services/twilioService');

class MessageController {
  /**
   * Lista mensagens de um chat específico com paginação
   * GET /api/message?chat_id=chat_id
   */
  async getByChatId(req, res) {
    try {
      const { chat_id } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 20;
      const maxLimit = parseInt(process.env.MAX_PAGE_SIZE) || 100;

      if (!chat_id) {
        return res.status(400).json({ error: 'chat_id é obrigatório' });
      }

      const pageSize = Math.min(limit, maxLimit);
      const skip = (page - 1) * pageSize;

      const [messages, total] = await Promise.all([
        prisma.chatMessage.findMany({
          where: { chatId: chat_id },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'asc' }
        }),
        prisma.chatMessage.count({ where: { chatId: chat_id } })
      ]);

      res.json({
        data: messages,
        pagination: {
          page,
          limit: pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    } catch (error) {
      logger.error(`Erro ao listar mensagens: ${error.message}`);
      res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
  }

  /**
   * Busca mensagem específica por ID
   * GET /api/message?id=message_id
   */
  async getById(req, res) {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID da mensagem é obrigatório' });
      }

      const message = await prisma.chatMessage.findUnique({
        where: { id },
        include: {
          chat: {
            include: {
              customer: true,
              phoneNumber: true
            }
          }
        }
      });

      if (!message) {
        return res.status(404).json({ error: 'Mensagem não encontrada' });
      }

      res.json(message);
    } catch (error) {
      logger.error(`Erro ao buscar mensagem: ${error.message}`);
      res.status(500).json({ error: 'Erro ao buscar mensagem' });
    }
  }

  /**
   * Webhook do Twilio - recebe mensagens do WhatsApp
   * POST /api/message
   * Body (Twilio): { From, Body, MessageSid, etc }
   */
  async create(req, res) {
    try {
      const { From, Body, MessageSid } = req.body;

      if (!From || !Body) {
        return res.status(400).json({ error: 'From e Body são obrigatórios' });
      }

      logger.info(`Mensagem recebida do Twilio: ${MessageSid} de ${From}`);

      // Remove prefixo whatsapp: do número
      const phoneNumber = From.replace('whatsapp:', '');

      // Busca número de telefone no banco
      const phoneNumberRecord = await prisma.phoneNumber.findFirst({
        where: { 
          phoneNumber: {
            contains: phoneNumber.slice(-10) // Últimos 10 dígitos
          },
          isActive: true 
        },
        include: {
          customer: true
        }
      });

      if (!phoneNumberRecord) {
        logger.warn(`Número não encontrado no sistema: ${phoneNumber}`);
        return res.status(404).json({ 
          error: 'Número não cadastrado',
          message: 'Este número não está cadastrado no sistema'
        });
      }

      // Busca ou cria chat
      const chat = await chatService.getOrCreateChat(
        phoneNumberRecord.customerId,
        phoneNumberRecord.id
      );

      // Adiciona mensagem ao chat
      const message = await chatService.addMessage(chat.id, Body, 'user');

      logger.info(`Mensagem adicionada ao chat ${chat.id}`);

      // Processa mensagem com IA e envia resposta automaticamente (assíncrono)
      // Não bloqueia a resposta do webhook para o Twilio
      chatService.processMessageAsync(
        chat,
        Body,
        phoneNumberRecord.phoneNumber
      );

      // Responde imediatamente ao Twilio (webhook deve responder rápido)
      res.status(200).json({
        message: 'Mensagem recebida com sucesso',
        chatId: chat.id,
        messageId: message.id,
        aiProcessing: true
      });
    } catch (error) {
      logger.error(`Erro ao processar mensagem: ${error.message}`);
      res.status(500).json({ error: 'Erro ao processar mensagem' });
    }
  }

  /**
   * Remove mensagem específica
   * DELETE /api/message?id=message_id
   */
  async delete(req, res) {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID da mensagem é obrigatório' });
      }

      await prisma.chatMessage.delete({
        where: { id }
      });

      logger.info(`Mensagem removida: ${id}`);
      res.json({ message: 'Mensagem removida com sucesso' });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Mensagem não encontrada' });
      }
      logger.error(`Erro ao remover mensagem: ${error.message}`);
      res.status(500).json({ error: 'Erro ao remover mensagem' });
    }
  }
}

module.exports = new MessageController();
