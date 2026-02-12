// tests/integration/productApi.test.ts
// Integration tests for Product API endpoints

import { APIGatewayProxyResult } from 'aws-lambda';
import { mockApiGatewayEvent } from '../mocks/testData';

// Mock DynamoDB before importing handlers
jest.mock('@aws-sdk/lib-dynamodb', () => {
  const mockSend = jest.fn();
  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: mockSend,
      })),
    },
    PutCommand: jest.fn((params) => ({ type: 'Put', params })),
    GetCommand: jest.fn((params) => ({ type: 'Get', params })),
    UpdateCommand: jest.fn((params) => ({ type: 'Update', params })),
    DeleteCommand: jest.fn((params) => ({ type: 'Delete', params })),
    ScanCommand: jest.fn((params) => ({ type: 'Scan', params })),
    QueryCommand: jest.fn((params) => ({ type: 'Query', params })),
    __mockSend: mockSend,
  };
});

// Import handlers after mocking
import { handler as createHandler } from '../../src/handlers/products/create';
import { handler as getHandler } from '../../src/handlers/products/get';
import { handler as listHandler } from '../../src/handlers/products/list';
import { handler as updateHandler } from '../../src/handlers/products/update';
import { handler as deleteHandler } from '../../src/handlers/products/delete';

const { __mockSend: mockDynamoSend } = jest.requireMock('@aws-sdk/lib-dynamodb');

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

describe('Product API Integration Tests', () => {
  const mockProduct = {
    PK: 'PRODUCT#test-id-123',
    SK: 'METADATA',
    GSI1PK: 'CATEGORY#electronics',
    GSI1SK: '2024-01-15T10:00:00.000Z',
    id: 'test-id-123',
    name: 'Test Product',
    description: 'Test description',
    category: 'electronics',
    price: 2999,
    quantity: 50,
    sku: 'TEST-001',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // CREATE PRODUCT
  // ===========================================================================
  describe('POST /products', () => {
    it('should create product and return 201', async () => {
      mockDynamoSend.mockResolvedValueOnce({});

      const event = mockApiGatewayEvent({
        httpMethod: 'POST',
        path: '/products',
        body: JSON.stringify({
          name: 'New Product',
          description: 'New product description',
          category: 'electronics',
          price: 2999,
          quantity: 50,
          sku: 'NP-001',
        }),
      });

      const response = await invokeHandler(createHandler, event);

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data.name).toBe('New Product');
    });

    it('should return 400 for invalid input', async () => {
      const event = mockApiGatewayEvent({
        httpMethod: 'POST',
        path: '/products',
        body: JSON.stringify({
          name: '', // Invalid: empty name
          category: 'invalid', // Invalid category
        }),
      });

      const response = await invokeHandler(createHandler, event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ===========================================================================
  // GET PRODUCT
  // ===========================================================================
  describe('GET /products/{id}', () => {
    it('should return product by ID', async () => {
      mockDynamoSend.mockResolvedValueOnce({ Item: mockProduct });

      const event = mockApiGatewayEvent({
        httpMethod: 'GET',
        path: '/products/550e8400-e29b-41d4-a716-446655440000',
        pathParameters: { id: '550e8400-e29b-41d4-a716-446655440000' },
      });

      const response = await invokeHandler(getHandler, event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('lowStock');
    });

    it('should return 404 for non-existent product', async () => {
      mockDynamoSend.mockResolvedValueOnce({ Item: null });

      const event = mockApiGatewayEvent({
        httpMethod: 'GET',
        path: '/products/550e8400-e29b-41d4-a716-446655440099',
        pathParameters: { id: '550e8400-e29b-41d4-a716-446655440099' },
      });

      const response = await invokeHandler(getHandler, event);

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid UUID', async () => {
      const event = mockApiGatewayEvent({
        httpMethod: 'GET',
        path: '/products/invalid-id',
        pathParameters: { id: 'invalid-id' },
      });

      const response = await invokeHandler(getHandler, event);

      expect(response.statusCode).toBe(400);
    });
  });

  // ===========================================================================
  // LIST PRODUCTS
  // ===========================================================================
  describe('GET /products', () => {
    it('should return list of products', async () => {
      mockDynamoSend.mockResolvedValueOnce({
        Items: [mockProduct],
        LastEvaluatedKey: null,
      });

      const event = mockApiGatewayEvent({
        httpMethod: 'GET',
        path: '/products',
      });

      const response = await invokeHandler(listHandler, event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.items).toHaveLength(1);
      expect(body.data.count).toBe(1);
    });

    it('should filter by category', async () => {
      mockDynamoSend.mockResolvedValueOnce({
        Items: [mockProduct],
        LastEvaluatedKey: null,
      });

      const event = mockApiGatewayEvent({
        httpMethod: 'GET',
        path: '/products',
        queryStringParameters: { category: 'electronics' },
      });

      const response = await invokeHandler(listHandler, event);

      expect(response.statusCode).toBe(200);
    });

    it('should handle pagination', async () => {
      mockDynamoSend.mockResolvedValueOnce({
        Items: [mockProduct],
        LastEvaluatedKey: { PK: 'PRODUCT#123', SK: 'METADATA' },
      });

      const event = mockApiGatewayEvent({
        httpMethod: 'GET',
        path: '/products',
        queryStringParameters: { limit: '1' },
      });

      const response = await invokeHandler(listHandler, event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.nextToken).toBeDefined();
    });
  });

  // ===========================================================================
  // UPDATE PRODUCT
  // ===========================================================================
  describe('PUT /products/{id}', () => {
    it('should update product', async () => {
      const updatedProduct = { ...mockProduct, name: 'Updated Name', price: 3999 };
      mockDynamoSend.mockResolvedValueOnce({ Attributes: updatedProduct });

      const event = mockApiGatewayEvent({
        httpMethod: 'PUT',
        path: '/products/550e8400-e29b-41d4-a716-446655440000',
        pathParameters: { id: '550e8400-e29b-41d4-a716-446655440000' },
        body: JSON.stringify({ name: 'Updated Name', price: 3999 }),
      });

      const response = await invokeHandler(updateHandler, event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.name).toBe('Updated Name');
    });

    it('should return 400 for empty update', async () => {
      const event = mockApiGatewayEvent({
        httpMethod: 'PUT',
        path: '/products/550e8400-e29b-41d4-a716-446655440000',
        pathParameters: { id: '550e8400-e29b-41d4-a716-446655440000' },
        body: JSON.stringify({}),
      });

      const response = await invokeHandler(updateHandler, event);

      expect(response.statusCode).toBe(400);
    });
  });

  // ===========================================================================
  // DELETE PRODUCT
  // ===========================================================================
  describe('DELETE /products/{id}', () => {
    it('should delete product and return 204', async () => {
      mockDynamoSend.mockResolvedValueOnce({});

      const event = mockApiGatewayEvent({
        httpMethod: 'DELETE',
        path: '/products/550e8400-e29b-41d4-a716-446655440000',
        pathParameters: { id: '550e8400-e29b-41d4-a716-446655440000' },
      });

      const response = await invokeHandler(deleteHandler, event);

      expect(response.statusCode).toBe(204);
    });
  });
});