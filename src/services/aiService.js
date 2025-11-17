/**
 * AI Service - Anthropic Claude Integration
 *
 * Manages interactions with Anthropic's Claude AI model to generate contextualized
 * responses for customer chat conversations. Extracts PDF report content and
 * builds comprehensive customer context for informed AI responses.
 *
 * @class AIService
 * @example
 * const aiService = new AIService();
 * const response = await aiService.generateResponse(
 *   'What were my campaign results?',
 *   'customer-uuid-123',
 *   'chat-uuid-456'
 * );
 */

const Anthropic = require('@anthropic-ai/sdk');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const pdfService = require('./pdfService');

class AIService {
  /**
   * Initialize AI Service with Anthropic client
   * Validates API key and configures model settings from environment variables
   *
   * @constructor
   * @throws {Error} If ANTHROPIC_API_KEY is missing or invalid
   */
  constructor() {
    // Validação da API Key
    if (!process.env.ANTHROPIC_API_KEY) {
      logger.error('ANTHROPIC_API_KEY não está configurada nas variáveis de ambiente!');
    } else if (process.env.ANTHROPIC_API_KEY.includes('your_') || process.env.ANTHROPIC_API_KEY.length < 20) {
      logger.error('ANTHROPIC_API_KEY parece ser um placeholder ou inválida!');
    }

    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.model = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
    this.maxTokens = parseInt(process.env.ANTHROPIC_MAX_TOKENS) || 1024;

    logger.info(`AIService inicializado - Modelo: ${this.model}, MaxTokens: ${this.maxTokens}`);
  }

