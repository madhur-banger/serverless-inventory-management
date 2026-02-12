import { ErrorCode } from './response';


export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown[];

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    details?: unknown[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}


export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: unknown[]) {
    super(message, 400, ErrorCode.BAD_REQUEST, details);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}


export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: unknown[]) {
    super(message, 400, ErrorCode.VALIDATION_ERROR, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}


export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, ErrorCode.UNAUTHORIZED);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}


export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, ErrorCode.FORBIDDEN);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}


export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', id?: string) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, 404, ErrorCode.NOT_FOUND);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}


export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, ErrorCode.CONFLICT);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}


export class InsufficientStockError extends AppError {
  constructor(productId: string, available: number, requested: number) {
    const message = `Insufficient stock for product '${productId}'. Available: ${available}, Requested: ${requested}`;
    super(message, 400, ErrorCode.INSUFFICIENT_STOCK);
    Object.setPrototypeOf(this, InsufficientStockError.prototype);
  }
}


export class InternalError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, ErrorCode.INTERNAL_ERROR);
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}

/**
 * Type guard to check if error is an AppError
 */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};