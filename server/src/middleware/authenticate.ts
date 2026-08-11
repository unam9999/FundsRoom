import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../config/prisma';
import { AppError } from '../utils/app-error';
import { logger } from '../utils/logger';
import { JwtPayload } from '../types';

/**
 * Authentication middleware.
 * Extracts JWT from Authorization header, verifies it, checks user is active,
 * and attaches user info to request.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw AppError.unauthorized('Token not provided');
    }

    // Verify JWT
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw AppError.unauthorized('Token has expired', 'TOKEN_EXPIRED');
      }
      throw AppError.unauthorized('Invalid token', 'INVALID_TOKEN');
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, is_active: true },
    });

    if (!user) {
      throw AppError.unauthorized('User not found');
    }

    if (!user.is_active) {
      logger.security('Inactive user attempted access', { userId: user.id });
      throw AppError.unauthorized('Account is deactivated');
    }

    // Attach user to request — server derives this from token, never trusts client
    req.user = {
      userId: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}
