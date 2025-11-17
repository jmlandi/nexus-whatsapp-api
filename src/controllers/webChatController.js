/**
 * Controller de Web Chat
 * Gerencia conversas via interface web com a IA
 */

const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const aiService = require('../services/aiService');

class WebChatController {
  /**
   * Cria uma nova sessão de chat web
   * POST /api/webchat/session
   * Body: { name, email? } OU { customerId }
   */
  async createSession(req, res) {
    try {
      const { name, customerId } = req.body;

      let customer;
      let phoneNumber;

      // Se forneceu customerId, usa cliente existente
      if (customerId) {
        customer = await prisma.customer.findUnique({
          where: { id: customerId },
          include: {
            phoneNumbers: {
              where: { isActive: true },
              take: 1
            }
          }
        });

        if (!customer) {
          return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        // Usa o primeiro número ativo ou cria um fictício
        if (customer.phoneNumbers.length > 0) {
          phoneNumber = customer.phoneNumbers[0];
        } else {
          phoneNumber = await prisma.phoneNumber.create({
            data: {
              customerId: customer.id,
              phoneNumber: `sim_${Date.now()}`,
              isActive: true
            }
          });
        }
      } else {
        // Cria cliente temporário para usuário web anônimo
        if (!name) {
          return res.status(400).json({ error: 'Nome ou customerId é obrigatório' });
        }

        customer = await prisma.customer.create({
          data: {
            firstName: name,
            lastName: 'Web User',
            nickname: name,
            isActive: true
          }
        });

        // Cria um número fictício para o chat web
        phoneNumber = await prisma.phoneNumber.create({
          data: {
            customerId: customer.id,
            phoneNumber: `web_${Date.now()}`,
            isActive: true
          }
        });
      }

      // Cria o chat
      const chat = await prisma.chat.create({
        data: {
          customerId: customer.id,
          phoneNumberId: phoneNumber.id,
          isOpen: true
        }
      });

      // Mensagem de boas-vindas
      const customerName = customer.nickname || customer.firstName;
      const welcomeMessage = `Olá ${customerName}! 👋 Sou o Nexus, assistente de IA da WN7 Marketing.\n\nComo posso ajudar você hoje?`;

      await prisma.chatMessage.create({
        data: {
          chatId: chat.id,
          message: welcomeMessage,
          type: 'agent'
        }
      });

      logger.info(`Sessão de web chat criada: ${chat.id} para ${customerName}`);

      res.status(201).json({
        sessionId: chat.id,
        customerId: customer.id,
        welcomeMessage,
        message: 'Sessão criada com sucesso'
      });
    } catch (error) {
      logger.error(`Erro ao criar sessão web: ${error.message}`);
      res.status(500).json({ error: 'Erro ao criar sessão' });
    }
  }

  /**
   * Envia mensagem e recebe resposta da IA
   * POST /api/webchat/message
   * Body: { sessionId, message }
   */
  async sendMessage(req, res) {
    try {
      const { sessionId, message } = req.body;

      if (!sessionId || !message) {
        return res.status(400).json({
          error: 'sessionId e message são obrigatórios'
        });
      }

      // Verifica se o chat existe e está aberto
      const chat = await prisma.chat.findUnique({
        where: { id: sessionId },
        include: {
          customer: true
        }
      });

      if (!chat) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      if (!chat.isOpen) {
        return res.status(400).json({ error: 'Sessão encerrada' });
      }

      // Salva mensagem do usuário
      await prisma.chatMessage.create({
        data: {
          chatId: chat.id,
          message: message,
          type: 'user'
        }
      });

      // Atualiza timestamp do chat
      await prisma.chat.update({
        where: { id: chat.id },
        data: { updatedAt: new Date() }
      });

      logger.info(`Mensagem recebida no web chat ${chat.id}`);

      // Verifica se IA está configurada
      if (!aiService.isConfigured()) {
        const fallbackMessage =
          'Desculpe, o serviço de IA não está configurado no momento. Por favor, entre em contato com o suporte.';

        await prisma.chatMessage.create({
          data: {
            chatId: chat.id,
            message: fallbackMessage,
            type: 'agent'
          }
        });

        return res.json({
          reply: fallbackMessage,
          timestamp: new Date().toISOString()
        });
      }

      // Gera resposta com IA
      try {
        const aiResponse = await aiService.generateResponse(message, chat.customerId, chat.id);

        // Salva resposta da IA
        await prisma.chatMessage.create({
          data: {
            chatId: chat.id,
            message: aiResponse,
            type: 'agent'
          }
        });

        logger.info(`Resposta da IA enviada para web chat ${chat.id}`);

        res.json({
          reply: aiResponse,
          timestamp: new Date().toISOString()
        });
      } catch (aiError) {
        logger.error(`Erro na IA: ${aiError.message}`);

        const fallbackMessage =
          'Desculpe, tive dificuldades técnicas. Um membro da equipe WN7 entrará em contato em breve! 😊';

        await prisma.chatMessage.create({
          data: {
            chatId: chat.id,
            message: fallbackMessage,
            type: 'agent'
          }
        });

        res.json({
          reply: fallbackMessage,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error(`Erro ao processar mensagem web: ${error.message}`);
      res.status(500).json({ error: 'Erro ao processar mensagem' });
    }
  }

  /**
   * Busca histórico de mensagens da sessão
   * GET /api/webchat/history/:sessionId
   */
  async getHistory(req, res) {
    try {
      const { sessionId } = req.params;

      const chat = await prisma.chat.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          },
          customer: {
            select: {
              firstName: true,
              nickname: true
            }
          }
        }
      });

      if (!chat) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      res.json({
        sessionId: chat.id,
        isOpen: chat.isOpen,
        customer: chat.customer,
        messages: chat.messages.map(msg => ({
          id: msg.id,
          message: msg.message,
          type: msg.type,
          timestamp: msg.createdAt
        }))
      });
    } catch (error) {
      logger.error(`Erro ao buscar histórico web: ${error.message}`);
      res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
  }

  /**
   * Encerra sessão de chat web
   * POST /api/webchat/end
   * Body: { sessionId }
   */
  async endSession(req, res) {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId é obrigatório' });
      }

      const chat = await prisma.chat.findUnique({
        where: { id: sessionId }
      });

      if (!chat) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      // Fecha o chat
      await prisma.chat.update({
        where: { id: sessionId },
        data: { isOpen: false }
      });

      logger.info(`Sessão de web chat encerrada: ${sessionId}`);

      res.json({
        message: 'Sessão encerrada com sucesso',
        sessionId
      });
    } catch (error) {
      logger.error(`Erro ao encerrar sessão web: ${error.message}`);
      res.status(500).json({ error: 'Erro ao encerrar sessão' });
    }
  }
}

module.exports = new WebChatController();
