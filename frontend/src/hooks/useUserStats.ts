import { useState, useEffect } from 'react';
import api from '../services/api';

interface UserDashboardStats {
  total_points: number;
  current_streak: number;
  longest_streak: number;
  total_training_count: number;
  last_training_date: string | null;
  this_month_points: number;
  today_completed: boolean;
  today_count: number;
  today_remaining: number;
  weekly_activity: Array<{
    day: string;
    completed: boolean;
    points: number;
  }>;
}

// ユーザー統計データの取得
export const useUserStats = () => {
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<{ dashboard_stats: UserDashboardStats }>('/users/dashboard_stats');
      setStats(response.data.dashboard_stats);
    } catch (err: any) {
      console.error('Failed to fetch user stats:', err);
      setError(err.response?.data?.error || 'Failed to fetch user stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};