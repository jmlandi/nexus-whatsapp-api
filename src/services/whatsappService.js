/**
 * WhatsApp Business API Service
 *
 * Manages WhatsApp message sending via Meta's official WhatsApp Cloud API.
 * Supports text messages, media, templates, and interactive buttons.
 *
 * @class WhatsAppService
 * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api|WhatsApp Cloud API Documentation}
 *
 * @example
 * const whatsappService = new WhatsAppService();
 *
 * // Send simple text message
 * await whatsappService.sendMessage('5511999999999', 'Hello!');
 *
 * // Send template with variables
 * await whatsappService.sendTemplate(
 *   '5511999999999',
 *   'report_notification',
 *   'pt_BR',
 *   [{ type: 'body', parameters: [{ type: 'text', text: 'John' }] }]
 * );
 */

const axios = require('axios');
const logger = require('../utils/logger');

class WhatsAppService {
  /**
   * Initialize WhatsApp Service with API credentials
   *
   * @constructor
   * @throws {Error} If required environment variables are missing
   */
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
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Send simple text message via WhatsApp
   *
   * Sends a plain text message to a WhatsApp number. Automatically formats
   * the phone number to international format (removes non-numeric characters).
   *
   * @async
   * @param {string} to - Destination phone number (any format, will be cleaned)
   * @param {string} message - Message text content (max 4096 characters)
   * @returns {Promise<{success: boolean, messageId: string, whatsappMessageId: string}>} Send result
   * @throws {Error} If API call fails or credentials are invalid
   *
   * @example
   * // Send message (accepts various formats)
   * await whatsappService.sendMessage('+55 11 99999-9999', 'Hello World!');
   * await whatsappService.sendMessage('5511999999999', 'Hello World!');
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
   * Send WhatsApp template message
   *
   * Sends a pre-approved message template. Templates must be created and approved
   * in Meta Business Manager before use. Supports variable substitution, media headers,
   * and interactive buttons.
   *
   * @async
   * @param {string} to - Destination phone number (any format)
   * @param {string} templateName - Name of approved template (e.g., 'report_notification')
   * @param {string} [languageCode='pt_BR'] - ISO language code (pt_BR, en_US, es_ES)
   * @param {Array<Object>} [components=[]] - Template components for variable substitution
   * @param {string} components[].type - Component type ('header', 'body', 'button')
   * @param {Array<Object>} components[].parameters - Variable values to substitute
   * @returns {Promise<{success: boolean, messageId: string, whatsappMessageId: string}>} Send result
   * @throws {Error} If template not found or API call fails
   *
   * @example
   * // Send template with body variables
   * await whatsappService.sendTemplate(
   *   '5511999999999',
   *   'report_notification',
   *   'pt_BR',
   *   [{
   *     type: 'body',
   *     parameters: [
   *       { type: 'text', text: 'John Doe' },
   *       { type: 'text', text: 'November 2025' }
   *     ]
   *   }]
   * );
   *
   * // Send template with document header
   * await whatsappService.sendTemplate(
   *   '5511999999999',
   *   'report_with_pdf',
   *   'pt_BR',
   *   [{
   *     type: 'header',
   *     parameters: [{ type: 'document', document: { link: 'https://...' } }]
   *   }]
   * );
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
   * Mark message as read
   *
   * Sends a read receipt for an incoming message. This updates the message
   * status on the sender's device to show double blue checkmarks.
   *
   * @async
   * @param {string} messageId - WhatsApp message ID to mark as read
   * @returns {Promise<{success: boolean}>} Operation result
   * @throws {Error} If API call fails
   *
   * @example
   * await whatsappService.markAsRead('wamid.XXX==');
   */
  async markAsRead(messageId) {
    try {
      await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      });

      logger.info(`Message marked as read: ${messageId}`);
      return {
        success: true
      };
    } catch (error) {
      logger.error(`Error marking message as read: ${error.response?.data || error.message}`);
      throw new Error(`Failed to mark as read: ${error.response?.data?.error?.message || error.message}`);
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

      const response = await this.client.post(`/${this.businessAccountId}/message_templates`, payload);

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
      const response = await this.client.get(`/${this.businessAccountId}/message_templates`, {
        params: {
          limit: limit
        }
      });

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
   * Delete message template
   *
   * Removes an approved message template from your WhatsApp Business Account.
   * Use with caution as this action cannot be undone.
   *
   * @async
   * @param {string} templateName - Name of template to delete
   * @returns {Promise<{success: boolean}>} Deletion result
   * @throws {Error} If template not found or API call fails
   *
   * @example
   * await whatsappService.deleteTemplate('old_promo_template');
   */
  async deleteTemplate(templateName) {
    try {
      await this.client.delete(`/${this.businessAccountId}/message_templates`, {
        params: {
          name: templateName
        }
      });

      logger.info(`Template deleted: ${templateName}`);
      return {
        success: true
      };
    } catch (error) {
      logger.error(`Error deleting template: ${error.response?.data || error.message}`);
      throw new Error(`Failed to delete template: ${error.response?.data?.error?.message || error.message}`);
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
