import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
      : ['http://localhost:5173', 'http://localhost:3000'],
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    general: 100,
    login: 5,
  },
} as const;

// Validate critical config at startup
export function validateConfig(): void {
  if (config.isProduction) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-change-in-production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL must be set in production');
    }
    if (!process.env.CORS_ORIGIN) {
      throw new Error('CORS_ORIGIN must be set in production');
    }
  }
}
