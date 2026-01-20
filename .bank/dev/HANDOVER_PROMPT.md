# 次セッション開始プロンプト

## 🎯 現在の状況

### ✅ 完了タスク（4つ）
1. **TASK-001**: 開発環境セットアップ（DevContainer + Docker-in-Docker）
2. **TASK-002**: Rails API初期化（devise, holidays gem追加）
3. **TASK-003**: React + Vite初期化（TailwindCSS, TypeScript）
4. **TASK-101**: データベーススキーマ作成（4テーブル、全マイグレーション完了）

### 🔄 次タスク: TASK-102

**タスク名**: モデル実装（User, Training, TrainingRecord, UserStat）
**推定時間**: 3時間
**アプローチ**: DIRECT（TDDではない）

## 📝 次セッションで実施すること

### TASK-102の実装内容

#### 1. Userモデル（`app/models/user.rb`）
- [ ] role enumの追加（general: 0, admin: 1）
- [ ] アソシエーション設定（has_many :training_records, has_one :user_stat）
- [ ] username validationの追加
- [ ] after_createコールバックでuser_stat自動作成

#### 2. Trainingモデル（`app/models/training.rb`）
- [ ] difficulty enumの追加（beginner: 0, intermediate: 1, advanced: 2）
- [ ] アソシエーション設定（has_many :training_records）
- [ ] バリデーション（name, duration, base_points）
- [ ] scope定義（published, by_difficulty）

#### 3. TrainingRecordモデル（`app/models/training_record.rb`）
- [ ] アソシエーション設定（belongs_to :user, :training）
- [ ] バリデーション（points_earned, completed_at）
- [ ] after_createコールバックでuser_stats更新
- [ ] scope定義（recent, by_user）

#### 4. UserStatモデル（`app/models/user_stat.rb`）
- [ ] アソシエーション設定（belongs_to :user）
- [ ] バリデーション（数値項目 >= 0）
- [ ] recalculate!メソッドのスケルトン作成

## 🚀 セッション開始時の実行コマンド

```bash
# 1. 環境確認
docker ps  # PostgreSQL, Redisが起動しているか確認

# 2. 起動していない場合
docker-compose up -d backend-db backend-redis

# 3. マイグレーション状態確認
cd /workspace/backend
bundle exec rails db:migrate:status

# 4. Railsコンソールで動作確認
bundle exec rails console
```

## 📚 参考ドキュメント

- **詳細設計**: `/workspace/docs/design/data.md`
- **詳細引き継ぎ**: `/workspace/.bank/dev/session_handover_004.md`
- **TODOリスト**: `/workspace/.bank/dev/01_mvp_planning/0200_todo/todo_overview.md`

## ⚠️ 注意事項

1. **database.yml設定済み**
   - host: localhost（DevContainer内からはlocalhostで接続）
   - database: app_development, app_test
   - username/password: postgres/password

2. **既存のマイグレーション**
   - 4つのマイグレーション全て完了済み
   - テーブル: users, trainings, training_records, user_stats

3. **コーディング規約**
   - Fat Model, Skinny Controller
   - 実装後に `bundle exec rubocop` で確認すること

---

**次セッション開始**: TASK-102（モデル実装）から開始
**前セッション完了**: TASK-101（データベーススキーマ作成）
