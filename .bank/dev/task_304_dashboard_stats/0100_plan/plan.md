# TASK-304: ダッシュボード・統計表示機能

## 🎯 タスク概要
**名前**: ダッシュボード・統計表示機能実装
**推定時間**: 2-3時間
**タスクタイプ**: フロントエンド + バックエンドAPI拡張
**優先度**: 高（次の主要機能）

## 📋 課題と目標

### 解決すべき課題
- ユーザーが自身のトレーニング進捗を視覚的に把握できない
- 過去の記録から傾向や成果を分析できない
- モチベーション維持に必要な達成感の可視化が不足

### 目標
- トレーニング統計の可視化ダッシュボード作成
- 週間・月間の進捗トレンド表示
- 達成度とモチベーション向上の仕組み構築

## 🔧 技術要件

### 実装対象

#### 1. バックエンドAPI拡張
```ruby
# 新規エンドポイント
GET /api/v1/users/dashboard_stats  # ダッシュボード統計データ
GET /api/v1/users/training_trends  # トレーニングトレンドデータ

# レスポンス形式
{
  "dashboard_stats": {
    "total_records": 150,
    "this_week_records": 12,
    "this_month_records": 45,
    "total_points": 2340,
    "streak_days": 7,
    "favorite_training": "腕立て伏せ"
  },
  "training_trends": {
    "weekly_data": [...],
    "monthly_data": [...],
    "training_frequency": {...}
  }
}
```

#### 2. フロントエンド新機能
```typescript
// 新規ページ・コンポーネント
pages/Dashboard.tsx              // メインダッシュボードページ
components/dashboard/
├── StatsOverview.tsx           // 統計概要カード
├── TrendChart.tsx              // トレンドグラフ
├── TrainingFrequency.tsx       // 頻度分析
└── AchievementBadges.tsx       // 達成度バッジ

// 新規フック
hooks/useDashboardStats.ts       // ダッシュボード統計API
hooks/useTrainingTrends.ts       // トレンドデータAPI
```

#### 3. グラフライブラリ
- **Chart.js + react-chartjs-2** を採用
- レスポンシブ対応
- ダークモード対応

## 📊 実装詳細

### 1. 統計データ設計

#### ダッシュボード統計
- **合計記録数**: 全期間のトレーニング記録数
- **今週の記録数**: 今週実行したトレーニング数
- **今月の記録数**: 今月実行したトレーニング数
- **合計ポイント**: 累計獲得ポイント
- **連続日数**: 連続でトレーニングした日数
- **お気に入りトレーニング**: 最も頻繁に実行しているトレーニング

#### トレンドデータ
- **週間トレンド**: 過去8週間の記録数推移
- **月間トレンド**: 過去6ヶ月の記録数推移
- **トレーニング別頻度**: 各トレーニングの実行回数分布

### 2. UI/UX設計

#### レイアウト
```
┌─────────────────────────────────────────┐
│ ダッシュボード                          │
├─────────────────────────────────────────┤
│ 📊 統計概要カード（4つ横並び）           │
│ [今週] [今月] [合計] [連続日数]         │
├─────────────────────────────────────────┤
│ 📈 トレンドグラフ                      │
│ (週間/月間切り替え)                     │
├─────────────────────────────────────────┤
│ 🏆 お気に入りトレーニング               │
│ & 達成度バッジ                         │
└─────────────────────────────────────────┘
```

#### レスポンシブ対応
- **デスクトップ**: 4カラムレイアウト
- **タブレット**: 2カラムレイアウト
- **モバイル**: 1カラムスタックレイアウト

### 3. 技術実装詳細

#### バックエンド実装
```ruby
# コントローラ
class Api::V1::UsersController < Api::V1::BaseController
  def dashboard_stats
    stats = current_user.calculate_dashboard_stats
    render json: { dashboard_stats: stats }
  end

  def training_trends
    trends = current_user.calculate_training_trends
    render json: { training_trends: trends }
  end
end

# ユーザーモデル拡張
class User < ApplicationRecord
  def calculate_dashboard_stats
    {
      total_records: training_records.count,
      this_week_records: training_records.this_week.count,
      this_month_records: training_records.this_month.count,
      total_points: user_stat&.total_points || 0,
      streak_days: calculate_streak_days,
      favorite_training: most_frequent_training&.name
    }
  end

  def calculate_training_trends
    # 週間・月間トレンドデータ計算ロジック
  end
end
```

#### フロントエンド実装
```typescript
// ダッシュボードフック
export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/dashboard_stats');
      setStats(response.data.dashboard_stats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
};

// メインダッシュボードコンポーネント
export const Dashboard: React.FC = () => {
  const { stats, loading } = useDashboardStats();
  const { trends } = useTrainingTrends();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <StatsOverview stats={stats} />
      <TrendChart trends={trends} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrainingFrequency />
        <AchievementBadges />
      </div>
    </div>
  );
};
```

## ✅ 完了条件

### 機能要件
- [ ] ダッシュボード統計API実装
- [ ] トレンドデータAPI実装
- [ ] ダッシュボードページ作成
- [ ] 統計概要カード実装
- [ ] トレンドグラフ実装（Chart.js使用）
- [ ] レスポンシブ対応
- [ ] ローディング・エラーハンドリング

### 品質要件
- [ ] API仕様書更新
- [ ] TypeScript型定義追加
- [ ] コンポーネントテスト作成
- [ ] 動作確認完了

### UI/UX要件
- [ ] 直感的な統計表示
- [ ] 美しいグラフビジュアライゼーション
- [ ] モバイルファーストデザイン
- [ ] アクセシビリティ対応

## 🗓️ 実装計画

### Phase 1: バックエンドAPI (45分)
1. Userモデルに統計計算メソッド追加
2. UsersControllerに統計エンドポイント追加
3. ルーティング設定
4. API動作確認

### Phase 2: Chart.jsセットアップ (15分)
1. react-chartjs-2インストール
2. Chart.js設定・カスタマイズ
3. 基本グラフコンポーネント作成

### Phase 3: フロントエンド実装 (75分)
1. ダッシュボードページ作成
2. 統計概要カード実装
3. トレンドグラフ実装
4. カスタムフック作成
5. レスポンシブ対応

### Phase 4: 統合・テスト (15分)
1. 全体動作確認
2. エラーハンドリングテスト
3. レスポンシブテスト
4. ドキュメント更新

## 🎯 期待成果
- ユーザーがトレーニング進捗を一目で把握可能
- データドリブンなモチベーション向上
- 美しく直感的な統計ダッシュボード
- 次期機能（カレンダー、ランキング）への基盤構築