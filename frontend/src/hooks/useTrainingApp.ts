import { useState, useCallback } from 'react';

// TrainingAppメインの状態管理
export const useTrainingApp = () => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [isTrainingComplete, setIsTrainingComplete] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [prepCountdown, setPrepCountdown] = useState<number | null>(null);
  const [todayTrainingDone, setTodayTrainingDone] = useState(false);
  const [selectedRankingTab, setSelectedRankingTab] = useState('points');

  // 画面遷移
  const navigateTo = useCallback((screen: string) => {
    setCurrentScreen(screen);
  }, []);

  // トレーニング選択
  const selectTraining = useCallback((training: any) => {
    setSelectedTraining(training);
    setCurrentScreen('training-execution');
    setPrepCountdown(3); // 準備カウントダウン開始
    setCountdown(training.duration);
  }, []);

  // トレーニング完了
  const completeTraining = useCallback(() => {
    setIsTrainingComplete(true);
    setTodayTrainingDone(true);
    setCountdown(null);
  }, []);

  // リセット
  const resetTraining = useCallback(() => {
    setSelectedTraining(null);
    setIsTrainingComplete(false);
    setCountdown(null);
    setPrepCountdown(null);
  }, []);

  // ランキングタブ変更
  const setRankingTab = useCallback((tab: string) => {
    setSelectedRankingTab(tab);
  }, []);

  return {
    // 状態
    currentScreen,
    selectedTraining,
    isTrainingComplete,
    countdown,
    prepCountdown,
    todayTrainingDone,
    selectedRankingTab,

    // アクション
    navigateTo,
    selectTraining,
    completeTraining,
    resetTraining,
    setRankingTab,
    setSelectedRankingTab,
    setCountdown,
    setPrepCountdown,
    setIsTrainingComplete,
  };
};