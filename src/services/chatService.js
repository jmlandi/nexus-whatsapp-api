/**
 * Service de Chat
 * Gerencia lógica de negócio relacionada aos chats
 */

const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const aiService = require('./aiService');
const whatsappService = require('./whatsappService');

class ChatService {
  /**
   * Verifica se há chat aberto para um cliente e número de telefone
   * @param {string} customerId - ID do cliente
   * @param {string} phoneNumberId - ID do número de telefone
   * @returns {Promise<Object|null>} Chat aberto ou null
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
   * Cria novo chat
   * @param {string} customerId - ID do cliente
   * @param {string} phoneNumberId - ID do número de telefone
   * @returns {Promise<Object>} Chat criado
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
   * Adiciona mensagem a um chat
   * @param {string} chatId - ID do chat
   * @param {string} message - Conteúdo da mensagem
   * @param {string} type - Tipo da mensagem (user, agent, wa_template)
   * @returns {Promise<Object>} Mensagem criada
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
      const aiResponse = await aiService.generateResponse(
        userMessage,
        chat.customerId,
        chat.id
      );

      // Salva resposta da IA no chat
      const aiMessage = await this.addMessage(chat.id, aiResponse, 'agent');

      // Envia resposta via WhatsApp
      const whatsappResult = await whatsappService.sendMessage(
        phoneNumber,
        aiResponse
      );

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
        const fallbackMessage = 'Desculpe, estou com dificuldades técnicas. ' +
          'Um membro da equipe WN7 entrará em contato em breve! 😊';
        
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
