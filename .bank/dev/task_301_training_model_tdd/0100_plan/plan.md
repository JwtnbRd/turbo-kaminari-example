# TASK-301: Trainingモデル詳細実装（TDD）

## 🎯 タスク目標
Trainingモデルの詳細化をTDDで実装する

## 📋 実装要件

### 現在のTrainingモデル状況
```ruby
class Training < ApplicationRecord
  enum :difficulty, { beginner: 0, intermediate: 1, advanced: 2 }, default: :beginner
  has_many :training_records, dependent: :destroy

  validates :name, presence: true, length: { maximum: 100 }
  validates :duration, presence: true, numericality: { greater_than: 0 }
  validates :base_points, presence: true, numericality: { greater_than_or_equal_to: 0 }

  scope :published, -> { where(published: true) }
  scope :by_difficulty, ->(difficulty) { where(difficulty: difficulty) }
end
```

### 追加実装予定

#### 1. 強化すべきバリデーション
- description presence & length
- published boolean validation
- deleted_at soft delete validation
- 複合バリデーション

#### 2. 追加すべきscope
- for_user_level
- recent
- popular

#### 3. カスタムメソッド
- calculate_points
- soft_delete
- restore
- available_for_user?

## 🔄 TDD実装手順
1. **Red**: 失敗するテスト作成
2. **Green**: 最小限実装
3. **Refactor**: コード品質向上

## ✅ 完了条件
- [ ] RSpecテスト95%以上カバレッジ
- [ ] 全バリデーション動作
- [ ] 関連モデル結合正常動作

## 🚨 注意事項
- 既存機能を破壊しない
- ベイビーステップで実装
- テストファーストを厳守