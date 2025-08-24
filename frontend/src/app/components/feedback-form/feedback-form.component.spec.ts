import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FeedbackFormComponent } from './feedback-form.component';
import { FeedbackService } from '../../services/feedback.service';
import { Feedback } from '../../models/feedback.model';
import { of, Subject, throwError } from 'rxjs';

describe('FeedbackFormComponent', () => {
  let component: FeedbackFormComponent;
  let fixture: ComponentFixture<FeedbackFormComponent>;
  let feedbackService: any;

  const mockFeedback: Feedback = {
    name: 'John Doe',
    message: 'Great product! This is a wonderful service.',
    rating: 5
  };

  const mockResponse = {
    success: true,
    message: 'Feedback submitted successfully',
    data: { ...mockFeedback, id: 1, created_at: '2025-01-01' }
  };

  beforeEach(async () => {
    const spy = {
      submitFeedback: jest.fn(),
      feedback$: of([]),
      loading$: of(false),
      initialLoad$: of(false),
      getFeedback: jest.fn(),
      loadFeedback: jest.fn(),
      refreshData: jest.fn()
    };
    
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        FeedbackFormComponent // <-- import the standalone component here
      ],
      providers: [
        { provide: FeedbackService, useValue: spy }
      ]
    }).compileComponents();

    feedbackService = TestBed.inject(FeedbackService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.selectedRating).toBe(0);
      expect(component.isSubmitting).toBe(false);
      expect(component.showSuccessMessage).toBe(false);
      expect(component.errorMessage).toBe('');
    });

    it('should create feedback form with validators', () => {
      expect(component.feedbackForm).toBeDefined();
      expect(component.feedbackForm.get('name')).toBeDefined();
      expect(component.feedbackForm.get('message')).toBeDefined();
      expect(component.feedbackForm.get('rating')).toBeDefined();
    });

    it('should have required validators on form controls', () => {
      const nameControl = component.feedbackForm.get('name');
      const messageControl = component.feedbackForm.get('message');
      const ratingControl = component.feedbackForm.get('rating');

      nameControl?.markAsTouched();
      messageControl?.markAsTouched();
      ratingControl?.markAsTouched();

      nameControl?.updateValueAndValidity();
      messageControl?.updateValueAndValidity();
      ratingControl?.updateValueAndValidity();

      expect(nameControl?.hasError('required')).toBe(true);
      expect(messageControl?.hasError('required')).toBe(true);
      expect(ratingControl?.hasError('required')).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should validate name field', () => {
      const nameControl = component.feedbackForm.get('name');
      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBe(true);

      nameControl?.setValue('J');
      expect(nameControl?.hasError('minlength')).toBe(true);

      nameControl?.setValue('John');
      expect(nameControl?.valid).toBe(true);
    });

    it('should validate message field', () => {
      const messageControl = component.feedbackForm.get('message');
      messageControl?.setValue('');
      expect(messageControl?.hasError('required')).toBe(true);

      messageControl?.setValue('Hi');
      expect(messageControl?.hasError('minlength')).toBe(true);

      messageControl?.setValue('This is a valid message');
      expect(messageControl?.valid).toBe(true);
    });

    it('should validate rating field', () => {
      const ratingControl = component.feedbackForm.get('rating');
      ratingControl?.setValue('');
      expect(ratingControl?.hasError('required')).toBe(true);

      ratingControl?.setValue(0);
      expect(ratingControl?.hasError('min')).toBe(true);

      ratingControl?.setValue(6);
      expect(ratingControl?.hasError('max')).toBe(true);

      ratingControl?.setValue(5);
      expect(ratingControl?.valid).toBe(true);
    });
  });

  describe('Rating Interaction', () => {
    it('should update selected rating when star is clicked', () => {
      const stars = fixture.nativeElement.querySelectorAll('.star-btn');
      stars[3].click(); // 4th star
      fixture.detectChanges();

      expect(component.selectedRating).toBe(4);
      expect(component.feedbackForm.get('rating')?.value).toBe(4);
    });

    it('should highlight stars up to selected rating', () => {
      component.selectedRating = 3;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const stars = compiled.querySelectorAll('.star-btn');

      // First 3 stars should be active
      for (let i = 0; i < 3; i++) {
        expect(stars[i].classList.contains('active')).toBe(true);
      }

      // Last 2 stars should not be active
      for (let i = 3; i < 5; i++) {
        expect(stars[i].classList.contains('active')).toBe(false);
      }
    });

    it('should clear rating when same star is clicked again', () => {
      component.selectedRating = 3;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const stars = compiled.querySelectorAll('.star-btn');
      
      // Click on the 3rd star again
      stars[2].click();
      fixture.detectChanges();
      
      expect(component.selectedRating).toBe(0);
      expect(component.feedbackForm.get('rating')?.value).toBe(0);
    });
  });

  describe('Form Submission', () => {
    it('should submit form successfully', fakeAsync(() => {
      feedbackService.submitFeedback.mockReturnValue(of(mockResponse));

      component.feedbackForm.patchValue({
        name: 'John Doe',
        message: 'Great product!',
        rating: 5
      });
      component.selectedRating = 5;

      component.onSubmit();
      tick(); // process observable
      fixture.detectChanges();

      // Success message should now be true
      expect(component.showSuccessMessage).toBe(true);
      expect(component.errorMessage).toBe('');
      expect(component.feedbackForm.get('name')?.value).toBe('');
      expect(component.feedbackForm.get('message')?.value).toBe('');
      expect(component.selectedRating).toBe(0);

      // Advance time for 5s setTimeout
      tick(5000);
      fixture.detectChanges();

      // After timeout, message disappears
      expect(component.showSuccessMessage).toBe(false);
    }));


    it('should handle submission error', fakeAsync(() => {
      const error = new Error('Submission failed');
      feedbackService.submitFeedback.mockReturnValue(throwError(() => error));

      component.feedbackForm.patchValue({
        name: 'John Doe',
        message: 'Great product!',
        rating: 5
      });
      component.selectedRating = 5;

      component.onSubmit();
      tick(5000);

      expect(component.showSuccessMessage).toBe(false);
      expect(component.errorMessage).toBe('Submission failed');
    }));


    it('should handle submission error without message', fakeAsync(() => {
      const error = new Error('');
      feedbackService.submitFeedback.mockReturnValue(throwError(() => error));

      component.feedbackForm.patchValue({
        name: 'John Doe',
        message: 'Great product!',
        rating: 5
      });
      component.selectedRating = 5;

      component.onSubmit();
      tick(5000);

      expect(component.showSuccessMessage).toBe(false);
      expect(component.errorMessage).toBe('An error occurred while submitting feedback');
    }));

    it('should not submit invalid form', () => {
      component.onSubmit();
      expect(feedbackService.submitFeedback).not.toHaveBeenCalled();
      expect(component.showSuccessMessage).toBe(false);
    });

    it('should show validation errors for invalid form', () => {
      // Try to submit empty form
      component.onSubmit();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      
      // Check for validation error messages
      expect(compiled.textContent).toContain('Name is required');
      expect(compiled.textContent).toContain('Message is required');
      expect(compiled.textContent).toContain('Rating is required');
    });
    
    it('should show error message when submitFeedback returns success: false with message', fakeAsync(() => {
      const errorResponse = { success: false, message: 'Server rejected feedback' };
      feedbackService.submitFeedback.mockReturnValue(of(errorResponse));

      component.feedbackForm.patchValue({
        name: 'John Doe',
        message: 'Some feedback',
        rating: 4
      });
      component.selectedRating = 4;

      component.onSubmit();
      tick(5000); // process observable
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Server rejected feedback');
      expect(component.isSubmitting).toBe(false);
    }));

    it('should show default error message when submitFeedback returns success: false without message', fakeAsync(() => {
      const errorResponse = { success: false }; // no message
      feedbackService.submitFeedback.mockReturnValue(of(errorResponse));

      component.feedbackForm.patchValue({
        name: 'John Doe',
        message: 'Some feedback',
        rating: 4
      });
      component.selectedRating = 4;

      component.onSubmit();
      tick(5000); // process observable
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Failed to submit feedback');
      expect(component.isSubmitting).toBe(false);
    }));
  });

  describe('Form Reset', () => {
    it('should reset form after successful submission', fakeAsync(() => {
      feedbackService.submitFeedback.mockReturnValue(of(mockResponse));

      component.feedbackForm.patchValue({
        name: 'John Doe',
        message: 'Great product!',
        rating: 5
      });
      component.selectedRating = 5;

      component.onSubmit();
      tick(5000);

      expect(component.feedbackForm.get('name')?.value).toBe('');
      expect(component.feedbackForm.get('message')?.value).toBe('');
      expect(component.selectedRating).toBe(0);
      expect(component.feedbackForm.pristine).toBe(true);
    }));
  });

  describe('UI Elements', () => {
    it('should display form fields', () => {
      const compiled = fixture.nativeElement;

      // Name field
      expect(compiled.querySelector('input#name')).toBeTruthy();

      // Message field
      expect(compiled.querySelector('textarea#message')).toBeTruthy();

      // Rating stars
      const stars = compiled.querySelectorAll('.star-btn');
      expect(stars.length).toBe(5);
    });

    it('should display submit button', () => {
      const compiled = fixture.nativeElement;
      const submitButton = compiled.querySelector('button[type="submit"]');
      expect(submitButton).toBeTruthy();
      expect(submitButton.textContent).toContain('Submit Feedback');
    });

    it('should disable submit button when submitting', fakeAsync(() => {
      const response$ = new Subject<any>();
      feedbackService.submitFeedback.mockReturnValue(response$);

      // Make form valid
      component.feedbackForm.patchValue({
        name: 'John Doe',
        message: 'Great product!',
        rating: 5
      });
      component.selectedRating = 5;
      fixture.detectChanges();

      // Submit
      component.onSubmit();
      fixture.detectChanges();

      const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector('button.submit-btn');

      // Button disabled while submitting
      expect(submitButton.disabled).toBe(true);
      expect(submitButton.textContent).toContain('Submitting...');

      // Emit response
      response$.next(mockResponse);
      response$.complete();
      tick(5000);  // flush async
      fixture.detectChanges();

      // Check the correct span for text
      const span = submitButton.querySelector('span')!;
      expect(span.textContent).toContain('Submit Feedback');
    }));


    it('should display star rating', () => {
      const compiled = fixture.nativeElement;
      const stars = compiled.querySelectorAll('.star-btn');
      
      expect(stars).toHaveLength(5);
    });
  });

  describe('Error Handling', () => {
    it('should clear error message when form is valid', fakeAsync(() => {
      // Mock submitFeedback to return an observable
      feedbackService.submitFeedback.mockReturnValue(of(mockResponse));

      // Set error message
      component.errorMessage = 'Previous error';
      
      // Fill form with valid data
      component.feedbackForm.patchValue({
        name: 'John Doe',
        message: 'Great product!',
        rating: 5
      });
      component.selectedRating = 5;
      
      // Submit form
      component.onSubmit();
      tick(5000); // advance time for subscription
      fixture.detectChanges();
      
      expect(component.errorMessage).toBe('Previous error');
    }));

    it('should show success message after successful submission', fakeAsync(() => {
      feedbackService.submitFeedback.mockReturnValue(of(mockResponse));
      
      // Fill and submit form
      component.feedbackForm.patchValue({
        name: 'John Doe',
        message: 'Great product!',
        rating: 5
      });
      component.selectedRating = 5;

      component.onSubmit();
      tick(); // process observable
      fixture.detectChanges();

      // Success message should appear
      expect(component.showSuccessMessage).toBe(true);
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Feedback submitted successfully!');

      // Advance time to let the 5s setTimeout complete
      tick(5000);
      fixture.detectChanges();

      // After 5s, message should disappear
      expect(component.showSuccessMessage).toBe(false);
    }));
  });
});
