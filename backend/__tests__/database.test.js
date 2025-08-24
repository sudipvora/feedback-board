// __tests__/database.test.js
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn()
}));

const mysql = require('mysql2/promise');

// Preserve original console
const originalLog = console.log;
const originalError = console.error;

describe('Database Module', () => {
  let mockConnection;
  let mockPool;
  let database;

  const loadDatabase = () => {
    jest.resetModules();
    const mysql2 = require('mysql2/promise');
    mysql2.createPool.mockReturnValue(mockPool); // ensure return value before require
    return require('../config/database');
  };

  beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();

    mockConnection = {
      query: jest.fn(),
      execute: jest.fn(),
      release: jest.fn()
    };

    mockPool = {
      getConnection: jest.fn().mockResolvedValue(mockConnection)
    };

    database = loadDatabase();
  });

  afterEach(() => {
    console.log = originalLog;
    console.error = originalError;
    delete global.dbPool;
    jest.clearAllMocks();
  });

  describe('initializeDatabase', () => {
    it('should initialize database successfully', async () => {
      mockConnection.query.mockResolvedValue([{}]);
      mockConnection.execute.mockResolvedValue([{}]);

      const result = await database.initializeDatabase();

      expect(result).toBe(true);
      expect(mockPool.getConnection).toHaveBeenCalled(); // check pool actually used
      expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS feedback')
      );
      expect(console.log).toHaveBeenCalledWith('✅ Database connection established');
      expect(console.log).toHaveBeenCalledWith('✅ Database created/verified');
      expect(console.log).toHaveBeenCalledWith('✅ Feedback table created/verified');
      expect(global.dbPool).toBeDefined();
    });

    it('should handle index creation when they already exist', async () => {
      mockConnection.query.mockResolvedValue([{}]);
      mockConnection.execute
        .mockResolvedValueOnce([{}]) // table creation
        .mockRejectedValueOnce({ code: 'ER_DUP_KEYNAME' }) // rating index
        .mockRejectedValueOnce({ code: 'ER_DUP_KEYNAME' }); // created_at index

      const result = await database.initializeDatabase();
      expect(result).toBe(true); // function completes successfully
    });

    it('should log warning when non-duplicate index error occurs', async () => {
      mockConnection.query.mockResolvedValue([{}]);
      mockConnection.execute
        .mockResolvedValueOnce([{}]) // table creation
        .mockRejectedValueOnce({ code: 'SOME_ERROR', message: 'Bad index' })
        .mockRejectedValueOnce({ code: 'SOME_ERROR', message: 'Bad index' });

      const result = await database.initializeDatabase();

      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        '⚠️ Rating index creation skipped:',
        'Bad index'
      );
      expect(console.log).toHaveBeenCalledWith(
        '⚠️ Created_at index creation skipped:',
        'Bad index'
      );
    });

    it('should throw error when initial connection fails', async () => {
      mockPool.getConnection.mockRejectedValueOnce(new Error('Connection failed'));

      await expect(database.initializeDatabase()).rejects.toThrow('Connection failed');
      expect(console.error).toHaveBeenCalledWith(
        '❌ Database initialization failed:',
        expect.any(Error)
      );
    });

    it('should throw error when table creation fails', async () => {
      mockConnection.query.mockResolvedValue([{}]);
      mockConnection.execute.mockRejectedValueOnce(new Error('Table creation failed'));

      await expect(database.initializeDatabase()).rejects.toThrow('Table creation failed');
    });

    it('should log error when index creation fails unexpectedly', async () => {
      mockConnection.query.mockResolvedValue([{}]);
      mockConnection.execute
        .mockResolvedValueOnce([{}]) // table creation
        .mockRejectedValueOnce(new Error('Index creation failed')); // index creation

      const result = await database.initializeDatabase();

      expect(result).toBe(true);
    });
    it('should handle index creation when they already exist', async () => {
      mockConnection.query.mockResolvedValue([{}]);
      mockConnection.execute
        .mockResolvedValueOnce([{}]) // table creation
        .mockRejectedValueOnce({ code: 'ER_DUP_KEYNAME' }) // rating index
        .mockRejectedValueOnce({ code: 'ER_DUP_KEYNAME' }); // created_at index

      const result = await database.initializeDatabase();

      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith('✅ Rating index already exists');
      expect(console.log).toHaveBeenCalledWith('✅ Created_at index already exists');
    });
  });

  describe('getPool', () => {
    it('should return global pool if defined', () => {
      global.dbPool = mockPool;
      expect(database.getPool()).toBe(mockPool);
    });

    it('should return initial pool if global pool is undefined', () => {
      expect(database.getPool()).toBe(mockPool);
    });
  });

  describe('Environment Configuration', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      process.env = { ...OLD_ENV };
      jest.resetModules();
    });

    afterEach(() => {
      process.env = OLD_ENV;
    });

    it('should use default values when env vars not set', () => {
      const mysql2 = require('mysql2/promise');
      mysql2.createPool.mockReturnValue({});

      const db = require('../config/database');

      expect(mysql2.createPool).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'localhost',
          user: 'root',
          password: '',
          port: 3306, // <-- number, not string
          database: undefined,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0
        })
      );

      expect(db).toBeDefined();
    });

    it('should use environment variables when set', () => {
      process.env.DB_HOST = 'test-host';
      process.env.DB_USER = 'test-user';
      process.env.DB_PASSWORD = 'test-password';
      process.env.DB_NAME = 'test-db';
      process.env.DB_PORT = '3307';

      const mysql2 = require('mysql2/promise');
      mysql2.createPool.mockReturnValue({});
      const db = require('../config/database');

      expect(mysql2.createPool).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'test-host',
          user: 'test-user',
          password: 'test-password',
          port: '3307',
          database: undefined,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0
        })
      );
      expect(db).toBeDefined();
    });
  });
});
