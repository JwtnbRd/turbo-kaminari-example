import React, { useState, useEffect } from 'react';
import type { TrainingRecordFormData } from '../../types';
import { useTrainings } from '../../hooks/useTrainings';

interface TrainingRecordFormProps {
  onSubmit: (data: TrainingRecordFormData) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const TrainingRecordForm: React.FC<TrainingRecordFormProps> = ({
  onSubmit,
  loading,
  error
}) => {
  const [formData, setFormData] = useState<TrainingRecordFormData>({
    training_id: 0,
    reps: undefined,
    duration: undefined,
    weight: undefined,
    notes: ''
  });

  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [showForm, setShowForm] = useState<boolean>(false);

  const { trainings, loading: trainingsLoading } = useTrainings();

  // 時間を分:秒から秒数に変換
  useEffect(() => {
    const totalSeconds = durationMinutes * 60 + durationSeconds;
    setFormData(prev => ({ ...prev, duration: totalSeconds > 0 ? totalSeconds : undefined }));
  }, [durationMinutes, durationSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.training_id === 0) {
      alert('トレーニングを選択してください');
      return;
    }

    const success = await onSubmit(formData);

    if (success) {
      // フォームリセット
      setFormData({
        training_id: 0,
        reps: undefined,
        duration: undefined,
        weight: undefined,
        notes: ''
      });
      setDurationMinutes(0);
      setDurationSeconds(0);
      setShowForm(false);
      alert('記録を保存しました！');
    }
  };

  const handleInputChange = (field: keyof TrainingRecordFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">トレーニング記録</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showForm ? '閉じる' : '新しい記録を追加'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* トレーニング選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              トレーニング *
            </label>
            <select
              value={formData.training_id}
              onChange={(e) => handleInputChange('training_id', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={trainingsLoading}
            >
              <option value={0}>
                {trainingsLoading ? '読み込み中...' : 'トレーニングを選択してください'}
              </option>
              {trainings.map((training) => (
                <option key={training.id} value={training.id}>
                  {training.name} ({training.difficulty})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 回数 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                回数
              </label>
              <input
                type="number"
                value={formData.reps || ''}
                onChange={(e) => handleInputChange('reps', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 20"
                min={1}
              />
            </div>

            {/* 実施時間 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                実施時間
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="分"
                  min={0}
                />
                <span className="flex items-center text-gray-500">:</span>
                <input
                  type="number"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="秒"
                  min={0}
                  max={59}
                />
              </div>
            </div>

            {/* 重量 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                重量 (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.weight || ''}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 10.5"
                min={0}
              />
            </div>
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メモ
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="調子やコンディションなど自由にメモしてください"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading || formData.training_id === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '保存中...' : '記録を保存'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};