// User types
export interface User {
  id: number;
  email: string;
  username: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

// Training types
export interface Training {
  id: number;
  name: string;
  description: string;
  duration: number; // seconds
  base_points: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  published: boolean;
  explain: string[]; // トレーニング手順の配列
  created_at: string;
  updated_at: string;
}

// Training Record types
export interface TrainingRecord {
  id: number;
  user_id?: number;
  training_id: number;
  training_name: string;
  reps?: number;
  duration?: number;
  weight?: string | number;
  notes?: string;
  points: number;
  completed_at: string;
  created_at: string;
  updated_at?: string;
  training?: Training;
}

// Training Record Form types
export interface TrainingRecordFormData {
  training_id: number;
  reps?: number;
  duration?: number;
  weight?: number;
  notes?: string;
  completed_at?: string;
}

// User Stats types
export interface UserStats {
  id: number;
  user_id: number;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  total_training_count: number;
  last_training_date: string | null;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

export interface ApiError {
  errors: string[];
}

// Ranking types
export interface RankingUser {
  id: number;
  username: string;
  total_points: number;
  current_streak: number;
  rank: number;
}

// Dashboard types
export interface DashboardStats {
  total_records: number;
  this_week_records: number;
  this_month_records: number;
  total_points: number;
  streak_days: number;
  favorite_training: string | null;
}

export interface WeeklyData {
  week: string;
  count: number;
}

export interface MonthlyData {
  month: string;
  count: number;
}

export interface TrainingTrends {
  weekly_data: WeeklyData[];
  monthly_data: MonthlyData[];
  training_frequency: Record<string, number>;
}