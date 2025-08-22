import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { Feedback } from '../../models/feedback.model';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card p-6 animate-fade-in">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Share Your Feedback</h2>
        <p class="text-gray-600">We'd love to hear your thoughts about our product or service.</p>
      </div>

      <form [formGroup]="feedbackForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Name Field -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Your Name <span class="text-error-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            formControlName="name"
            class="form-input"
            placeholder="Enter your name"
            [class.border-error-300]="isFieldInvalid('name')"
            [class.focus:border-error-500]="isFieldInvalid('name')"
          />
          <div *ngIf="isFieldInvalid('name')" class="mt-1 text-sm text-error-600">
            <span *ngIf="feedbackForm.get('name')?.errors?.['required']">Name is required</span>
            <span *ngIf="feedbackForm.get('name')?.errors?.['minlength']">Name must be at least 2 characters</span>
          </div>
        </div>

        <!-- Message Field -->
        <div>
          <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
            Your Message <span class="text-error-500">*</span>
          </label>
          <textarea
            id="message"
            formControlName="message"
            rows="4"
            class="form-textarea"
            placeholder="Tell us what you think..."
            [class.border-error-300]="isFieldInvalid('message')"
            [class.focus:border-error-500]="isFieldInvalid('message')"
          ></textarea>
          <div *ngIf="isFieldInvalid('message')" class="mt-1 text-sm text-error-600">
            <span *ngIf="feedbackForm.get('message')?.errors?.['required']">Message is required</span>
            <span *ngIf="feedbackForm.get('message')?.errors?.['minlength']">Message must be at least 10 characters</span>
          </div>
        </div>

        <!-- Rating Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Rating <span class="text-error-500">*</span>
          </label>
          <div class="flex items-center space-x-2">
            <div class="flex space-x-1">
              <span
                *ngFor="let star of [1, 2, 3, 4, 5]"
                (click)="setRating(star)"
                class="rating-star"
                [class.active]="star <= selectedRating"
                [class.inactive]="star > selectedRating"
              >
                ★
              </span>
            </div>
            <span class="ml-3 text-sm text-gray-600">
              {{ selectedRating }}/5
            </span>
          </div>
          <div *ngIf="isFieldInvalid('rating')" class="mt-1 text-sm text-error-600">
            <span *ngIf="feedbackForm.get('rating')?.errors?.['required']">Rating is required</span>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <button
            type="submit"
            [disabled]="feedbackForm.invalid || isSubmitting"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span *ngIf="!isSubmitting" class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
              Submit Feedback
            </span>
            <span *ngIf="isSubmitting" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          </button>
        </div>
      </form>

      <!-- Success Message -->
      <div *ngIf="showSuccessMessage" class="mt-4 p-4 bg-success-50 border border-success-200 rounded-md animate-bounce-in">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-success-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-success-800">
              Thank you for your feedback!
            </p>
            <p class="mt-1 text-sm text-success-700">
              Your message has been submitted successfully.
            </p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="mt-4 p-4 bg-error-50 border border-error-200 rounded-md">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-error-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-error-800">
              Error submitting feedback
            </p>
            <p class="mt-1 text-sm text-error-700">
              {{ errorMessage }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FeedbackFormComponent implements OnInit, OnDestroy {
  feedbackForm: FormGroup;
  selectedRating: number = 0;
  isSubmitting: boolean = false;
  showSuccessMessage: boolean = false;
  errorMessage: string = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService
  ) {
    this.feedbackForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  ngOnInit(): void {
    // Watch for rating changes
    this.feedbackForm.get('rating')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(rating => {
        this.selectedRating = rating;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
    this.feedbackForm.patchValue({ rating });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.feedbackForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.feedbackForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.showSuccessMessage = false;

    const feedback: Feedback = this.feedbackForm.value;

    this.feedbackService.submitFeedback(feedback)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            this.showSuccessMessage = true;
            this.feedbackForm.reset();
            this.selectedRating = 0;
            
            // Hide success message after 5 seconds
            setTimeout(() => {
              this.showSuccessMessage = false;
            }, 5000);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.error?.message || 'An error occurred while submitting feedback. Please try again.';
          
          // Hide error message after 10 seconds
          setTimeout(() => {
            this.errorMessage = '';
          }, 10000);
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.feedbackForm.controls).forEach(key => {
      const control = this.feedbackForm.get(key);
      control?.markAsTouched();
    });
  }
} 