import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import {
  Order,
  OrderDynamoItem,
  OrderItem,
  OrderStatus,
  buildOrderKeys,
} from '../models/order';
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


const toOrder = (item: OrderDynamoItem): Order => {
  const order = { ...item };
  delete (order as any).PK;
  delete (order as any).SK;
  delete (order as any).GSI1PK;
  delete (order as any).GSI1SK;
  return order as Order;
};



export const createOrder = async (
  userId: string,
  userEmail: string,
  items: OrderItem[],
  totalAmount: number
): Promise<Order> => {
  const id = uuidv4();
  const now = new Date().toISOString();

  const order: OrderDynamoItem = {
    ...buildOrderKeys(id, userId, now),
    id,
    userId,
    userEmail,
    items,
    totalAmount,
    status: OrderStatus.PENDING,
    createdAt: now,
    updatedAt: now,
  };

  logger.debug('Creating order', { id, userId, totalAmount });

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: order,
    })
  );

  logger.info('Order created', { id, userId });
  return toOrder(order);
};


export const getOrder = async (id: string): Promise<Order> => {
  logger.debug('Getting order', { id });

  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `ORDER#${id}`,
        SK: 'METADATA',
      },
    })
  );

  if (!result.Item) {
    throw new NotFoundError('Order', id);
  }

  return toOrder(result.Item as OrderDynamoItem);
};


export const updateOrderStatus = async (
  id: string,
  status: OrderStatus
): Promise<Order> => {
  logger.debug('Updating order status', { id, status });

  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `ORDER#${id}`,
          SK: 'METADATA',
        },
        UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':status': status,
          ':updatedAt': new Date().toISOString(),
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    logger.info('Order status updated', { id, status });
    return toOrder(result.Attributes as OrderDynamoItem);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.name === 'ConditionalCheckFailedException'
    ) {
      throw new NotFoundError('Order', id);
    }
    throw error;
  }
};


export const listUserOrders = async (
  userId: string,
  params: {
    status?: OrderStatus;
    limit?: number;
    nextToken?: string;
  } = {}
): Promise<{
  items: Order[];
  count: number;
  nextToken?: string;
}> => {
  const limit = params.limit || DEFAULT_PAGE_SIZE;

  logger.debug('Listing user orders', { userId, params });

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

  // Build query
  const queryParams: {
    TableName: string;
    IndexName: string;
    KeyConditionExpression: string;
    ExpressionAttributeValues: Record<string, unknown>;
    FilterExpression?: string;
    ExpressionAttributeNames?: Record<string, string>;
    Limit: number;
    ExclusiveStartKey?: Record<string, unknown>;
    ScanIndexForward: boolean;
  } = {
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :userId',
    ExpressionAttributeValues: {
      ':userId': `USER#${userId}`,
    },
    Limit: limit,
    ExclusiveStartKey: exclusiveStartKey,
    ScanIndexForward: false, // Newest first
  };

  // Add status filter if provided
  if (params.status) {
    queryParams.FilterExpression = '#status = :status';
    queryParams.ExpressionAttributeNames = { '#status': 'status' };
    queryParams.ExpressionAttributeValues[':status'] = params.status;
  }

  const result = await docClient.send(new QueryCommand(queryParams));

  const items = (result.Items || []).map((item) =>
    toOrder(item as OrderDynamoItem)
  );

  // Encode pagination token for next page
  let nextToken: string | undefined;
  if (result.LastEvaluatedKey) {
    nextToken = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString(
      'base64'
    );
  }

  logger.info('User orders listed', {
    userId,
    count: items.length,
    hasMore: !!nextToken,
  });

  return {
    items,
    count: items.length,
    nextToken,
  };
};


export const getOrderForUser = async (
  orderId: string,
  userId: string
): Promise<Order> => {
  const order = await getOrder(orderId);

  if (order.userId !== userId) {
    throw new NotFoundError('Order', orderId);
  }

  return order;
};