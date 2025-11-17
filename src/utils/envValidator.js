/**
 * Environment Variables Validator
 * Validates required environment variables at application startup
 * Fails fast with clear error messages if configuration is incomplete
 */

// Logger import reserved for future enhanced logging
// const logger = require('./logger');

/**
 * Required environment variables configuration
 * Each entry defines: name, description, validation function, and whether it's critical
 */
const REQUIRED_ENV_VARS = [
  // Database
  {
    name: 'DATABASE_URL',
    description: 'PostgreSQL connection string',
    validate: value => value && value.startsWith('postgres'),
    critical: true
  },

  // Server
  {
    name: 'PORT',
    description: 'Server port number',
    validate: value => !value || (!isNaN(parseInt(value)) && parseInt(value) > 0),
    critical: false,
    default: '3000'
  },
  {
    name: 'NODE_ENV',
    description: 'Node environment (development/production)',
    validate: value => !value || ['development', 'production', 'test'].includes(value),
    critical: false,
    default: 'development'
  },

  // Security
  {
    name: 'JWT_SECRET',
    description: 'JWT secret key for token generation',
    validate: value => value && value.length >= 32,
    critical: true,
    hint: 'Should be at least 32 characters long'
  },
  {
    name: 'JWT_EXPIRES_IN',
    description: 'JWT token expiration time',
    validate: value => !value || /^\d+[hdwmy]$/.test(value),
    critical: false,
    default: '24h'
  },

  // WhatsApp Business API
  {
    name: 'WHATSAPP_API_VERSION',
    description: 'WhatsApp Graph API version',
    validate: value => !value || value.startsWith('v'),
    critical: false,
    default: 'v21.0'
  },
  {
    name: 'WHATSAPP_PHONE_NUMBER_ID',
    description: 'WhatsApp Business phone number ID',
    validate: value => !value || value.length > 0,
    critical: false
  },
  {
    name: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
    description: 'WhatsApp Business account ID',
    validate: value => !value || value.length > 0,
    critical: false
  },
  {
    name: 'WHATSAPP_ACCESS_TOKEN',
    description: 'WhatsApp Business API access token',
    validate: value => !value || value.length > 50,
    critical: false
  },
  {
    name: 'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
    description: 'WhatsApp webhook verification token',
    validate: value => !value || value.length > 0,
    critical: false
  },

  // AWS S3
  {
    name: 'AWS_REGION',
    description: 'AWS region for S3',
    validate: value => value && value.length > 0,
    critical: true
  },
  {
    name: 'AWS_ACCESS_KEY_ID',
    description: 'AWS access key ID',
    validate: value => value && value.length > 0,
    critical: true
  },
  {
    name: 'AWS_SECRET_ACCESS_KEY',
    description: 'AWS secret access key',
    validate: value => value && value.length > 0,
    critical: true
  },
  {
    name: 'AWS_S3_BUCKET_NAME',
    description: 'AWS S3 bucket name for reports',
    validate: value => value && value.length > 0,
    critical: true
  },

  // Anthropic AI
  {
    name: 'ANTHROPIC_API_KEY',
    description: 'Anthropic Claude API key',
    validate: value => value && value.startsWith('sk-ant-') && value.length > 20,
    critical: true,
    hint: 'Should start with sk-ant- and be at least 20 characters'
  },
  {
    name: 'ANTHROPIC_MODEL',
    description: 'Anthropic model name',
    validate: value => !value || value.startsWith('claude-'),
    critical: false,
    default: 'claude-3-5-sonnet-20241022'
  },
  {
    name: 'ANTHROPIC_MAX_TOKENS',
    description: 'Maximum tokens for AI responses',
    validate: value => !value || (!isNaN(parseInt(value)) && parseInt(value) > 0),
    critical: false,
    default: '1024'
  },

  // Application Settings
  {
    name: 'CHAT_TIMEOUT_MINUTES',
    description: 'Minutes before auto-closing inactive chats',
    validate: value => !value || (!isNaN(parseInt(value)) && parseInt(value) > 0),
    critical: false,
    default: '15'
  },
  {
    name: 'MAX_PAGE_SIZE',
    description: 'Maximum items per page in API responses',
    validate: value => !value || (!isNaN(parseInt(value)) && parseInt(value) > 0),
    critical: false,
    default: '100'
  },
  {
    name: 'DEFAULT_PAGE_SIZE',
    description: 'Default items per page in API responses',
    validate: value => !value || (!isNaN(parseInt(value)) && parseInt(value) > 0),
    critical: false,
    default: '20'
  },
  {
    name: 'LOG_LEVEL',
    description: 'Logging level (error/warn/info/debug)',
    validate: value => !value || ['error', 'warn', 'info', 'debug'].includes(value),
    critical: false,
    default: 'info'
  }
];

