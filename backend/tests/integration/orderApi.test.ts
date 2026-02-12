// tests/integration/orderApi.test.ts
// Integration tests for Order API endpoints

import { APIGatewayProxyResult } from 'aws-lambda';
import { mockApiGatewayEvent, mockProduct, mockOrder } from '../mocks/testData';

// Store mock functions
const mockDynamoSend = jest.fn();
const mockSqsSend = jest.fn().mockResolvedValue({});

// Mock DynamoDB Client
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(() => ({})),
}));

// Mock DynamoDB Document Client
jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({
      send: mockDynamoSend,
    })),
  },
  PutCommand: jest.fn((params) => ({ type: 'Put', params })),
  GetCommand: jest.fn((params) => ({ type: 'Get', params })),
  UpdateCommand: jest.fn((params) => ({ type: 'Update', params })),
  QueryCommand: jest.fn((params) => ({ type: 'Query', params })),
}));

// Mock SQS
jest.mock('@aws-sdk/client-sqs', () => ({
  SQSClient: jest.fn(() => ({
    send: mockSqsSend,
  })),
  SendMessageCommand: jest.fn((params) => ({ type: 'SendMessage', params })),
}));

// Import handlers after mocking
import { handler as createOrderHandler } from '../../src/handlers/orders/create';
import { handler as getOrderHandler } from '../../src/handlers/orders/get';
import { handler as listOrdersHandler } from '../../src/handlers/orders/list';

// Helper to invoke Middy-wrapped handlers
const invokeHandler = async (
  handler: any,
  event: any
): Promise<APIGatewayProxyResult> => {
  const result = await handler(event, {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'test',
    functionVersion: '1',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789:function:test',
    memoryLimitInMB: '256',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/test',
    logStreamName: 'test-stream',
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  });
  return result as APIGatewayProxyResult;
};

