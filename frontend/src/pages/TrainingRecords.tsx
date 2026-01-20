import React, { useState } from "react";
import { TrainingRecordForm } from "../components/training/TrainingRecordForm";
import { TrainingRecordList } from "../components/training/TrainingRecordList";
import { useTrainingRecords } from "../hooks/useTrainingRecords";

export const TrainingRecords: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const {
    records,
    loading,
    error,
    meta,
    createRecord,
    filterRecords,
    setError,
  } = useTrainingRecords({ page: currentPage, per_page: perPage });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    filterRecords({ page, per_page: perPage });
  };

  const handleCreateRecord = async (data: any) => {
    // エラーをクリア
    if (error) {
      setError(null);
    }

    const success = await createRecord(data);
    if (success) {
      // 作成成功時は1ページ目に戻る
      setCurrentPage(1);
    }
    return success;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            スクスクスクワット
          </h1>
          <p className="mt-2 text-gray-600">
            日々のトレーニング結果を記録して、進捗を確認しましょう。
          </p>
        </div>

        {/* 統計サマリー */}
        {meta && meta.total_count > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {meta.total_count}
                </div>
                <div className="text-sm text-gray-500">総記録数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {records.reduce((sum, record) => sum + record.points, 0)}
                </div>
                <div className="text-sm text-gray-500">総獲得ポイント</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {new Set(records.map((r) => r.training_name)).size}
                </div>
                <div className="text-sm text-gray-500">
                  実施トレーニング種類
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 記録作成フォーム */}
        <TrainingRecordForm
          onSubmit={handleCreateRecord}
          loading={loading}
          error={error}
        />

        {/* 記録一覧 */}
        <TrainingRecordList
          records={records}
          loading={loading}
          error={error}
          meta={meta}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};
