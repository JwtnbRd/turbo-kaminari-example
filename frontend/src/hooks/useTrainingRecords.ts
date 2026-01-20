import { useState, useEffect } from 'react';
import api from '../services/api';
import type { TrainingRecord, TrainingRecordFormData } from '../types';

interface UseTrainingRecordsOptions {
  training_id?: number;
  page?: number;
  per_page?: number;
}

interface TrainingRecordsResponse {
  data: TrainingRecord[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

export const useTrainingRecords = (options: UseTrainingRecordsOptions = {}) => {
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<TrainingRecordsResponse['meta'] | null>(null);

  // 記録一覧取得
  const fetchRecords = async (params: UseTrainingRecordsOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();

      if (params.training_id) queryParams.append('training_id', params.training_id.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.per_page) queryParams.append('per_page', params.per_page.toString());

      const response = await api.get<TrainingRecordsResponse>(`/training_records?${queryParams}`);

      setRecords(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      console.error('Failed to fetch training records:', err);
      setError(err.response?.data?.error || 'Failed to fetch training records');
    } finally {
      setLoading(false);
    }
  };

  // 記録作成
  const createRecord = async (data: TrainingRecordFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await api.post<TrainingRecord>('/training_records', {
        training_record: data
      });

      // 作成成功時は一覧を再取得
      await fetchRecords(options);

      return true;
    } catch (err: any) {
      console.error('Failed to create training record:', err);
      setError(err.response?.data?.errors?.[0] || 'Failed to create training record');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 記録更新
  const updateRecord = async (id: number, data: Partial<TrainingRecordFormData>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await api.patch(`/training_records/${id}`, {
        training_record: data
      });

      // 更新成功時は一覧を再取得
      await fetchRecords(options);

      return true;
    } catch (err: any) {
      console.error('Failed to update training record:', err);
      setError(err.response?.data?.errors?.[0] || 'Failed to update training record');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 記録削除
  const deleteRecord = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/training_records/${id}`);

      // 削除成功時は一覧を再取得
      await fetchRecords(options);

      return true;
    } catch (err: any) {
      console.error('Failed to delete training record:', err);
      setError(err.response?.data?.error || 'Failed to delete training record');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // フィルタリング
  const filterRecords = async (filters: UseTrainingRecordsOptions) => {
    await fetchRecords({ ...options, ...filters });
  };

  // 初回ロード
  useEffect(() => {
    fetchRecords(options);
  }, []); // 依存配列を空にして初回のみ実行

  return {
    records,
    loading,
    error,
    meta,
    createRecord,
    updateRecord,
    deleteRecord,
    filterRecords,
    refetch: () => fetchRecords(options),
    setError // エラーメッセージをクリアするため
  };
};