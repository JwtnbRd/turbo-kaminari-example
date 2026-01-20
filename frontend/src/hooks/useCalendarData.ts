import { useState, useEffect } from 'react';
import { useTrainingRecords } from './useTrainingRecords';

interface CalendarEntry {
  points: number;
  trainings: number;
}

interface CalendarData {
  [date: string]: CalendarEntry;
}

// カレンダー表示用実データ
export const useCalendarData = () => {
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { records, loading: recordsLoading, refetch: refetchRecords } = useTrainingRecords();

  useEffect(() => {
    if (!recordsLoading && records) {
      processCalendarData(records);
    }
  }, [records, recordsLoading, currentMonth]);

  const processCalendarData = (trainingRecords: any[]) => {
    try {
      setLoading(true);

      const processedData: CalendarData = {};

      trainingRecords.forEach((record: any) => {
        const recordDate = new Date(record.completed_at);
        const dateStr = recordDate.toISOString().split('T')[0];

        // 仮のポイント計算
        const points = record.points || 10;

        if (!processedData[dateStr]) {
          processedData[dateStr] = {
            points: 0,
            trainings: 0,
          };
        }

        processedData[dateStr].points += points;
        processedData[dateStr].trainings += 1;
      });

      setCalendarData(processedData);
      setError(null);
    } catch (err) {
      console.error('カレンダーデータ処理エラー:', err);
      setError('カレンダーデータの処理に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 月変更
  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // 指定日のデータ取得
  const getDateData = (date: string): CalendarEntry | null => {
    return calendarData[date] || null;
  };

  // 月間統計
  const getMonthlyStats = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    let totalPoints = 0;
    let totalTrainings = 0;
    let activeDays = 0;

    Object.entries(calendarData).forEach(([dateStr, data]) => {
      const date = new Date(dateStr);
      if (date >= monthStart && date <= monthEnd) {
        totalPoints += data.points;
        totalTrainings += data.trainings;
        activeDays += 1;
      }
    });

    return {
      totalPoints,
      totalTrainings,
      activeDays,
    };
  };

  // データ再取得
  const refetch = async () => {
    await refetchRecords();
  };

  return {
    calendarData,
    currentMonth,
    loading: loading || recordsLoading,
    error,
    changeMonth,
    getDateData,
    getMonthlyStats,
    refetch,
  };
};