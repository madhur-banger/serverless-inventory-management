import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpCors from '@middy/http-cors';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import { errorHandler } from './errorHandler';
import { requestContext } from './requestContext';


const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';


export const wrapHandler = (
  handler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult>
): middy.MiddyfiedHandler<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  return middy(handler)
    .use(requestContext())
    .use(httpJsonBodyParser())
    .use(
      httpCors({
        origin: CORS_ORIGIN,
        credentials: true,
        headers: [
          'Content-Type',
          'Authorization',
          'X-Request-Id',
          'X-Amz-Date',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ].join(','),
      })
    )
    .use(errorHandler());
};



export const wrapHandlerWithoutBodyParser = (
  handler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult>
): middy.MiddyfiedHandler<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  return middy(handler)
    .use(requestContext())
    .use(
      httpCors({
        origin: CORS_ORIGIN,
        credentials: true,
      })
    )
    .use(errorHandler());
};