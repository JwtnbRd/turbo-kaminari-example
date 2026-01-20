# UI設計書

## UI設計概要

### 設計アプローチ
**レスポンシブデザイン** - マルチデバイス対応
- **Desktop First**: 主な利用環境（社内PC）
- **Mobile Responsive**: スマートフォン対応も考慮
- **Progressive Enhancement**: 基本機能→高度な機能の段階実装

### 技術スタック
- **React 18** + TypeScript
- **TailwindCSS** - ユーティリティファーストCSS
- **React Router v6** - SPA ルーティング
- **Lucide React** - アイコンライブラリ

## デザインシステム

### カラーパレット

```css
/* Primary Colors - ブランドカラー */
--color-primary-50: #eff6ff;    /* 背景 */
--color-primary-100: #dbeafe;   /* 薄い背景 */
--color-primary-500: #3b82f6;   /* メインボタン */
--color-primary-600: #2563eb;   /* ホバー */
--color-primary-700: #1d4ed8;   /* アクティブ */

/* Success Colors - 成功・ポジティブ */
--color-success-100: #dcfce7;   /* 成功メッセージ背景 */
--color-success-500: #22c55e;   /* 成功ボタン */
--color-success-600: #16a34a;   /* 成功ホバー */

/* Warning Colors - 注意 */
--color-warning-100: #fef3c7;   /* 注意メッセージ背景 */
--color-warning-500: #f59e0b;   /* 注意ボタン */

/* Error Colors - エラー */
--color-error-100: #fee2e2;     /* エラーメッセージ背景 */
--color-error-500: #ef4444;     /* エラーボタン */

/* Neutral Colors - ベース */
--color-gray-50: #f9fafb;       /* 背景 */
--color-gray-100: #f3f4f6;      /* カード背景 */
--color-gray-200: #e5e7eb;      /* ボーダー */
--color-gray-400: #9ca3af;      /* 無効テキスト */
--color-gray-600: #4b5563;      /* サブテキスト */
--color-gray-900: #111827;      /* メインテキスト */
```

### タイポグラフィ

```css
/* Headings */
.heading-1 { @apply text-3xl font-bold text-gray-900; }     /* h1: ページタイトル */
.heading-2 { @apply text-2xl font-semibold text-gray-900; } /* h2: セクション */
.heading-3 { @apply text-xl font-medium text-gray-900; }    /* h3: カードタイトル */

/* Body Text */
.body-large { @apply text-base text-gray-900; }            /* メインテキスト */
.body-medium { @apply text-sm text-gray-600; }             /* サブテキスト */
.body-small { @apply text-xs text-gray-400; }              /* 補助テキスト */

/* Special */
.label { @apply text-sm font-medium text-gray-700; }       /* フォームラベル */
.caption { @apply text-xs text-gray-500; }                 /* キャプション */
```

### スペーシング

```css
/* Spacing Scale (Tailwind標準) */
space-1: 0.25rem (4px)    /* 細かい余白 */
space-2: 0.5rem (8px)     /* 小さい余白 */
space-4: 1rem (16px)      /* 標準余白 */
space-6: 1.5rem (24px)    /* 中余白 */
space-8: 2rem (32px)      /* 大余白 */
space-12: 3rem (48px)     /* セクション間 */
```

## レイアウト設計

### 1. グローバルレイアウト

```jsx
// Layout.tsx
<div className="min-h-screen bg-gray-50">
  {/* ヘッダー */}
  <header className="bg-white shadow-sm border-b border-gray-200">
    <Navigation />
  </header>

  {/* メインコンテンツ */}
  <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
    <Outlet />
  </main>

  {/* フッター（モバイル用タブバー） */}
  <footer className="sm:hidden">
    <MobileTabBar />
  </footer>
</div>
```

### 2. レスポンシブブレイクポイント

```css
/* Tailwind Breakpoints */
sm: 640px    /* タブレット縦 */
md: 768px    /* タブレット横 */
lg: 1024px   /* デスクトップ */
xl: 1280px   /* 大きなデスクトップ */

/* 使用例 */
.responsive-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4;
}
```

## 画面設計

### 1. 認証画面

#### ログイン画面 (`/login`)

