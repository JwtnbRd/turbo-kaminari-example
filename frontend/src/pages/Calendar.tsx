import React, { useState } from 'react';

// サンプルデータ（プロトタイプと同じ構造）
const sampleUserData = {
  monthlyPoints: 180,
  trainingDays: 8,
  averagePoints: 22.5
};

const sampleCalendarData: Record<string, { points: number; trainings: number }> = {
  "2025-11-01": { points: 20, trainings: 2 },
  "2025-11-03": { points: 15, trainings: 1 },
  "2025-11-05": { points: 30, trainings: 3 },
  "2025-11-07": { points: 25, trainings: 2 },
  "2025-11-08": { points: 20, trainings: 2 },
  "2025-11-09": { points: 15, trainings: 1 },
  "2025-11-10": { points: 35, trainings: 3 },
  "2025-11-11": { points: 20, trainings: 2 },
  "2025-11-26": { points: 25, trainings: 2 }
};

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // 2025年11月

  // カレンダーの日付生成（プロトタイプと同じロジック）
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // 月の最初の日より前の空白
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // 月の日付
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">
      {/* カレンダーメインカード */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        {/* ヘッダー（月移動） */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold">{formatMonthYear(currentDate)}</h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['日', '月', '火', '水', '木', '金', '土'].map(day => (
            <div key={day} className="text-center font-bold text-gray-600 p-2">
              {day}
            </div>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7 gap-2">
          {getDaysInMonth().map((day, index) => {
            const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
            const data = dateStr ? sampleCalendarData[dateStr] : null;

            return (
              <div
                key={index}
                className={`aspect-square p-2 rounded-lg ${
                  day ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer' : ''
                }`}
              >
                {day && (
                  <>
                    <div className="font-semibold text-sm mb-1">{day}</div>
                    {data && (
                      <div className={`text-xs p-1 rounded text-white text-center ${
                        data.points >= 30 ? 'bg-green-500' :
                        data.points >= 20 ? 'bg-blue-500' :
                        'bg-purple-500'
                      }`}>
                        {data.points}pt
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 月間統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-lg mb-2">月間累計</h3>
          <p className="text-3xl font-bold text-blue-600">{sampleUserData.monthlyPoints}pt</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-lg mb-2">トレーニング日数</h3>
          <p className="text-3xl font-bold text-green-600">{sampleUserData.trainingDays}日</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-lg mb-2">平均ポイント/日</h3>
          <p className="text-3xl font-bold text-purple-600">{sampleUserData.averagePoints}pt</p>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">クイックアクション</h3>
        <div className="flex flex-wrap gap-4">
          <a
            href="/training-records"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <span className="mr-2">📝</span>
            新しい記録を追加
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <span className="mr-2">📊</span>
            ダッシュボードへ
          </a>
        </div>
      </div>
      </div>
    </div>
  );
};