# 🚀 TASK-301引き継ぎプロンプト

## 📋 コンテキスト
トレーニング記録Webアプリケーション（React + Rails）の開発を継続してください。
現在、**TASK-301: Trainingモデル詳細実装（TDD）**から開始します。

## ✅ 完了済みタスク（5/25）

### インフラ・基盤（4タスク完了）
- **TASK-001**: ✅ 開発環境構築（DevContainer + Docker）
- **TASK-002**: ✅ Rails API初期化（port 3001）
- **TASK-003**: ✅ React初期化（port 3000）
- **TASK-101**: ✅ データベーススキーマ作成（4テーブル）
- **TASK-102**: ✅ JWT認証システム完全実装

### 🎯 認証システム実装済み
```bash
# 動作確認済みAPI
POST /api/v1/auth/sign_up    # ユーザー登録（JWT返却）
POST /api/v1/auth/sign_in    # ログイン（JWT返却）
DELETE /api/v1/auth/sign_out # ログアウト
```

### 📊 実装済みモデル（基本版）
- **User**: Devise + JWT認証（role: general/admin）
- **Training**: 基本構造完了
- **TrainingRecord**: 基本構造完了
- **UserStat**: 統計計算ロジック実装済み

## 🔄 次タスク：TASK-301

### タスク詳細
**名前**: Trainingモデル詳細実装（TDD）
**推定時間**: 3時間
**タスクタイプ**: TDD（Red-Green-Refactor）

### 実装対象
```ruby
# app/models/training.rb を詳細化
class Training < ApplicationRecord
  # 🔄 詳細ビジネスロジック追加
  # 🔄 バリデーション強化
  # 🔄 scope追加（by_difficulty, for_user_level等）
  # 🆕 カスタムメソッド実装（calculate_points等）
end
```

### TDD実装手順
1. **Red**: 失敗するテストケース作成
2. **Green**: 最小限の実装でテスト成功
3. **Refactor**: コード品質向上（テスト維持）

### 完了条件
- [ ] RSpecテストが全て成功する（95%以上カバレッジ）
- [ ] 全バリデーションが適切に動作する
- [ ] 関連モデルとの結合が正常動作する

## 🖥️ 環境状況

### サーバー起動状況
```bash
# バックエンド: Rails API
http://localhost:3001 (起動中)

# フロントエンド: Vite React
http://localhost:3000 (起動中)

# データベース
PostgreSQL: workspace-backend-db-1 (起動中)
Redis: workspace-backend-redis-1 (起動中)
```

### 認証テスト環境
```
認証テストページ: http://localhost:3000/auth-test
- ユーザー登録・ログイン・ログアウトが動作確認済み
```

## 📁 重要なファイルパス

### バックエンド構造
```
backend/
├── app/models/
│   ├── user.rb              ✅ 実装済み
│   ├── training.rb          🔄 詳細化対象
│   ├── training_record.rb   ✅ 実装済み
│   └── user_stat.rb         ✅ 実装済み
├── lib/jsonweb_token.rb     ✅ JWT実装済み
└── spec/                    🆕 TDDで作成予定
    └── models/
        └── training_spec.rb 🆕 作成予定
```

### フロントエンド構造
```
frontend/src/
├── services/
│   ├── api.ts               ✅ axios設定済み
│   └── auth.ts              ✅ 認証サービス済み
├── components/auth/
│   └── AuthTest.tsx         ✅ テスト用UI
└── types/index.ts           ✅ 基本型定義済み
```

## 🛠️ 推奨コマンド

### RSpec実行
```bash
cd backend
bundle exec rspec                    # 全テスト実行
bundle exec rspec spec/models/       # モデルテストのみ
bundle exec rspec spec/models/training_spec.rb  # 個別テスト
```

### サーバー管理
```bash
# バックエンド起動（必要に応じて）
cd backend && bundle exec rails server -p 3001

# フロントエンド起動（必要に応じて）
cd frontend && npm run dev
```

### データベース操作
```bash
cd backend
bundle exec rails console               # Rails console
bundle exec rails db:migrate           # マイグレーション
bundle exec rails db:seed              # シードデータ
```

## 📋 実装チェックリスト

### Phase 1: テスト設計（Red）
- [ ] `spec/models/training_spec.rb` 作成
- [ ] バリデーションテスト（name, duration, description, etc.）
- [ ] scopeテスト（published, by_difficulty, etc.）
- [ ] 関連テスト（has_many :training_records）

### Phase 2: 最小実装（Green）
- [ ] バリデーション実装
- [ ] scope実装
- [ ] 関連設定

### Phase 3: 詳細実装（Refactor）
- [ ] ビジネスロジック追加
- [ ] カスタムメソッド実装
- [ ] コード最適化

## 🔗 参照ドキュメント

### 必読ファイル
1. **タスク詳細**: `/workspace/docs/tasks/1week-mvp-tasks.md` (TASK-301セクション)
2. **進捗記録**: `/workspace/.bank/dev/session_handover_006.md`
3. **プロジェクトルール**: `/workspace/CLAUDE.md`

### モデル設計参考
```ruby
# 現在のTrainingモデル（基本実装）
class Training < ApplicationRecord
  enum difficulty: { beginner: 0, intermediate: 1, advanced: 2 }

  has_many :training_records

  validates :name, presence: true, length: { maximum: 50 }
  validates :duration, numericality: { greater_than: 0 }
  validates :base_points, numericality: { greater_than: 0 }

  scope :published, -> { where(published: true, deleted_at: nil) }
  scope :by_difficulty, ->(difficulty) { where(difficulty: difficulty) }
end
```

## 🎯 成功基準

### 技術的成功基準
1. **テストカバレッジ**: 95%以上
2. **テスト実行時間**: 5秒以内
3. **全テスト成功**: エラー0件

### 機能的成功基準
1. **バリデーション**: 全項目で適切なエラーメッセージ
2. **scope機能**: 期待通りの検索結果
3. **関連モデル**: 正常な関連データ取得

## ⚡ クイックスタート

### 1分で開始する手順
```bash
# 1. プロジェクトディレクトリに移動
cd /workspace

# 2. バックエンドディレクトリでテスト環境確認
cd backend && bundle exec rspec --version

# 3. Trainingモデル確認
bundle exec rails console
> Training.first
> exit

# 4. テストファイル作成開始
# spec/models/training_spec.rb を作成してTDD開始
```

## 🚨 重要な注意事項

### CLAUDE.mdルール遵守
1. **AI運用5原則**: 作業前に必ず確認取得
2. **ベイビーステップ**: 小さな単位で確実に進行
3. **TDD原則**: Red-Green-Refactor厳守
4. **日本語対応**: すべて日本語で報告

### 技術制約
- Ruby 3.4.0
- Rails 8.0.2
- RSpec使用
- PostgreSQL使用
- 既存コード改変時は十分注意

---

**次のアクション**: TASK-301のTDD実装を開始してください。
**開始コマンド**: `cd /workspace/backend && bundle exec rspec` でテスト環境確認から開始。

**作成日**: 2025-11-26
**対象タスク**: TASK-301（Trainingモデル詳細実装）
**前タスク**: TASK-102完了（JWT認証システム）