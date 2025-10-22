/**
 * Service do Twilio
 * Gerencia envio de mensagens WhatsApp via Twilio
 */

const twilio = require('twilio');
const logger = require('../utils/logger');

class TwilioService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  /**
   * Envia mensagem de texto simples via WhatsApp
   * @param {string} to - Número de destino no formato whatsapp:+5511999999999
   * @param {string} message - Conteúdo da mensagem
   * @returns {Promise<Object>} Resposta do Twilio
   */
  async sendMessage(to, message) {
    try {
      // Garante formato correto do número
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const formattedFrom = this.fromNumber.startsWith('whatsapp:') 
        ? this.fromNumber 
        : `whatsapp:${this.fromNumber}`;

      const response = await this.client.messages.create({
        body: message,
        from: formattedFrom,
        to: formattedTo
      });

      logger.info(`Mensagem enviada via Twilio: ${response.sid}`);
      return {
        success: true,
        messageId: response.sid,
        status: response.status
      };
    } catch (error) {
      logger.error(`Erro ao enviar mensagem Twilio: ${error.message}`);
      throw new Error(`Falha ao enviar mensagem: ${error.message}`);
    }
  }

  /**
   * Envia template de mensagem aprovado do WhatsApp
   * @param {string} to - Número de destino
   * @param {string} templateSid - SID do template aprovado
   * @param {Object} variables - Variáveis do template
   * @returns {Promise<Object>} Resposta do Twilio
   */
  async sendTemplate(to, templateSid, variables = {}) {
    try {
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const formattedFrom = this.fromNumber.startsWith('whatsapp:') 
        ? this.fromNumber 
        : `whatsapp:${this.fromNumber}`;

      const response = await this.client.messages.create({
        from: formattedFrom,
        to: formattedTo,
        contentSid: templateSid,
        contentVariables: JSON.stringify(variables)
      });

      logger.info(`Template enviado via Twilio: ${response.sid}`);
      return {
        success: true,
        messageId: response.sid,
        status: response.status
      };
    } catch (error) {
      logger.error(`Erro ao enviar template Twilio: ${error.message}`);
      throw new Error(`Falha ao enviar template: ${error.message}`);
    }
  }

  /**
   * Envia mensagem com mídia (PDF, imagem, etc)
   * @param {string} to - Número de destino
   * @param {string} message - Texto da mensagem
   * @param {string} mediaUrl - URL da mídia
   * @returns {Promise<Object>} Resposta do Twilio
   */
  async sendMediaMessage(to, message, mediaUrl) {
    try {
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const formattedFrom = this.fromNumber.startsWith('whatsapp:') 
        ? this.fromNumber 
        : `whatsapp:${this.fromNumber}`;

      const response = await this.client.messages.create({
        body: message,
        from: formattedFrom,
        to: formattedTo,
        mediaUrl: [mediaUrl]
      });

      logger.info(`Mensagem com mídia enviada via Twilio: ${response.sid}`);
      return {
        success: true,
        messageId: response.sid,
        status: response.status
      };
    } catch (error) {
      logger.error(`Erro ao enviar mídia Twilio: ${error.message}`);
      throw new Error(`Falha ao enviar mídia: ${error.message}`);
    }
  }

  /**
   * Valida formato de número de telefone
   * @param {string} phoneNumber - Número a validar
   * @returns {boolean} True se válido
   */
  validatePhoneNumber(phoneNumber) {
    // Remove prefixo whatsapp: se existir
    const number = phoneNumber.replace('whatsapp:', '');
    // Valida formato internacional (+55...)
    const regex = /^\+[1-9]\d{1,14}$/;
    return regex.test(number);
  }
}

// Exporta instância única
module.exports = new TwilioService();
