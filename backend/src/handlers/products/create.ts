import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { wrapHandler } from '../../middleware';
import { productService } from '../../services';
import { createdResponse } from '../../utils/response';


const createProductHandler = async (
  event: APIGatewayProxyEvent & { body: unknown }
): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext.requestId;

  const product = await productService.createProduct(event.body);

  return createdResponse(product, requestId);
};


export const handler = wrapHandler(createProductHandler);