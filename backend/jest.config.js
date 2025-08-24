module.exports = {
  testEnvironment: 'node',
  // Only look for test files outside ignored folders
  testMatch: ['**/?(*.)+(spec|test).js'],
  
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!server.js',
    '!**/__tests__/**' // Ignore __tests__ for coverage
  ],

  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },

  setupFilesAfterEnv: [], // Removed __tests__/setup.js if you want to ignore __tests__ entirely
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
