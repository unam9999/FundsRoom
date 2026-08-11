/**
 * Custom application error with HTTP status code and error code.
 * Used throughout the API for consistent, meaningful error responses.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(statusCode: number, code: string, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  // ─── Common error factories ─────────────────────────────────────────────────

  static badRequest(message: string, code = 'BAD_REQUEST') {
    return new AppError(400, code, message);
  }

  static unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED') {
    return new AppError(401, code, message);
  }

  static forbidden(message = 'Insufficient permissions', code = 'FORBIDDEN') {
    return new AppError(403, code, message);
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
    return new AppError(404, code, message);
  }

  static conflict(message: string, code = 'CONFLICT') {
    return new AppError(409, code, message);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    return new AppError(500, code, message, false);
  }

  static validationError(message: string) {
    return new AppError(400, 'VALIDATION_ERROR', message);
  }

  static insufficientStock(productName: string) {
    return new AppError(
      409,
      'INSUFFICIENT_STOCK',
      `Insufficient stock for product: ${productName}`
    );
  }

  static duplicateEntry(field: string) {
    return new AppError(409, 'DUPLICATE_ENTRY', `A record with this ${field} already exists`);
  }
}
