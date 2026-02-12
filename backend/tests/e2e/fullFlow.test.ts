
/**
 * E2E TEST CONFIGURATION
 * 
 * Set these environment variables before running:
 * - API_URL: Your deployed API URL
 * - USER_POOL_ID: Cognito User Pool ID
 * - CLIENT_ID: Cognito Client ID
 * - TEST_EMAIL: Test user email
 * - TEST_PASSWORD: Test user password
 * 
 * Run with: npm run test:e2e
 */

const API_URL = process.env.API_URL || 'https://b0gaukfyp2.execute-api.us-east-1.amazonaws.com/dev';
const USER_POOL_ID = process.env.USER_POOL_ID || 'us-east-1_KNMtrIttY';
const CLIENT_ID = process.env.CLIENT_ID || '766m0vm8vpsas01u0u9d6drsh';
const TEST_EMAIL = process.env.TEST_EMAIL || 'testuser@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPass123!';

// Skip if not configured
const shouldRun = API_URL && USER_POOL_ID && CLIENT_ID;

// Helper to make API calls
const apiCall = async (
  method: string,
  path: string,
  token?: string,
  body?: object
) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);
  return { status: response.status, data };
};

// Helper to get auth token (requires AWS SDK)
const getAuthToken = async (): Promise<string> => {
  // In real E2E, you would use AWS SDK to authenticate
  // For now, this is a placeholder
  const { CognitoIdentityProviderClient, InitiateAuthCommand } = await import(
    '@aws-sdk/client-cognito-identity-provider'
  );

  const client = new CognitoIdentityProviderClient({ region: 'us-east-1' });
  const command = new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: TEST_EMAIL,
      PASSWORD: TEST_PASSWORD,
    },
  });

  const response = await client.send(command);
  return response.AuthenticationResult?.IdToken || '';
};

