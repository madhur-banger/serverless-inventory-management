import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { wrapHandlerWithoutBodyParser, extractUserInfo } from '../../middleware';
import { orderService } from '../../services';
import { successResponse } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';


const listOrdersHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext.requestId;


  const userInfo = extractUserInfo(event);
  if (!userInfo) {
    throw new UnauthorizedError('User information not found in token');
  }

  const queryParams = event.queryStringParameters || {};

  const result = await orderService.listUserOrders(userInfo.userId, {
    status: queryParams.status,
    limit: queryParams.limit ? parseInt(queryParams.limit, 10) : undefined,
    nextToken: queryParams.nextToken,
  });

  return successResponse(result, requestId);
};


export const handler = wrapHandlerWithoutBodyParser(listOrdersHandler);