```jsx
// Desktop Layout (md以上)
<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
  <div className="max-w-md w-full space-y-8">
    {/* ロゴ・タイトル */}
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900">
        トレーニング記録アプリ
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        アカウントにログインしてください
      </p>
    </div>

    {/* ログインフォーム */}
    <form className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            type="email"
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            パスワード
          </label>
          <input
            type="password"
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="パスワード"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          ログイン
        </button>
      </div>

      <div className="text-center">
        <Link to="/register" className="text-primary-600 hover:text-primary-500">
          アカウント登録はこちら
        </Link>
      </div>
    </form>
  </div>
</div>
```

### 2. ダッシュボード (`/`)

#### デスクトップレイアウト

```jsx
<div className="space-y-6">
  {/* ヘッダー */}
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="px-4 py-5 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900">
        こんにちは、{username}さん！
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        今日もトレーニングを頑張りましょう
      </p>
    </div>
  </div>

  {/* 統計カード */}
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard
      title="累計ポイント"
      value={totalPoints}
      icon={<TrophyIcon />}
      color="blue"
    />
    <StatCard
      title="連続日数"
      value={currentStreak}
      icon={<FlameIcon />}
      color="orange"
    />
    <StatCard
      title="総回数"
      value={totalCount}
      icon={<ActivityIcon />}
      color="green"
    />
    <StatCard
      title="最長連続"
      value={longestStreak}
      icon={<StarIcon />}
      color="purple"
    />
  </div>

  {/* 最近の記録 */}
  <div className="bg-white shadow rounded-lg">
    <div className="px-4 py-5 sm:p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        最近のトレーニング
      </h2>
      <RecentTrainingList />
    </div>
  </div>

  {/* クイックアクション */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <QuickActionCard
      title="トレーニング実行"
      description="新しいトレーニングを開始"
      to="/training"
      icon={<PlayIcon />}
    />
    <QuickActionCard
      title="カレンダー"
      description="記録を確認"
      to="/calendar"
      icon={<CalendarIcon />}
    />
  </div>
</div>
```

### 3. トレーニング実行画面 (`/training`)

#### トレーニング選択

```jsx
<div className="space-y-6">
  <h1 className="text-2xl font-bold text-gray-900">
    トレーニング選択
  </h1>

  {/* 難易度フィルター */}
  <div className="flex space-x-2">
    <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
      すべて
    </FilterButton>
    <FilterButton active={filter === 'beginner'} onClick={() => setFilter('beginner')}>
      初級
    </FilterButton>
    <FilterButton active={filter === 'intermediate'} onClick={() => setFilter('intermediate')}>
      中級
    </FilterButton>
    <FilterButton active={filter === 'advanced'} onClick={() => setFilter('advanced')}>
      上級
    </FilterButton>
  </div>

  {/* トレーニング一覧 */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {trainings.map(training => (
      <TrainingCard
        key={training.id}
        training={training}
        onSelect={() => startTraining(training)}
      />
    ))}
  </div>
</div>
```

#### トレーニング実行中

```jsx
<div className="max-w-md mx-auto text-center space-y-8">
  {/* プログレスバー */}
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div
      className="bg-primary-600 h-2 rounded-full transition-all duration-1000"
      style={{ width: `${(timeElapsed / duration) * 100}%` }}
    />
  </div>

  {/* トレーニング情報 */}
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-2">
      {trainingName}
    </h1>
    <p className="text-gray-600">
      {description}
    </p>
  </div>

  {/* カウントダウン */}
  <div className="bg-white rounded-full w-48 h-48 mx-auto flex items-center justify-center shadow-lg border-8 border-primary-100">
    <span className="text-4xl font-bold text-primary-600">
      {timeRemaining}
    </span>
  </div>

  {/* コントロールボタン */}
  <div className="flex justify-center space-x-4">
    {isRunning ? (
      <button
        onClick={pauseTimer}
        className="px-6 py-3 bg-warning-500 text-white rounded-lg hover:bg-warning-600"
      >
        一時停止
      </button>
    ) : (
      <button
        onClick={resumeTimer}
        className="px-6 py-3 bg-success-500 text-white rounded-lg hover:bg-success-600"
      >
        再開
      </button>
    )}

    <button
      onClick={stopTraining}
      className="px-6 py-3 bg-error-500 text-white rounded-lg hover:bg-error-600"
    >
      停止
    </button>
  </div>
</div>
```

