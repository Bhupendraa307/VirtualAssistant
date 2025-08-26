import rateLimit from 'express-rate-limit';

// Looser limits in development to avoid interrupting local testing
const isDev = process.env.NODE_ENV !== 'production';
const window15m = 15 * 60 * 1000; // 15 minutes

// General rate limiter for all routes
export const generalLimiter = rateLimit({
  windowMs: window15m,
  max: isDev ? 1000 : 100, // Dev: very high; Prod: sensible default
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(window15m / 60000)
    });
  }
});

// Stricter rate limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: window15m,
  max: isDev ? 50 : 5, // Dev: higher to allow testing; Prod: strict
  standardHeaders: true,
  legacyHeaders: false,
  // Don’t count successful auth attempts against the limit
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts',
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: Math.ceil(window15m / 60000)
    });
  }
});

// Rate limiter for AI assistant requests
export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isDev ? 100 : 10,   // Dev: higher; Prod: tighter
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many AI requests',
      message: 'Too many AI requests, please wait a moment before trying again.',
      retryAfter: 1
    });
  }
});

// Rate limiter for file uploads
export const uploadLimiter = rateLimit({
  windowMs: window15m,
  max: isDev ? 200 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many file uploads',
      message: 'Too many file uploads, please try again later.',
      retryAfter: Math.ceil(window15m / 60000)
    });
  }
});