import { useState, useEffect } from 'react';
import { useUserStats } from './useUserStats';

interface DashboardStats {
  totalPoints: number;
  currentStreak: number;
  monthlyPoints: number;
  todayCompleted: boolean;
  todayCount: number;
  todayRemaining: number;
  weeklyActivity: Array<{
    day: string;
    completed: boolean;
    points: number;
  }>;
}

// ダッシュボード統計データ
export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPoints: 0,
    currentStreak: 0,
    monthlyPoints: 0,
    todayCompleted: false,
    todayCount: 0,
    todayRemaining: 3,
    weeklyActivity: [],
  });

  const { stats: userStats, loading, error, refetch } = useUserStats();

  useEffect(() => {
    if (userStats) {
      setStats({
        totalPoints: userStats.total_points,
        currentStreak: userStats.current_streak,
        monthlyPoints: userStats.this_month_points,
        todayCompleted: userStats.today_completed,
        todayCount: userStats.today_count || 0,
        todayRemaining: userStats.today_remaining || 3,
        weeklyActivity: userStats.weekly_activity || [],
      });
    }
  }, [userStats]);

  return {
    stats,
    loading,
    error,
    refetch,
  };
};