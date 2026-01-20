# TASK-302: TrainingRecordモデル・API実装

## 📋 タスク概要

**タスク名**: TrainingRecordモデル・API実装
**推定時間**: 3時間
**タスクタイプ**: TDD（Red-Green-Refactor）
**優先度**: 高（ユーザー機能の中核）

## 🎯 実装目標

### 1. TrainingRecordモデル詳細化
現在の基本的なTrainingRecordモデルに、詳細なビジネスロジックを追加する。

### 2. API実装
- `POST /api/v1/training_records` - 記録作成
- `GET /api/v1/training_records` - 記録一覧取得

### 3. 統計更新システム
トレーニング記録作成時に、ユーザー統計情報を自動更新する。

## 🔧 技術仕様

### TrainingRecordモデル強化

#### 追加するバリデーション
```ruby
# 必須項目
validates :user_id, :training_id, :completed_at, presence: true

# 論理制約
validates :reps, numericality: { greater_than: 0, allow_nil: true }
validates :duration, numericality: { greater_than: 0, allow_nil: true }
validates :weight, numericality: { greater_than: 0, allow_nil: true }

# 日付制約
validates :completed_at, presence: true
validate :completed_at_not_future
```

#### 追加するScope
```ruby
scope :recent, ->(days = 7) { where('completed_at >= ?', days.days.ago) }
scope :by_date, ->(date) { where(completed_at: date.beginning_of_day..date.end_of_day) }
scope :by_training, ->(training_id) { where(training_id: training_id) }
scope :by_user, ->(user_id) { where(user_id: user_id) }
scope :this_week, -> { where('completed_at >= ?', Date.current.beginning_of_week) }
scope :this_month, -> { where('completed_at >= ?', Date.current.beginning_of_month) }
scope :ordered, -> { order(completed_at: :desc) }
```

#### 追加するインスタンスメソッド
```ruby
# ポイント計算
def calculate_points
  return 0 unless training&.base_points

  base = training.base_points
  difficulty_bonus = training.difficulty_multiplier || 1.0

  (base * difficulty_bonus).round
end

# 同日の同トレーニング記録数
def same_day_same_training_count
  TrainingRecord.by_date(completed_at.to_date)
                .by_training(training_id)
                .by_user(user_id)
                .count
end

# パフォーマンス比較
def performance_ratio
  return nil unless reps && training.base_reps

  reps.to_f / training.base_reps
end
```

### API仕様

#### POST /api/v1/training_records
**目的**: トレーニング記録を作成し、統計情報を更新

**リクエスト**:
```json
{
  "training_record": {
    "training_id": 1,
    "reps": 20,
    "duration": 300,
    "weight": 10.5,
    "notes": "調子が良かった"
  }
}
```

**レスポンス（成功）**:
```json
{
  "id": 1,
  "training_id": 1,
  "training_name": "腕立て伏せ",
  "reps": 20,
  "duration": 300,
  "weight": 10.5,
  "notes": "調子が良かった",
  "points": 15,
  "completed_at": "2025-11-26T10:30:00Z",
  "created_at": "2025-11-26T10:30:00Z"
}
```

#### GET /api/v1/training_records
**目的**: ユーザーのトレーニング記録一覧を取得

**クエリパラメータ**:
- `page`: ページ番号（デフォルト: 1）
- `per_page`: 1ページあたりの件数（デフォルト: 20）
- `training_id`: 特定のトレーニングに絞り込み
- `start_date`: 開始日（YYYY-MM-DD）
- `end_date`: 終了日（YYYY-MM-DD）

**レスポンス**:
```json
{
  "data": [
    {
      "id": 1,
      "training_id": 1,
      "training_name": "腕立て伏せ",
      "reps": 20,
      "duration": 300,
      "weight": 10.5,
      "points": 15,
      "completed_at": "2025-11-26T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 100,
    "per_page": 20
  }
}
```

### 統計更新システム

#### UserStatモデル自動更新
```ruby
# 記録作成時に以下を更新
- total_points: 総ポイント数
- total_trainings: 総トレーニング回数
- current_streak: 連続トレーニング日数
- longest_streak: 最長連続日数
- last_training_at: 最新トレーニング日時
```

#### トランザクション処理
```ruby
ActiveRecord::Base.transaction do
  # 1. TrainingRecord作成
  record = TrainingRecord.create!(params)

  # 2. UserStat更新
  UserStat.update_stats_for_user(current_user, record)

  # 3. 成功レスポンス返却
end
```

## 🧪 テスト戦略

### TDDサイクル実装順序

#### 1. Red - 失敗するテストを書く
```ruby
# spec/models/training_record_spec.rb
RSpec.describe TrainingRecord, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:user_id) }
    it { should validate_presence_of(:training_id) }
    it { should validate_presence_of(:completed_at) }
  end
end
```

#### 2. Green - 最小限の実装でテストを通す
```ruby
# app/models/training_record.rb
class TrainingRecord < ApplicationRecord
  validates :user_id, :training_id, :completed_at, presence: true
end
```

#### 3. Refactor - コードを改善する
```ruby
# より良い実装に改善
class TrainingRecord < ApplicationRecord
  belongs_to :user
  belongs_to :training

  validates :user_id, :training_id, :completed_at, presence: true
  validates :reps, numericality: { greater_than: 0, allow_nil: true }
end
```

### テスト項目

#### モデルテスト
- [ ] バリデーション
- [ ] アソシエーション
- [ ] Scope
- [ ] インスタンスメソッド（ポイント計算等）

#### APIテスト
- [ ] POST /api/v1/training_records
  - [ ] 正常系: 記録作成成功
  - [ ] 異常系: バリデーションエラー
  - [ ] 異常系: 未認証エラー
- [ ] GET /api/v1/training_records
  - [ ] 正常系: 一覧取得成功
  - [ ] 正常系: フィルタリング動作
  - [ ] 正常系: ページネーション動作

#### 統合テスト
- [ ] 記録作成時の統計更新
- [ ] トランザクション処理
- [ ] エラー時のロールバック

## 🔄 実装フロー

### Phase 1: モデル詳細化（1時間）
1. バリデーション追加
2. Scope実装
3. インスタンスメソッド実装
4. モデルテスト作成

### Phase 2: API実装（1時間）
1. TrainingRecordsController作成
2. create/indexアクション実装
3. Serializer実装
4. ルーティング設定

### Phase 3: 統計更新実装（1時間）
1. 統計更新ロジック実装
2. トランザクション処理
3. APIテスト作成
4. 統合テスト

## ✅ 完了条件

### 機能要件
- [ ] トレーニング記録作成API動作
- [ ] 記録一覧取得API動作
- [ ] 統計情報自動更新
- [ ] バリデーション適切動作

### 品質要件
- [ ] 全テストパス（カバレッジ90%以上）
- [ ] Lintエラーなし
- [ ] セキュリティチェック通過

### パフォーマンス要件
- [ ] API応答時間500ms以下
- [ ] N+1クエリなし
- [ ] 適切なインデックス設定

## 🚨 リスク・注意事項

### 技術制約
- Ruby 3.4.0 + Rails 8.0.2 対応
- PostgreSQLのデータ型制約考慮
- JWT認証必須

### ビジネスロジック制約
- 統計更新の整合性保証
- 同時実行時の競合状態対策
- データ削除時の統計修正

### パフォーマンス考慮
- 大量データでのページネーション
- 統計計算の効率化
- インデックス最適化

---

**作成日**: 2025-11-26
**作成者**: Claude
**前提タスク**: TASK-301, TASK-202, TASK-203完了
**次タスク**: TASK-303（ユーザー向けトレーニング記録UI）