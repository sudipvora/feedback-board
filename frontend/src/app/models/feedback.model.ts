export interface Feedback {
  id?: number;
  name: string;
  message: string;
  rating: number;
  created_at?: string;
  updated_at?: string;
}

export interface FeedbackResponse {
  success: boolean;
  message?: string;
  data?: Feedback;
  error?: string;
  details?: any;
}

export interface FeedbackListResponse {
  success: boolean;
  count: number;
  data: Feedback[];
}

export interface FeedbackStats {
  total_feedback: number;
  average_rating: number;
  min_rating: number;
  max_rating: number;
  positive_feedback: number;
  negative_feedback: number;
  rating_distribution: Array<{
    rating: number;
    count: number;
  }>;
}

export interface FeedbackStatsResponse {
  success: boolean;
  data: FeedbackStats;
}

export type SortField = 'rating' | 'created_at' | 'name';
export type SortOrder = 'asc' | 'desc'; 