import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { wrapHandlerWithoutBodyParser } from '../../middleware';
import { productService } from '../../services';
import { successResponse } from '../../utils/response';


const listProductsHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext.requestId;


  const queryParams = event.queryStringParameters || {};

  const result = await productService.listProducts(queryParams);

  return successResponse(result, requestId);
};


export const handler = wrapHandlerWithoutBodyParser(listProductsHandler);