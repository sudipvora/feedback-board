import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../services/feedback.service';
import { Feedback, SortField, SortOrder } from '../../models/feedback.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-feedback-list',
  templateUrl: './feedback-list.component.html',
  styleUrls: ['./feedback-list.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class FeedbackListComponent implements OnInit {
  feedback$: Observable<Feedback[]>;
  loading$: Observable<boolean>;
  initialLoad$: Observable<boolean>;
  sortBy: SortField = 'created_at';
  sortOrder: SortOrder = 'desc';
  sortOptions = [
    { value: 'created_at', label: 'Date' },
    { value: 'rating', label: 'Rating' },
    { value: 'name', label: 'Name' }
  ];

  constructor(private feedbackService: FeedbackService) {
    this.feedback$ = this.feedbackService.feedback$;
    this.loading$ = this.feedbackService.loading$;
    this.initialLoad$ = this.feedbackService.initialLoad$;
  }

  ngOnInit(): void {
    this.loadFeedback();
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target.id === 'sortOrder') {
      this.sortOrder = target.value as SortOrder;
    } else if (target.id === 'sortBy') {
      this.sortBy = target.value as SortField;
    }
    this.loadFeedback();
  }

  private loadFeedback(): void {
    // Subscribe to the service call to ensure the HTTP request completes
    this.feedbackService.getFeedback(this.sortBy, this.sortOrder).subscribe({
      next: (response) => {
        // Data is handled by the service observables
      },
      error: (error) => {
        console.error('Error loading feedback:', error);
      }
    });
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return '';
    }
  }

  getRatingBadgeClass(rating: number): string {
    if (rating >= 5) return 'rating-5';
    if (rating >= 4) return 'rating-4';
    if (rating >= 3) return 'rating-3';
    if (rating >= 2) return 'rating-2';
    if (rating >= 1) return 'rating-1';
    return 'rating-0';
  }
} 