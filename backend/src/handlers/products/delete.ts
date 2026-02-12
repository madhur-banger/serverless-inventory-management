import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { wrapHandlerWithoutBodyParser } from '../../middleware';
import { productService } from '../../services';
import { noContentResponse } from '../../utils/response';
import { BadRequestError } from '../../utils/errors';
import { productIdSchema } from '../../validation/productSchema';


const deleteProductHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (!id) {
    throw new BadRequestError('Product ID is required');
  }


  const validationResult = productIdSchema.safeParse({ id });
  if (!validationResult.success) {
    throw new BadRequestError('Invalid product ID format');
  }

  await productService.deleteProduct(id);

  return noContentResponse();
};


export const handler = wrapHandlerWithoutBodyParser(deleteProductHandler);