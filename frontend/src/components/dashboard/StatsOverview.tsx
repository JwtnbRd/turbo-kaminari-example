import React from 'react';
import type { DashboardStats } from '../../types';

interface StatsOverviewProps {
  stats: DashboardStats | null;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: '今週の記録',
      value: stats.this_week_records,
      icon: '📅',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: '今月の記録',
      value: stats.this_month_records,
      icon: '📊',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: '合計ポイント',
      value: stats.total_points,
      icon: '⭐',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: '連続日数',
      value: stats.streak_days,
      icon: '🔥',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <div key={index} className={`${card.bgColor} rounded-lg shadow p-6 border-l-4 border-${card.color.split('-')[1]}-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{card.title}</p>
              <p className={`text-2xl font-bold ${card.color}`}>
                {card.value?.toLocaleString() || 0}
              </p>
            </div>
            <div className="text-3xl">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};