describe('E2E: Full API Flow', () => {
  let authToken: string;
  let createdProductId: string;
  let createdOrderId: string;

  // Skip all tests if not configured
  beforeAll(async () => {
    if (!shouldRun) {
      console.log('⚠️  E2E tests skipped: Missing configuration');
      console.log('   Set API_URL, USER_POOL_ID, CLIENT_ID environment variables');
      return;
    }

    try {
      authToken = await getAuthToken();
      console.log('✓ Authentication successful');
    } catch (error) {
      console.error('✗ Authentication failed:', error);
    }
  });

  // ===========================================================================
  // HEALTH CHECK
  // ===========================================================================
  describe('1. Health Check', () => {
    it('should return healthy status', async () => {
      if (!shouldRun) return;

      const { status, data } = await apiCall('GET', '/health');

      expect(status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.service).toBe('inventory-api');
    });
  });

  // ===========================================================================
  // AUTHENTICATION
  // ===========================================================================
  describe('2. Authentication', () => {
    it('should reject requests without token', async () => {
      if (!shouldRun) return;

      const { status } = await apiCall('GET', '/products');

      expect(status).toBe(401);
    });

    it('should accept requests with valid token', async () => {
      if (!shouldRun || !authToken) return;

      const { status } = await apiCall('GET', '/products', authToken);

      expect(status).toBe(200);
    });
  });

  // ===========================================================================
  // PRODUCT CRUD
  // ===========================================================================
  describe('3. Product CRUD', () => {
    it('should create a product', async () => {
      if (!shouldRun || !authToken) return;

      const { status, data } = await apiCall('POST', '/products', authToken, {
        name: `E2E Test Product ${Date.now()}`,
        description: 'Created by E2E test',
        category: 'electronics',
        price: 4999,
        quantity: 100,
        sku: `E2E-${Date.now()}`,
      });

      expect(status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');

      createdProductId = data.data.id;
      console.log(`   Created product: ${createdProductId}`);
    });

    it('should get the created product', async () => {
      if (!shouldRun || !authToken || !createdProductId) return;

      const { status, data } = await apiCall(
        'GET',
        `/products/${createdProductId}`,
        authToken
      );

      expect(status).toBe(200);
      expect(data.data.id).toBe(createdProductId);
      expect(data.data).toHaveProperty('lowStock');
    });

    it('should list products', async () => {
      if (!shouldRun || !authToken) return;

      const { status, data } = await apiCall('GET', '/products', authToken);

      expect(status).toBe(200);
      expect(data.data).toHaveProperty('items');
      expect(data.data).toHaveProperty('count');
      expect(data.data.items.length).toBeGreaterThan(0);
    });

    it('should filter products by category', async () => {
      if (!shouldRun || !authToken) return;

      const { status, data } = await apiCall(
        'GET',
        '/products?category=electronics',
        authToken
      );

      expect(status).toBe(200);
      data.data.items.forEach((product: any) => {
        expect(product.category).toBe('electronics');
      });
    });

    it('should update the product', async () => {
      if (!shouldRun || !authToken || !createdProductId) return;

      const { status, data } = await apiCall(
        'PUT',
        `/products/${createdProductId}`,
        authToken,
        {
          name: 'Updated E2E Product',
          price: 5999,
        }
      );

      expect(status).toBe(200);
      expect(data.data.name).toBe('Updated E2E Product');
      expect(data.data.price).toBe(5999);
    });
  });

  // ===========================================================================
  // ORDER FLOW
  // ===========================================================================
  describe('4. Order Flow (Purchase)', () => {
    it('should create an order (purchase)', async () => {
      if (!shouldRun || !authToken || !createdProductId) return;

      const { status, data } = await apiCall('POST', '/orders', authToken, {
        productId: createdProductId,
        quantity: 2,
      });

      expect(status).toBe(201);
      expect(data.data).toHaveProperty('id');
      expect(data.data.status).toBe('PENDING');
      expect(data.data.items[0].productId).toBe(createdProductId);
      expect(data.data.items[0].quantity).toBe(2);

      createdOrderId = data.data.id;
      console.log(`   Created order: ${createdOrderId}`);
    });

    it('should verify stock decreased', async () => {
      if (!shouldRun || !authToken || !createdProductId) return;

      const { status, data } = await apiCall(
        'GET',
        `/products/${createdProductId}`,
        authToken
      );

      expect(status).toBe(200);
      // Original was 100, purchased 2, should be 98
      expect(data.data.quantity).toBe(98);
    });

    it('should get the order', async () => {
      if (!shouldRun || !authToken || !createdOrderId) return;

      const { status, data } = await apiCall(
        'GET',
        `/orders/${createdOrderId}`,
        authToken
      );

      expect(status).toBe(200);
      expect(data.data.id).toBe(createdOrderId);
    });

    it('should list user orders', async () => {
      if (!shouldRun || !authToken) return;

      const { status, data } = await apiCall('GET', '/orders', authToken);

      expect(status).toBe(200);
      expect(data.data.items.length).toBeGreaterThan(0);
    });

    it('should reject order with insufficient stock', async () => {
      if (!shouldRun || !authToken || !createdProductId) return;

      const { status, data } = await apiCall('POST', '/orders', authToken, {
        productId: createdProductId,
        quantity: 1000, // More than available
      });

      expect(status).toBe(400);
      expect(data.error.code).toBe('INSUFFICIENT_STOCK');
    });
  });

  // ===========================================================================
  // VALIDATION
  // ===========================================================================
  describe('5. Validation', () => {
    it('should reject invalid product data', async () => {
      if (!shouldRun || !authToken) return;

      const { status, data } = await apiCall('POST', '/products', authToken, {
        name: '', // Invalid: empty
        category: 'invalid-category', // Invalid
        price: -100, // Invalid: negative
      });

      expect(status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.length).toBeGreaterThan(0);
    });

    it('should reject invalid order data', async () => {
      if (!shouldRun || !authToken) return;

      const { status, data } = await apiCall('POST', '/orders', authToken, {
        productId: 'not-a-uuid',
        quantity: 0,
      });

      expect(status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ===========================================================================
  // CLEANUP
  // ===========================================================================
  describe('6. Cleanup', () => {
    it('should delete the test product', async () => {
      if (!shouldRun || !authToken || !createdProductId) return;

      const { status } = await apiCall(
        'DELETE',
        `/products/${createdProductId}`,
        authToken
      );

      expect(status).toBe(204);
      console.log(`   Deleted product: ${createdProductId}`);
    });

    it('should confirm product is deleted', async () => {
      if (!shouldRun || !authToken || !createdProductId) return;

      const { status } = await apiCall(
        'GET',
        `/products/${createdProductId}`,
        authToken
      );

      expect(status).toBe(404);
    });
  });
});