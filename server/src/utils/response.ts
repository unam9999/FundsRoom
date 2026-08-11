import { Response } from 'express';

/**
 * Standard API response helpers.
 * All API responses follow the shape:
 *   Success: { success: true, data: ... }
 *   Failure: { success: false, error: { code, message } }
 */
export function sendSuccess(res: Response, data: unknown, statusCode = 200): void {
  res.status(statusCode).json({
    success: true,
    data,
  });
}

export function sendCreated(res: Response, data: unknown): void {
  sendSuccess(res, data, 201);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string
): void {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

export function sendPaginated(
  res: Response,
  data: unknown[],
  total: number,
  page: number,
  limit: number
): void {
  res.status(200).json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
