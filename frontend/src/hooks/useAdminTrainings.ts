import { useState, useEffect } from 'react';
import api from '../services/api';

export interface Training {
  id: number;
  name: string;
  description: string;
  duration: number;
  base_points: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  published: boolean;
  created_at: string;
  updated_at: string;
  training_records_count: number;
  formatted_duration: string;
  difficulty_multiplier: number;
}

export interface TrainingFormData {
  name: string;
  description: string;
  duration: number;
  base_points: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  published: boolean;
}

export const useAdminTrainings = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // トレーニング一覧取得
  const fetchTrainings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/trainings');
      setTrainings(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'トレーニングの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // トレーニング作成
  const createTraining = async (trainingData: TrainingFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/admin/trainings', {
        training: trainingData
      });
      setTrainings(prev => [...prev, response.data]);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.errors?.join(', ') || 'トレーニングの作成に失敗しました');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // トレーニング更新
  const updateTraining = async (id: number, trainingData: TrainingFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/admin/trainings/${id}`, {
        training: trainingData
      });
      setTrainings(prev => prev.map(t => t.id === id ? response.data : t));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.errors?.join(', ') || 'トレーニングの更新に失敗しました');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // トレーニング削除
  const deleteTraining = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/admin/trainings/${id}`);
      setTrainings(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'トレーニングの削除に失敗しました');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 公開/非公開切り替え
  const togglePublished = async (id: number, published: boolean): Promise<boolean> => {
    const training = trainings.find(t => t.id === id);
    if (!training) return false;

    return await updateTraining(id, {
      name: training.name,
      description: training.description,
      duration: training.duration,
      base_points: training.base_points,
      difficulty: training.difficulty,
      published: published
    });
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  return {
    trainings,
    loading,
    error,
    fetchTrainings,
    createTraining,
    updateTraining,
    deleteTraining,
    togglePublished,
    setError
  };
};