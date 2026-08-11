import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { sendError } from '../utils/response';

/**
 * General API rate limiter — 100 requests per 15 minutes per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.general,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, 'RATE_LIMITED', 'Too many requests. Please try again later.');
  },
});

/**
 * Strict login rate limiter — 5 attempts per 15 minutes per IP.
 * Protects against brute-force attacks.
 */
export const loginLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.login,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, 'RATE_LIMITED', 'Too many login attempts. Please try again later.');
  },
});
