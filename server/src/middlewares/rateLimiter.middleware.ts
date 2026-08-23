import rateLimit from 'express-rate-limit';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100000, // High throughput for live dashboard polling and simulation
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const ip = req.ip || req.socket?.remoteAddress;
    return (
      process.env.NODE_ENV !== 'production' ||
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip === '::ffff:127.0.0.1' ||
      req.hostname === 'localhost'
    );
  },
  message: {
    success: false,
    message: 'Too many requests created from this IP, please try again after 15 minutes.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const ip = req.ip || req.socket?.remoteAddress;
    return (
      process.env.NODE_ENV !== 'production' ||
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip === '::ffff:127.0.0.1'
    );
  },
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});
