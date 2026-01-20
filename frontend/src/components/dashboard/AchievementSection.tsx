import React from 'react';
import type { DashboardStats } from '../../types';

interface AchievementSectionProps {
  stats: DashboardStats | null;
}

export const AchievementSection: React.FC<AchievementSectionProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // 達成度バッジの計算
  const getAchievementBadges = () => {
    const badges = [];

    // 記録数バッジ
    if (stats.total_records >= 100) {
      badges.push({ title: '記録マスター', icon: '🏆', description: '100回以上記録' });
    } else if (stats.total_records >= 50) {
      badges.push({ title: '記録エキスパート', icon: '🥈', description: '50回以上記録' });
    } else if (stats.total_records >= 10) {
      badges.push({ title: '記録チャレンジャー', icon: '🥉', description: '10回以上記録' });
    }

    // ポイントバッジ
    if (stats.total_points >= 1000) {
      badges.push({ title: 'ポイントキング', icon: '👑', description: '1000ポイント獲得' });
    } else if (stats.total_points >= 500) {
      badges.push({ title: 'ポイントマスター', icon: '💎', description: '500ポイント獲得' });
    }

    // 連続日数バッジ
    if (stats.streak_days >= 30) {
      badges.push({ title: '継続の達人', icon: '🔥', description: '30日連続' });
    } else if (stats.streak_days >= 7) {
      badges.push({ title: '習慣づくり', icon: '⚡', description: '7日連続' });
    } else if (stats.streak_days >= 3) {
      badges.push({ title: '継続中', icon: '💪', description: '3日連続' });
    }

    return badges;
  };

  const badges = getAchievementBadges();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* お気に入りトレーニング */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">お気に入りトレーニング</h3>

        {stats.favorite_training ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏋️</div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">{stats.favorite_training}</h4>
            <p className="text-gray-600">最も頻繁に実行しているトレーニングです</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💤</div>
            <p className="text-gray-600">まだトレーニング記録がありません</p>
            <p className="text-sm text-gray-500 mt-2">トレーニングを記録してお気に入りを見つけましょう！</p>
          </div>
        )}
      </div>

      {/* 達成度バッジ */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">達成バッジ</h3>

        {badges.length > 0 ? (
          <div className="space-y-3">
            {badges.map((badge, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mr-3">{badge.icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-800">{badge.title}</h4>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-gray-600">まだバッジはありません</p>
            <p className="text-sm text-gray-500 mt-2">トレーニングを続けてバッジを獲得しましょう！</p>
          </div>
        )}
      </div>
    </div>
  );
};