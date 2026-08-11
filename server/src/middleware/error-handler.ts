import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { config } from '../config';
import { Prisma } from '@prisma/client';

/**
 * Global error handler middleware.
 * - Operational errors: return meaningful error to client
 * - Programming errors: log internally, return sanitized 500
 * - Prisma errors: translate to appropriate HTTP status
 * - Never expose stack traces, SQL errors, or internal paths in production
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Handle AppError (operational errors)
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message);
    return;
  }

  // Handle Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        // Unique constraint violation
        const target = (err.meta?.target as string[])?.join(', ') || 'field';
        sendError(res, 409, 'DUPLICATE_ENTRY', `A record with this ${target} already exists`);
        return;
      }
      case 'P2003': {
        // Foreign key constraint violation
        sendError(res, 400, 'INVALID_REFERENCE', 'Referenced record does not exist');
        return;
      }
      case 'P2025': {
        // Record not found
        sendError(res, 404, 'NOT_FOUND', 'The requested record was not found');
        return;
      }
      default:
        break;
    }
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid data provided');
    return;
  }

  // Log unexpected errors internally — sanitize for production
  logger.error('Unhandled error', {
    message: err.message,
    stack: config.isProduction ? undefined : err.stack,
    path: req.path,
    method: req.method,
  });

  // Sanitized response for unexpected errors
  sendError(
    res,
    500,
    'INTERNAL_ERROR',
    config.isProduction ? 'An unexpected error occurred' : err.message
  );
}
