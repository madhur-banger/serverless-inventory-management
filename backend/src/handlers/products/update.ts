import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { wrapHandler } from '../../middleware';
import { productService } from '../../services';
import { successResponse } from '../../utils/response';
import { BadRequestError } from '../../utils/errors';
import { productIdSchema } from '../../validation/productSchema';


const updateProductHandler = async (
  event: APIGatewayProxyEvent & { body: unknown }
): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext.requestId;
  const id = event.pathParameters?.id;

  if (!id) {
    throw new BadRequestError('Product ID is required');
  }


  const validationResult = productIdSchema.safeParse({ id });
  if (!validationResult.success) {
    throw new BadRequestError('Invalid product ID format');
  }

  const product = await productService.updateProduct(id, event.body);

  return successResponse(product, requestId);
};


export const handler = wrapHandler(updateProductHandler);