/**
 * Validates all environment variables
 *
 * @param {boolean} exitOnError - Whether to exit process on critical errors
 * @returns {Object} Validation result with errors and warnings
 */
function validateEnvironment(exitOnError = true) {
  const errors = [];
  const warnings = [];
  const info = [];

  console.log('\n🔍 Validating environment variables...\n');

  REQUIRED_ENV_VARS.forEach(config => {
    const value = process.env[config.name];
    const hasValue = value !== undefined && value !== null && value !== '';

    // Check if variable exists
    if (!hasValue) {
      if (config.critical) {
        errors.push({
          variable: config.name,
          message: `Missing required variable: ${config.name}`,
          description: config.description,
          hint: config.hint
        });
      } else if (config.default) {
        warnings.push({
          variable: config.name,
          message: `Using default value for ${config.name}: ${config.default}`,
          description: config.description
        });
        // Set default value
        process.env[config.name] = config.default;
      } else {
        warnings.push({
          variable: config.name,
          message: `Optional variable not set: ${config.name}`,
          description: config.description
        });
      }
      return;
    }

    // Validate value format
    if (config.validate && !config.validate(value)) {
      if (config.critical) {
        errors.push({
          variable: config.name,
          message: `Invalid value for ${config.name}`,
          description: config.description,
          hint: config.hint || 'Check the expected format',
          currentValue: maskSensitiveValue(config.name, value)
        });
      } else {
        warnings.push({
          variable: config.name,
          message: `Invalid value for ${config.name}, but not critical`,
          description: config.description,
          hint: config.hint
        });
      }
    } else {
      info.push({
        variable: config.name,
        message: `✓ ${config.name} configured`,
        value: maskSensitiveValue(config.name, value)
      });
    }
  });

  // Display results
  if (info.length > 0) {
    console.log('✅ Configured variables:');
    info.forEach(i => console.log(`   ${i.message} - ${i.value}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(w => {
      console.log(`   - ${w.message}`);
      if (w.description) console.log(`     ${w.description}`);
      if (w.hint) console.log(`     Hint: ${w.hint}`);
    });
    console.log('');
  }

  if (errors.length > 0) {
    console.log('❌ Critical errors:');
    errors.forEach(e => {
      console.log(`   - ${e.message}`);
      if (e.description) console.log(`     ${e.description}`);
      if (e.hint) console.log(`     Hint: ${e.hint}`);
      if (e.currentValue) console.log(`     Current value: ${e.currentValue}`);
    });
    console.log('');
    console.log('💡 Please check your .env file or environment variables.');
    console.log('   See .env.example for reference.\n');

    if (exitOnError) {
      console.log('🛑 Application cannot start with missing critical variables.\n');
      process.exit(1);
    }
  } else {
    console.log('✅ All critical environment variables are properly configured!\n');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info
  };
}

/**
 * Masks sensitive values for logging
 *
 * @param {string} key - Environment variable name
 * @param {string} value - Environment variable value
 * @returns {string} Masked value
 */
function maskSensitiveValue(key, value) {
  const sensitiveKeys = [
    'SECRET',
    'KEY',
    'TOKEN',
    'PASSWORD',
    'PASS',
    'API_KEY',
    'ACCESS_KEY',
    'ANTHROPIC',
    'AWS_SECRET'
  ];

  const isSensitive = sensitiveKeys.some(sensitive => key.toUpperCase().includes(sensitive));

  if (!value) return 'NOT SET';

  if (isSensitive) {
    if (value.length <= 8) {
      return '****';
    }
    return `${value.substring(0, 8)}...**${value.substring(value.length - 4)}`;
  }

  return value;
}

/**
 * Gets environment configuration summary
 *
 * @returns {Object} Configuration summary
 */
function getConfigSummary() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    database: {
      configured: !!process.env.DATABASE_URL,
      connection: maskSensitiveValue('DATABASE_URL', process.env.DATABASE_URL)
    },
    whatsapp: {
      configured: !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_BUSINESS_ACCOUNT_ID),
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || 'NOT SET',
      apiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0'
    },
    aws: {
      configured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
      region: process.env.AWS_REGION || 'NOT SET',
      bucket: process.env.AWS_S3_BUCKET_NAME || 'NOT SET'
    },
    anthropic: {
      configured: !!process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      maxTokens: process.env.ANTHROPIC_MAX_TOKENS || '1024'
    },
    security: {
      jwtConfigured: !!process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    app: {
      chatTimeout: process.env.CHAT_TIMEOUT_MINUTES || '15',
      maxPageSize: process.env.MAX_PAGE_SIZE || '100',
      defaultPageSize: process.env.DEFAULT_PAGE_SIZE || '20',
      logLevel: process.env.LOG_LEVEL || 'info'
    }
  };
}

module.exports = {
  validateEnvironment,
  getConfigSummary,
  maskSensitiveValue
};
