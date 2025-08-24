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

export type SortField = 'rating' | 'created_at' | 'name';
export type SortOrder = 'asc' | 'desc'; 