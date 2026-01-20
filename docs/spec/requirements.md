# トレーニング記録アプリ 1週間MVP要件定義書

## プロジェクト概要

### 目的
社内向けトレーニング記録Webアプリケーション「suku-suku-squat」の1週間MVP開発

### 開発期間
7日間

### 対象ユーザー
- **一般ユーザー**: トレーニングを記録・管理する社員
- **管理者**: トレーニングマスタを管理する運営者

## 技術スタック

### フロントエンド
- React 18 + TypeScript + Vite
- TailwindCSS
- React Router v6
- Axios

### バックエンド
- Ruby on Rails 7.1+ (API mode)
- PostgreSQL 15
- Devise（認証）

### 開発環境
- .devcontainer + Docker

## 機能要件（EARS記法）

### 認証機能

#### REQ-001: ユーザー登録
- **EARS**: システムはユーザーがメールアドレス、ユーザー名、パスワードを入力した場合、新しいアカウントを作成しなければならない
- **受け入れ基準**:
  - GIVEN ユーザーが登録フォームにアクセスしたとき
  - WHEN 有効なメール、ユーザー名、パスワードを入力してSUBMITする
  - THEN アカウントが作成され、ログイン状態でダッシュボードにリダイレクトされる
- **優先度**: High

#### REQ-002: ユーザーログイン
- **EARS**: システムはユーザーが正しい認証情報を入力した場合、ログインセッションを確立しなければならない
- **受け入れ基準**:
  - GIVEN 登録済みユーザーがログインフォームにアクセスしたとき
  - WHEN 正しいメールアドレスとパスワードを入力する
  - THEN ログインが成功しダッシュボードにリダイレクトされる
- **優先度**: High

### 管理機能（管理者のみ）

#### REQ-003: トレーニング作成
- **EARS**: システムは管理者がトレーニング情報を入力した場合、新しいトレーニングマスタを作成しなければならない
- **受け入れ基準**:
  - GIVEN 管理者がトレーニング作成フォームにアクセスしたとき
  - WHEN トレーニング名、説明、実施時間、基本ポイントを入力してSUBMITする
  - THEN 新しいトレーニングが作成され一覧に表示される
- **優先度**: High

#### REQ-004: トレーニング一覧管理
- **EARS**: システムは管理者が管理画面にアクセスした場合、すべてのトレーニングマスタを一覧表示しなければならない
- **受け入れ基準**:
  - GIVEN 管理者が管理画面にアクセスしたとき
  - WHEN ページが読み込まれる
  - THEN 全てのトレーニングが名前、説明、時間、ポイントとともに表示される
- **優先度**: High

### トレーニング実行機能

#### REQ-005: トレーニング選択
- **EARS**: システムは一般ユーザーがトレーニング画面にアクセスした場合、利用可能なトレーニング一覧を表示しなければならない
- **受け入れ基準**:
  - GIVEN 一般ユーザーがトレーニング画面にアクセスしたとき
  - WHEN ページが読み込まれる
  - THEN 公開中のトレーニングが実行可能な形で表示される
- **優先度**: High

#### REQ-006: トレーニング実行
- **EARS**: システムはユーザーがトレーニングを選択した場合、指定時間のカウントダウン機能を提供しなければならない
- **受け入れ基準**:
  - GIVEN ユーザーがトレーニングを選択したとき
  - WHEN 実行ボタンをクリックする
  - THEN カウントダウンタイマーが開始される
- **優先度**: High

#### REQ-007: トレーニング記録保存
- **EARS**: システムはユーザーがトレーニングを完了した場合、実行記録とポイントを保存しなければならない
- **受け入れ基準**:
  - GIVEN ユーザーがトレーニングを完了したとき
  - WHEN カウントダウンが0になる
  - THEN 記録が保存され、統計が更新され、完了画面が表示される
- **優先度**: High

### ダッシュボード機能

