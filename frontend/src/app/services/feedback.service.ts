import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { 
  Feedback, 
  FeedbackResponse, 
  FeedbackListResponse, 
  FeedbackStatsResponse,
  SortField,
  SortOrder 
} from '../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'http://localhost:3000/api';
  private feedbackSubject = new BehaviorSubject<Feedback[]>([]);
  private statsSubject = new BehaviorSubject<any>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public feedback$ = this.feedbackSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Submit new feedback
  submitFeedback(feedback: Feedback): Observable<FeedbackResponse> {
    this.loadingSubject.next(true);
    
    return this.http.post<FeedbackResponse>(`${this.apiUrl}/feedback`, feedback).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentFeedback = this.feedbackSubject.value;
          this.feedbackSubject.next([response.data, ...currentFeedback]);
          this.loadStats(); // Refresh stats after new submission
        }
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(error => {
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  // Get all feedback with optional sorting
  getFeedback(sortBy: SortField = 'created_at', order: SortOrder = 'desc'): Observable<FeedbackListResponse> {
    this.loadingSubject.next(true);
    
    const params = new HttpParams()
      .set('sortBy', sortBy)
      .set('order', order);

    return this.http.get<FeedbackListResponse>(`${this.apiUrl}/feedback`, { params }).pipe(
      tap(response => {
        if (response.success) {
          this.feedbackSubject.next(response.data);
        }
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(error => {
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  // Get feedback statistics
  getStats(): Observable<FeedbackStatsResponse> {
    return this.http.get<FeedbackStatsResponse>(`${this.apiUrl}/feedback/stats`).pipe(
      tap(response => {
        if (response.success) {
          this.statsSubject.next(response.data);
        }
      }),
      catchError(error => {
        throw error;
      })
    );
  }

  // Load feedback data
  loadFeedback(sortBy: SortField = 'created_at', order: SortOrder = 'desc'): void {
    this.getFeedback(sortBy, order).subscribe();
  }

  // Load statistics
  loadStats(): void {
    this.getStats().subscribe();
  }

  // Refresh all data
  refreshData(sortBy: SortField = 'created_at', order: SortOrder = 'desc'): void {
    this.loadFeedback(sortBy, order);
    this.loadStats();
  }

  // Get current feedback from cache
  getCurrentFeedback(): Feedback[] {
    return this.feedbackSubject.value;
  }

  // Get current stats from cache
  getCurrentStats(): any {
    return this.statsSubject.value;
  }

  // Check if currently loading
  isLoading(): boolean {
    return this.loadingSubject.value;
  }
} 