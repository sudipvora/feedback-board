import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FeedbackService } from './feedback.service';
import { Feedback, FeedbackResponse, FeedbackListResponse } from '../models/feedback.model';
import { of, throwError } from 'rxjs';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let httpMock: HttpTestingController;

  const mockFeedback: Feedback = {
    name: 'John Doe',
    message: 'Great product!',
    rating: 5
  };

  const mockFeedbackResponse: FeedbackResponse = {
    success: true,
    message: 'Feedback submitted successfully',
    data: { ...mockFeedback, id: 1, created_at: '2025-01-01T10:00:00Z' }
  };

  const mockFeedbackList: Feedback[] = [
    { ...mockFeedback, id: 1, created_at: '2025-01-01T10:00:00Z' },
    { name: 'Jane Smith', message: 'Good service', rating: 4, id: 2, created_at: '2025-01-02T11:00:00Z' }
  ];

  const mockFeedbackListResponse: FeedbackListResponse = {
    success: true,
    data: mockFeedbackList,
    count: 2
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FeedbackService]
    });
    service = TestBed.inject(FeedbackService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('submitFeedback', () => {
    it('should submit feedback successfully', () => {
      service.submitFeedback(mockFeedback).subscribe(response => {
        expect(response).toEqual(mockFeedbackResponse);
      });

      const req = httpMock.expectOne(`${service.baseUrl}/feedback`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockFeedback);
      req.flush(mockFeedbackResponse);
    });

    it('should handle submission error', () => {
      const errorMessage = 'Submission failed';
      
      service.submitFeedback(mockFeedback).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.error.message).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${service.baseUrl}/feedback`);
      req.flush({ message: errorMessage }, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network error', () => {
      service.submitFeedback(mockFeedback).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(0);
        }
      });

      const req = httpMock.expectOne(`${service.baseUrl}/feedback`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getFeedback', () => {
    it('should get feedback list successfully', () => {
      service.getFeedback().subscribe(response => {
        expect(response).toEqual(mockFeedbackListResponse);
      });

      const req = httpMock.expectOne(`${service.baseUrl}/feedback?sortBy=created_at&order=desc`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFeedbackListResponse);
    });

    it('should get feedback list with sorting parameters', () => {
      service.getFeedback('rating', 'asc').subscribe(response => {
        expect(response).toEqual(mockFeedbackListResponse);
      });

      const req = httpMock.expectOne(`${service.baseUrl}/feedback?sortBy=rating&order=asc`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFeedbackListResponse);
    });

    it('should handle get feedback error', () => {
      const errorMessage = 'Failed to fetch feedback';
      
      service.getFeedback().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.error.message).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${service.baseUrl}/feedback?sortBy=created_at&order=desc`);
      req.flush({ message: errorMessage }, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network error when getting feedback', () => {
      service.getFeedback().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(0);
        }
      });

      const req = httpMock.expectOne(`${service.baseUrl}/feedback?sortBy=created_at&order=desc`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('loadFeedback', () => {
    it('should load feedback and update observables', () => {
      // Spy on getFeedback to return our mock observable
      const getFeedbackSpy = jest.spyOn(service as any, 'getFeedback').mockReturnValue(
        of(mockFeedbackListResponse)
      );

      // Call loadFeedback (returns void)
      service.loadFeedback();

      // Ensure getFeedback was called
      expect(getFeedbackSpy).toHaveBeenCalledWith('created_at', 'desc');

      // Check that feedback$ observable is updated
      service.feedback$.subscribe(feedback => {
        expect(feedback).toEqual(mockFeedbackListResponse.data);
      });

      // Check that loading$ is false after load
      service.loading$.subscribe(loading => {
        expect(loading).toBe(false);
      });
    });

    it('should handle loading error gracefully', () => {
      const httpError = { status: 500, message: 'Server error' };

      // Spy on getFeedback to return an observable that errors
      const getFeedbackSpy = jest.spyOn(service as any, 'getFeedback').mockReturnValue(
        throwError(() => httpError)
      );

      // Call loadFeedback (returns void)
      service.loadFeedback();

      // Ensure getFeedback was called
      expect(getFeedbackSpy).toHaveBeenCalled();

      // Subscribe to loading$ to check that it is false even after error
      service.loading$.subscribe(loading => {
        expect(loading).toBe(false);
      });
    });

  });

  describe('refreshData', () => {
    it('should refresh feedback data', () => {
      service.refreshData();

      service.feedback$.subscribe(feedback => {
        expect(feedback).toEqual([]);
      });

      service.loading$.subscribe(loading => {
        expect(loading).toBe(true);
      });
    });
  });

  describe('Observables', () => {
    it('should provide feedback observable', () => {
      expect(service.feedback$).toBeDefined();
      
      service.feedback$.subscribe(feedback => {
        expect(Array.isArray(feedback)).toBe(true);
      });
    });

    it('should provide loading observable', () => {
      expect(service.loading$).toBeDefined();
      
      service.loading$.subscribe(loading => {
        expect(typeof loading).toBe('boolean');
      });
    });

    it('should provide initial load observable', () => {
      expect(service.initialLoad$).toBeDefined();
      
      service.initialLoad$.subscribe(initialLoad => {
        expect(typeof initialLoad).toBe('boolean');
      });
    });
  });

  describe('Initial Load Logic', () => {
    it('should set loading to true only on initial load', () => {
      // Initial load should set loading to true
      // Subscribe to actually trigger HTTP request
      (service as any).getFeedback('created_at', 'desc').subscribe();
      
      service.loading$.subscribe(loading => {
        expect(loading).toBe(true);
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url === `${service.baseUrl}/feedback` &&
          request.params.get('sortBy') === 'created_at' &&
          request.params.get('order') === 'desc'
      );
      req.flush(mockFeedbackListResponse);
    });

    it('should not set loading to true on subsequent calls when not initial load', () => {
      // Set initial load to false
      (service as any).initialLoadSubject.next(false);
      
      // Subscribe to actually trigger HTTP request
      (service as any).getFeedback('created_at', 'desc').subscribe();

      // Loading should remain false
      service.loading$.subscribe(loading => {
        expect(loading).toBe(false);
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url === `${service.baseUrl}/feedback` &&
          request.params.get('sortBy') === 'created_at' &&
          request.params.get('order') === 'desc'
      );

      req.flush(mockFeedbackListResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle unsuccessful responses from getFeedback', () => {
      const unsuccessfulResponse = {
        success: false,
        data: [],
        count: 0
      };

      service.getFeedback().subscribe(response => {
        expect(response.success).toBe(false);
        expect(response.data).toEqual([]);
        expect(response.count).toBe(0);
      });

      const req = httpMock.expectOne(`${service.baseUrl}/feedback?sortBy=created_at&order=desc`);
      req.flush(unsuccessfulResponse);
    });

    it('should handle empty data responses', () => {
      const emptyResponse = {
        success: true,
        data: [],
        count: 0
      };

      service.getFeedback().subscribe(response => {
        expect(response.data).toEqual([]);
        expect(response.count).toBe(0);
      });

      const req = httpMock.expectOne(`${service.baseUrl}/feedback?sortBy=created_at&order=desc`);
      req.flush(emptyResponse);
    });
  });
});
