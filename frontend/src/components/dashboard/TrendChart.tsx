import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import type { TrainingTrends } from '../../types';

// Chart.jsの要素を登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface TrendChartProps {
  trends: TrainingTrends | null;
}

export const TrendChart: React.FC<TrendChartProps> = ({ trends }) => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');

  if (!trends) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  // 週間データのグラフ設定
  const weeklyData = {
    labels: trends.weekly_data.map(d => d.week),
    datasets: [
      {
        label: '週間記録数',
        data: trends.weekly_data.map(d => d.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.1,
        fill: true,
      }
    ]
  };

  // 月間データのグラフ設定
  const monthlyData = {
    labels: trends.monthly_data.map(d => d.month),
    datasets: [
      {
        label: '月間記録数',
        data: trends.monthly_data.map(d => d.count),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.1,
        fill: true,
      }
    ]
  };

  // トレーニング頻度の円グラフ設定
  const frequencyLabels = Object.keys(trends.training_frequency);
  const frequencyValues = Object.values(trends.training_frequency);
  const colors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(139, 92, 246, 0.8)'
  ];

  const frequencyData = {
    labels: frequencyLabels,
    datasets: [
      {
        label: '実行回数',
        data: frequencyValues,
        backgroundColor: colors.slice(0, frequencyLabels.length),
        borderColor: colors.slice(0, frequencyLabels.length).map(color => color.replace('0.8', '1')),
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">トレーニングトレンド</h3>

        {/* タブボタン */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'weekly'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            週間
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'monthly'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            月間
          </button>
        </div>
      </div>

      {/* トレンドグラフ */}
      <div className="mb-8">
        <div className="h-64">
          {activeTab === 'weekly' ? (
            <Line data={weeklyData} options={chartOptions} />
          ) : (
            <Line data={monthlyData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* トレーニング頻度円グラフ */}
      {frequencyLabels.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4">トレーニング別頻度</h4>
          <div className="h-64">
            <Doughnut data={frequencyData} options={doughnutOptions} />
          </div>
        </div>
      )}
    </div>
  );
};