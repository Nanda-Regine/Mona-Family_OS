'use strict';

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for OpenAI endpoints: max 10 requests per minute per IP.
 */
const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many AI requests',
    message: 'You have reached the AI request limit (10/min). Please wait before trying again.',
    code: 'AI_RATE_LIMIT'
  },
  skip: (req) => process.env.NODE_ENV === 'test'
});

/**
 * General API rate limiter: max 100 requests per minute per IP.
 */
const generalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Request limit reached. Please slow down.',
    code: 'RATE_LIMIT'
  }
});

/**
 * Sync rate limiter: max 30 syncs per minute (every 2 seconds minimum).
 */
const syncRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many sync requests',
    message: 'Sync rate limit reached. Clients should sync every 10 seconds.',
    code: 'SYNC_RATE_LIMIT'
  }
});

module.exports = { aiRateLimit, generalRateLimit, syncRateLimit };