  /**
   * Build customer context from their marketing reports
   *
   * Retrieves customer information and their recent reports (up to 2),
   * extracts PDF content, and formats it into a comprehensive context
   * string for the AI model.
   *
   * @async
   * @param {string} customerId - UUID of the customer
   * @returns {Promise<string>} Formatted context with customer info and report content
   * @throws {Error} If database query fails
   *
   * @example
   * const context = await aiService.getCustomerContext('uuid-123');
   * // Returns: "Customer Information:\nName: John Doe\n\n=== MARKETING REPORTS ===..."
   */
  async getCustomerContext(customerId) {
    try {
      // Busca cliente com relatórios recentes
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          reports: {
            where: { isActive: true },
            orderBy: { startDate: 'desc' },
            take: 2 // Últimos 2 relatórios (para não sobrecarregar)
          }
        }
      });

      if (!customer) {
        return 'Não foram encontradas informações sobre este cliente.';
      }

      // Monta contexto
      let context = 'Informações do Cliente:\n';
      context += `Nome: ${customer.firstName} ${customer.lastName}`;
      if (customer.nickname) {
        context += ` (${customer.nickname})`;
      }
      context += '\n\n';

      if (customer.reports.length > 0) {
        context += '=== RELATÓRIOS DE MARKETING ===\n\n';

        // Processa PDFs e extrai conteúdo
        for (let i = 0; i < customer.reports.length; i++) {
          const report = customer.reports[i];
          const startDate = new Date(report.startDate).toLocaleDateString('pt-BR');
          const endDate = new Date(report.endDate).toLocaleDateString('pt-BR');

          context += `📊 RELATÓRIO ${i + 1} - Período: ${startDate} a ${endDate}\n`;

          if (report.observations) {
            context += `Observações: ${report.observations}\n`;
          }

          // Tenta extrair conteúdo do PDF
          try {
            logger.info(`Extraindo conteúdo do relatório: ${report.id}`);
            const pdfText = await pdfService.processPDF(report.reportUrl);

            // Limita a 6000 caracteres por relatório
            const limitedText =
              pdfText.length > 6000
                ? `${pdfText.substring(0, 6000)}\n[... restante do relatório omitido por tamanho ...]`
                : pdfText;

            context += `\nConteúdo do Relatório:\n${limitedText}\n`;
            context += `\n${'='.repeat(60)}\n\n`;
          } catch (pdfError) {
            logger.error(`Erro ao processar PDF ${report.id}: ${pdfError.message}`);
            context += '\n⚠️ Não foi possível extrair o conteúdo deste PDF.\n';
            context += `\n${'='.repeat(60)}\n\n`;
          }
        }

        context += '\n✅ Você tem acesso ao CONTEÚDO COMPLETO dos relatórios acima.\n';
        context += 'Analise os dados, métricas e informações para responder perguntas específicas do cliente.\n';
      } else {
        context += 'Nenhum relatório disponível ainda.\n';
      }

      return context;
    } catch (error) {
      logger.error(`Erro ao buscar contexto do cliente: ${error.message}`);
      return 'Não foi possível carregar informações do cliente.';
    }
  }

  /**
   * Build chat history context
   *
   * Retrieves recent messages from a chat and formats them for Claude's
   * message format with proper role assignment (user/assistant).
   *
   * @async
   * @param {string} chatId - UUID of the chat
   * @param {number} [limit=10] - Maximum number of messages to retrieve
   * @returns {Promise<Array<{role: string, content: string}>>} Array of formatted messages
   * @throws {Error} If database query fails
   *
   * @example
   * const history = await aiService.getChatHistory('chat-uuid', 5);
   * // Returns: [{role: 'user', content: 'Hello'}, {role: 'assistant', content: 'Hi!'}]
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
   * Generate AI response using Claude with customer context
   *
   * Main method that orchestrates customer context retrieval, chat history,
   * and Claude API interaction to generate contextualized responses.
   * Handles rate limits, API errors, and fallback responses.
   *
   * @async
   * @param {string} userMessage - The user's message to respond to
   * @param {string} customerId - UUID of the customer
   * @param {string} chatId - UUID of the chat conversation
   * @returns {Promise<string>} AI-generated response text
   * @throws {Error} If API call fails or customer not found
   *
   * @example
   * const response = await aiService.generateResponse(
   *   'What were my campaign results last month?',
   *   'customer-uuid-123',
   *   'chat-uuid-456'
   * );
   * // Returns: "Based on your October report, your campaign achieved..."
   */
  async generateResponse(userMessage, customerId, chatId) {
    try {
      // Busca contexto do cliente
      const customerContext = await this.getCustomerContext(customerId);

      // Busca histórico de conversa (exclui a mensagem atual)
      const chatHistory = await this.getChatHistory(chatId, 8);

      // Monta o system prompt
      const systemPrompt = `Você é o Nexus, um assistente de IA especializado em marketing digital da agência WN7 Marketing.

Seu papel é ajudar clientes a entender seus relatórios de marketing, responder perguntas sobre campanhas, métricas e resultados.

Contexto do Cliente:
${customerContext}

Diretrizes Importantes:
- Você TEM ACESSO COMPLETO ao conteúdo dos relatórios de marketing do cliente
- Analise os dados, métricas, gráficos e informações presentes nos relatórios
- Responda perguntas específicas com base nos números e dados reais dos relatórios
- Seja preciso e cite os valores exatos quando relevante
- Se o cliente perguntar sobre algo que não está nos relatórios fornecidos, seja honesto sobre isso
- Compare períodos diferentes se houver múltiplos relatórios disponíveis
- Identifique tendências, pontos fortes e áreas de melhoria
- Seja amigável, profissional e prestativo
- Use linguagem clara e acessível
- Mantenha respostas concisas (2-4 parágrafos) mas completas
- Use emojis ocasionalmente para tornar a conversa mais amigável (📊 📈 💰 ✅ etc)
- Se identificar insights importantes, destaque-os de forma clara

Exemplo de boa resposta:
"Analisando seu relatório de setembro, vejo que você teve 15.234 impressões no Google Ads com um CTR de 3.2%. 📊 Isso representa um aumento de 18% em relação ao mês anterior! O CPC médio foi de R$ 1,45..."

Lembre-se: você está conversando via WhatsApp, então seja direto e objetivo, mas sempre baseado nos dados reais.`;

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
      // Log detalhado para debugging em produção
      const errorDetails = {
        message: error.message,
        type: error.constructor.name,
        status: error.status || 'N/A',
        error: error.error || null,
        response: error.response?.data || null,
        stack: error.stack
      };

      logger.error('=== ERRO AO GERAR RESPOSTA COM IA ===');
      logger.error(JSON.stringify(errorDetails, null, 2));
      logger.error('======================================');

      // Resposta fallback em caso de erro
      return (
        'Desculpe, estou com dificuldades técnicas no momento. 😔\n\n' +
        'Por favor, tente novamente em alguns instantes ou entre em contato diretamente com seu gerente de conta na WN7.'
      );
    }
  }

  /**
   * Generate simulated AI response (for testing/simulator)
   *
   * Similar to generateResponse but uses provided history array instead
   * of fetching from database. Used by the simulator endpoint for testing
   * AI responses without creating actual chat records.
   *
   * @async
   * @param {string} userMessage - The user's message to respond to
   * @param {string} customerId - UUID of the customer
   * @param {Array<{role: string, content: string}>} [history=[]] - Previous messages
   * @returns {Promise<string>} AI-generated response text
   * @throws {Error} If API call fails or customer not found
   *
   * @example
   * const response = await aiService.generateSimulatedResponse(
   *   'What were my results?',
   *   'customer-uuid-123',
   *   [{role: 'user', content: 'Hello'}, {role: 'assistant', content: 'Hi!'}]
   * );
   */
  async generateSimulatedResponse(userMessage, customerId, history = []) {
    console.log('=== AIService.generateSimulatedResponse START ===');
    console.log('CustomerId:', customerId);
    console.log('Message:', userMessage.substring(0, 100));
    console.log('History length:', history.length);

    logger.debug('generateSimulatedResponse called', {
      customerId,
      messageLength: userMessage.length,
      historyLength: history.length
    });

    try {
      // Busca contexto do cliente
      console.log('Fetching customer context...');
      logger.debug('Fetching customer context...');
      const customerContext = await this.getCustomerContext(customerId);
      console.log('✅ Customer context fetched, length:', customerContext.length);

      // Monta o system prompt
      const systemPrompt = `Você é o Nexus, um assistente de IA especializado em marketing digital da agência WN7 Marketing.

Seu papel é ajudar clientes a entender seus relatórios de marketing, responder perguntas sobre campanhas, métricas e resultados.

Contexto do Cliente:
${customerContext}

Diretrizes Importantes:
- Você TEM ACESSO COMPLETO ao conteúdo dos relatórios de marketing do cliente
- Analise os dados, métricas, gráficos e informações presentes nos relatórios
- Responda perguntas específicas com base nos números e dados reais dos relatórios
- Seja preciso e cite os valores exatos quando relevante
- Se o cliente perguntar sobre algo que não está nos relatórios fornecidos, seja honesto sobre isso
- Compare períodos diferentes se houver múltiplos relatórios disponíveis
- Identifique tendências, pontos fortes e áreas de melhoria
- Seja amigável, profissional e prestativo
- Use linguagem clara e acessível
- Mantenha respostas concisas (2-4 parágrafos) mas completas
- Use emojis ocasionalmente para tornar a conversa mais amigável (📊 📈 💰 ✅ etc)
- Se identificar insights importantes, destaque-os de forma clara

Exemplo de boa resposta:
"Analisando seu relatório de setembro, vejo que você teve 15.234 impressões no Google Ads com um CTR de 3.2%. 📊 Isso representa um aumento de 18% em relação ao mês anterior! O CPC médio foi de R$ 1,45..."

Lembre-se: você está conversando via WhatsApp, então seja direto e objetivo, mas sempre baseado nos dados reais.`;

      // Adiciona a mensagem atual ao histórico
      const messages = [
        ...history,
        {
          role: 'user',
          content: userMessage
        }
      ];

      // Chama a API do Claude
      console.log('Calling Anthropic API...');
      console.log('Model:', this.model);
      console.log('Max tokens:', this.maxTokens);
      logger.debug('Calling Anthropic API...', { model: this.model, maxTokens: this.maxTokens });

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: messages
      });

      // Extrai o texto da resposta
      const aiResponse = response.content[0].text;

      console.log('✅ Anthropic API response received');
      console.log('Response length:', aiResponse.length);
      console.log('=== AIService.generateSimulatedResponse END ===');

      logger.info(`Simulated response generated for customer ${customerId}`, { responseLength: aiResponse.length });
      return aiResponse;
    } catch (error) {
      console.error('=== ERROR in generateSimulatedResponse ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      console.error('Error stack:', error.stack);
      console.error('==========================================');

      // Log detalhado para debugging em produção
      const errorDetails = {
        message: error.message,
        type: error.constructor.name,
        status: error.status || 'N/A',
        error: error.error || null,
        response: error.response?.data || null,
        stack: error.stack
      };

      logger.error('=== ERRO AO GERAR RESPOSTA SIMULADA ===');
      logger.error(JSON.stringify(errorDetails, null, 2));
      logger.error('========================================');

      // Resposta fallback em caso de erro
      return (
        'Desculpe, estou com dificuldades técnicas no momento. 😔\n\n' +
        'Por favor, tente novamente em alguns instantes ou entre em contato diretamente com seu gerente de conta na WN7.'
      );
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
        messages: [
          {
            role: 'user',
            content: `Crie um resumo conciso e objetivo deste relatório de marketing em português:\n\n${reportText}`
          }
        ]
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
        messages: [
          {
            role: 'user',
            content: `Analise o sentimento desta mensagem e responda apenas com: positive, neutral ou negative\n\nMensagem: "${message}"`
          }
        ]
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
        messages: [
          {
            role: 'user',
            content: 'Responda apenas: OK'
          }
        ]
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
