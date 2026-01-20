import { useState, useEffect } from 'react';
import type { TrainingTrends } from '../types';
import api from '../services/api';

export const useTrainingTrends = () => {
  const [trends, setTrends] = useState<TrainingTrends | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/users/training_trends');
      setTrends(response.data.training_trends);
    } catch (err: any) {
      console.error('Failed to fetch training trends:', err);
      setError(err.response?.data?.error || 'トレーニングトレンドの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  return {
    trends,
    loading,
    error,
    refetch: fetchTrends
  };
};