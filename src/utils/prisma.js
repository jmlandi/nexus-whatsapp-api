/**
 * Cliente Prisma - Singleton para conexão com o banco de dados
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

// Cria instância única do Prisma
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error']
});

// Event listeners para logs
prisma.$on('query', (e) => {
  logger.debug(`Query: ${e.query} - Duration: ${e.duration}ms`);
});

prisma.$on('error', (e) => {
  logger.error(`Prisma Error: ${e.message}`);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Conexão com banco de dados encerrada');
});

module.exports = prisma;
