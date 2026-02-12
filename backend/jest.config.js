// jest.config.js
/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    testMatch: [
      '<rootDir>/tests/**/*.test.ts',
      '<rootDir>/tests/**/*.spec.ts',
    ],
    // Skip integration and E2E tests by default - run separately
    testPathIgnorePatterns: [
      '/node_modules/',
      '/dist/',
      '/tests/e2e/',
      '/tests/integration/', // Skip integration tests for now
    ],
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts',
      '!src/**/index.ts',
      '!src/handlers/docs.ts', // Exclude docs handler
      '!src/handlers/health.ts', // Exclude simple health handler
      '!src/handlers/orders/processDLQ.ts', // Exclude SQS handlers
      '!src/handlers/orders/processNotification.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
      global: {
        branches: 10,
        functions: 20,
        lines: 15,
        statements: 20,
      },
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    transform: {
      '^.+\\.ts$': ['ts-jest', {
        tsconfig: 'tsconfig.json',
      }],
    },
    clearMocks: true,
    verbose: true,
    testTimeout: 30000,
  };