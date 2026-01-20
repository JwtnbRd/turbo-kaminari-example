# 推奨コマンド集

## 開発環境管理

### サービス起動・停止
```bash
# 全サービス起動（推奨）
bash scripts/container-manage.sh start

# バックエンドのみ起動
bash scripts/container-backend.sh start

# フロントエンドのみ起動
bash scripts/container-frontend.sh start

# サービス状態確認
bash scripts/container-manage.sh status

# ログ確認
bash scripts/container-manage.sh logs

# 再起動
bash scripts/container-manage.sh restart

# 停止
bash scripts/container-manage.sh stop
```

### データベース操作
```bash
# Rails コンソール
./scripts/container-backend.sh console

# マイグレーション実行
./scripts/container-backend.sh migrate

# シードデータ投入
./scripts/container-backend.sh seed

# バックエンドシェル
./scripts/container-backend.sh shell

# フロントエンドシェル
./scripts/container-frontend.sh shell
```

## 品質管理

### テスト・リント
```bash
# バックエンドテスト
./scripts/container-backend.sh test

# フロントエンドテスト（要確認）
./scripts/container-frontend.sh test

# Rails RSpec
docker-compose exec backend bundle exec rspec

# フロントエンドlint/format（package.jsonに基づく）
npm run lint
npm run format
```

### トラブルシューティング
```bash
# クリーンアップして再起動
docker-compose down -v
docker-compose build --no-cache
bash scripts/container-manage.sh start

# データベース再作成
docker exec workspace-backend-web-1 rails db:drop db:create db:migrate db:seed
docker-compose restart backend-web

# 依存関係再インストール
# Rails
docker exec workspace-backend-web-1 bundle install
docker-compose restart backend-web

# React
docker exec workspace-frontend-web-1 npm install
docker-compose restart frontend-web
```

## アクセスURL
- Frontend (React): http://localhost:3000
- Backend (Rails): http://localhost:4000

## Git操作
```bash
# 基本的なGitコマンド
git status
git add .
git commit -m "コミットメッセージ"

# ブランチ管理（Claude作業用）
git checkout -b claude_YYYY_MM_DD_HHMM_task_name
```

## Tsumikiワークフロー
```bash
# 要件定義
/kairo-requirements

# 設計書作成
/kairo-design

# タスク分割
/kairo-tasks

# 実装実行
/kairo-implement

# TDD個別コマンド
/tsumiki-tdd-red      # テスト作成（失敗）
/tsumiki-tdd-green    # 最小実装
/tsumiki-tdd-refactor # リファクタリング
```