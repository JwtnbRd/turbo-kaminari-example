# TASK-304 現在システム分析

## 🔍 現在の実装状況

### バックエンド分析

#### 1. User モデル
```ruby
# 現在の実装（backend/app/models/user.rb）
class User < ApplicationRecord
  enum :role, { general: 0, admin: 1 }, default: :general
  has_many :training_records, dependent: :destroy
  has_one :user_stat, dependent: :destroy
  validates :username, presence: true, uniqueness: true
  after_create :create_user_stat
end
```

**必要な拡張:**
- ダッシュボード統計計算メソッドの追加
- トレンドデータ計算メソッドの追加

#### 2. TrainingRecord モデル
```ruby
# 既存の便利なScope（活用可能）
scope :this_week, -> { where('completed_at >= ?', Date.current.beginning_of_week) }
scope :this_month, -> { where('completed_at >= ?', Date.current.beginning_of_month) }
scope :by_training, ->(training_id) { where(training_id: training_id) }
scope :recent, ->(days = 7) { where('completed_at >= ?', days.days.ago) }

# 既存の便利なメソッド
def calculate_points
def same_day_same_training_count
```

**活用ポイント:**
- 既存Scopeで基本的な期間フィルタリングは対応済み
- ポイント計算ロジックも実装済み

#### 3. UserStat モデル
```ruby
# 既存の統計フィールド
total_points              # 合計ポイント
current_streak           # 現在の連続日数
longest_streak           # 最大連続日数
total_training_count     # 合計トレーニング数
last_training_date       # 最終トレーニング日

# 既存メソッド
def recalculate!         # 統計再計算（営業日ベース）
```

**活用ポイント:**
- ダッシュボードに必要な基本統計は既に存在
- 営業日ベース連続日数計算も実装済み

#### 4. ルーティング
```ruby
# 現在のAPI（config/routes.rb）
namespace :api do
  namespace :v1 do
    resources :training_records  # 記録CRUD
    namespace :admin do
      resources :trainings       # 管理者用
    end
  end
end
```

**必要な追加:**
- ユーザー統計エンドポイント（dashboard_stats, training_trends）

### フロントエンド分析

#### 1. 既存のページ構造
```
frontend/src/
├── pages/
│   ├── Home.tsx                    # ホームページ
│   ├── TrainingRecords.tsx         # トレーニング記録（完成）
│   └── admin/TrainingManagement.tsx # 管理画面（完成）
```

**必要な追加:**
- Dashboard.tsx（新規メインページ）

#### 2. 既存のコンポーネント
```
components/
├── common/              # 共通コンポーネント（既存）
├── auth/               # 認証関連（既存）
├── training/           # トレーニング記録（完成）
└── admin/              # 管理画面（完成）
```

**必要な追加:**
- components/dashboard/ ディレクトリと配下コンポーネント

#### 3. 既存のフック
```
hooks/
├── useAuth.ts             # 認証（完成）
├── useTrainingRecords.ts  # トレーニング記録CRUD（完成）
├── useTrainings.ts        # トレーニング選択（完成）
└── useAdminTrainings.ts   # 管理者用（完成）
```

**必要な追加:**
- useDashboardStats.ts（統計データ取得）
- useTrainingTrends.ts（トレンドデータ取得）

## 💡 実装戦略

### 1. 既存システムの活用
**強み:**
- TrainingRecordの豊富なScopeメソッド
- UserStatの統計基盤
- JWT認証システム
- レスポンシブUI基盤（TailwindCSS）

### 2. 最小限の追加実装
**バックエンド:**
- Userモデルに2つのメソッド追加
- UsersControllerに2つのアクション追加
- ルーティングに2行追加

**フロントエンド:**
- Chart.jsライブラリ追加
- Dashboard関連コンポーネント追加（5ファイル）
- ルーティング1行追加

### 3. 段階的実装計画
1. **Phase 1**: バックエンド統計メソッド追加
2. **Phase 2**: Chart.jsセットアップ
3. **Phase 3**: ダッシュボードコンポーネント実装
4. **Phase 4**: 統合・テスト

## 🛠️ 技術的考慮事項

### 1. パフォーマンス
- 統計計算はUserStatテーブル活用で高速化
- 必要に応じてキャッシュ機能追加
- ページネーション不要（統計データのため）

### 2. データ整合性
- UserStat.recalculate!メソッド活用
- リアルタイム更新不要（定期更新で十分）

### 3. UI/UX
- 既存TrainingRecordsページのデザイン言語を踏襲
- TailwindCSSクラス再利用
- レスポンシブ対応継続

## ✅ 実装準備完了

### 利用可能なリソース
- ✅ データベーススキーマ（追加不要）
- ✅ 基本統計データ（UserStat）
- ✅ API認証システム
- ✅ UI/UXベーススタイル
- ✅ エラーハンドリングパターン

### 次のアクション
1. バックエンドAPI実装開始
2. Chart.jsライブラリインストール
3. ダッシュボードコンポーネント作成