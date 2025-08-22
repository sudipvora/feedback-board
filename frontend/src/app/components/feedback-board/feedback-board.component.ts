import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FeedbackFormComponent } from '../feedback-form/feedback-form.component';
import { FeedbackListComponent } from '../feedback-list/feedback-list.component';
import { FeedbackStatsComponent } from '../feedback-stats/feedback-stats.component';

@Component({
  selector: 'app-feedback-board',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FeedbackFormComponent,
    FeedbackListComponent,
    FeedbackStatsComponent
  ],
  template: `
    <div class="space-y-8">
      <!-- Welcome Section -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Our Feedback Board
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          We value your opinion! Share your thoughts about our products, services, or any suggestions you might have. 
          Your feedback helps us improve and serve you better.
        </p>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - Feedback Form -->
        <div class="lg:col-span-1">
          <app-feedback-form></app-feedback-form>
        </div>

        <!-- Right Column - Stats and List -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Statistics -->
          <app-feedback-stats></app-feedback-stats>
          
          <!-- Feedback List -->
          <app-feedback-list></app-feedback-list>
        </div>
      </div>

      <!-- Features Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 class="text-2xl font-bold text-gray-900 text-center mb-8">
          Why Choose Our Feedback Board?
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Easy to Use</h3>
            <p class="text-gray-600">Simple and intuitive interface for submitting feedback quickly and easily.</p>
          </div>

          <!-- Feature 2 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h3>
            <p class="text-gray-600">See your feedback and statistics update in real-time as others contribute.</p>
          </div>

          <!-- Feature 3 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Detailed Analytics</h3>
            <p class="text-gray-600">Comprehensive statistics and insights to understand feedback patterns.</p>
          </div>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 text-center text-white">
        <h2 class="text-3xl font-bold mb-4">Ready to Share Your Thoughts?</h2>
        <p class="text-xl mb-6 opacity-90">
          Your feedback makes a difference. Help us improve and grow together.
        </p>
        <button
          (click)="scrollToForm()"
          class="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
        >
          Submit Feedback Now
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class FeedbackBoardComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  scrollToForm(): void {
    const formElement = document.querySelector('app-feedback-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
} 