describe('Order API Integration Tests', () => {
  // Mock product in DynamoDB format
  const mockProductDynamo = {
    PK: `PRODUCT#${mockProduct.id}`,
    SK: 'METADATA',
    GSI1PK: `CATEGORY#${mockProduct.category}`,
    GSI1SK: mockProduct.createdAt,
    id: mockProduct.id,
    name: mockProduct.name,
    description: mockProduct.description,
    category: mockProduct.category,
    price: mockProduct.price,
    quantity: mockProduct.quantity,
    sku: mockProduct.sku,
    imageUrl: mockProduct.imageUrl,
    createdAt: mockProduct.createdAt,
    updatedAt: mockProduct.updatedAt,
  };

  // Mock order in DynamoDB format - userId MUST match the auth user 'user-123'
  const mockOrderDynamo = {
    PK: `ORDER#${mockOrder.id}`,
    SK: 'METADATA',
    GSI1PK: `USER#user-123`, // Must match auth user
    GSI1SK: mockOrder.createdAt,
    id: mockOrder.id,
    userId: 'user-123', // Must match auth user from mockApiGatewayEvent
    userEmail: 'user@example.com',
    items: mockOrder.items,
    totalAmount: mockOrder.totalAmount,
    status: mockOrder.status,
    createdAt: mockOrder.createdAt,
    updatedAt: mockOrder.updatedAt,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDynamoSend.mockReset();
    mockSqsSend.mockReset();
    mockSqsSend.mockResolvedValue({});
  });

  // ===========================================================================
  // CREATE ORDER (PURCHASE)
  // ===========================================================================
  describe('POST /orders', () => {
    it('should create order successfully', async () => {
      // Mock sequence:
      // 1. Get product (productRepository.getProduct)
      // 2. Decrease stock (productRepository.decreaseProductQuantity)
      // 3. Create order (orderRepository.createOrder)
      mockDynamoSend
        .mockResolvedValueOnce({ Item: mockProductDynamo }) // Get product
        .mockResolvedValueOnce({ Attributes: { ...mockProductDynamo, quantity: 98 } }) // Decrease stock
        .mockResolvedValueOnce({}); // Create order

      const event = mockApiGatewayEvent({
        httpMethod: 'POST',
        path: '/orders',
        body: JSON.stringify({
          productId: mockProduct.id,
          quantity: 2,
        }),
      });

      const response = await invokeHandler(createOrderHandler, event);

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data.status).toBe('PENDING');
      expect(body.data.items[0].quantity).toBe(2);

      // Verify SQS was called
      expect(mockSqsSend).toHaveBeenCalled();
    });

    it('should return 401 without auth token', async () => {
      const event = mockApiGatewayEvent({
        httpMethod: 'POST',
        path: '/orders',
        body: JSON.stringify({
          productId: mockProduct.id,
          quantity: 2,
        }),
      });

      // Override requestContext to remove authorizer claims
      event.requestContext = {
        ...event.requestContext,
        authorizer: {
          claims: null,
        },
      } as any;

      const response = await invokeHandler(createOrderHandler, event);

      expect(response.statusCode).toBe(401);
    });

    it('should return 400 for invalid quantity', async () => {
      const event = mockApiGatewayEvent({
        httpMethod: 'POST',
        path: '/orders',
        body: JSON.stringify({
          productId: mockProduct.id,
          quantity: 0, // Invalid: must be >= 1
        }),
      });

      const response = await invokeHandler(createOrderHandler, event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent product', async () => {
      // Mock: Get product returns null
      mockDynamoSend.mockResolvedValueOnce({ Item: undefined });

      const event = mockApiGatewayEvent({
        httpMethod: 'POST',
        path: '/orders',
        body: JSON.stringify({
          productId: '550e8400-e29b-41d4-a716-446655440099',
          quantity: 2,
        }),
      });

      const response = await invokeHandler(createOrderHandler, event);

      expect(response.statusCode).toBe(404);
    });
  });

  // ===========================================================================
  // GET ORDER
  // ===========================================================================
  describe('GET /orders/{id}', () => {
    it('should return order for owner', async () => {
      // Mock: Get order
      mockDynamoSend.mockResolvedValueOnce({ Item: mockOrderDynamo });

      const event = mockApiGatewayEvent({
        httpMethod: 'GET',
        path: `/orders/${mockOrder.id}`,
        pathParameters: { id: mockOrder.id },
      });

      const response = await invokeHandler(getOrderHandler, event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.id).toBe(mockOrder.id);
    });

    it('should return 404 for other users order', async () => {
      const otherUserOrder = {
        ...mockOrderDynamo,
        userId: 'other-user-id', // Different user than 'user-123'
        GSI1PK: 'USER#other-user-id',
      };
      mockDynamoSend.mockResolvedValueOnce({ Item: otherUserOrder });

      const event = mockApiGatewayEvent({
        httpMethod: 'GET',
        path: `/orders/${mockOrder.id}`,
        pathParameters: { id: mockOrder.id },
      });

      const response = await invokeHandler(getOrderHandler, event);

      expect(response.statusCode).toBe(404);
    });

    it('should return 404 for non-existent order', async () => {
      mockDynamoSend.mockResolvedValueOnce({ Item: undefined });

      const event = mockApiGatewayEvent({
        httpMethod: 'GET',
        path: `/orders/550e8400-e29b-41d4-a716-446655440099`,
        pathParameters: { id: '550e8400-e29b-41d4-a716-446655440099' },
      });

      const response = await invokeHandler(getOrderHandler, event);

      expect(response.statusCode).toBe(404);
    });
  });

  // ===========================================================================
  // LIST ORDERS
  // ===========================================================================
  describe('GET /orders', () => {
    it('should return user orders', async () => {
      // Mock: Query returns orders
      mockDynamoSend.mockResolvedValueOnce({
        Items: [mockOrderDynamo],
        LastEvaluatedKey: undefined,
      });

      const event = mockApiGatewayEvent({
        httpMethod: 'GET',
        path: '/orders',
      });

      const response = await invokeHandler(listOrdersHandler, event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.items).toHaveLength(1);
      expect(body.data.count).toBe(1);
    });

    it('should return empty list when no orders', async () => {
      mockDynamoSend.mockResolvedValueOnce({
        Items: [],
        LastEvaluatedKey: undefined,
      });

      const event = mockApiGatewayEvent({
        httpMethod: 'GET',
        path: '/orders',
      });

      const response = await invokeHandler(listOrdersHandler, event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.items).toHaveLength(0);
    });

    it('should filter by status', async () => {
      mockDynamoSend.mockResolvedValueOnce({
        Items: [mockOrderDynamo],
        LastEvaluatedKey: undefined,
      });

      const event = mockApiGatewayEvent({
        httpMethod: 'GET',
        path: '/orders',
        queryStringParameters: { status: 'PENDING' },
      });

      const response = await invokeHandler(listOrdersHandler, event);

      expect(response.statusCode).toBe(200);
    });
  });
});