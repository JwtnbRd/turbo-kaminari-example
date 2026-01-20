import React from 'react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useTrainingTrends } from '../hooks/useTrainingTrends';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { TrendChart } from '../components/dashboard/TrendChart';
import { AchievementSection } from '../components/dashboard/AchievementSection';

export const Dashboard: React.FC = () => {
  const { stats, error: statsError } = useDashboardStats();
  const { trends, error: trendsError } = useTrainingTrends();

  if (statsError || trendsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-500 text-xl mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 font-semibold">データの取得に失敗しました</h3>
              <p className="text-red-600 text-sm">
                {statsError || trendsError}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">ダッシュボード</h1>
        <p className="text-gray-600">あなたのトレーニング進捗を確認しましょう</p>
      </div>

      {/* 統計概要カード */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">統計概要</h2>
        <StatsOverview stats={stats} />
      </div>

      {/* トレーニングトレンド */}
      <div className="mb-8">
        <TrendChart trends={trends} />
      </div>

      {/* お気に入り & 達成度 */}
      <div className="mb-8">
        <AchievementSection stats={stats} />
      </div>

      {/* クイックアクション */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">クイックアクション</h3>
        <div className="flex flex-wrap gap-4">
          <a
            href="/training-records"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2">📝</span>
            新しい記録を追加
          </a>
          <a
            href="/training-records"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <span className="mr-2">📊</span>
            記録一覧を見る
          </a>
        </div>
      </div>
    </div>
  );
};