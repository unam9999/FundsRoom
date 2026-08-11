import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { config } from '../../config';
import { AppError } from '../../utils/app-error';
import { logger } from '../../utils/logger';
import { JwtPayload } from '../../types';
import { LoginInput } from './auth.validation';

export class AuthService {
  /**
   * Authenticate user with email and password.
   * Returns JWT token and user info (excluding password).
   */
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        name: true,
        email: true,
        password_hash: true,
        role: true,
        is_active: true,
      },
    });

    if (!user) {
      // Use generic message to prevent user enumeration
      logger.security('Login attempt for non-existent email', { email: input.email });
      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (!user.is_active) {
      logger.security('Login attempt for inactive user', { userId: user.id });
      throw AppError.unauthorized('Account is deactivated', 'ACCOUNT_INACTIVE');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password_hash);

    if (!isPasswordValid) {
      logger.security('Failed login attempt', { userId: user.id });
      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Generate JWT with minimal payload
    const payload: JwtPayload = {
      userId: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);

    logger.info('User logged in', { userId: user.id, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Get current authenticated user's profile.
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    return user;
  }
}

export const authService = new AuthService();
