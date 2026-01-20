# 1週間MVP開発計画

## 目的

トレーニング記録Webアプリケーション「suku-suku-squat」の1週間MVP開発

## 開発期間

7日間（56時間想定）

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

## MVP範囲

### 必須機能（13要件）

1. **認証機能**
   - REQ-001: ユーザー登録
   - REQ-002: ユーザーログイン

2. **管理機能**
   - REQ-003: トレーニング作成（管理者のみ）
   - REQ-004: トレーニング一覧管理（管理者のみ）

3. **トレーニング実行**
   - REQ-005: トレーニング選択
   - REQ-006: トレーニング実行（カウントダウン）
   - REQ-007: トレーニング記録保存

4. **ダッシュボード**
   - REQ-008: 基本統計表示（累計ポイント、総回数、連続日数）

5. **カレンダー**
   - REQ-009: 月次カレンダー表示

6. **ランキング**
   - REQ-010: 累計ポイントランキング
   - REQ-011: 連続日数ランキング
   - REQ-012: 週次ポイントランキング
   - REQ-013: 月次ポイントランキング

### 除外機能

- 画像アップロード
- パスワードリセット
- メール確認
- E2Eテスト
- デプロイ設定（本番環境）
- 通知機能
- プロフィール画像

## アーキテクチャ決定

### 基本構成
モノリシック3層アーキテクチャ
- プレゼンテーション層: React SPA
- アプリケーション層: Rails API
- データ層: PostgreSQL

### 認証方式
セッションベース認証（Devise）
- 理由: 1週間開発でシンプル、社内アプリで十分

### データモデル
4テーブル構成:
1. users - ユーザー情報
2. trainings - トレーニングマスタ
3. training_records - トレーニング実行記録
4. user_stats - ユーザー統計（キャッシュテーブル）

## 重要な技術的決定

### 連続日数計算ロジック
```ruby
# UserStatモデル内
def calculate_current_streak(last_date, new_date)
  return 1 if last_date.nil?

  days_diff = (new_date - last_date).to_i

  case days_diff
  when 0
    current_streak # 同日は変更なし
  when 1
    current_streak + 1 # 連続
  else
    1 # リセット
  end
end
```

### ランキングAPI設計
単一エンドポイントでperiodパラメータ切り替え:
- `/api/v1/point_rankings?period=all` - 累計
- `/api/v1/point_rankings?period=week` - 週次
- `/api/v1/point_rankings?period=month` - 月次
- `/api/v1/streak_rankings` - 連続日数（別エンドポイント）

## 成功基準

### 機能面
- ✅ 管理者がトレーニングを登録できる
- ✅ ユーザーがアカウント作成・ログインできる
- ✅ ユーザーがトレーニングを実行・記録できる
- ✅ ダッシュボードで統計が表示される
- ✅ カレンダーでトレーニング実行状況が確認できる
- ✅ 4種類のランキングが表示される
- ✅ 連続日数が正しく計算・表示される

### 技術面
- ✅ すべての基本機能が動作する
- ✅ フロントエンドとバックエンドが正常に連携する
- ✅ 認証機能が適切に動作する
- ✅ データの整合性が保たれる

## 参照ドキュメント

- 要件定義: `docs/spec/requirements.md`
- アーキテクチャ設計: `docs/design/architecture.md`
- データ設計: `docs/design/data.md`
- API設計: `docs/design/api.md`
- UI設計: `docs/design/ui.md`
- タスク計画: `docs/tasks/1week-mvp-tasks.md`
