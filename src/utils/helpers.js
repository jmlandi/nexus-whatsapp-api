/**
 * Funções auxiliares e validators
 * Helpers reutilizáveis em toda a aplicação
 */

/**
 * Valida se um UUID é válido
 * @param {string} uuid - UUID a validar
 * @returns {boolean} True se válido
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} True se válido
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida número de telefone no formato internacional
 * @param {string} phoneNumber - Número a validar
 * @returns {boolean} True se válido
 */
function isValidPhoneNumber(phoneNumber) {
  // Remove prefixo whatsapp: se existir
  const number = phoneNumber.replace('whatsapp:', '');
  // Formato internacional: +[código_país][número]
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(number);
}

/**
 * Formata número de telefone para WhatsApp
 * @param {string} phoneNumber - Número a formatar
 * @returns {string} Número formatado com prefixo whatsapp:
 */
function formatWhatsAppNumber(phoneNumber) {
  // Remove espaços e caracteres especiais exceto +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Adiciona + se não tiver
  const withPlus = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  
  // Adiciona prefixo whatsapp: se não tiver
  return withPlus.startsWith('whatsapp:') ? withPlus : `whatsapp:${withPlus}`;
}

/**
 * Sanitiza string para prevenir injeção
 * @param {string} str - String a sanitizar
 * @returns {string} String sanitizada
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove < e >
    .slice(0, 1000); // Limita tamanho
}

/**
 * Valida se data é válida
 * @param {string|Date} date - Data a validar
 * @returns {boolean} True se válida
 */
function isValidDate(date) {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
}

/**
 * Gera mensagem de erro padronizada
 * @param {string} field - Campo com erro
 * @param {string} message - Mensagem de erro
 * @returns {Object} Objeto de erro padronizado
 */
function createValidationError(field, message) {
  return {
    field,
    message,
    code: 'VALIDATION_ERROR'
  };
}

/**
 * Valida campos obrigatórios
 * @param {Object} data - Dados a validar
 * @param {Array<string>} requiredFields - Campos obrigatórios
 * @returns {Array<Object>} Array de erros (vazio se tudo OK)
 */
function validateRequiredFields(data, requiredFields) {
  const errors = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(createValidationError(field, `${field} é obrigatório`));
    }
  }
  
  return errors;
}

/**
 * Formata resposta de paginação
 * @param {Array} data - Dados da página
 * @param {number} page - Página atual
 * @param {number} limit - Itens por página
 * @param {number} total - Total de itens
 * @returns {Object} Resposta formatada com paginação
 */
function formatPaginatedResponse(data, page, limit, total) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
}

/**
 * Extrai parâmetros de paginação da query
 * @param {Object} query - Query parameters da requisição
 * @param {number} defaultLimit - Limite padrão
 * @param {number} maxLimit - Limite máximo
 * @returns {Object} Parâmetros de paginação { page, limit, skip }
 */
function extractPaginationParams(query, defaultLimit = 20, maxLimit = 100) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const requestedLimit = parseInt(query.limit) || defaultLimit;
  const limit = Math.min(requestedLimit, maxLimit);
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

/**
 * Converte base64 para buffer
 * @param {string} base64String - String em base64
 * @returns {Buffer} Buffer do arquivo
 */
function base64ToBuffer(base64String) {
  // Remove prefixo data:* se existir
  const base64Data = base64String.replace(/^data:[^;]+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Gera nome de arquivo único
 * @param {string} originalName - Nome original do arquivo
 * @returns {string} Nome único com timestamp
 */
function generateUniqueFileName(originalName) {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(`.${extension}`, '');
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${sanitized}_${timestamp}.${extension}`;
}

/**
 * Calcula diferença em minutos entre duas datas
 * @param {Date} date1 - Data inicial
 * @param {Date} date2 - Data final (default: agora)
 * @returns {number} Diferença em minutos
 */
function getMinutesDifference(date1, date2 = new Date()) {
  const diff = Math.abs(date2 - date1);
  return Math.floor(diff / (1000 * 60));
}

/**
 * Verifica se ambiente é produção
 * @returns {boolean} True se produção
 */
function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Verifica se ambiente é desenvolvimento
 * @returns {boolean} True se desenvolvimento
 */
function isDevelopment() {
  return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
}

/**
 * Sleep/delay assíncrono
 * @param {number} ms - Milissegundos para aguardar
 * @returns {Promise} Promise que resolve após delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry com backoff exponencial
 * @param {Function} fn - Função a executar
 * @param {number} maxRetries - Máximo de tentativas
 * @param {number} delay - Delay inicial em ms
 * @returns {Promise} Resultado da função ou erro
 */
async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        const backoffDelay = delay * Math.pow(2, i);
        await sleep(backoffDelay);
      }
    }
  }
  
  throw lastError;
}

module.exports = {
  // Validators
  isValidUUID,
  isValidEmail,
  isValidPhoneNumber,
  isValidDate,
  validateRequiredFields,
  
  // Formatters
  formatWhatsAppNumber,
  sanitizeString,
  formatPaginatedResponse,
  generateUniqueFileName,
  
  // Parsers
  extractPaginationParams,
  base64ToBuffer,
  
  // Utilities
  createValidationError,
  getMinutesDifference,
  isProduction,
  isDevelopment,
  sleep,
  retryWithBackoff
};
