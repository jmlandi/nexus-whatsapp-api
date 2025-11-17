/**
 * Validation Utilities
 * Common validation functions used across the application
 */

/**
 * Validates email format
 *
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 *
 * @example
 * if (!isValidEmail(req.body.email)) {
 *   return res.status(400).json({ error: 'Email inválido' });
 * }
 */
const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number format (Brazilian)
 * Accepts formats: +5511999999999, 5511999999999, 11999999999
 *
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 *
 * @example
 * if (!isValidPhoneNumber(phoneNumber)) {
 *   return res.status(400).json({ error: 'Telefone inválido' });
 * }
 */
const isValidPhoneNumber = phone => {
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Brazilian phone: 10-11 digits (with country code: 12-13)
  return cleaned.length >= 10 && cleaned.length <= 13;
};

/**
 * Formats phone number to WhatsApp format (numbers only)
 *
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 *
 * @example
 * const formatted = formatPhoneNumber('+55 11 99999-9999');
 * // Returns: '5511999999999'
 */
const formatPhoneNumber = phone => {
  return phone.replace(/\D/g, '');
};

/**
 * Validates UUID format
 *
 * @param {string} id - UUID to validate
 * @returns {boolean} True if valid UUID
 *
 * @example
 * if (!isValidUUID(req.params.id)) {
 *   return res.status(400).json({ error: 'ID inválido' });
 * }
 */
const isValidUUID = id => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Validates date format (ISO 8601 or common formats)
 *
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 *
 * @example
 * if (!isValidDate(req.body.startDate)) {
 *   return res.status(400).json({ error: 'Data inválida' });
 * }
 */
const isValidDate = dateString => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Sanitizes string input (removes HTML tags and trims)
 *
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 *
 * @example
 * const clean = sanitizeString(req.body.message);
 */
const sanitizeString = str => {
  if (typeof str !== 'string') return str;

  // Remove HTML tags
  let sanitized = str.replace(/<[^>]*>/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
};

/**
 * Validates string length
 *
 * @param {string} str - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} True if valid length
 *
 * @example
 * if (!isValidLength(req.body.name, 2, 100)) {
 *   return res.status(400).json({ error: 'Nome deve ter entre 2 e 100 caracteres' });
 * }
 */
const isValidLength = (str, min, max) => {
  if (typeof str !== 'string') return false;
  const length = str.trim().length;
  return length >= min && length <= max;
};

/**
 * Validates if value is a positive integer
 *
 * @param {*} value - Value to validate
 * @returns {boolean} True if positive integer
 *
 * @example
 * if (!isPositiveInteger(req.query.page)) {
 *   return res.status(400).json({ error: 'Página deve ser um número positivo' });
 * }
 */
const isPositiveInteger = value => {
  const num = parseInt(value);
  return Number.isInteger(num) && num > 0;
};

/**
 * Validates date range
 *
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Object} Validation result with valid flag and error message
 *
 * @example
 * const validation = validateDateRange(req.body.startDate, req.body.endDate);
 * if (!validation.valid) {
 *   return res.status(400).json({ error: validation.error });
 * }
 */
const validateDateRange = (startDate, endDate) => {
  if (!isValidDate(startDate)) {
    return { valid: false, error: 'Data inicial inválida' };
  }

  if (!isValidDate(endDate)) {
    return { valid: false, error: 'Data final inválida' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return { valid: false, error: 'Data inicial deve ser anterior à data final' };
  }

  return { valid: true };
};

/**
 * Validates file extension
 *
 * @param {string} filename - Filename to validate
 * @param {Array<string>} allowedExtensions - Array of allowed extensions
 * @returns {boolean} True if valid extension
 *
 * @example
 * if (!isValidFileExtension(file.name, ['pdf', 'jpg', 'png'])) {
 *   return res.status(400).json({ error: 'Tipo de arquivo não permitido' });
 * }
 */
const isValidFileExtension = (filename, allowedExtensions) => {
  const extension = filename.split('.').pop().toLowerCase();
  return allowedExtensions.includes(extension);
};

/**
 * Validates file size
 *
 * @param {number} sizeInBytes - File size in bytes
 * @param {number} maxSizeInMB - Maximum size in MB
 * @returns {boolean} True if size is valid
 *
 * @example
 * if (!isValidFileSize(file.size, 10)) {
 *   return res.status(400).json({ error: 'Arquivo muito grande (máx: 10MB)' });
 * }
 */
const isValidFileSize = (sizeInBytes, maxSizeInMB) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
};

module.exports = {
  isValidEmail,
  isValidPhoneNumber,
  formatPhoneNumber,
  isValidUUID,
  isValidDate,
  sanitizeString,
  isValidLength,
  isPositiveInteger,
  validateDateRange,
  isValidFileExtension,
  isValidFileSize
};