### 4. カレンダー画面 (`/calendar`)

```jsx
<div className="space-y-6">
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold text-gray-900">
      トレーニングカレンダー
    </h1>

    {/* 月切り替え */}
    <div className="flex items-center space-x-2">
      <button onClick={previousMonth}>
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      <span className="px-4 py-2 text-lg font-medium">
        {currentMonth}
      </span>
      <button onClick={nextMonth}>
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  </div>

  {/* カレンダーグリッド */}
  <div className="bg-white shadow rounded-lg overflow-hidden">
    <div className="grid grid-cols-7 gap-px bg-gray-200">
      {/* 曜日ヘッダー */}
      {['日', '月', '火', '水', '木', '金', '土'].map(day => (
        <div key={day} className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-900">
          {day}
        </div>
      ))}

      {/* カレンダー日付 */}
      {calendarDays.map(day => (
        <CalendarDay
          key={day.date}
          date={day.date}
          trainingData={day.trainingData}
          isCurrentMonth={day.isCurrentMonth}
          isToday={day.isToday}
          onClick={() => showDayDetail(day)}
        />
      ))}
    </div>
  </div>

  {/* 凡例 */}
  <div className="flex items-center justify-center space-x-6 text-sm">
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 bg-success-100 rounded border-2 border-success-500"></div>
      <span>トレーニング実施</span>
    </div>
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 bg-gray-100 rounded border-2 border-gray-300"></div>
      <span>未実施</span>
    </div>
  </div>
</div>
```

### 5. ランキング画面 (`/ranking`)

```jsx
<div className="space-y-6">
  <h1 className="text-2xl font-bold text-gray-900">
    ランキング
  </h1>

  {/* タブ切り替え */}
  <div className="border-b border-gray-200">
    <nav className="-mb-px flex space-x-8">
      <TabButton active={activeTab === 'total'} onClick={() => setActiveTab('total')}>
        累計ポイント
      </TabButton>
      <TabButton active={activeTab === 'streak'} onClick={() => setActiveTab('streak')}>
        連続日数
      </TabButton>
      <TabButton active={activeTab === 'week'} onClick={() => setActiveTab('week')}>
        今週
      </TabButton>
      <TabButton active={activeTab === 'month'} onClick={() => setActiveTab('month')}>
        今月
      </TabButton>
    </nav>
  </div>

  {/* ランキングリスト */}
  <div className="bg-white shadow rounded-lg overflow-hidden">
    <div className="px-4 py-5 sm:p-6">
      <div className="space-y-3">
        {rankings.map((user, index) => (
          <RankingItem
            key={user.id}
            rank={index + 1}
            user={user}
            isCurrentUser={user.isCurrentUser}
            score={getScoreByTab(user, activeTab)}
            scoreType={getScoreTypeByTab(activeTab)}
          />
        ))}
      </div>
    </div>
  </div>

  {/* 自分の順位 */}
  {currentUserRank && (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
      <div className="flex items-center">
        <TrophyIcon className="h-5 w-5 text-primary-600 mr-2" />
        <span className="text-primary-800 font-medium">
          あなたの順位: {currentUserRank}位
        </span>
      </div>
    </div>
  )}
</div>
```

### 6. 管理画面 (`/admin`)

```jsx
<div className="space-y-6">
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold text-gray-900">
      トレーニング管理
    </h1>

    <button
      onClick={() => setShowCreateForm(true)}
      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
    >
      新規作成
    </button>
  </div>

  {/* 検索・フィルター */}
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <input
        type="text"
        placeholder="トレーニング名で検索"
        className="border border-gray-300 rounded-md px-3 py-2"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <select
        className="border border-gray-300 rounded-md px-3 py-2"
        value={difficultyFilter}
        onChange={(e) => setDifficultyFilter(e.target.value)}
      >
        <option value="">すべての難易度</option>
        <option value="beginner">初級</option>
        <option value="intermediate">中級</option>
        <option value="advanced">上級</option>
      </select>

      <select
        className="border border-gray-300 rounded-md px-3 py-2"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">すべての状態</option>
        <option value="published">公開</option>
        <option value="unpublished">非公開</option>
      </select>
    </div>
  </div>

  {/* トレーニングテーブル */}
  <div className="bg-white shadow rounded-lg overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            名前
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            難易度
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            時間
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            ポイント
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            状態
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            操作
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {trainings.map((training) => (
          <AdminTrainingRow
            key={training.id}
            training={training}
            onEdit={() => editTraining(training)}
            onDelete={() => deleteTraining(training.id)}
          />
        ))}
      </tbody>
    </table>
  </div>
</div>
```

