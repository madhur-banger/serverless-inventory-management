import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import {
  Product,
  ProductDynamoItem,
  CreateProductInput,
  UpdateProductInput,
  ListProductsParams,
  PaginatedProducts,
  buildProductKeys,
} from '../models/product';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';


const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const TABLE_NAME = process.env.TABLE_NAME!;
const DEFAULT_PAGE_SIZE = 20;


const toProduct = (item: ProductDynamoItem): Product => {
  const product = { ...item };
  delete (product as any).PK;
  delete (product as any).SK;
  delete (product as any).GSI1PK;
  delete (product as any).GSI1SK;
  return product as Product;
};



export const createProduct = async (
  input: CreateProductInput
): Promise<Product> => {
  const id = uuidv4();
  const now = new Date().toISOString();

  const item: ProductDynamoItem = {
    ...buildProductKeys(id, input.category, now),
    id,
    name: input.name,
    description: input.description,
    category: input.category,
    price: input.price,
    quantity: input.quantity,
    sku: input.sku,
    imageUrl: input.imageUrl,
    createdAt: now,
    updatedAt: now,
  };

  logger.debug('Creating product', { id, sku: input.sku });

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(PK)',
    })
  );

  logger.info('Product created', { id });
  return toProduct(item);
};



export const getProduct = async (id: string): Promise<Product> => {
  logger.debug('Getting product', { id });

  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `PRODUCT#${id}`,
        SK: 'METADATA',
      },
    })
  );

  if (!result.Item) {
    throw new NotFoundError('Product', id);
  }

  return toProduct(result.Item as ProductDynamoItem);
};


export const updateProduct = async (
  id: string,
  input: UpdateProductInput
): Promise<Product> => {
  logger.debug('Updating product', { id, fields: Object.keys(input) });

  // Build update expression dynamically
  const updateExpressions: string[] = ['#updatedAt = :updatedAt'];
  const expressionAttributeNames: Record<string, string> = {
    '#updatedAt': 'updatedAt',
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ':updatedAt': new Date().toISOString(),
  };

  // Add each field to update
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined) {
      updateExpressions.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = value;
    }
  });

  // If category is being updated, update GSI1PK as well
  if (input.category) {
    updateExpressions.push('#GSI1PK = :GSI1PK');
    expressionAttributeNames['#GSI1PK'] = 'GSI1PK';
    expressionAttributeValues[':GSI1PK'] = `CATEGORY#${input.category}`;
  }

  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `PRODUCT#${id}`,
          SK: 'METADATA',
        },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: 'attribute_exists(PK)',
        ReturnValues: 'ALL_NEW',
      })
    );

    logger.info('Product updated', { id });
    return toProduct(result.Attributes as ProductDynamoItem);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.name === 'ConditionalCheckFailedException'
    ) {
      throw new NotFoundError('Product', id);
    }
    throw error;
  }
};


export const deleteProduct = async (id: string): Promise<void> => {
  logger.debug('Deleting product', { id });

  try {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `PRODUCT#${id}`,
          SK: 'METADATA',
        },
        ConditionExpression: 'attribute_exists(PK)',
      })
    );

    logger.info('Product deleted', { id });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.name === 'ConditionalCheckFailedException'
    ) {
      throw new NotFoundError('Product', id);
    }
    throw error;
  }
};



export const listProducts = async (
  params: ListProductsParams
): Promise<PaginatedProducts> => {
  const limit = params.limit || DEFAULT_PAGE_SIZE;

  logger.debug('Listing products', { params });

  // Decode pagination token if provided
  let exclusiveStartKey: Record<string, unknown> | undefined;
  if (params.nextToken) {
    try {
      exclusiveStartKey = JSON.parse(
        Buffer.from(params.nextToken, 'base64').toString('utf-8')
      );
    } catch {
      logger.warn('Invalid pagination token');
    }
  }

  let result;

  // Use GSI query if filtering by category
  if (params.category) {
    result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :category',
        ExpressionAttributeValues: {
          ':category': `CATEGORY#${params.category}`,
        },
        Limit: limit,
        ExclusiveStartKey: exclusiveStartKey,
        ScanIndexForward: false, // Newest first
      })
    );
  } else {
    // Scan all products
    const scanParams: {
      TableName: string;
      Limit: number;
      ExclusiveStartKey?: Record<string, unknown>;
      FilterExpression?: string;
      ExpressionAttributeNames?: Record<string, string>;
      ExpressionAttributeValues?: Record<string, unknown>;
    } = {
      TableName: TABLE_NAME,
      Limit: limit,
      ExclusiveStartKey: exclusiveStartKey,
    };

    // Filter by SK to only get product items
    scanParams.FilterExpression = 'SK = :sk';
    scanParams.ExpressionAttributeValues = { ':sk': 'METADATA' };

    // Add search filter if provided
    if (params.search) {
      scanParams.FilterExpression += ' AND contains(#name, :search)';
      scanParams.ExpressionAttributeNames = { '#name': 'name' };
      scanParams.ExpressionAttributeValues[':search'] = params.search;
    }

    result = await docClient.send(new ScanCommand(scanParams));
  }

  const items = (result.Items || []).map((item) =>
    toProduct(item as ProductDynamoItem)
  );

  // Encode pagination token for next page
  let nextToken: string | undefined;
  if (result.LastEvaluatedKey) {
    nextToken = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString(
      'base64'
    );
  }

  logger.info('Products listed', { count: items.length, hasMore: !!nextToken });

  return {
    items,
    count: items.length,
    nextToken,
  };
};


export const decreaseProductQuantity = async (
  id: string,
  quantity: number
): Promise<Product> => {
  logger.debug('Decreasing product quantity', { id, quantity });

  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `PRODUCT#${id}`,
          SK: 'METADATA',
        },
        UpdateExpression:
          'SET quantity = quantity - :qty, #updatedAt = :updatedAt',
        ConditionExpression:
          'attribute_exists(PK) AND quantity >= :qty',
        ExpressionAttributeNames: {
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':qty': quantity,
          ':updatedAt': new Date().toISOString(),
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    logger.info('Product quantity decreased', { id, quantity });
    return toProduct(result.Attributes as ProductDynamoItem);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.name === 'ConditionalCheckFailedException'
    ) {
      // Could be not found OR insufficient stock
      // Try to get the product to determine which
      try {
        const product = await getProduct(id);
        // Product exists but insufficient stock
        throw new Error(
          `INSUFFICIENT_STOCK:${product.quantity}:${quantity}`
        );
      } catch (getError) {
        if (getError instanceof NotFoundError) {
          throw getError;
        }
        throw getError;
      }
    }
    throw error;
  }
};