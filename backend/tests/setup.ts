// tests/setup.ts
// Jest setup file - runs before all tests

// Set test environment variables
process.env.STAGE = 'test';
process.env.TABLE_NAME = 'test-inventory-table';
process.env.ORDER_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789/test-queue';
process.env.ORDER_TOPIC_ARN = 'arn:aws:sns:us-east-1:123456789:test-topic';
process.env.LOG_LEVEL = 'error'; // Suppress logs during tests
process.env.AWS_REGION = 'us-east-1';
process.env.CORS_ORIGIN = '*';

// Increase timeout for integration tests
jest.setTimeout(30000);