import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { FeedbackStats } from '../../models/feedback.model';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-feedback-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card p-6 animate-fade-in">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Feedback Statistics</h2>
        <p class="text-gray-600">Overview of all feedback received</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="!stats" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Stats Grid -->
      <div *ngIf="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Feedback -->
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-blue-600">Total Feedback</p>
              <p class="text-2xl font-bold text-blue-900">{{ stats.total_feedback }}</p>
            </div>
          </div>
        </div>

        <!-- Average Rating -->
        <div class="bg-gradient-to-br from-warning-50 to-warning-100 p-6 rounded-lg border border-warning-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-warning-500 rounded-md flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-warning-600">Average Rating</p>
              <p class="text-2xl font-bold text-warning-900">
                {{ stats.average_rating ? stats.average_rating.toFixed(1) : '0.0' }}/5
              </p>
            </div>
          </div>
        </div>

        <!-- Positive Feedback -->
        <div class="bg-gradient-to-br from-success-50 to-success-100 p-6 rounded-lg border border-success-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-success-500 rounded-md flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-success-600">Positive (4-5★)</p>
              <p class="text-2xl font-bold text-success-900">{{ stats.positive_feedback }}</p>
            </div>
          </div>
        </div>

        <!-- Negative Feedback -->
        <div class="bg-gradient-to-br from-error-50 to-error-100 p-6 rounded-lg border border-error-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-error-500 rounded-md flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-error-600">Needs Improvement (1-2★)</p>
              <p class="text-2xl font-bold text-error-900">{{ stats.negative_feedback }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Rating Distribution Chart -->
      <div *ngIf="stats" class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
        
        <div class="space-y-3">
          <div
            *ngFor="let distribution of stats.rating_distribution"
            class="flex items-center space-x-4"
          >
            <div class="flex items-center space-x-2 w-16">
              <span class="text-warning-400 text-lg">★</span>
              <span class="text-sm font-medium text-gray-700">{{ distribution.rating }}</span>
            </div>
            
            <div class="flex-1">
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div
                  class="bg-warning-400 h-3 rounded-full transition-all duration-500"
                  [style.width.%]="getPercentage(distribution.count, stats.total_feedback)"
                ></div>
              </div>
            </div>
            
            <div class="w-16 text-right">
              <span class="text-sm font-medium text-gray-700">{{ distribution.count }}</span>
              <span class="text-xs text-gray-500 ml-1">
                ({{ getPercentage(distribution.count, stats.total_feedback).toFixed(1) }}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Refresh Button -->
      <div *ngIf="stats" class="mt-6 text-center">
        <button
          (click)="refreshStats()"
          class="btn-secondary"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Stats
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class FeedbackStatsComponent implements OnInit, OnDestroy {
  stats: FeedbackStats | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(private feedbackService: FeedbackService) {}

  ngOnInit(): void {
    this.loadStats();
    
    // Subscribe to stats updates
    this.feedbackService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.stats = stats;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStats(): void {
    this.feedbackService.loadStats();
  }

  refreshStats(): void {
    this.feedbackService.loadStats();
  }

  getPercentage(count: number, total: number): number {
    if (total === 0) return 0;
    return (count / total) * 100;
  }
} 