#### REQ-008: 基本統計表示
- **EARS**: システムはユーザーがダッシュボードにアクセスした場合、累計ポイントと総トレーニング回数と現在の連続日数を表示しなければならない
- **受け入れ基準**:
  - GIVEN ユーザーがダッシュボードにアクセスしたとき
  - WHEN ページが読み込まれる
  - THEN 累計ポイント、総回数、現在の連続日数、直近のトレーニング記録が表示される
- **優先度**: Medium

### カレンダー機能

#### REQ-009: 月次カレンダー表示
- **EARS**: システムはユーザーがカレンダー画面にアクセスした場合、当月のトレーニング実行状況を表示しなければならない
- **受け入れ基準**:
  - GIVEN ユーザーがカレンダー画面にアクセスしたとき
  - WHEN ページが読み込まれる
  - THEN 当月カレンダーにトレーニング実行日が視覚的に表示される
- **優先度**: Medium

### ランキング機能

#### REQ-010: 累計ポイントランキング
- **EARS**: システムはユーザーがランキング画面にアクセスした場合、全ユーザーの累計ポイント順ランキングを表示しなければならない
- **受け入れ基準**:
  - GIVEN ユーザーがランキング画面の「累計ポイント」タブにアクセスしたとき
  - WHEN ページが読み込まれる
  - THEN 全期間の累計ポイント順でユーザーがランキング表示される
- **優先度**: Medium

#### REQ-011: 連続日数ランキング
- **EARS**: システムはユーザーが連続日数ランキングにアクセスした場合、現在の連続トレーニング日数順ランキングを表示しなければならない
- **重要**: 連続日数は営業日ベースで計算（土日祝日はトレーニングしなくても連続日数が途切れない）
- **受け入れ基準**:
  - GIVEN ユーザーがランキング画面の「連続日数」タブにアクセスしたとき
  - WHEN ページが読み込まれる
  - THEN 現在の営業日ベース連続日数順でユーザーがランキング表示される
- **優先度**: Medium

#### REQ-012: 週次ポイントランキング
- **EARS**: システムはユーザーが週次ランキングにアクセスした場合、今週の獲得ポイント順ランキングを表示しなければならない
- **受け入れ基準**:
  - GIVEN ユーザーがランキング画面の「今週」タブにアクセスしたとき
  - WHEN ページが読み込まれる
  - THEN 今週（月曜開始）の獲得ポイント順でユーザーがランキング表示される
- **優先度**: Medium

#### REQ-013: 月次ポイントランキング
- **EARS**: システムはユーザーが月次ランキングにアクセスした場合、今月の獲得ポイント順ランキングを表示しなければならない
- **受け入れ基準**:
  - GIVEN ユーザーがランキング画面の「今月」タブにアクセスしたとき
  - WHEN ページが読み込まれる
  - THEN 今月の獲得ポイント順でユーザーがランキング表示される
- **優先度**: Medium

## 非機能要件

### パフォーマンス要件
- システムはページの読み込み時間を3秒以内にしなければならない
- システムは同時接続50ユーザーまで対応しなければならない

### セキュリティ要件
- システムはDeviseを使用したセッションベース認証を実装しなければならない
- システムは管理者権限を持つユーザーのみが管理機能にアクセスできるようにしなければならない

### 可用性要件
- システムは開発期間中に安定して動作しなければならない

## 1週間実装スケジュール

### Day 1-2: 基盤構築
- ✅ 環境構築（.devcontainer + Docker）
- ✅ Rails API初期化 + Devise設定
- ✅ React初期化（Vite + TypeScript）
- ✅ User認証API実装
- ✅ フロントエンド認証機能

### Day 3-5: コア機能実装
- ✅ Trainingモデル + 基本API
- ✅ 管理画面（一覧・作成）
- ✅ トレーニング実行機能
- ✅ 記録保存機能
- ✅ UserStatモデル（統計・連続日数計算）
- ✅ ダッシュボード（基本統計表示）
- ✅ 簡易カレンダー表示

### Day 6-7: ランキング・最終調整
- ✅ ランキングAPI実装（4種類対応）
- ✅ ランキング画面（タブ切り替え機能）
- ✅ 統計更新ロジック（トレーニング記録時）
- ✅ 動作確認・バグ修正
- ✅ 最低限のスタイリング

