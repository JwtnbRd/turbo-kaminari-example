import React, { useState, useEffect } from 'react';
import type { Training, TrainingFormData } from '../../hooks/useAdminTrainings';

interface TrainingFormProps {
  training?: Training | null;
  onSubmit: (data: TrainingFormData) => Promise<boolean>;
  onCancel: () => void;
  loading: boolean;
}

export const TrainingForm: React.FC<TrainingFormProps> = ({
  training,
  onSubmit,
  onCancel,
  loading
}) => {
  const [formData, setFormData] = useState<TrainingFormData>({
    name: '',
    description: '',
    duration: 60,
    base_points: 10,
    difficulty: 'beginner',
    published: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (training) {
      setFormData({
        name: training.name,
        description: training.description,
        duration: training.duration,
        base_points: training.base_points,
        difficulty: training.difficulty,
        published: training.published
      });
    } else {
      setFormData({
        name: '',
        description: '',
        duration: 60,
        base_points: 10,
        difficulty: 'beginner',
        published: false
      });
    }
    setErrors({});
  }, [training]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'トレーニング名は必須です';
    } else if (formData.name.length > 100) {
      newErrors.name = 'トレーニング名は100文字以内で入力してください';
    }

    if (formData.description.length > 500) {
      newErrors.description = '説明は500文字以内で入力してください';
    }

    if (formData.duration <= 0) {
      newErrors.duration = '時間は1秒以上で入力してください';
    } else if (formData.duration > 3600) {
      newErrors.duration = '時間は3600秒以内で入力してください';
    }

    if (formData.base_points < 0) {
      newErrors.base_points = 'ポイントは0以上で入力してください';
    } else if (formData.base_points > 1000) {
      newErrors.base_points = 'ポイントは1000以下で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      onCancel(); // フォームを閉じる
    }
  };

  const handleInputChange = (field: keyof TrainingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatMinutesSeconds = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0 && remainingSeconds > 0) {
      return `${minutes}分${remainingSeconds}秒`;
    } else if (minutes > 0) {
      return `${minutes}分`;
    } else {
      return `${remainingSeconds}秒`;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {training ? 'トレーニング編集' : '新規トレーニング作成'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* トレーニング名 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              トレーニング名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例: 腕立て伏せ"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* 説明 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              説明
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="トレーニングの詳細説明"
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 時間 */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                時間（秒） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.duration ? 'border-red-500' : 'border-gray-300'
                }`}
                min="1"
                max="3600"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formatMinutesSeconds(formData.duration)}
              </p>
              {errors.duration && <p className="mt-1 text-sm text-red-500">{errors.duration}</p>}
            </div>

            {/* ベースポイント */}
            <div>
              <label htmlFor="base_points" className="block text-sm font-medium text-gray-700 mb-2">
                ベースポイント <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="base_points"
                value={formData.base_points}
                onChange={(e) => handleInputChange('base_points', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.base_points ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                max="1000"
              />
              {errors.base_points && <p className="mt-1 text-sm text-red-500">{errors.base_points}</p>}
            </div>
          </div>

          {/* 難易度 */}
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
              難易度 <span className="text-red-500">*</span>
            </label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) => handleInputChange('difficulty', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="beginner">初級 (×1.0)</option>
              <option value="intermediate">中級 (×1.5)</option>
              <option value="advanced">上級 (×2.0)</option>
            </select>
          </div>

          {/* 公開設定 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => handleInputChange('published', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
              公開する
            </label>
          </div>
        </form>

        {/* ボタンエリア */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {training ? '更新' : '作成'}
          </button>
        </div>
      </div>
    </div>
  );
};