/**
 * CORS Configuration
 * Configures Cross-Origin Resource Sharing for production
 */

/**
 * Gets CORS options based on environment
 *
 * @returns {Object} CORS configuration object
 */
function getCorsOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Production: Restrict to specific origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : [];

    // Always allow same-origin requests (frontend served from same domain as API)
    const renderUrl = process.env.RENDER_EXTERNAL_URL; // e.g., https://nexus-api-xm3p.onrender.com
    if (renderUrl && !allowedOrigins.includes(renderUrl)) {
      allowedOrigins.push(renderUrl);
    }

    return {
      origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, curl, etc)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log('❌ CORS blocked origin:', origin);
          console.log('📋 Allowed origins:', allowedOrigins);
          callback(new Error('Origin not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Requested-With'],
      exposedHeaders: ['X-Request-ID'],
      maxAge: 86400, // 24 hours
      optionsSuccessStatus: 200
    };
  } else {
    // Development: Allow all origins
    return {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      exposedHeaders: ['X-Request-ID']
    };
  }
}

module.exports = {
  getCorsOptions
};
