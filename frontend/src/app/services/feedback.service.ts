import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { 
  Feedback, 
  FeedbackResponse, 
  FeedbackListResponse,
  SortField,
  SortOrder 
} from '../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'http://localhost:3100/api';
  private feedbackSubject = new BehaviorSubject<Feedback[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private initialLoadSubject = new BehaviorSubject<boolean>(true);

  public feedback$ = this.feedbackSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public initialLoad$ = this.initialLoadSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Submit new feedback
  submitFeedback(feedback: Feedback): Observable<FeedbackResponse> {
    this.loadingSubject.next(true);
    
    return this.http.post<FeedbackResponse>(`${this.apiUrl}/feedback`, feedback).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentFeedback = this.feedbackSubject.value;
          this.feedbackSubject.next([response.data, ...currentFeedback]);
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
    // Always show loading for the first request
    if (this.initialLoadSubject.value) {
      this.loadingSubject.next(true);
    }
    
    const params = new HttpParams()
      .set('sortBy', sortBy)
      .set('order', order);

    return this.http.get<FeedbackListResponse>(`${this.apiUrl}/feedback`, { params }).pipe(
      tap(response => {
        if (response.success) {
          this.feedbackSubject.next(response.data);
          this.initialLoadSubject.next(false);
        }
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(error => {
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  // Load feedback data
  loadFeedback(sortBy: SortField = 'created_at', order: SortOrder = 'desc'): void {
    this.getFeedback(sortBy, order);
  }

  // Refresh data
  refreshData(sortBy: SortField = 'created_at', order: SortOrder = 'desc'): void {
    this.loadFeedback(sortBy, order);
  }

  get baseUrl(): string {
    return this.apiUrl;
  }
} 