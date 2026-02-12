// Standardized API response utilities

import { APIGatewayProxyResult } from 'aws-lambda';


export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown[];
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
}


export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
}


const getHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
});


export const successResponse = <T>(
  data: T,
  requestId: string,
  statusCode: number = 200
): APIGatewayProxyResult => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  };

  return {
    statusCode,
    headers: getHeaders(),
    body: JSON.stringify(response),
  };
};


export const createdResponse = <T>(
  data: T,
  requestId: string
): APIGatewayProxyResult => {
  return successResponse(data, requestId, 201);
};


export const noContentResponse = (): APIGatewayProxyResult => {
  return {
    statusCode: 204,
    headers: getHeaders(),
    body: '',
  };
};


export const errorResponse = (
  statusCode: number,
  code: string,
  message: string,
  requestId: string,
  details?: unknown[]
): APIGatewayProxyResult => {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  };

  return {
    statusCode,
    headers: getHeaders(),
    body: JSON.stringify(response),
  };
};