import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from '../utils/app-error';
import { logger } from '../utils/logger';

/**
 * Role-based authorization middleware factory.
 * Usage: authorize('ADMIN', 'SALES') — allows only those roles.
 *
 * Must be used AFTER authenticate middleware.
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required before authorization'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.security('Authorization denied', {
        userId: req.user.userId,
        role: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
        method: req.method,
      });
      return next(AppError.forbidden('You do not have permission to perform this action'));
    }

    next();
  };
}
