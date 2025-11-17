/**
 * Chat Service - Business Logic for Chat Management
 *
 * Orchestrates chat lifecycle, message handling, and AI-powered responses.
 * Manages chat sessions between customers and the AI assistant via WhatsApp.
 * Handles automatic chat timeouts and message routing.
 *
 * @class ChatService
 * @example
 * const chatService = new ChatService();
 *
 * // Get or create open chat
 * const chat = await chatService.getOpenChat('customer-uuid', 'phone-uuid');
 *
 * // Process incoming message from customer
 * await chatService.processIncomingMessage('chat-uuid', 'What were my results?', 'customer-uuid');
 *
 * // Close inactive chat
 * await chatService.closeChat('chat-uuid');
 */

const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const aiService = require('./aiService');
const whatsappService = require('./whatsappService');

class ChatService {
  /**
   * Find open chat for customer and phone number
   *
   * Searches for an active (isOpen: true) chat session for the given
   * customer and phone number combination. Includes last 50 messages.
   *
   * @async
   * @param {string} customerId - UUID of the customer
   * @param {string} phoneNumberId - UUID of the phone number
   * @returns {Promise<Object|null>} Open chat with messages, or null if none found
   * @throws {Error} If database query fails
   *
   * @example
   * const openChat = await chatService.getOpenChat('customer-uuid', 'phone-uuid');
   * if (openChat) {
   *   console.log(`Found open chat with ${openChat.messages.length} messages`);
   * }
   */
  async getOpenChat(customerId, phoneNumberId) {
    try {
      const chat = await prisma.chat.findFirst({
        where: {
          customerId,
          phoneNumberId,
          isOpen: true
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 50 // Últimas 50 mensagens
          }
        }
      });

      return chat;
    } catch (error) {
      logger.error(`Erro ao buscar chat aberto: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create new chat session
   *
   * Creates a new active chat between a customer and phone number.
   * Prevents duplicate open chats for the same customer/phone combination.
   *
   * @async
   * @param {string} customerId - UUID of the customer
   * @param {string} phoneNumberId - UUID of the phone number
   * @returns {Promise<Object>} Newly created chat object
   * @throws {Error} If open chat already exists or database insert fails
   *
   * @example
   * const newChat = await chatService.createChat('customer-uuid', 'phone-uuid');
   * // Returns: { id: 'chat-uuid', customerId: '...', phoneNumberId: '...', isOpen: true, ... }
   */
  async createChat(customerId, phoneNumberId) {
    try {
      // Verifica se já existe chat aberto
      const existingChat = await this.getOpenChat(customerId, phoneNumberId);

      if (existingChat) {
        throw new Error('Já existe um chat aberto para este cliente e número');
      }

      const chat = await prisma.chat.create({
        data: {
          customerId,
          phoneNumberId,
          isOpen: true
        }
      });

      logger.info(`Chat criado: ${chat.id}`);
      return chat;
    } catch (error) {
      logger.error(`Erro ao criar chat: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add message to chat
   *
   * Creates a new message record in the chat conversation.
   * Validates that chat exists and is open before adding message.
   *
   * @async
   * @param {string} chatId - UUID of the chat
   * @param {string} message - Message text content
   * @param {string} type - Message type: 'user' (customer), 'agent' (AI), or 'wa_template' (system)
   * @returns {Promise<Object>} Created message object
   * @throws {Error} If chat not found, closed, or database insert fails
   *
   * @example
   * const userMsg = await chatService.addMessage('chat-uuid', 'Hello!', 'user');
   * const aiMsg = await chatService.addMessage('chat-uuid', 'Hi! How can I help?', 'agent');
   */
  async addMessage(chatId, message, type) {
    try {
      // Verifica se o chat está aberto
      const chat = await prisma.chat.findUnique({
        where: { id: chatId }
      });

      if (!chat) {
        throw new Error('Chat não encontrado');
      }

      if (!chat.isOpen) {
        throw new Error('Não é possível adicionar mensagem a um chat fechado');
      }

      const chatMessage = await prisma.chatMessage.create({
        data: {
          chatId,
          message,
          type
        }
      });

      // Atualiza timestamp do chat
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() }
      });

      logger.info(`Mensagem adicionada ao chat ${chatId}`);
      return chatMessage;
    } catch (error) {
      logger.error(`Erro ao adicionar mensagem: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fecha um chat
   * @param {string} chatId - ID do chat
   * @returns {Promise<Object>} Chat atualizado
   */
  async closeChat(chatId) {
    try {
      const chat = await prisma.chat.update({
        where: { id: chatId },
        data: { isOpen: false }
      });

      logger.info(`Chat fechado: ${chatId}`);
      return chat;
    } catch (error) {
      logger.error(`Erro ao fechar chat: ${error.message}`);
      throw error;
    }
  }

  /**
   * Busca chats abertos há mais de X minutos
   * @param {number} minutes - Tempo em minutos
   * @returns {Promise<Array>} Lista de chats
   */
  async getStaleChats(minutes) {
    try {
      const cutoffTime = new Date();
      cutoffTime.setMinutes(cutoffTime.getMinutes() - minutes);

      const chats = await prisma.chat.findMany({
        where: {
          isOpen: true,
          updatedAt: {
            lt: cutoffTime
          }
        }
      });

      return chats;
    } catch (error) {
      logger.error(`Erro ao buscar chats inativos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fecha chats inativos
   * @param {number} minutes - Tempo de inatividade em minutos
   * @returns {Promise<number>} Quantidade de chats fechados
   */
  async closeStaleChats(minutes) {
    try {
      const staleChats = await this.getStaleChats(minutes);

      let closedCount = 0;
      for (const chat of staleChats) {
        await this.closeChat(chat.id);
        closedCount++;
      }

      logger.info(`${closedCount} chats inativos foram fechados`);
      return closedCount;
    } catch (error) {
      logger.error(`Erro ao fechar chats inativos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Busca ou cria chat para mensagem recebida
   * @param {string} customerId - ID do cliente
   * @param {string} phoneNumberId - ID do número de telefone
   * @returns {Promise<Object>} Chat (existente ou novo)
   */
  async getOrCreateChat(customerId, phoneNumberId) {
    try {
      // Tenta encontrar chat aberto
      let chat = await this.getOpenChat(customerId, phoneNumberId);

      // Se não encontrar, cria novo
      if (!chat) {
        chat = await this.createChat(customerId, phoneNumberId);
      }

      return chat;
    } catch (error) {
      logger.error(`Erro ao buscar ou criar chat: ${error.message}`);
      throw error;
    }
  }

  /**
   * Processa mensagem do usuário com IA e envia resposta via WhatsApp
   * @param {Object} chat - Objeto do chat
   * @param {string} userMessage - Mensagem do usuário
   * @param {string} phoneNumber - Número de telefone do cliente
   * @returns {Promise<Object>} Resultado do processamento
   */
  async processMessageWithAI(chat, userMessage, phoneNumber) {
    try {
      // Verifica se IA está configurada
      if (!aiService.isConfigured()) {
        logger.warn('IA não configurada - pulando geração de resposta automática');
        return {
          success: false,
          reason: 'AI_NOT_CONFIGURED',
          message: 'IA não está configurada'
        };
      }

      logger.info(`Processando mensagem com IA para chat ${chat.id}`);

      // Gera resposta usando Claude
      const aiResponse = await aiService.generateResponse(userMessage, chat.customerId, chat.id);

      // Salva resposta da IA no chat
      const aiMessage = await this.addMessage(chat.id, aiResponse, 'agent');

      // Envia resposta via WhatsApp
      const whatsappResult = await whatsappService.sendMessage(phoneNumber, aiResponse);

      logger.info(`Resposta da IA enviada via WhatsApp para chat ${chat.id}`);

      return {
        success: true,
        aiMessage,
        whatsappResult
      };
    } catch (error) {
      logger.error(`Erro ao processar mensagem com IA: ${error.message}`);

      // Em caso de erro, envia mensagem de fallback
      try {
        const fallbackMessage =
          'Desculpe, estou com dificuldades técnicas. ' + 'Um membro da equipe WN7 entrará em contato em breve! 😊';

        await this.addMessage(chat.id, fallbackMessage, 'agent');
        await whatsappService.sendMessage(phoneNumber, fallbackMessage);

        return {
          success: false,
          reason: 'AI_ERROR',
          message: error.message,
          fallbackSent: true
        };
      } catch (fallbackError) {
        logger.error(`Erro ao enviar mensagem de fallback: ${fallbackError.message}`);
        return {
          success: false,
          reason: 'COMPLETE_FAILURE',
          message: error.message
        };
      }
    }
  }

  /**
   * Processa mensagem de forma assíncrona (não bloqueia resposta do webhook)
   * @param {Object} chat - Objeto do chat
   * @param {string} userMessage - Mensagem do usuário
   * @param {string} phoneNumber - Número de telefone do cliente
   */
  processMessageAsync(chat, userMessage, phoneNumber) {
    // Processa em background sem bloquear
    this.processMessageWithAI(chat, userMessage, phoneNumber)
      .then(result => {
        if (result.success) {
          logger.info(`Processamento assíncrono bem-sucedido para chat ${chat.id}`);
        } else {
          logger.warn(`Processamento assíncrono falhou para chat ${chat.id}: ${result.reason}`);
        }
      })
      .catch(error => {
        logger.error(`Erro no processamento assíncrono: ${error.message}`);
      });
  }
}

module.exports = new ChatService();