## 共通コンポーネント設計

### 1. Button Component

```jsx
// Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size: 'sm' | 'md' | 'lg';
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

const buttonClasses = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  success: 'bg-success-500 hover:bg-success-600 text-white',
  warning: 'bg-warning-500 hover:bg-warning-600 text-white',
  error: 'bg-error-500 hover:bg-error-600 text-white',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};
```

### 2. Card Component

```jsx
// Card.tsx
interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: FC<CardProps> = ({ children, className = '', padding = 'md' }) => (
  <div className={`bg-white shadow rounded-lg ${paddingClasses[padding]} ${className}`}>
    {children}
  </div>
);
```

### 3. Modal Component

```jsx
// Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};
```

## モバイル対応

### 1. レスポンシブナビゲーション

```jsx
// Desktop: ヘッダーナビ
<nav className="hidden sm:flex space-x-8">
  <NavLink to="/">ダッシュボード</NavLink>
  <NavLink to="/training">トレーニング</NavLink>
  <NavLink to="/calendar">カレンダー</NavLink>
  <NavLink to="/ranking">ランキング</NavLink>
</nav>

// Mobile: ボトムタブバー
<nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
  <div className="grid grid-cols-4 gap-1">
    <MobileTabButton to="/" icon={<HomeIcon />} label="ホーム" />
    <MobileTabButton to="/training" icon={<PlayIcon />} label="実行" />
    <MobileTabButton to="/calendar" icon={<CalendarIcon />} label="記録" />
    <MobileTabButton to="/ranking" icon={<TrophyIcon />} label="順位" />
  </div>
</nav>
```

### 2. タッチ操作最適化

```css
/* タッチターゲット最小サイズ: 44px */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* スワイプジェスチャー対応 */
.swipeable {
  touch-action: pan-x;
}
```

## アクセシビリティ

### 1. キーボードナビゲーション

```jsx
// フォーカス管理
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    onClick();
  }
};

<div
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  className="focus:outline-none focus:ring-2 focus:ring-primary-500"
>
```

### 2. ARIA属性

```jsx
// ランキングリスト
<ul role="list" aria-label="ポイントランキング">
  {rankings.map((user, index) => (
    <li
      key={user.id}
      role="listitem"
      aria-label={`${index + 1}位 ${user.username} ${user.points}ポイント`}
    >
```

### 3. カラーコントラスト

```css
/* WCAG AA準拠のコントラスト比 */
.text-primary { color: #1d4ed8; }    /* 4.5:1以上 */
.text-secondary { color: #4b5563; }  /* 4.5:1以上 */
.text-muted { color: #6b7280; }      /* 3:1以上（大きな文字用） */
```

## パフォーマンス最適化

### 1. コード分割

```jsx
// ページレベルでの遅延読み込み
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Training = lazy(() => import('./pages/Training'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Ranking = lazy(() => import('./pages/Ranking'));

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/training" element={<Training />} />
    <Route path="/calendar" element={<Calendar />} />
    <Route path="/ranking" element={<Ranking />} />
  </Routes>
</Suspense>
```

### 2. 画像最適化

```jsx
// 遅延読み込み
<img
  src={imageSrc}
  alt={altText}
  loading="lazy"
  className="object-cover w-full h-48"
/>

// WebP対応
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="..." />
</picture>
```

### 3. 状態管理最適化

```jsx
// useCallback/useMemoの適切な使用
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

このUI設計により、使いやすく・美しく・アクセシブルなユーザーインターフェースを1週間で実現します。