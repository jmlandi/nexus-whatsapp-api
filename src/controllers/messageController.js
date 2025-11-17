/**
 * Controller de Messages
 * Gerencia mensagens e integração com webhook do WhatsApp
 */

const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const chatService = require('../services/chatService');
const whatsappService = require('../services/whatsappService');

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
        messages,
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
   * Webhook do WhatsApp - recebe mensagens e eventos
   * POST /api/message
   * Body: Payload do webhook do WhatsApp (formato Graph API)
   */
  async create(req, res) {
    try {
      // Verifica se é uma mensagem recebida
      const entry = req.body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (!messages || messages.length === 0) {
        // Pode ser um evento de status, não uma mensagem
        logger.info('Webhook recebido mas sem mensagens');
        return res.status(200).json({ message: 'Webhook recebido' });
      }

      const message = messages[0];
      const { from, id: messageId, text, type } = message;

      // Por enquanto, só processa mensagens de texto
      if (type !== 'text') {
        logger.info(`Tipo de mensagem não suportado: ${type}`);
        return res.status(200).json({ message: 'Tipo de mensagem não suportado' });
      }

      const messageBody = text?.body;

      if (!from || !messageBody) {
        return res.status(400).json({ error: 'Dados da mensagem incompletos' });
      }

      logger.info(`Mensagem recebida do WhatsApp: ${messageId} de ${from}`);

      // Busca número de telefone no banco
      const phoneNumberRecord = await prisma.phoneNumber.findFirst({
        where: {
          phoneNumber: {
            contains: from.slice(-10) // Últimos 10 dígitos
          },
          isActive: true
        },
        include: {
          customer: true
        }
      });

      if (!phoneNumberRecord) {
        logger.warn(`Número não encontrado no sistema: ${from}`);

        // Envia mensagem informando que o número não está cadastrado
        await whatsappService.sendMessage(from, 'Desculpe, este número não está cadastrado em nosso sistema.');

        return res.status(200).json({
          message: 'Número não cadastrado - mensagem informativa enviada'
        });
      }

      // Busca ou cria chat
      const chat = await chatService.getOrCreateChat(phoneNumberRecord.customerId, phoneNumberRecord.id);

      // Adiciona mensagem ao chat
      const chatMessage = await chatService.addMessage(chat.id, messageBody, 'user');

      logger.info(`Mensagem adicionada ao chat ${chat.id}`);

      // Marca mensagem como lida
      whatsappService.markAsRead(messageId).catch(err => {
        logger.warn(`Erro ao marcar mensagem como lida: ${err.message}`);
      });

      // Processa mensagem com IA e envia resposta automaticamente (assíncrono)
      chatService.processMessageAsync(chat, messageBody, from);

      // Responde imediatamente ao WhatsApp (webhook deve responder rápido)
      res.status(200).json({
        message: 'Mensagem recebida com sucesso',
        chatId: chat.id,
        messageId: chatMessage.id,
        aiProcessing: true
      });
    } catch (error) {
      logger.error(`Erro ao processar mensagem: ${error.message}`);
      res.status(500).json({ error: 'Erro ao processar mensagem' });
    }
  }

  /**
   * Verifica o webhook do WhatsApp (GET request)
   * GET /api/message
   * Query params: hub.mode, hub.verify_token, hub.challenge
   */
  async verifyWebhook(req, res) {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'nexus_verify_token';

      if (mode === 'subscribe' && token === verifyToken) {
        logger.info('Webhook do WhatsApp verificado com sucesso');
        res.status(200).send(challenge);
      } else {
        logger.warn('Falha na verificação do webhook do WhatsApp');
        res.status(403).json({ error: 'Verification failed' });
      }
    } catch (error) {
      logger.error(`Erro ao verificar webhook: ${error.message}`);
      res.status(500).json({ error: 'Erro ao verificar webhook' });
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
