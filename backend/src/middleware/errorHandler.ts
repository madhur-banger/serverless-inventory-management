import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { errorResponse, ErrorCode } from '../utils/response';
import { isAppError } from '../utils/errors';
import { formatZodErrors } from '../validation/helpers';

interface ErrorHandlerOptions {
  fallbackMessage?: string;
}

/**
 * Custom error handler middleware
 * Catches all errors and returns standardized API responses
 */
export const errorHandler = (
  options: ErrorHandlerOptions = {}
): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const { fallbackMessage = 'An unexpected error occurred' } = options;

  return {
    onError: async (request): Promise<void> => {
      const { error } = request;
      const requestId = request.event.requestContext?.requestId || 'unknown';

      // Log the error
      logger.error('Request error', error as Error, {
        path: request.event.path,
        method: request.event.httpMethod,
      });

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        request.response = errorResponse(
          400,
          ErrorCode.VALIDATION_ERROR,
          'Validation failed',
          requestId,
          formatZodErrors(error)
        );
        return;
      }

      // Handle custom application errors
      if (isAppError(error)) {
        request.response = errorResponse(
          error.statusCode,
          error.code,
          error.message,
          requestId,
          error.details
        );
        return;
      }

      // Handle http-errors (from middy middlewares)
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const httpError = error as { statusCode: number; message: string };
        request.response = errorResponse(
          httpError.statusCode,
          ErrorCode.BAD_REQUEST,
          httpError.message,
          requestId
        );
        return;
      }

      // Handle unexpected errors (don't expose internal details)
      request.response = errorResponse(
        500,
        ErrorCode.INTERNAL_ERROR,
        fallbackMessage,
        requestId
      );
    },
  };
};