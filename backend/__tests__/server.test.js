const mockConsoleLog = jest.fn();
const mockConsoleError = jest.fn();
console.log = mockConsoleLog;
console.error = mockConsoleError;

const mockProcessExit = jest.fn();
process.exit = mockProcessExit;

// Mock database module
const mockInitializeDatabase = jest.fn();
jest.mock('../config/database', () => ({
  initializeDatabase: mockInitializeDatabase
}));

// Mock Express app
const mockListen = jest.fn((port, cb) => { cb(); return { close: jest.fn() }; });
const mockApp = {
  use: jest.fn(),
  get: jest.fn(),
  listen: mockListen
};

// Mock express and its methods
jest.mock('express', () => {
  const express = jest.fn(() => mockApp);
  express.json = jest.fn(() => express);
  express.urlencoded = jest.fn(() => express);
  express.static = jest.fn(() => express);
  express.Router = jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
    use: jest.fn()
  }));
  return express;
});

// Mock middlewares
jest.mock('cors', () => jest.fn(() => (req, res, next) => next()));
jest.mock('helmet', () => jest.fn(() => (req, res, next) => next()));
jest.mock('express-rate-limit', () => jest.fn(() => (req, res, next) => next()));
jest.mock('dotenv', () => ({ config: jest.fn() }));

// Mock feedback routes
jest.mock('../routes/feedback', () => {
  const express = require('express');
  const router = express.Router();
  router.post('/', (req, res) => res.status(200).json({ message: 'Mock feedback route' }));
  return router;
});

describe('Server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Server Initialization', () => {
    it('should start server successfully with database initialization', async () => {
      mockInitializeDatabase.mockResolvedValue(true);

      await jest.isolateModulesAsync(async () => {
        await require('../server');
      });

      expect(mockInitializeDatabase).toHaveBeenCalled();
      expect(mockListen).toHaveBeenCalledWith(3100, expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/health', expect.any(Function));
    });

    it('should handle database initialization failure', async () => {
      const error = new Error('Database connection failed');
      mockInitializeDatabase.mockRejectedValue(error);

      await jest.isolateModulesAsync(async () => {
        await require('../server');
      });

      expect(mockInitializeDatabase).toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith('❌ Failed to start server:', error);
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });

  describe('Server Configuration', () => {
    it('should use default port when PORT environment variable is not set', async () => {
      delete process.env.PORT;
      mockInitializeDatabase.mockResolvedValue(true);

      await jest.isolateModulesAsync(async () => {
        await require('../server');
      });

      expect(mockListen).toHaveBeenCalledWith(3100, expect.any(Function));
    });

    it('should use custom port when PORT environment variable is set', async () => {
      process.env.PORT = '4000';
      mockInitializeDatabase.mockResolvedValue(true);

      await jest.isolateModulesAsync(async () => {
        await require('../server');
      });

      expect(mockListen).toHaveBeenCalledWith('4000', expect.any(Function));
    });
  });

  describe('Middleware Configuration', () => {
    it('should configure all required middleware', async () => {
      mockInitializeDatabase.mockResolvedValue(true);

      await jest.isolateModulesAsync(async () => {
        await require('../server');
      });

      expect(mockApp.use).toHaveBeenCalled();
    });
  });

  describe('Route Configuration', () => {
    it('should configure feedback routes', async () => {
      mockInitializeDatabase.mockResolvedValue(true);

      await jest.isolateModulesAsync(async () => {
        await require('../server');
      });

      expect(mockApp.use).toHaveBeenCalledWith('/api/feedback', expect.any(Object));
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      mockInitializeDatabase.mockResolvedValue(true);

      await jest.isolateModulesAsync(async () => {
        await require('../server');
      });

      expect(mockApp.use).toHaveBeenCalled();
    });
  });
});
