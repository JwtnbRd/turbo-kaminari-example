import React, { useState } from 'react';
import { Calendar, Trophy, Flame, Clock, ChevronLeft, ChevronRight, Play, CheckCircle } from 'lucide-react';

// マスタデータ
const TRAINING_TYPES = {
  push_up: {
    name: "腕立て伏せ",
    description: "胸と腕を鍛える基本トレーニング。正しいフォームで行うことが重要です。",
    duration: 60,
    points: 10,
    difficulty: "初級",
    imageUrl: "🏋️"
  },
  squat: {
    name: "スクワット",
    description: "下半身全体を鍛えるトレーニング。膝がつま先より前に出ないように注意。",
    duration: 60,
    points: 10,
    difficulty: "初級",
    imageUrl: "🦵"
  },
  plank: {
    name: "プランク",
    description: "体幹を鍛える静的トレーニング。体を一直線に保ちます。",
    duration: 30,
    points: 15,
    difficulty: "中級",
    imageUrl: "💪"
  },
  burpee: {
    name: "バーピー",
    description: "全身を使う高強度トレーニング。有酸素運動の効果も。",
    duration: 45,
    points: 20,
    difficulty: "上級",
    imageUrl: "🔥"
  }
};

// サンプルデータ
const sampleUserData = {
  username: "山田太郎",
  totalPoints: 450,
  currentStreak: 7,
  monthlyPoints: 180
};

const sampleCalendarData = {
  "2025-11-01": { points: 20, trainings: 2 },
  "2025-11-03": { points: 15, trainings: 1 },
  "2025-11-05": { points: 30, trainings: 3 },
  "2025-11-07": { points: 25, trainings: 2 },
  "2025-11-08": { points: 20, trainings: 2 },
  "2025-11-09": { points: 15, trainings: 1 },
  "2025-11-10": { points: 35, trainings: 3 },
  "2025-11-11": { points: 20, trainings: 2 }
};

const sampleRankings = [
  { rank: 1, username: "鈴木一郎", points: 890, streak: 15 },
  { rank: 2, username: "佐藤花子", points: 750, streak: 12 },
  { rank: 3, username: "田中次郎", points: 680, streak: 10 },
  { rank: 4, username: "山田太郎", points: 450, streak: 7, isCurrentUser: true },
  { rank: 5, username: "高橋美咲", points: 420, streak: 8 }
];

