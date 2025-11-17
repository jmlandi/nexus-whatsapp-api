/**
 * Service de IA - Anthropic Claude
 * Gerencia interações com o modelo de IA para gerar respostas contextualizadas
 */

const Anthropic = require('@anthropic-ai/sdk');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const pdfService = require('./pdfService');

class AIService {
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
    this.model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
    this.maxTokens = parseInt(process.env.ANTHROPIC_MAX_TOKENS) || 1024;
    
    logger.info(`AIService inicializado - Modelo: ${this.model}, MaxTokens: ${this.maxTokens}`);
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
            orderBy: { startDate: 'desc' },
            take: 2 // Últimos 2 relatórios (para não sobrecarregar)
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
        context += `=== RELATÓRIOS DE MARKETING ===\n\n`;
        
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
            const limitedText = pdfText.length > 6000 
              ? pdfText.substring(0, 6000) + '\n[... restante do relatório omitido por tamanho ...]'
              : pdfText;
            
            context += `\nConteúdo do Relatório:\n${limitedText}\n`;
            context += `\n${'='.repeat(60)}\n\n`;
            
          } catch (pdfError) {
            logger.error(`Erro ao processar PDF ${report.id}: ${pdfError.message}`);
            context += `\n⚠️ Não foi possível extrair o conteúdo deste PDF.\n`;
            context += `\n${'='.repeat(60)}\n\n`;
          }
        }
        
        context += `\n✅ Você tem acesso ao CONTEÚDO COMPLETO dos relatórios acima.\n`;
        context += `Analise os dados, métricas e informações para responder perguntas específicas do cliente.\n`;
        
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
      
      console.error('=== ERRO AO GERAR RESPOSTA COM IA ===');
      console.error(JSON.stringify(errorDetails, null, 2));
      console.error('======================================');
      
      logger.error('=== ERRO AO GERAR RESPOSTA COM IA ===');
      logger.error(JSON.stringify(errorDetails, null, 2));
      logger.error('======================================');
      
      // Resposta fallback em caso de erro
      return 'Desculpe, estou com dificuldades técnicas no momento. 😔\n\n' +
             'Por favor, tente novamente em alguns instantes ou entre em contato diretamente com seu gerente de conta na WN7.';
    }
  }

  /**
   * Gera resposta simulada (sem salvar no banco)
   * Usado pelo simulador de chat
   * @param {string} userMessage - Mensagem do usuário
   * @param {string} customerId - ID do cliente
   * @param {Array} history - Histórico de mensagens
   * @returns {Promise<string>} Resposta gerada pela IA
   */
  async generateSimulatedResponse(userMessage, customerId, history = []) {
    console.log('🤖 generateSimulatedResponse chamado');
    console.log(`Customer ID: ${customerId}`);
    console.log(`Mensagem: ${userMessage}`);
    console.log(`História: ${history.length} mensagens`);
    
    try {
      // Busca contexto do cliente
      console.log('📋 Buscando contexto do cliente...');
      const customerContext = await this.getCustomerContext(customerId);

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
      console.log('☁️ Chamando Anthropic API...');
      console.log(`Modelo: ${this.model}`);
      console.log(`Max tokens: ${this.maxTokens}`);
      
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: messages
      });

      // Extrai o texto da resposta
      const aiResponse = response.content[0].text;

      console.log('✅ Resposta gerada com sucesso');
      console.log(`Tamanho da resposta: ${aiResponse.length} caracteres`);
      
      logger.info(`Resposta simulada gerada para cliente ${customerId}`);
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
      
      console.error('=== ERRO AO GERAR RESPOSTA SIMULADA ===');
      console.error(JSON.stringify(errorDetails, null, 2));
      console.error('========================================');
      
      logger.error('=== ERRO AO GERAR RESPOSTA SIMULADA ===');
      logger.error(JSON.stringify(errorDetails, null, 2));
      logger.error('========================================');
      
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
