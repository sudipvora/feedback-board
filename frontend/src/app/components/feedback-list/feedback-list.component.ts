import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { Feedback, SortField, SortOrder } from '../../models/feedback.model';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-feedback-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card p-6 animate-fade-in">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Feedback List</h2>
          <p class="text-gray-600">
            {{ feedback.length }} feedback entries
          </p>
        </div>
        
        <!-- Sorting Controls -->
        <div class="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          <div class="flex items-center space-x-2">
            <label for="sortBy" class="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              id="sortBy"
              [(ngModel)]="currentSortBy"
              (change)="onSortChange()"
              class="form-input w-auto px-3 py-1 text-sm"
            >
              <option value="created_at">Date</option>
              <option value="rating">Rating</option>
              <option value="name">Name</option>
            </select>
          </div>
          
          <div class="flex items-center space-x-2">
            <label for="sortOrder" class="text-sm font-medium text-gray-700">Order:</label>
            <select
              id="sortOrder"
              [(ngModel)]="currentSortOrder"
              (change)="onSortChange()"
              class="form-input w-auto px-3 py-1 text-sm"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && feedback.length === 0" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
        <p class="text-gray-500">Be the first to share your thoughts!</p>
      </div>

      <!-- Feedback Items -->
      <div *ngIf="!isLoading && feedback.length > 0" class="space-y-4">
        <div
          *ngFor="let item of feedback; trackBy: trackByFeedback"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 animate-slide-up"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h3 class="text-lg font-semibold text-gray-900">{{ item.name }}</h3>
                <div class="flex items-center space-x-1">
                  <span
                    *ngFor="let star of [1, 2, 3, 4, 5]"
                    class="text-sm"
                    [class.text-warning-400]="star <= item.rating"
                    [class.text-gray-300]="star > item.rating"
                  >
                    ★
                  </span>
                  <span class="ml-1 text-sm text-gray-500">({{ item.rating }}/5)</span>
                </div>
              </div>
              
              <p class="text-gray-700 mb-3 leading-relaxed">{{ item.message }}</p>
              
              <div class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatDate(item.created_at) }}
              </div>
            </div>
            
            <!-- Rating Badge -->
            <div class="ml-4">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                [ngClass]="getRatingBadgeClass(item.rating)"
              >
                {{ item.rating }}/5
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Button (if needed) -->
      <div *ngIf="!isLoading && feedback.length > 0" class="mt-6 text-center">
        <button
          (click)="refreshData()"
          class="btn-secondary"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class FeedbackListComponent implements OnInit, OnDestroy {
  feedback: Feedback[] = [];
  isLoading: boolean = false;
  currentSortBy: SortField = 'created_at';
  currentSortOrder: SortOrder = 'desc';
  
  private destroy$ = new Subject<void>();

  constructor(private feedbackService: FeedbackService) {}

  ngOnInit(): void {
    this.loadFeedback();
    
    // Subscribe to feedback updates
    this.feedbackService.feedback$
      .pipe(takeUntil(this.destroy$))
      .subscribe(feedback => {
        this.feedback = feedback;
      });
    
    // Subscribe to loading state
    this.feedbackService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFeedback(): void {
    this.feedbackService.loadFeedback(this.currentSortBy, this.currentSortOrder);
  }

  onSortChange(): void {
    this.loadFeedback();
  }

  refreshData(): void {
    this.feedbackService.refreshData(this.currentSortBy, this.currentSortOrder);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  getRatingBadgeClass(rating: number): string {
    if (rating >= 4) {
      return 'bg-success-100 text-success-800';
    } else if (rating >= 3) {
      return 'bg-warning-100 text-warning-800';
    } else {
      return 'bg-error-100 text-error-800';
    }
  }

  trackByFeedback(index: number, feedback: Feedback): number {
    return feedback.id || index;
  }
} 