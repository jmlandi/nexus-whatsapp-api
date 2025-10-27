/**
 * Service do WhatsApp Business API
 * Gerencia envio de mensagens WhatsApp via API oficial do Meta
 * Documentação: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const axios = require('axios');
const logger = require('../utils/logger');

class WhatsAppService {
  constructor() {
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    
    // Configuração do cliente HTTP
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Envia mensagem de texto simples via WhatsApp
   * @param {string} to - Número de destino (formato internacional sem +)
   * @param {string} message - Conteúdo da mensagem
   * @returns {Promise<Object>} Resposta da API do WhatsApp
   */
  async sendMessage(to, message) {
    try {
      // Remove caracteres não numéricos e o sinal de +
      const formattedTo = to.replace(/\D/g, '');

      const response = await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedTo,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      });

      logger.info(`Mensagem enviada via WhatsApp: ${response.data.messages[0].id}`);
      return {
        success: true,
        messageId: response.data.messages[0].id,
        whatsappMessageId: response.data.messages[0].id
      };
    } catch (error) {
      logger.error(`Erro ao enviar mensagem WhatsApp: ${error.response?.data || error.message}`);
      throw new Error(`Falha ao enviar mensagem: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Envia template de mensagem aprovado do WhatsApp
   * @param {string} to - Número de destino
   * @param {string} templateName - Nome do template aprovado
   * @param {string} languageCode - Código do idioma (ex: pt_BR, en_US)
   * @param {Array} components - Componentes do template (header, body, buttons)
   * @returns {Promise<Object>} Resposta da API do WhatsApp
   */
  async sendTemplate(to, templateName, languageCode = 'pt_BR', components = []) {
    try {
      const formattedTo = to.replace(/\D/g, '');

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedTo,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          }
        }
      };

      // Adiciona componentes se fornecidos (variáveis, botões, etc)
      if (components && components.length > 0) {
        payload.template.components = components;
      }

      const response = await this.client.post(`/${this.phoneNumberId}/messages`, payload);

      logger.info(`Template enviado via WhatsApp: ${response.data.messages[0].id}`);
      return {
        success: true,
        messageId: response.data.messages[0].id,
        whatsappMessageId: response.data.messages[0].id
      };
    } catch (error) {
      logger.error(`Erro ao enviar template WhatsApp: ${error.response?.data || error.message}`);
      throw new Error(`Falha ao enviar template: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Envia mensagem com mídia (imagem, documento, PDF, etc)
   * @param {string} to - Número de destino
   * @param {string} mediaType - Tipo de mídia (image, document, video, audio)
   * @param {string} mediaUrl - URL da mídia (deve ser acessível publicamente)
   * @param {string} caption - Legenda opcional da mídia
   * @param {string} filename - Nome do arquivo (para documentos)
   * @returns {Promise<Object>} Resposta da API do WhatsApp
   */
  async sendMediaMessage(to, mediaType, mediaUrl, caption = '', filename = null) {
    try {
      const formattedTo = to.replace(/\D/g, '');

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedTo,
        type: mediaType
      };

      // Configura o payload baseado no tipo de mídia
      payload[mediaType] = {
        link: mediaUrl
      };

      if (caption && (mediaType === 'image' || mediaType === 'video' || mediaType === 'document')) {
        payload[mediaType].caption = caption;
      }

      if (filename && mediaType === 'document') {
        payload[mediaType].filename = filename;
      }

      const response = await this.client.post(`/${this.phoneNumberId}/messages`, payload);

      logger.info(`Mensagem com mídia enviada via WhatsApp: ${response.data.messages[0].id}`);
      return {
        success: true,
        messageId: response.data.messages[0].id,
        whatsappMessageId: response.data.messages[0].id
      };
    } catch (error) {
      logger.error(`Erro ao enviar mídia WhatsApp: ${error.response?.data || error.message}`);
      throw new Error(`Falha ao enviar mídia: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Marca mensagem como lida
   * @param {string} messageId - ID da mensagem a marcar como lida
   * @returns {Promise<Object>} Resposta da API
   */
  async markAsRead(messageId) {
    try {
      const response = await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      });

      logger.info(`Mensagem marcada como lida: ${messageId}`);
      return {
        success: true
      };
    } catch (error) {
      logger.error(`Erro ao marcar mensagem como lida: ${error.response?.data || error.message}`);
      throw new Error(`Falha ao marcar como lida: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Cria um novo template de mensagem
   * @param {string} name - Nome do template
   * @param {string} category - Categoria (MARKETING, UTILITY, AUTHENTICATION)
   * @param {string} language - Código do idioma (pt_BR, en_US, etc)
   * @param {Array} components - Componentes do template (HEADER, BODY, FOOTER, BUTTONS)
   * @returns {Promise<Object>} Resposta da API com ID do template
   */
  async createTemplate(name, category, language, components) {
    try {
      const payload = {
        name: name,
        category: category.toUpperCase(),
        language: language,
        components: components
      };

      const response = await this.client.post(
        `/${this.businessAccountId}/message_templates`,
        payload
      );

      logger.info(`Template criado: ${name} (ID: ${response.data.id})`);
      return {
        success: true,
        templateId: response.data.id,
        status: response.data.status
      };
    } catch (error) {
      logger.error(`Erro ao criar template: ${error.response?.data || error.message}`);
      throw new Error(`Falha ao criar template: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Lista todos os templates de mensagem
   * @param {number} limit - Limite de resultados
   * @returns {Promise<Array>} Lista de templates
   */
  async listTemplates(limit = 100) {
    try {
      const response = await this.client.get(
        `/${this.businessAccountId}/message_templates`,
        {
          params: {
            limit: limit
          }
        }
      );

      logger.info(`Templates listados: ${response.data.data.length} encontrados`);
      return {
        success: true,
        templates: response.data.data,
        paging: response.data.paging
      };
    } catch (error) {
      logger.error(`Erro ao listar templates: ${error.response?.data || error.message}`);
      throw new Error(`Falha ao listar templates: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Deleta um template de mensagem
   * @param {string} templateName - Nome do template
   * @returns {Promise<Object>} Resposta da API
   */
  async deleteTemplate(templateName) {
    try {
      const response = await this.client.delete(
        `/${this.businessAccountId}/message_templates`,
        {
          params: {
            name: templateName
          }
        }
      );

      logger.info(`Template deletado: ${templateName}`);
      return {
        success: true
      };
    } catch (error) {
      logger.error(`Erro ao deletar template: ${error.response?.data || error.message}`);
      throw new Error(`Falha ao deletar template: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Valida formato de número de telefone
   * @param {string} phoneNumber - Número a validar
   * @returns {boolean} True se válido
   */
  validatePhoneNumber(phoneNumber) {
    // Remove caracteres não numéricos
    const number = phoneNumber.replace(/\D/g, '');
    // Valida se tem entre 10 e 15 dígitos (formato internacional)
    return /^\d{10,15}$/.test(number);
  }

  /**
   * Verifica o status de saúde da API
   * @returns {Promise<Object>} Status da conexão
   */
  async healthCheck() {
    try {
      // Tenta buscar informações do número de telefone
      const response = await this.client.get(`/${this.phoneNumberId}`);
      
      return {
        success: true,
        status: 'connected',
        phoneNumber: response.data
      };
    } catch (error) {
      logger.error(`Erro no health check WhatsApp: ${error.response?.data || error.message}`);
      return {
        success: false,
        status: 'disconnected',
        error: error.response?.data?.error?.message || error.message
      };
    }
  }
}

// Exporta instância única
module.exports = new WhatsAppService();
