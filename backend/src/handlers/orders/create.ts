import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { wrapHandler, extractUserInfo } from '../../middleware';
import { orderService } from '../../services';
import { createdResponse } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';


const createOrderHandler = async (
  event: APIGatewayProxyEvent & { body: unknown }
): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext.requestId;

  const userInfo = extractUserInfo(event);
  if (!userInfo) {
    throw new UnauthorizedError('User information not found in token');
  }

  const { userId, userEmail } = userInfo;

  const order = await orderService.createOrder(userId, userEmail, event.body);

  return createdResponse(order, requestId);
};


export const handler = wrapHandler(createOrderHandler);