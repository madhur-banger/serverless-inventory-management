/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    
    // Root directory
    rootDir: '.',
    
    // Test file patterns
    testMatch: [
      '<rootDir>/tests/**/*.test.ts',
      '<rootDir>/tests/**/*.spec.ts',
    ],
    
    // Coverage configuration
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts',
      '!src/**/index.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    
    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    
    // Transform
    transform: {
      '^.+\\.ts$': ['ts-jest', {
        tsconfig: 'tsconfig.json',
      }],
    },
    
    // Ignore patterns
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    
    // Clear mocks
    clearMocks: true,
    
    // Verbose output
    verbose: true,
    
    // Timeout
    testTimeout: 10000,
  };