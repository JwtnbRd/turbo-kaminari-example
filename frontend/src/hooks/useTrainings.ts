import { useState, useEffect } from 'react';
import api from '../services/api';
import type { Training } from '../types';

export const useTrainings = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainings = async () => {
    setLoading(true);
    setError(null);

    try {
      // 一般ユーザー向けのAPIエンドポイントを使用（認証不要、公開済みのみ返却）
      const response = await api.get<Training[]>('/trainings');
      setTrainings(response.data);
    } catch (err: any) {
      console.error('Failed to fetch trainings:', err);
      setError(err.response?.data?.error || 'Failed to fetch trainings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  return {
    trainings,
    loading,
    error,
    refetch: fetchTrainings
  };
};