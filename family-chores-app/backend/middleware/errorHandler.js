'use strict';

/**
 * Global error handler middleware.
 * Must be registered LAST in Express middleware chain.
 */
function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // OpenAI-specific errors
  if (err.constructor?.name === 'APIError' || message.includes('openai')) {
    return res.status(503).json({
      error: 'AI service unavailable',
      message: 'The AI feature is temporarily unavailable. Please try again later.',
      code: 'AI_ERROR'
    });
  }

  // Rate limit errors from express-rate-limit
  if (status === 429) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'You have made too many requests. Please wait a minute and try again.',
      code: 'RATE_LIMIT'
    });
  }

  return res.status(status).json({
    error: status >= 500 ? 'Internal server error' : message,
    message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Something went wrong' : message,
    code: err.code || 'ERROR'
  });
}

module.exports = { errorHandler };