const TrainingApp = () => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [isTrainingComplete, setIsTrainingComplete] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [todayTrainingDone, setTodayTrainingDone] = useState(false);
  const [selectedRankingTab, setSelectedRankingTab] = useState('points');

  // ナビゲーションバー
  const Navigation = () => (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">💪 トレーニング記録</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className={`px-4 py-2 rounded-lg transition ${
              currentScreen === 'dashboard' ? 'bg-white text-blue-600' : 'hover:bg-blue-500'
            }`}
          >
            ホーム
          </button>
          <button
            onClick={() => setCurrentScreen('calendar')}
            className={`px-4 py-2 rounded-lg transition ${
              currentScreen === 'calendar' ? 'bg-white text-blue-600' : 'hover:bg-blue-500'
            }`}
          >
            <Calendar className="inline mr-2" size={20} />
            記録
          </button>
          <button
            onClick={() => setCurrentScreen('ranking')}
            className={`px-4 py-2 rounded-lg transition ${
              currentScreen === 'ranking' ? 'bg-white text-blue-600' : 'hover:bg-blue-500'
            }`}
          >
            <Trophy className="inline mr-2" size={20} />
            ランキング
          </button>
        </div>
      </div>
    </nav>
  );

  // ダッシュボード画面
  const Dashboard = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <h2 className="text-3xl font-bold mb-2">ようこそ、{sampleUserData.username}さん！</h2>
        <p className="text-gray-600 mb-6">今日もトレーニングを頑張りましょう 🔥</p>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="text-blue-600" size={24} />
              <span className="text-gray-600 text-sm">累計ポイント</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{sampleUserData.totalPoints}</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="text-orange-600" size={24} />
              <span className="text-gray-600 text-sm">連続日数</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">{sampleUserData.currentStreak}日</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-green-600" size={24} />
              <span className="text-gray-600 text-sm">今月のポイント</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{sampleUserData.monthlyPoints}</p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setCurrentScreen('training-select')}
            className={`px-8 py-4 text-xl font-bold rounded-lg transition transform hover:scale-105 ${
              todayTrainingDone
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
            }`}
          >
            {todayTrainingDone ? '✅ もう一度トレーニングする' : '🚀 トレーニングをする'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">📊 今週の活動</h3>
        <div className="flex gap-2 justify-between">
          {['月', '火', '水', '木', '金', '土', '日'].map((day, index) => (
            <div key={day} className="flex-1 text-center">
              <div className="text-sm text-gray-600 mb-2">{day}</div>
              <div className={`h-20 rounded-lg ${
                index < 5 ? 'bg-green-500' : index === 5 ? 'bg-yellow-500' : 'bg-gray-200'
              }`}></div>
              {index < 5 && <div className="text-xs mt-1 text-gray-600">完了</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // トレーニング選択画面
  const TrainingSelect = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => setCurrentScreen('dashboard')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft size={20} />
          <span>戻る</span>
        </button>
      </div>

      <h2 className="text-3xl font-bold mb-6">トレーニングを選択</h2>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(TRAINING_TYPES).map(([key, training]) => (
          <div
            key={key}
            onClick={() => {
              setSelectedTraining({ key, ...training });
              setCurrentScreen('training-execution');
              setCountdown(training.duration);
            }}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition transform hover:scale-105"
          >
            <div className="text-6xl mb-4 text-center">{training.imageUrl}</div>
            <h3 className="text-2xl font-bold mb-2">{training.name}</h3>
            <p className="text-gray-600 mb-4 text-sm">{training.description}</p>
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-sm ${
                training.difficulty === '初級' ? 'bg-green-100 text-green-700' :
                training.difficulty === '中級' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {training.difficulty}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  <Clock className="inline" size={16} /> {training.duration}秒
                </span>
                <span className="font-bold text-blue-600">{training.points}pt</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // トレーニング実行画面
  const TrainingExecution = () => {
    React.useEffect(() => {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else if (countdown === 0) {
        setIsTrainingComplete(true);
      }
    }, [countdown]);

    return (
      <div className="max-w-4xl mx-auto p-6">
        {!isTrainingComplete ? (
          <>
            <div className="mb-6">
              <button
                onClick={() => {
                  setCurrentScreen('training-select');
                  setCountdown(null);
                }}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <ChevronLeft size={20} />
                <span>中断</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-6">{selectedTraining?.name}</h2>
              
              <div className="text-9xl mb-8">{selectedTraining?.imageUrl}</div>

              <div className="mb-8">
                <div className="text-8xl font-bold text-blue-600 mb-4">{countdown}</div>
                <div className="text-xl text-gray-600">秒</div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h3 className="font-bold text-lg mb-2">トレーニング方法</h3>
                <p className="text-gray-700">{selectedTraining?.description}</p>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${((selectedTraining?.duration - countdown) / selectedTraining?.duration) * 100}%` }}
                ></div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold mb-4 text-green-600">完了しました！</h2>
            <p className="text-2xl mb-6">+{selectedTraining?.points} ポイント獲得</p>
            <button
              onClick={() => {
                setCurrentScreen('dashboard');
                setIsTrainingComplete(false);
                setTodayTrainingDone(true);
                setCountdown(null);
              }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
            >
              ホームに戻る
            </button>
          </div>
        )}
      </div>
    );
  };

  // カレンダー画面
  const CalendarView = () => {
    const getDaysInMonth = () => {
      const days = [];
      const firstDay = new Date(2025, 10, 1).getDay();
      const daysInMonth = 30;
      
      for (let i = 0; i < firstDay; i++) {
        days.push(null);
      }
      
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
      }
      
      return days;
    };

    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <button className="p-2 hover:bg-gray-100 rounded">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold">2025年 11月</h2>
            <button className="p-2 hover:bg-gray-100 rounded">
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['日', '月', '火', '水', '木', '金', '土'].map(day => (
              <div key={day} className="text-center font-bold text-gray-600 p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth().map((day, index) => {
              const dateStr = day ? `2025-11-${String(day).padStart(2, '0')}` : null;
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

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-2">月間累計</h3>
            <p className="text-3xl font-bold text-blue-600">{sampleUserData.monthlyPoints}pt</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-2">トレーニング日数</h3>
            <p className="text-3xl font-bold text-green-600">8日</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-2">平均ポイント/日</h3>
            <p className="text-3xl font-bold text-purple-600">22.5pt</p>
          </div>
        </div>
      </div>
    );
  };

  // ランキング画面
  const RankingView = () => (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">🏆 ランキング</h2>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSelectedRankingTab('points')}
            className={`flex-1 py-3 rounded-lg font-bold transition ${
              selectedRankingTab === 'points'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ポイントランキング
          </button>
          <button
            onClick={() => setSelectedRankingTab('streak')}
            className={`flex-1 py-3 rounded-lg font-bold transition ${
              selectedRankingTab === 'streak'
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            連続日数ランキング
          </button>
        </div>

        <div className="space-y-3">
          {sampleRankings.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center justify-between p-4 rounded-lg transition ${
                user.isCurrentUser
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-600'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-xl ${
                  user.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                  user.rank === 2 ? 'bg-gray-300 text-gray-700' :
                  user.rank === 3 ? 'bg-orange-400 text-orange-900' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
                </div>
                <div>
                  <div className="font-bold text-lg">
                    {user.username}
                    {user.isCurrentUser && <span className="ml-2 text-sm text-blue-600">(あなた)</span>}
                  </div>
                  <div className="text-sm text-gray-600">
                    <Flame className="inline" size={14} /> 連続 {user.streak}日
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {selectedRankingTab === 'points' ? `${user.points}pt` : `${user.streak}日`}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-lg mb-2">あなたの現在の順位</p>
        <p className="text-5xl font-bold mb-2">4位</p>
        <p className="text-sm opacity-90">トップ3まであと30ポイント！</p>
      </div>
    </div>
  );

  // 画面の切り替え
  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'training-select':
        return <TrainingSelect />;
      case 'training-execution':
        return <TrainingExecution />;
      case 'calendar':
        return <CalendarView />;
      case 'ranking':
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