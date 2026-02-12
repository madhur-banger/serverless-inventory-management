import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';


export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const response = {
    status: 'healthy',
    service: 'inventory-api',
    version: '1.0.0',
    stage: process.env.STAGE || 'unknown',
    timestamp: new Date().toISOString(),
    requestId: event.requestContext.requestId,
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify(response),
  };
};