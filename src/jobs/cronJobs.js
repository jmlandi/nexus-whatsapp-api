/**
 * Cron Jobs
 * Tarefas agendadas da aplicação
 */

const cron = require('node-cron');
const chatService = require('../services/chatService');
const logger = require('../utils/logger');

/**
 * Fecha chats inativos há mais de X minutos
 * Executa a cada 5 minutos
 */
function scheduleCloseStaleChats() {
  const timeoutMinutes = parseInt(process.env.CHAT_TIMEOUT_MINUTES) || 15;

  // Executa a cada 5 minutos
  cron.schedule('*/5 * * * *', async () => {
    try {
      logger.info('Executando job: fechar chats inativos');

      const closedCount = await chatService.closeStaleChats(timeoutMinutes);

      if (closedCount > 0) {
        logger.info(`Job concluído: ${closedCount} chat(s) fechado(s)`);
      }
    } catch (error) {
      logger.error(`Erro no job de fechar chats: ${error.message}`);
    }
  });

  logger.info(`Job agendado: Fechar chats inativos (${timeoutMinutes} min) - A cada 5 minutos`);
}

/**
 * Inicia todos os cron jobs
 */
function startCronJobs() {
  scheduleCloseStaleChats();

  // Adicione outros cron jobs aqui conforme necessário
  // Exemplo:
  // scheduleReportReminders();
  // scheduleDataCleanup();
}

module.exports = {
  startCronJobs
};
