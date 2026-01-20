import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export interface RankingUser {
  rank: number;
  user_id: number;
  username: string;
  points: number;
  streak: number;
}

interface RankingsResponse {
  rankings: RankingUser[];
  current_user_rank: RankingUser | null;
}

export const useRankings = () => {
  const [pointsRankings, setPointsRankings] = useState<RankingUser[]>([]);
  const [streaksRankings, setStreaksRankings] = useState<RankingUser[]>([]);
  const [currentUserPointsRank, setCurrentUserPointsRank] = useState<RankingUser | null>(null);
  const [currentUserStreaksRank, setCurrentUserStreaksRank] = useState<RankingUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPointsRankings = useCallback(async () => {
    try {
      const response = await api.get<RankingsResponse>('/rankings/points');
      setPointsRankings(response.data.rankings);
      setCurrentUserPointsRank(response.data.current_user_rank);
    } catch (err: any) {
      console.error('Failed to fetch points rankings:', err);
      setError(err.response?.data?.error || 'Failed to fetch points rankings');
    }
  }, []);

  const fetchStreaksRankings = useCallback(async () => {
    try {
      const response = await api.get<RankingsResponse>('/rankings/streaks');
      setStreaksRankings(response.data.rankings);
      setCurrentUserStreaksRank(response.data.current_user_rank);
    } catch (err: any) {
      console.error('Failed to fetch streaks rankings:', err);
      setError(err.response?.data?.error || 'Failed to fetch streaks rankings');
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchPointsRankings(), fetchStreaksRankings()]);
    setLoading(false);
  }, [fetchPointsRankings, fetchStreaksRankings]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    pointsRankings,
    streaksRankings,
    currentUserPointsRank,
    currentUserStreaksRank,
    loading,
    error,
    refetch: fetchAll,
  };
};
