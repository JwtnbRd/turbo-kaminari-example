import { useCallback } from 'react';
import { useTrainingRecords } from './useTrainingRecords';
import type { TrainingRecordFormData } from '../types';

// トレーニング実行・保存機能
export const useTrainingExecution = () => {
  const { createRecord, loading, error } = useTrainingRecords();

  // トレーニング完了時の記録保存
  const saveTrainingRecord = useCallback(async (trainingData: {
    id: number;
    name: string;
    duration: number;
    points: number;
  }) => {
    const recordData: TrainingRecordFormData = {
      training_id: trainingData.id,
      duration: trainingData.duration,
      notes: `${trainingData.name}を完了しました`,
      completed_at: new Date().toISOString(),
    };

    try {
      const success = await createRecord(recordData);
      if (success) {
        console.log('トレーニング記録が保存されました');
        return true;
      }
      return false;
    } catch (err) {
      console.error('トレーニング記録の保存に失敗しました:', err);
      return false;
    }
  }, [createRecord]);

  return {
    saveTrainingRecord,
    loading,
    error,
  };
};