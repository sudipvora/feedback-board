const request = require('supertest');
const express = require('express');

// Mock the database module
jest.mock('../config/database', () => ({
  getPool: jest.fn()
}));

const { getPool } = require('../config/database');
const feedbackRoutes = require('../routes/feedback');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/feedback', feedbackRoutes);

describe('Feedback Routes', () => {
  let mockPool;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock pool
    mockPool = {
      execute: jest.fn(),
      release: jest.fn()
    };

    getPool.mockReturnValue(mockPool);
  });

  describe('POST /api/feedback', () => {
    const validFeedback = {
      name: 'John Doe',
      message: 'Great product! This is a wonderful service.',
      rating: 5
    };

    it('should successfully create feedback', async () => {
      // Mock successful database operations
      mockPool.execute
        .mockResolvedValueOnce([{ insertId: 1 }, []]) // INSERT returns [result, fields]
        .mockResolvedValueOnce([[{ id: 1, ...validFeedback, created_at: '2025-01-01' }], []]); // SELECT returns [rows, fields]

      const response = await request(app)
        .post('/api/feedback')
        .send(validFeedback)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Feedback submitted successfully');
      expect(response.body.data).toBeDefined();
      expect(mockPool.execute).toHaveBeenCalledTimes(2);
    });

    it('should handle database error during feedback creation', async () => {
      const error = new Error('Database error');
      mockPool.execute.mockRejectedValueOnce(error);

      const response = await request(app)
        .post('/api/feedback')
        .send(validFeedback)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to submit feedback');
    });

    it('should handle database error during feedback retrieval', async () => {
      mockPool.execute
        .mockResolvedValueOnce([{ insertId: 1 }, []]) // INSERT
        .mockRejectedValueOnce(new Error('Select error')); // SELECT fails

      const response = await request(app)
        .post('/api/feedback')
        .send(validFeedback)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to submit feedback');
    });
  });

  describe('GET /api/feedback', () => {
    const mockFeedbackData = [
      { id: 1, name: 'John Doe', message: 'Great!', rating: 5, created_at: '2025-01-01' },
      { id: 2, name: 'Jane Smith', message: 'Good service', rating: 4, created_at: '2025-01-02' }
    ];

    it('should retrieve feedback with default sorting', async () => {
      mockPool.execute.mockResolvedValueOnce([mockFeedbackData, []]);

      const response = await request(app)
        .get('/api/feedback')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toEqual(mockFeedbackData);
    });

    it('should retrieve feedback with custom sorting by rating', async () => {
      mockPool.execute.mockResolvedValueOnce([mockFeedbackData, []]);

      const response = await request(app)
        .get('/api/feedback?sortBy=rating&order=desc')
        .expect(200);

      expect(response.body.success).toBe(true);

      const executedQuery = mockPool.execute.mock.calls[0][0].replace(/\s+/g, ' ');
      expect(executedQuery).toContain('ORDER BY rating DESC');
    });

    it('should retrieve feedback with custom sorting by name', async () => {
      mockPool.execute.mockResolvedValueOnce([mockFeedbackData, []]);

      const response = await request(app)
        .get('/api/feedback?sortBy=name&order=asc')
        .expect(200);

      expect(response.body.success).toBe(true);

      const executedQuery = mockPool.execute.mock.calls[0][0].replace(/\s+/g, ' ');
      expect(executedQuery).toContain('ORDER BY name ASC');
    });

    it('should handle invalid sort field', async () => {
      const response = await request(app)
        .get('/api/feedback?sortBy=invalid&order=desc')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid sort field');
    });

    it('should handle invalid sort order', async () => {
      const response = await request(app)
        .get('/api/feedback?sortBy=rating&order=invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid order');
    });

    it('should handle database error', async () => {
      mockPool.execute.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/feedback')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to fetch feedback');
    });
  });
});
