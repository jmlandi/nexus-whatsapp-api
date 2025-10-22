/**
 * Service de IA - Anthropic Claude
 * Gerencia interações com o modelo de IA para gerar respostas contextualizadas
 */

const Anthropic = require('@anthropic-ai/sdk');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
    this.maxTokens = parseInt(process.env.ANTHROPIC_MAX_TOKENS) || 1024;
  }

  /**
   * Gera contexto do cliente baseado em seus relatórios
   * @param {string} customerId - ID do cliente
   * @returns {Promise<string>} Contexto formatado
   */
  async getCustomerContext(customerId) {
    try {
      // Busca cliente com relatórios recentes
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          reports: {
            where: { isActive: true },
            orderBy: { reportTimestamp: 'desc' },
            take: 5 // Últimos 5 relatórios
          }
        }
      });

      if (!customer) {
        return 'Não foram encontradas informações sobre este cliente.';
      }

      // Monta contexto
      let context = `Informações do Cliente:\n`;
      context += `Nome: ${customer.firstName} ${customer.lastName}`;
      if (customer.nickname) {
        context += ` (${customer.nickname})`;
      }
      context += `\n\n`;

      if (customer.reports.length > 0) {
        context += `Relatórios de Marketing:\n`;
        customer.reports.forEach((report, index) => {
          const date = new Date(report.reportTimestamp).toLocaleDateString('pt-BR');
          context += `${index + 1}. Relatório de ${date}`;
          if (report.observations) {
            context += ` - ${report.observations}`;
          }
          context += `\n`;
        });
      } else {
        context += `Nenhum relatório disponível ainda.\n`;
      }

      return context;
    } catch (error) {
      logger.error(`Erro ao buscar contexto do cliente: ${error.message}`);
      return 'Não foi possível carregar informações do cliente.';
    }
  }

  /**
   * Gera contexto do histórico de conversa
   * @param {string} chatId - ID do chat
   * @param {number} limit - Número de mensagens a incluir
   * @returns {Promise<Array>} Array de mensagens formatadas para Claude
   */
  async getChatHistory(chatId, limit = 10) {
    try {
      const messages = await prisma.chatMessage.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' },
        take: limit
      });

      // Converte para formato do Claude
      return messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.message
      }));
    } catch (error) {
      logger.error(`Erro ao buscar histórico do chat: ${error.message}`);
      return [];
    }
  }

  /**
   * Gera resposta usando Claude com contexto do cliente
   * @param {string} userMessage - Mensagem do usuário
   * @param {string} customerId - ID do cliente
   * @param {string} chatId - ID do chat
   * @returns {Promise<string>} Resposta gerada pela IA
   */
  async generateResponse(userMessage, customerId, chatId) {
    try {
      // Busca contexto do cliente
      const customerContext = await this.getCustomerContext(customerId);
      
      // Busca histórico de conversa (exclui a mensagem atual)
      const chatHistory = await this.getChatHistory(chatId, 8);

      // Monta o system prompt
      const systemPrompt = `Você é o Nexus, um assistente de IA especializado em marketing digital da agência WN7.

Seu papel é ajudar clientes a entender seus relatórios de marketing, responder perguntas sobre campanhas, métricas e resultados.

Contexto do Cliente:
${customerContext}

Diretrizes:
- Seja amigável, profissional e prestativo
- Use linguagem clara e acessível
- Baseie suas respostas nos relatórios disponíveis
- Se não souber algo específico, seja honesto e ofereça ajuda para entrar em contato com a equipe
- Mantenha respostas concisas (máximo 2-3 parágrafos)
- Use emojis ocasionalmente para tornar a conversa mais amigável
- Se o cliente pedir informações muito específicas que não estão nos relatórios, sugira que ele fale com seu gerente de conta

Lembre-se: você está conversando via WhatsApp, então mantenha as mensagens relativamente curtas e diretas.`;

      // Adiciona a mensagem atual ao histórico
      const messages = [
        ...chatHistory,
        {
          role: 'user',
          content: userMessage
        }
      ];

      // Chama a API do Claude
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: messages
      });

      // Extrai o texto da resposta
      const aiResponse = response.content[0].text;

      logger.info(`Resposta gerada pela IA para chat ${chatId}`);
      return aiResponse;

    } catch (error) {
      logger.error(`Erro ao gerar resposta com IA: ${error.message}`);
      
      // Resposta fallback em caso de erro
      return 'Desculpe, estou com dificuldades técnicas no momento. 😔\n\n' +
             'Por favor, tente novamente em alguns instantes ou entre em contato diretamente com seu gerente de conta na WN7.';
    }
  }

  /**
   * Gera resumo de um relatório (para uso futuro)
   * @param {string} reportText - Texto do relatório
   * @returns {Promise<string>} Resumo gerado
   */
  async summarizeReport(reportText) {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Crie um resumo conciso e objetivo deste relatório de marketing em português:\n\n${reportText}`
        }]
      });

      return response.content[0].text;
    } catch (error) {
      logger.error(`Erro ao resumir relatório: ${error.message}`);
      return null;
    }
  }

  /**
   * Analisa sentimento da mensagem (para métricas futuras)
   * @param {string} message - Mensagem a analisar
   * @returns {Promise<string>} Sentimento: positive, neutral, negative
   */
  async analyzeSentiment(message) {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: `Analise o sentimento desta mensagem e responda apenas com: positive, neutral ou negative\n\nMensagem: "${message}"`
        }]
      });

      const sentiment = response.content[0].text.toLowerCase().trim();
      return ['positive', 'neutral', 'negative'].includes(sentiment) ? sentiment : 'neutral';
    } catch (error) {
      logger.error(`Erro ao analisar sentimento: ${error.message}`);
      return 'neutral';
    }
  }

  /**
   * Verifica se a API key está configurada
   * @returns {boolean} True se configurada
   */
  isConfigured() {
    return !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key';
  }

  /**
   * Testa a conexão com a API Anthropic
   * @returns {Promise<boolean>} True se funcionando
   */
  async testConnection() {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: 'Responda apenas: OK'
        }]
      });

      return response.content[0].text.includes('OK');
    } catch (error) {
      logger.error(`Erro ao testar conexão Anthropic: ${error.message}`);
      return false;
    }
  }
}

// Exporta instância única
module.exports = new AIService();
