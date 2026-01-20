import React from 'react';
import type { Training } from '../../hooks/useAdminTrainings';

interface TrainingListProps {
  trainings: Training[];
  loading: boolean;
  onEdit: (training: Training) => void;
  onDelete: (id: number) => void;
  onTogglePublished: (id: number, published: boolean) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-800';
    case 'intermediate': return 'bg-yellow-100 text-yellow-800';
    case 'advanced': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return '初級';
    case 'intermediate': return '中級';
    case 'advanced': return '上級';
    default: return difficulty;
  }
};

export const TrainingList: React.FC<TrainingListProps> = ({
  trainings,
  loading,
  onEdit,
  onDelete,
  onTogglePublished
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (trainings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">トレーニングがありません</p>
        <p className="text-gray-400 text-sm mt-2">新しいトレーニングを作成してください</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* デスクトップ版テーブル */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                トレーニング
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                時間/ポイント
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                難易度
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                実行回数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trainings.map((training) => (
              <tr key={training.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{training.name}</div>
                    <div className="text-sm text-gray-500">{training.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{training.formatted_duration}</div>
                  <div className="text-sm text-gray-500">{training.base_points}pt × {training.difficulty_multiplier}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(training.difficulty)}`}>
                    {getDifficultyLabel(training.difficulty)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {training.training_records_count}回
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onTogglePublished(training.id, !training.published)}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      training.published
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {training.published ? '公開中' : '非公開'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onEdit(training)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => onDelete(training.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* モバイル版カードレイアウト */}
      <div className="md:hidden">
        {trainings.map((training) => (
          <div key={training.id} className="border-b border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">{training.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{training.description}</p>
              </div>
              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(training.difficulty)}`}>
                {getDifficultyLabel(training.difficulty)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
              <div>
                <span className="text-gray-500">時間: </span>
                <span className="text-gray-900">{training.formatted_duration}</span>
              </div>
              <div>
                <span className="text-gray-500">ポイント: </span>
                <span className="text-gray-900">{training.base_points}pt × {training.difficulty_multiplier}</span>
              </div>
              <div>
                <span className="text-gray-500">実行回数: </span>
                <span className="text-gray-900">{training.training_records_count}回</span>
              </div>
              <div>
                <button
                  onClick={() => onTogglePublished(training.id, !training.published)}
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    training.published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {training.published ? '公開中' : '非公開'}
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => onEdit(training)}
                className="flex-1 bg-blue-50 text-blue-700 text-sm font-medium py-2 px-3 rounded-md hover:bg-blue-100"
              >
                編集
              </button>
              <button
                onClick={() => onDelete(training.id)}
                className="flex-1 bg-red-50 text-red-700 text-sm font-medium py-2 px-3 rounded-md hover:bg-red-100"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};