const { validateFeedback } = require('../middleware/validation');

describe('Validation Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('validateFeedback', () => {
    it('should pass validation for valid feedback data', () => {
      mockReq.body = {
        name: 'John Doe',
        message: 'Great product!',
        rating: 5
      };

      validateFeedback(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.body.name).toBe('John Doe');
      expect(mockReq.body.message).toBe('Great product!');
      expect(mockReq.body.rating).toBe(5);
    });

    it('should return error for missing name', () => {
      mockReq.body = {
        message: 'Great product!',
        rating: 5
      };

      validateFeedback(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing required fields',
        details: {
          name: 'Name is required',
          message: null,
          rating: null
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return error for missing message', () => {
      mockReq.body = {
        name: 'John Doe',
        rating: 5
      };

      validateFeedback(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing required fields',
        details: {
          name: null,
          message: 'Message is required',
          rating: null
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return error for missing rating', () => {
      mockReq.body = {
        name: 'John Doe',
        message: 'Great product!'
      };

      validateFeedback(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing required fields',
        details: {
          name: null,
          message: null,
          rating: 'Rating is required'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return error for invalid rating range', () => {
      mockReq.body = {
        name: 'John Doe',
        message: 'Great product!',
        rating: 6
      };

      validateFeedback(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Rating must be an integer between 1 and 5'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return error for rating below 1', () => {
      mockReq.body = {
        name: 'John Doe',
        message: 'Great product!',
        rating: 0
      };

      validateFeedback(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Rating must be an integer between 1 and 5'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return error for empty name', () => {
      mockReq.body = {
        name: '   ',
        message: 'Great product!',
        rating: 5
      };

      validateFeedback(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Name must be a non-empty string'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return error for empty message', () => {
      mockReq.body = {
        name: 'John Doe',
        message: '   ',
        rating: 5
      };

      validateFeedback(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Message must be a non-empty string'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should trim whitespace from inputs', () => {
      mockReq.body = {
        name: '  John Doe  ',
        message: '  Great product!  ',
        rating: 5
      };

      validateFeedback(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.body.name).toBe('John Doe');
      expect(mockReq.body.message).toBe('Great product!');
      expect(mockReq.body.rating).toBe(5);
    });
    
    it('should return error for name longer than 255 characters', () => {
      mockReq.body = {
        name: 'a'.repeat(256),
        message: 'Valid message',
        rating: 5
      };

      validateFeedback(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Name must be less than 255 characters'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return error for message longer than 10,000 characters', () => {
      mockReq.body = {
        name: 'John Doe',
        message: 'a'.repeat(10001),
        rating: 5
      };

      validateFeedback(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Message must be less than 10,000 characters'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 