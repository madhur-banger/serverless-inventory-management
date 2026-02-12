import middy from '@middy/core';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { logger } from '../utils/logger';


export const requestContext = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => {
  return {
    before: async (request): Promise<void> => {
      const requestId =
        request.event.requestContext?.requestId || 'unknown';

      // Extract user info from Cognito authorizer
      const claims =
        request.event.requestContext?.authorizer?.claims as
          | Record<string, unknown>
          | undefined;

      const userId = claims?.sub as string | undefined;
      const userEmail = claims?.email as string | undefined;

      // Set logger context
      logger.setContext({
        requestId,
        userId,
        userEmail,
      });

      // Log request start
      logger.info('Request started', {
        path: request.event.path,
        method: request.event.httpMethod,
        queryParams: request.event.queryStringParameters,
        hasBody: !!request.event.body,
      });
    },

    after: async (request): Promise<void> => {
      logger.info('Request completed', {
        statusCode: request.response?.statusCode,
      });

      logger.clearContext();
    },

    onError: async (): Promise<void> => {
      logger.clearContext();
    },
  };
};

/**
 * Extract user info from the request
 */
export const extractUserInfo = (
  event: APIGatewayProxyEvent
): { userId: string; userEmail: string } | null => {
  const claims =
    event.requestContext?.authorizer?.claims as
      | Record<string, unknown>
      | undefined;

  const userId = claims?.sub as string | undefined;
  const userEmail = claims?.email as string | undefined;

  if (!userId || !userEmail) {
    return null;
  }

  return { userId, userEmail };
};
