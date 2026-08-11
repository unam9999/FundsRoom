import { Role } from '@prisma/client';

/**
 * Authenticated user payload attached to request by auth middleware.
 */
export interface AuthUser {
  userId: string;
  role: Role;
}

/**
 * Augment Express Request to include authenticated user.
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * JWT payload structure — minimal to avoid leaking sensitive data.
 */
export interface JwtPayload {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
}

/**
 * Pagination query parameters.
 */
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}
