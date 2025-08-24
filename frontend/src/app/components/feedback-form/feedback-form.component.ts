import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FeedbackService } from '../../services/feedback.service';
import { Feedback } from '../../models/feedback.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class FeedbackFormComponent implements OnInit, OnDestroy {
  feedbackForm!: FormGroup;
  selectedRating: number = 0;
  hoverRating: number = 0;
  isSubmitting: boolean = false;
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  errorMessage: string = '';
  private subscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initForm(): void {
    this.feedbackForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10000)]],
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  setRating(rating: number): void {
    if (this.selectedRating === rating) {
      this.selectedRating = 0;
      this.feedbackForm.patchValue({ rating: 0 });
    } else {
      this.selectedRating = rating;
      this.feedbackForm.patchValue({ rating });
    }
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
    this.hideMessages();

    const feedback: Feedback = {
      name: this.feedbackForm.value.name,
      message: this.feedbackForm.value.message,
      rating: this.feedbackForm.value.rating
    };

    this.subscription.add(
      this.feedbackService.submitFeedback(feedback).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccessMessage = true;
            this.resetForm();
            this.feedbackService.refreshData();
            setTimeout(() => {
              this.showSuccessMessage = false;
            }, 5000);
          } else {
            this.showError(response.message || 'Failed to submit feedback');
          }
        },
        error: (error) => {
          this.showError(error.message || 'An error occurred while submitting feedback');
        },
        complete: () => {
          this.isSubmitting = false;
        }
      })
    );
  }

  private markFormGroupTouched(): void {
    Object.keys(this.feedbackForm.controls).forEach(key => {
      const control = this.feedbackForm.get(key);
      control?.markAsTouched();
    });
  }

  private resetForm(): void {
    this.feedbackForm.reset({
      name: '',
      message: '',
      rating: 0
    });
    this.selectedRating = 0;
    this.hoverRating = 0;
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.showErrorMessage = true;
    setTimeout(() => {
      this.showErrorMessage = false;
    }, 5000);
  }

  private hideMessages(): void {
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
  }
} 