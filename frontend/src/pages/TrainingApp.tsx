import React, { useEffect } from "react";
import {
  Calendar,
  Trophy,
  Flame,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTrainingApp } from "../hooks/useTrainingApp";
import { useTrainingExecution } from "../hooks/useTrainingExecution";
import { useDashboardData } from "../hooks/useDashboardData";
import { useCalendarData } from "../hooks/useCalendarData";
import { useAuth } from "../hooks/useAuth";
import { useTrainings } from "../hooks/useTrainings";
import { useRankings } from "../hooks/useRankings";
import type { Training } from "../types";

// 絵文字マッピング（トレーニング名から絵文字を決定）
const getTrainingEmoji = (name: string): string => {
  if (name.includes("腕立て")) return "🏋️";
  if (name.includes("スクワット")) return "🦵";
  if (name.includes("プランク")) return "💪";
  if (name.includes("バーピー")) return "🔥";
  return "💪"; // デフォルト
};

// 難易度の日本語変換
const getDifficultyLabel = (difficulty: string): string => {
  switch (difficulty) {
    case "beginner":
      return "初級";
    case "intermediate":
      return "中級";
    case "advanced":
      return "上級";
    default:
      return difficulty;
  }
};

const TrainingApp = () => {
  // カスタムフック使用
  const trainingApp = useTrainingApp();
  const trainingExecution = useTrainingExecution();
  const dashboardData = useDashboardData();
  const calendarData = useCalendarData();
  const auth = useAuth();
  const {
    trainings,
    loading: trainingsLoading,
    error: trainingsError,
  } = useTrainings();
  const rankings = useRankings();

  // 分割代入で状態取得（後方互換性のため）
  const {
    currentScreen,
    selectedTraining,
    isTrainingComplete,
    countdown,
    prepCountdown,
    selectedRankingTab,
    navigateTo,
    selectTraining,
    resetTraining,
    setSelectedRankingTab,
    setCountdown,
    setPrepCountdown,
    setIsTrainingComplete,
  } = trainingApp;

  // 認証状態確認とリダイレクト
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      // 未認証の場合は即座にログインページにリダイレクト
      window.location.href = "/login";
    }
  }, [auth.loading, auth.isAuthenticated]);

  // 読み込み中または未認証の場合はローディング画面
  if (auth.loading || !auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl">読み込み中...</div>
        </div>
      </div>
    );
  }

  // ナビゲーションバー
  const Navigation = () => (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">💪 スクスクスクワット</h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm">{auth.user?.username}さん</span>
          <button
            onClick={() => navigateTo("dashboard")}
            className={`px-4 py-2 rounded-lg transition ${
              currentScreen === "dashboard"
                ? "bg-white text-blue-600"
                : "hover:bg-blue-500"
            }`}
          >
            ホーム
          </button>
          <button
            onClick={() => navigateTo("calendar")}
            className={`px-4 py-2 rounded-lg transition ${
              currentScreen === "calendar"
                ? "bg-white text-blue-600"
                : "hover:bg-blue-500"
            }`}
          >
            <Calendar className="inline mr-2" size={20} />
            記録
          </button>
          <button
            onClick={() => navigateTo("ranking")}
            className={`px-4 py-2 rounded-lg transition ${
              currentScreen === "ranking"
                ? "bg-white text-blue-600"
                : "hover:bg-blue-500"
            }`}
          >
            <Trophy className="inline mr-2" size={20} />
            ランキング
          </button>
          <button
            onClick={async () => {
              await auth.logout();
              window.location.href = "/";
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            ログアウト
          </button>
        </div>
      </div>
    </nav>
  );

  // ダッシュボード画面
  const Dashboard = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <h2 className="text-3xl font-bold mb-2">
          ようこそ、{auth.user?.username || "ユーザー"}さん！
        </h2>
        <p className="text-gray-600 mb-6">
          今日もトレーニングを頑張りましょう 🔥
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="text-blue-600" size={24} />
              <span className="text-gray-600 text-sm">累計ポイント</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {dashboardData.loading ? "..." : dashboardData.stats.totalPoints}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="text-orange-600" size={24} />
              <span className="text-gray-600 text-sm">連続日数</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {dashboardData.loading
                ? "..."
                : dashboardData.stats.currentStreak}
              日
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-green-600" size={24} />
              <span className="text-gray-600 text-sm">今月のポイント</span>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {dashboardData.loading
                ? "..."
                : dashboardData.stats.monthlyPoints}
            </p>
          </div>
        </div>

        <div className="text-center">
          {dashboardData.stats.todayRemaining === 0 ? (
            // 今日の上限（3回）に達した場合
            <div className="space-y-4">
              <div className="bg-gray-100 text-gray-600 px-8 py-4 text-xl font-bold rounded-lg">
                🎉 今日のトレーニング完了 (3/3)
              </div>
              <p className="text-gray-600">
                お疲れさまでした！明日また頑張りましょう
              </p>
            </div>
          ) : dashboardData.stats.todayCompleted ? (
            // 1回以上完了している場合
            <div className="space-y-4">
              <div className="bg-green-100 text-green-800 px-8 py-4 text-xl font-bold rounded-lg">
                ✅ 今日はトレーニング済み ({dashboardData.stats.todayCount}/3)
              </div>
              <button
                onClick={() => navigateTo("training-select")}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
              >
                もう一回やる ({dashboardData.stats.todayRemaining}回残り)
              </button>
            </div>
          ) : (
            // 今日初回の場合
            <button
              onClick={() => navigateTo("training-select")}
              className="px-8 py-4 text-xl font-bold rounded-lg transition transform hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              🚀 トレーニングをする
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">📊 今週の活動</h3>
        <div className="flex gap-2 justify-between">
          {dashboardData.loading ? (
            <div className="text-center w-full">読み込み中...</div>
          ) : (
            dashboardData.stats.weeklyActivity.map((activity) => (
              <div key={activity.day} className="flex-1 text-center">
                <div className="text-sm text-gray-600 mb-2">{activity.day}</div>
                <div
                  className={`h-20 rounded-lg ${
                    activity.completed ? "bg-green-500" : "bg-gray-200"
                  }`}
                ></div>
                {activity.completed && (
                  <div className="text-xs mt-1 text-gray-600">完了</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // トレーニング選択画面
  const TrainingSelect = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigateTo("dashboard")}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft size={20} />
          <span>戻る</span>
        </button>
      </div>

      <h2 className="text-3xl font-bold mb-6">トレーニングを選択</h2>

      {/* 上限チェック警告 */}
      {dashboardData.stats.todayRemaining === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-800 font-bold">
            ⚠️ 本日の上限に達しました
          </div>
          <div className="text-red-600 text-sm">
            1日のトレーニングは3回までです。明日また挑戦してください。
          </div>
        </div>
      )}

      {trainingsLoading ? (
        <div className="text-center py-8">
          <div className="text-xl">トレーニングデータを読み込み中...</div>
        </div>
      ) : trainingsError ? (
        <div className="text-center py-8 text-red-600">
          <div className="text-xl">エラー: {trainingsError}</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {trainings.map((training: Training) => {
            const difficultyLabel = getDifficultyLabel(training.difficulty);
            const emoji = getTrainingEmoji(training.name);
            const isComingSoon = !training.published;
            const isDisabled =
              dashboardData.stats.todayRemaining === 0 || isComingSoon;

            return (
              <div
                key={training.id}
                onClick={() => {
                  if (!isDisabled) {
                    selectTraining({
                      id: training.id,
                      name: training.name,
                      description: training.description,
                      duration: training.duration,
                      points: training.base_points,
                      difficulty: difficultyLabel,
                      imageUrl: emoji,
                      explain: training.explain || [],
                    });
                  }
                }}
                className={`relative bg-white rounded-xl shadow-lg p-6 transition overflow-hidden ${
                  isDisabled
                    ? "cursor-not-allowed"
                    : "cursor-pointer hover:shadow-xl transform hover:scale-105"
                }`}
              >
                {/* Coming Soon オーバーレイ */}
                {isComingSoon && (
                  <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10 rounded-xl">
                    <div className="text-center">
                      <p className="text-white text-2xl font-bold tracking-wider">
                        Coming Soon...
                      </p>
                      <p className="text-gray-300 text-sm mt-2">準備中</p>
                    </div>
                  </div>
                )}

                <div className="text-6xl mb-4 text-center">{emoji}</div>
                <h3 className="text-2xl font-bold mb-2">{training.name}</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {training.description}
                </p>
                <div className="flex justify-between items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      difficultyLabel === "初級"
                        ? "bg-green-100 text-green-700"
                        : difficultyLabel === "中級"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {difficultyLabel}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">
                      <Clock className="inline" size={16} /> {training.duration}
                      秒
                    </span>
                    <span className="font-bold text-blue-600">
                      {training.base_points}pt
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // トレーニング実行画面
  const TrainingExecution = () => {
    const isPreparing = prepCountdown !== null && prepCountdown > 0;

    // 準備カウントダウン
    React.useEffect(() => {
      if (prepCountdown !== null && prepCountdown > 0) {
        const timer = setTimeout(
          () => setPrepCountdown(prepCountdown - 1),
          1000
        );
        return () => clearTimeout(timer);
      }
    }, [prepCountdown]);

    // 本編カウントダウン（準備完了後）
    React.useEffect(() => {
      if (prepCountdown === 0 && countdown && countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else if (prepCountdown === 0 && countdown === 0) {
        setIsTrainingComplete(true);
      }
    }, [prepCountdown, countdown, setCountdown, setIsTrainingComplete]);

    return (
      <div className="max-w-4xl mx-auto p-6">
        {isPreparing ? (
          // 準備カウントダウン画面
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-6">
              {selectedTraining?.name}
            </h2>

            <div className="text-9xl mb-8">{selectedTraining?.imageUrl}</div>

            <div className="mb-8">
              <p className="text-2xl text-gray-600 mb-4">準備してください</p>
              <div className="text-9xl font-bold text-orange-500 animate-pulse">
                {prepCountdown}
              </div>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg text-left">
              <h3 className="font-bold text-lg mb-3 text-center">
                トレーニング方法
              </h3>
              {selectedTraining?.explain &&
              selectedTraining.explain.length > 0 ? (
                <ol className="list-decimal list-inside space-y-2">
                  {selectedTraining.explain.map(
                    (step: string, index: number) => (
                      <li key={index} className="text-gray-700">
                        {step}
                      </li>
                    )
                  )}
                </ol>
              ) : (
                <p className="text-gray-700 text-center">
                  {selectedTraining?.description}
                </p>
              )}
            </div>
          </div>
        ) : !isTrainingComplete ? (
          // 本編トレーニング画面
          <>
            <div className="mb-6">
              <button
                onClick={() => {
                  navigateTo("training-select");
                  setCountdown(null);
                  setPrepCountdown(null);
                }}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <ChevronLeft size={20} />
                <span>中断</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-6">
                {selectedTraining?.name}
              </h2>

              <div className="text-9xl mb-8">{selectedTraining?.imageUrl}</div>

              <div className="mb-8">
                <div className="text-8xl font-bold text-blue-600 mb-4">
                  {countdown}
                </div>
                <div className="text-xl text-gray-600">秒</div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg mb-6 text-left">
                <h3 className="font-bold text-lg mb-3 text-center">
                  トレーニング方法
                </h3>
                {selectedTraining?.explain &&
                selectedTraining.explain.length > 0 ? (
                  <ol className="list-decimal list-inside space-y-2">
                    {selectedTraining.explain.map(
                      (step: string, index: number) => (
                        <li key={index} className="text-gray-700">
                          {step}
                        </li>
                      )
                    )}
                  </ol>
                ) : (
                  <p className="text-gray-700 text-center">
                    {selectedTraining?.description}
                  </p>
                )}
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-1000"
                  style={{
                    width: `${
                      selectedTraining && countdown
                        ? ((selectedTraining.duration - countdown) /
                            selectedTraining.duration) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold mb-4 text-green-600">
              完了しました！
            </h2>
            <p className="text-2xl mb-6">
              +{selectedTraining?.points} ポイント獲得
            </p>
            <button
              onClick={async () => {
                // トレーニング記録を保存
                if (selectedTraining) {
                  const saveSuccess =
                    await trainingExecution.saveTrainingRecord(
                      selectedTraining
                    );

                  if (saveSuccess) {
                    // 保存成功後に各データを更新
                    console.log("トレーニング記録保存成功、データを更新中...");
                    await Promise.all([
                      dashboardData.refetch(),
                      rankings.refetch(),
                      calendarData.refetch(),
                    ]);
                    console.log("データ更新完了");

                    // データ更新完了後に画面遷移
                    navigateTo("dashboard");
                    resetTraining();
                  } else {
                    console.error("トレーニング記録の保存に失敗しました");
                    // エラーメッセージを表示
                    if (trainingExecution.error) {
                      alert(`エラー: ${trainingExecution.error}`);
                    } else {
                      alert(
                        "トレーニング記録の保存に失敗しました。上限に達している可能性があります。"
                      );
                    }
                    // エラー時でもダッシュボードには戻る
                    navigateTo("dashboard");
                    resetTraining();
                  }
                } else {
                  // 選択されたトレーニングがない場合
                  navigateTo("dashboard");
                  resetTraining();
                }
              }}
              className={`px-8 py-4 text-xl font-bold rounded-lg transition ${
                trainingExecution.loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              }`}
              disabled={trainingExecution.loading}
            >
              {trainingExecution.loading ? "保存中..." : "ホームに戻る"}
            </button>
          </div>
        )}
      </div>
    );
  };

  // カレンダー画面
  const CalendarView = () => {
    const getDaysInMonth = () => {
      const year = calendarData.currentMonth.getFullYear();
      const month = calendarData.currentMonth.getMonth();

      const days = [];
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // 月の最初の空白
      for (let i = 0; i < firstDay; i++) {
        days.push(null);
      }
      // 月の日付
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
      }
      return days;
    };

    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => calendarData.changeMonth("prev")}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold">
              {calendarData.currentMonth.getFullYear()}年{" "}
              {calendarData.currentMonth.getMonth() + 1}月
            </h2>
            <button
              onClick={() => calendarData.changeMonth("next")}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
              <div
                key={day}
                className="text-center font-bold text-gray-600 p-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth().map((day, index) => {
              if (!day) return <div key={index}></div>;

              const year = calendarData.currentMonth.getFullYear();
              const month = calendarData.currentMonth.getMonth() + 1;
              const dateStr = `${year}-${String(month).padStart(
                2,
                "0"
              )}-${String(day).padStart(2, "0")}`;
              const data = calendarData.getDateData(dateStr);

              return (
                <div
                  key={index}
                  className={`aspect-square p-2 rounded-lg ${
                    day ? "bg-gray-50 hover:bg-gray-100 cursor-pointer" : ""
                  }`}
                >
                  {day && (
                    <>
                      <div className="font-semibold text-sm mb-1">{day}</div>
                      {data && (
                        <div
                          className={`text-xs p-1 rounded text-white text-center ${
                            data.points >= 30
                              ? "bg-green-500"
                              : data.points >= 20
                              ? "bg-blue-500"
                              : "bg-purple-500"
                          }`}
                        >
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

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-2">月間累計</h3>
            <p className="text-3xl font-bold text-blue-600">
              {calendarData.loading
                ? "..."
                : calendarData.getMonthlyStats().totalPoints}
              pt
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-2">トレーニング日数</h3>
            <p className="text-3xl font-bold text-green-600">
              {calendarData.loading
                ? "..."
                : calendarData.getMonthlyStats().activeDays}
              日
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-2">回数</h3>
            <p className="text-3xl font-bold text-purple-600">
              {calendarData.loading
                ? "..."
                : calendarData.getMonthlyStats().totalTrainings}
              回
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ランキング画面
  const RankingView = () => {
    const currentRankings =
      selectedRankingTab === "points"
        ? rankings.pointsRankings
        : rankings.streaksRankings;
    const currentUserRank =
      selectedRankingTab === "points"
        ? rankings.currentUserPointsRank
        : rankings.currentUserStreaksRank;

    // トップ3との差を計算
    const getGapToTop3 = () => {
      if (!currentUserRank || currentUserRank.rank <= 3) return null;
      const thirdPlace = currentRankings[2];
      if (!thirdPlace) return null;

      if (selectedRankingTab === "points") {
        return thirdPlace.points - currentUserRank.points;
      } else {
        return thirdPlace.streak - currentUserRank.streak;
      }
    };

    const gap = getGapToTop3();

    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6">🏆 ランキング</h2>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setSelectedRankingTab("points")}
              className={`flex-1 py-3 rounded-lg font-bold transition ${
                selectedRankingTab === "points"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              ポイントランキング
            </button>
            <button
              onClick={() => setSelectedRankingTab("streak")}
              className={`flex-1 py-3 rounded-lg font-bold transition ${
                selectedRankingTab === "streak"
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              連続日数ランキング
            </button>
          </div>

          {rankings.loading ? (
            <div className="text-center py-8">
              <div className="text-xl text-gray-600">読み込み中...</div>
            </div>
          ) : rankings.error ? (
            <div className="text-center py-8 text-red-600">
              <div className="text-xl">エラー: {rankings.error}</div>
            </div>
          ) : currentRankings.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <div className="text-xl">まだランキングデータがありません</div>
            </div>
          ) : (
            <div className="space-y-3">
              {currentRankings.slice(0, 10).map((user) => {
                const isCurrentUser = auth.user?.id === user.user_id;
                return (
                  <div
                    key={`${user.rank}-${user.user_id}`}
                    className={`flex items-center justify-between p-4 rounded-lg transition ${
                      isCurrentUser
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-600"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-xl ${
                          user.rank === 1
                            ? "bg-yellow-400 text-yellow-900"
                            : user.rank === 2
                            ? "bg-gray-300 text-gray-700"
                            : user.rank === 3
                            ? "bg-orange-400 text-orange-900"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {user.rank === 1
                          ? "🥇"
                          : user.rank === 2
                          ? "🥈"
                          : user.rank === 3
                          ? "🥉"
                          : user.rank}
                      </div>
                      <div>
                        <div className="font-bold text-lg">
                          {user.username}
                          {isCurrentUser && (
                            <span className="ml-2 text-sm text-blue-600">
                              (あなた)
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <Flame className="inline" size={14} /> 連続{" "}
                          {user.streak}日
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedRankingTab === "points"
                        ? `${user.points}pt`
                        : `${user.streak}日`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {currentUserRank && (
          <div
            className={`text-white rounded-xl shadow-lg p-6 text-center ${
              selectedRankingTab === "points"
                ? "bg-gradient-to-r from-blue-600 to-purple-600"
                : "bg-gradient-to-r from-orange-600 to-red-600"
            }`}
          >
            <p className="text-lg mb-2">あなたの現在の順位</p>
            <p className="text-5xl font-bold mb-2">{currentUserRank.rank}位</p>
            {currentUserRank.rank <= 3 ? (
              <p className="text-sm opacity-90">
                🎉 おめでとうございます！トップ3入りです！
              </p>
            ) : (
              gap !== null && (
                <p className="text-sm opacity-90">
                  トップ3まであと
                  {selectedRankingTab === "points"
                    ? `${gap}ポイント`
                    : `${gap}日`}
                  ！
                </p>
              )
            )}
          </div>
        )}
      </div>
    );
  };

  // 画面の切り替え
  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <Dashboard />;
      case "training-select":
        return <TrainingSelect />;
      case "training-execution":
        return <TrainingExecution />;
      case "calendar":
        return <CalendarView />;
      case "ranking":
        return <RankingView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      {renderScreen()}
    </div>
  );
};

export default TrainingApp;
