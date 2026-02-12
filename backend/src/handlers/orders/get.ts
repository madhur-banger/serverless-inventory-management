import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { wrapHandlerWithoutBodyParser, extractUserInfo } from '../../middleware';
import { orderService } from '../../services';
import { successResponse } from '../../utils/response';
import { BadRequestError, UnauthorizedError } from '../../utils/errors';
import { orderIdSchema } from '../../validation/orderSchema';


const getOrderHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext.requestId;
  const orderId = event.pathParameters?.id;

  if (!orderId) {
    throw new BadRequestError('Order ID is required');
  }


  const validationResult = orderIdSchema.safeParse({ id: orderId });
  if (!validationResult.success) {
    throw new BadRequestError('Invalid order ID format');
  }


  const userInfo = extractUserInfo(event);
  if (!userInfo) {
    throw new UnauthorizedError('User information not found in token');
  }

  const order = await orderService.getOrder(orderId, userInfo.userId);

  return successResponse(order, requestId);
};


export const handler = wrapHandlerWithoutBodyParser(getOrderHandler);