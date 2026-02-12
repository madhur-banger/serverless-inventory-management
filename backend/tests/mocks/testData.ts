import { Product } from '../../src/models/product';
import { Order, OrderStatus, OrderItem } from '../../src/models/order';

// =============================================================================
// PRODUCT TEST DATA
// =============================================================================

export const mockProduct: Product = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Wireless Keyboard',
  description: 'Ergonomic wireless keyboard with backlight',
  category: 'electronics',
  price: 4999, // $49.99
  quantity: 100,
  sku: 'WK-001-BLK',
  imageUrl: 'https://example.com/keyboard.jpg',
  createdAt: '2024-01-15T10:30:00.000Z',
  updatedAt: '2024-01-15T10:30:00.000Z',
};

export const mockProductLowStock: Product = {
  ...mockProduct,
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'Limited Edition Mouse',
  quantity: 5,
  sku: 'LEM-001',
};

export const validCreateProductInput = {
  name: 'New Product',
  description: 'A brand new product description',
  category: 'electronics',
  price: 2999,
  quantity: 50,
  sku: 'NP-001',
  imageUrl: 'https://example.com/new-product.jpg',
};

export const validUpdateProductInput = {
  name: 'Updated Product Name',
  price: 3999,
};

export const invalidProductInputs = {
  missingName: {
    description: 'Test',
    category: 'electronics',
    price: 1000,
    quantity: 10,
    sku: 'TEST-001',
  },
  invalidCategory: {
    name: 'Test',
    description: 'Test',
    category: 'invalid-category',
    price: 1000,
    quantity: 10,
    sku: 'TEST-001',
  },
  negativePrice: {
    name: 'Test',
    description: 'Test',
    category: 'electronics',
    price: -100,
    quantity: 10,
    sku: 'TEST-001',
  },
  invalidSku: {
    name: 'Test',
    description: 'Test',
    category: 'electronics',
    price: 1000,
    quantity: 10,
    sku: 'invalid sku with spaces!',
  },
};

// =============================================================================
// ORDER TEST DATA
// =============================================================================

export const mockOrderItem: OrderItem = {
  productId: mockProduct.id,
  productName: mockProduct.name,
  quantity: 2,
  pricePerUnit: mockProduct.price,
  totalPrice: mockProduct.price * 2,
};

export const mockOrder: Order = {
  id: '660e8400-e29b-41d4-a716-446655440000',
  userId: 'user-123',
  userEmail: 'user@example.com',
  items: [mockOrderItem],
  totalAmount: mockOrderItem.totalPrice,
  status: OrderStatus.PENDING,
  createdAt: '2024-01-15T11:00:00.000Z',
  updatedAt: '2024-01-15T11:00:00.000Z',
};

export const validCreateOrderInput = {
  productId: mockProduct.id,
  quantity: 2,
};

export const invalidOrderInputs = {
  missingProductId: {
    quantity: 2,
  },
  invalidProductId: {
    productId: 'not-a-uuid',
    quantity: 2,
  },
  zeroQuantity: {
    productId: mockProduct.id,
    quantity: 0,
  },
  tooManyQuantity: {
    productId: mockProduct.id,
    quantity: 200, // Max is 100
  },
};

// =============================================================================
// API GATEWAY EVENT MOCKS
// =============================================================================

export const mockApiGatewayEvent = (overrides: Record<string, unknown> = {}) => ({
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'GET',
  isBase64Encoded: false,
  path: '/test',
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {
    accountId: '123456789',
    apiId: 'test-api',
    authorizer: {
      claims: {
        sub: 'user-123',
        email: 'user@example.com',
      },
    },
    protocol: 'HTTP/1.1',
    httpMethod: 'GET',
    identity: {
      sourceIp: '127.0.0.1',
      userAgent: 'test-agent',
    },
    path: '/test',
    stage: 'test',
    requestId: 'test-request-id',
    requestTimeEpoch: Date.now(),
    resourceId: 'test-resource',
    resourcePath: '/test',
  },
  resource: '/test',
  ...overrides,
});

export const mockSQSEvent = (messages: Record<string, unknown>[]) => ({
  Records: messages.map((msg, index) => ({
    messageId: `msg-${index}`,
    receiptHandle: `receipt-${index}`,
    body: JSON.stringify(msg),
    attributes: {
      ApproximateReceiveCount: '1',
      SentTimestamp: Date.now().toString(),
      SenderId: 'sender-123',
      ApproximateFirstReceiveTimestamp: Date.now().toString(),
    },
    messageAttributes: {},
    md5OfBody: 'md5-hash',
    eventSource: 'aws:sqs',
    eventSourceARN: 'arn:aws:sqs:us-east-1:123456789:test-queue',
    awsRegion: 'us-east-1',
  })),
});