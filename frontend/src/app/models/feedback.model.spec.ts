import { Feedback, FeedbackResponse, FeedbackListResponse, SortField, SortOrder } from './feedback.model';

describe('Feedback Models', () => {
  describe('Feedback Interface', () => {
    it('should create a valid feedback object', () => {
      const feedback: Feedback = {
        id: 1,
        name: 'John Doe',
        message: 'Great product!',
        rating: 5,
        created_at: '2025-01-01T10:00:00Z'
      };

      expect(feedback.id).toBe(1);
      expect(feedback.name).toBe('John Doe');
      expect(feedback.message).toBe('Great product!');
      expect(feedback.rating).toBe(5);
      expect(feedback.created_at).toBe('2025-01-01T10:00:00Z');
    });

    it('should handle feedback with minimum required fields', () => {
      const feedback: Feedback = {
        name: 'Jane Smith',
        message: 'Good service',
        rating: 4
      };

      expect(feedback.name).toBe('Jane Smith');
      expect(feedback.message).toBe('Good service');
      expect(feedback.rating).toBe(4);
      expect(feedback.id).toBeUndefined();
      expect(feedback.created_at).toBeUndefined();
    });

    it('should handle feedback with all fields', () => {
      const feedback: Feedback = {
        id: 2,
        name: 'Bob Johnson',
        message: 'Average experience',
        rating: 3,
        created_at: '2025-01-02T11:00:00Z'
      };

      expect(feedback.id).toBe(2);
      expect(feedback.name).toBe('Bob Johnson');
      expect(feedback.message).toBe('Average experience');
      expect(feedback.rating).toBe(3);
      expect(feedback.created_at).toBe('2025-01-02T11:00:00Z');
    });
  });

  describe('FeedbackResponse Interface', () => {
    it('should create a valid feedback response object', () => {
      const feedback: Feedback = {
        name: 'John Doe',
        message: 'Great product!',
        rating: 5
      };

      const response: FeedbackResponse = {
        success: true,
        message: 'Feedback submitted successfully',
        data: { ...feedback, id: 1, created_at: '2025-01-01T10:00:00Z' }
      };

      expect(response.success).toBe(true);
      expect(response.message).toBe('Feedback submitted successfully');
      expect(response.data).toBeDefined();
      expect(response.data?.name).toBe('John Doe');
      expect(response.data?.id).toBe(1);
    });

    it('should handle unsuccessful feedback response', () => {
      const response: FeedbackResponse = {
        success: false,
        message: 'Validation failed',
        data: undefined 
      };

      expect(response.success).toBe(false);
      expect(response.message).toBe('Validation failed');
    });

    it('should handle feedback response with error message', () => {
      const response: FeedbackResponse = {
        success: false,
        message: 'Name is required',
        data: undefined 
      };

      expect(response.success).toBe(false);
      expect(response.message).toBe('Name is required');
    });
  });

  describe('FeedbackListResponse Interface', () => {
    it('should create a valid feedback list response object', () => {
      const feedbackList: Feedback[] = [
        {
          id: 1,
          name: 'John Doe',
          message: 'Great product!',
          rating: 5,
          created_at: '2025-01-01T10:00:00Z'
        },
        {
          id: 2,
          name: 'Jane Smith',
          message: 'Good service',
          rating: 4,
          created_at: '2025-01-02T11:00:00Z'
        }
      ];

      const response: FeedbackListResponse = {
        success: true,
        data: feedbackList,
        count: 2
      };

      expect(response.success).toBe(true);
      expect(response.data).toEqual(feedbackList);
      expect(response.count).toBe(2);
    });

    it('should handle empty feedback list response', () => {
      const response: FeedbackListResponse = {
        success: true,
        data: [],
        count: 0
      };

      expect(response.success).toBe(true);
      expect(response.data).toEqual([]);
      expect(response.count).toBe(0);
    });

    it('should handle unsuccessful feedback list response', () => {
      const response: FeedbackListResponse = {
        success: false,
        data: [],
        count: 0
      };

      expect(response.success).toBe(false);
      expect(response.data).toEqual([]);
      expect(response.count).toBe(0);
    });

    it('should handle feedback list response with single item', () => {
      const feedback: Feedback = {
        id: 1,
        name: 'John Doe',
        message: 'Great product!',
        rating: 5,
        created_at: '2025-01-01T10:00:00Z'
      };

      const response: FeedbackListResponse = {
        success: true,
        data: [feedback],
        count: 1
      };

      expect(response.success).toBe(true);
      expect(response.data).toEqual([feedback]);
      expect(response.count).toBe(1);
    });
  });

  describe('SortField Type', () => {
    it('should accept valid sort field values', () => {
      const validSortFields: SortField[] = ['created_at', 'rating', 'name'];

      expect(validSortFields).toContain('created_at');
      expect(validSortFields).toContain('rating');
      expect(validSortFields).toContain('name');
    });

    it('should handle created_at sort field', () => {
      const sortField: SortField = 'created_at';
      expect(sortField).toBe('created_at');
    });

    it('should handle rating sort field', () => {
      const sortField: SortField = 'rating';
      expect(sortField).toBe('rating');
    });

    it('should handle name sort field', () => {
      const sortField: SortField = 'name';
      expect(sortField).toBe('name');
    });
  });

  describe('SortOrder Type', () => {
    it('should accept valid sort order values', () => {
      const validSortOrders: SortOrder[] = ['asc', 'desc'];

      expect(validSortOrders).toContain('asc');
      expect(validSortOrders).toContain('desc');
    });

    it('should handle ascending sort order', () => {
      const sortOrder: SortOrder = 'asc';
      expect(sortOrder).toBe('asc');
    });

    it('should handle descending sort order', () => {
      const sortOrder: SortOrder = 'desc';
      expect(sortOrder).toBe('desc');
    });
  });

  describe('Type Safety', () => {
    it('should enforce required fields in Feedback interface', () => {
      // This should compile without errors
      const feedback: Feedback = {
        name: 'John Doe',
        message: 'Great product!',
        rating: 5
      };

      expect(feedback.name).toBeDefined();
      expect(feedback.message).toBeDefined();
      expect(feedback.rating).toBeDefined();
    });

    it('should enforce required fields in FeedbackResponse interface', () => {
      // This should compile without errors
      const response: FeedbackResponse = {
        success: true,
        message: 'Success',
        data: undefined 
      };

      expect(response.success).toBeDefined();
      expect(response.message).toBeDefined();
    });

    it('should enforce required fields in FeedbackListResponse interface', () => {
      // This should compile without errors
      const response: FeedbackListResponse = {
        success: true,
        data: [],
        count: 0
      };

      expect(response.success).toBeDefined();
      expect(response.count).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle feedback with maximum rating', () => {
      const feedback: Feedback = {
        name: 'Max Rating',
        message: 'Perfect!',
        rating: 5
      };

      expect(feedback.rating).toBe(5);
    });

    it('should handle feedback with minimum rating', () => {
      const feedback: Feedback = {
        name: 'Min Rating',
        message: 'Poor',
        rating: 1
      };

      expect(feedback.rating).toBe(1);
    });

    it('should handle feedback with middle rating', () => {
      const feedback: Feedback = {
        name: 'Middle Rating',
        message: 'Average',
        rating: 3
      };

      expect(feedback.rating).toBe(3);
    });

    it('should handle very long names', () => {
      const longName = 'A'.repeat(100);
      const feedback: Feedback = {
        name: longName,
        message: 'Test message',
        rating: 4
      };

      expect(feedback.name).toBe(longName);
      expect(feedback.name.length).toBe(100);
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(1000);
      const feedback: Feedback = {
        name: 'Test User',
        message: longMessage,
        rating: 4
      };

      expect(feedback.message).toBe(longMessage);
      expect(feedback.message.length).toBe(1000);
    });

    it('should handle empty string names', () => {
      const feedback: Feedback = {
        name: '',
        message: 'Test message',
        rating: 4
      };

      expect(feedback.name).toBe('');
    });

    it('should handle empty string messages', () => {
      const feedback: Feedback = {
        name: 'Test User',
        message: '',
        rating: 4
      };

      expect(feedback.message).toBe('');
    });

    it('should handle zero rating', () => {
      const feedback: Feedback = {
        name: 'Test User',
        message: 'Test message',
        rating: 0
      };

      expect(feedback.rating).toBe(0);
    });

    it('should handle decimal ratings', () => {
      const feedback: Feedback = {
        name: 'Test User',
        message: 'Test message',
        rating: 3.5
      };

      expect(feedback.rating).toBe(3.5);
    });

    it('should handle negative ratings', () => {
      const feedback: Feedback = {
        name: 'Test User',
        message: 'Test message',
        rating: -1
      };

      expect(feedback.rating).toBe(-1);
    });

    it('should handle ratings above 5', () => {
      const feedback: Feedback = {
        name: 'Test User',
        message: 'Test message',
        rating: 10
      };

      expect(feedback.rating).toBe(10);
    });
  });

  describe('Data Validation', () => {
    it('should handle feedback with special characters in name', () => {
      const feedback: Feedback = {
        name: 'José María O\'Connor-Smith',
        message: 'Test message',
        rating: 4
      };

      expect(feedback.name).toBe('José María O\'Connor-Smith');
    });

    it('should handle feedback with special characters in message', () => {
      const feedback: Feedback = {
        name: 'Test User',
        message: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        rating: 4
      };

      expect(feedback.message).toBe('Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?');
    });

    it('should handle feedback with HTML-like content in message', () => {
      const feedback: Feedback = {
        name: 'Test User',
        message: '<script>alert("test")</script>',
        rating: 4
      };

      expect(feedback.message).toBe('<script>alert("test")</script>');
    });

    it('should handle feedback with emoji in name', () => {
      const feedback: Feedback = {
        name: 'John 😊 Doe',
        message: 'Test message',
        rating: 4
      };

      expect(feedback.name).toBe('John 😊 Doe');
    });

    it('should handle feedback with emoji in message', () => {
      const feedback: Feedback = {
        name: 'Test User',
        message: 'Great product! 👍👏🎉',
        rating: 4
      };

      expect(feedback.message).toBe('Great product! 👍👏🎉');
    });

    it('should handle feedback with unicode characters', () => {
      const feedback: Feedback = {
        name: 'José María',
        message: 'Café au lait',
        rating: 4
      };

      expect(feedback.name).toBe('José María');
      expect(feedback.message).toBe('Café au lait');
    });
  });
});
