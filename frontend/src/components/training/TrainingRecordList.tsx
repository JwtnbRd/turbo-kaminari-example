import React, { useState } from 'react';
import type { TrainingRecord } from '../../types';

interface TrainingRecordListProps {
  records: TrainingRecord[];
  loading: boolean;
  error: string | null;
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  } | null;
  onPageChange: (page: number) => void;
}

export const TrainingRecordList: React.FC<TrainingRecordListProps> = ({
  records,
  loading,
  error,
  meta,
  onPageChange
}) => {
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());

  const toggleNotes = (recordId: number) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId);
    } else {
      newExpanded.add(recordId);
    }
    setExpandedNotes(newExpanded);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">記録がありません</h3>
          <p className="mt-1 text-sm text-gray-500">
            トレーニング記録を作成して、進捗を記録しましょう。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          トレーニング記録 {meta && `(${meta.total_count}件)`}
        </h3>
      </div>

      {/* デスクトップ表示 */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                実施日時
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                トレーニング
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                回数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                時間
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                重量
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ポイント
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                メモ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDateTime(record.completed_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {record.training_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.reps ? `${record.reps}回` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDuration(record.duration)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.weight ? `${record.weight}kg` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {record.points}pt
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {record.notes ? (
                    <div>
                      <div className={expandedNotes.has(record.id) ? '' : 'truncate max-w-xs'}>
                        {record.notes}
                      </div>
                      {record.notes.length > 50 && (
                        <button
                          onClick={() => toggleNotes(record.id)}
                          className="text-blue-500 hover:text-blue-700 text-xs mt-1"
                        >
                          {expandedNotes.has(record.id) ? '省略' : '詳細'}
                        </button>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* モバイル表示 */}
      <div className="md:hidden">
        {records.map((record) => (
          <div key={record.id} className="px-6 py-4 border-b border-gray-200 last:border-b-0">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-medium text-gray-900">{record.training_name}</h4>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {record.points}pt
              </span>
            </div>

            <div className="text-sm text-gray-600 mb-2">
              {formatDateTime(record.completed_at)}
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-gray-500">回数:</span>
                <div className="font-medium">{record.reps ? `${record.reps}回` : '-'}</div>
              </div>
              <div>
                <span className="text-gray-500">時間:</span>
                <div className="font-medium">{formatDuration(record.duration)}</div>
              </div>
              <div>
                <span className="text-gray-500">重量:</span>
                <div className="font-medium">{record.weight ? `${record.weight}kg` : '-'}</div>
              </div>
            </div>

            {record.notes && (
              <div className="mt-2 text-sm text-gray-700">
                <span className="text-gray-500">メモ:</span>
                <div className={expandedNotes.has(record.id) ? '' : 'truncate'}>
                  {record.notes}
                </div>
                {record.notes.length > 50 && (
                  <button
                    onClick={() => toggleNotes(record.id)}
                    className="text-blue-500 hover:text-blue-700 text-xs mt-1"
                  >
                    {expandedNotes.has(record.id) ? '省略' : '詳細'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ページネーション */}
      {meta && meta.total_pages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => onPageChange(meta.current_page - 1)}
                disabled={meta.current_page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>
              <button
                onClick={() => onPageChange(meta.current_page + 1)}
                disabled={meta.current_page >= meta.total_pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{((meta.current_page - 1) * meta.per_page) + 1}</span>
                  {' '}から{' '}
                  <span className="font-medium">
                    {Math.min(meta.current_page * meta.per_page, meta.total_count)}
                  </span>
                  {' '}件目 (全{' '}
                  <span className="font-medium">{meta.total_count}</span>
                  {' '}件)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => onPageChange(meta.current_page - 1)}
                    disabled={meta.current_page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    前へ
                  </button>

                  {/* ページ番号（簡素版） */}
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {meta.current_page} / {meta.total_pages}
                  </span>

                  <button
                    onClick={() => onPageChange(meta.current_page + 1)}
                    disabled={meta.current_page >= meta.total_pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    次へ
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};