## MVP範囲外（実装しない機能）

### 除外する機能
- 画像アップロード（Cloudinary設定）
- パスワードリセット機能
- メール確認機能
- 複雑な並び順変更
- 詳細なバリデーション
- E2Eテスト
- デプロイ設定（本番環境）
- 通知機能
- プロフィール画像

### 最小限にする機能
- エラーハンドリング: 基本的なもののみ
- バリデーション: 必須項目チェック程度
- UI/UX: シンプルなデザイン（凝った装飾なし）

## データモデル設計

### Usersテーブル（Devise標準 + 拡張）
```ruby
create_table :users do |t|
  # Devise標準フィールド
  t.string :email, null: false, default: ""
  t.string :encrypted_password, null: false, default: ""
  t.string :reset_password_token
  t.datetime :reset_password_sent_at
  t.datetime :remember_created_at

  # 追加フィールド
  t.string :username, null: false
  t.integer :role, default: 0, null: false # 0: user, 1: admin

  t.timestamps null: false
end
```

### Trainingsテーブル
```ruby
create_table :trainings do |t|
  t.string :name, null: false
  t.text :description, null: false
  t.integer :duration, null: false # 秒単位
  t.integer :base_points, null: false
  t.integer :difficulty, default: 0, null: false # 0: beginner, 1: intermediate, 2: advanced
  t.boolean :published, default: true, null: false
  t.timestamps
end
```

### TrainingRecordsテーブル
```ruby
create_table :training_records do |t|
  t.references :user, null: false, foreign_key: true
  t.references :training, null: false, foreign_key: true
  t.integer :points_earned, null: false
  t.datetime :completed_at, null: false
  t.timestamps
end
```

### UserStatsテーブル（集計用キャッシュ）
```ruby
create_table :user_stats do |t|
  t.references :user, null: false, foreign_key: true, index: { unique: true }
  t.integer :total_points, default: 0, null: false
  t.integer :current_streak, default: 0, null: false # 現在の連続日数
  t.integer :longest_streak, default: 0, null: false # 最長連続日数
  t.integer :total_training_count, default: 0, null: false
  t.date :last_training_date
  t.datetime :updated_at, null: false
end
```

## API設計

### 認証API
- `POST /api/v1/auth/sign_in` - ログイン
- `POST /api/v1/auth` - ユーザー登録
- `DELETE /api/v1/auth/sign_out` - ログアウト
- `GET /api/v1/current_user` - 現在のユーザー情報取得

### トレーニングAPI
- `GET /api/v1/trainings` - トレーニング一覧（一般ユーザー用）
- `GET /api/v1/admin/trainings` - トレーニング管理一覧（管理者用）
- `POST /api/v1/admin/trainings` - トレーニング作成（管理者用）

### 記録API
- `POST /api/v1/training_records` - トレーニング記録作成
- `GET /api/v1/training_records` - ユーザーの記録一覧

### 統計・ランキングAPI
- `GET /api/v1/user_stat` - 現在のユーザー統計
- `GET /api/v1/point_rankings?period=all|week|month` - ポイントランキング
- `GET /api/v1/streak_rankings` - 連続日数ランキング
- `GET /api/v1/calendar_days?year=2025&month=11` - カレンダーデータ

## 成功の定義

### 最終目標（Day 7終了時点）
- ✅ 管理者がトレーニングを登録できる
- ✅ ユーザーがアカウント作成・ログインできる
- ✅ ユーザーがトレーニングを実行・記録できる
- ✅ ダッシュボードで統計が表示される
- ✅ カレンダーでトレーニング実行状況が確認できる
- ✅ 4種類のランキングが表示される
- ✅ 連続日数が正しく計算・表示される

### 技術的成功基準
- ✅ すべての基本機能が動作する
- ✅ フロントエンドとバックエンドが正常に連携する
- ✅ 認証機能が適切に動作する
- ✅ データの整合性が保たれる

**これが1週間で達成すべきMVPの完全な要件定義です。**