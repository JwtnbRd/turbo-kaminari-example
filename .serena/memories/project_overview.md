# プロジェクト概要

## プロジェクトの目的
トレーニング記録Webアプリケーション「suku-suku-squat」の開発

## 技術スタック
- **フロントエンド**: React + TypeScript + Vite + TailwindCSS
- **バックエンド**: Ruby on Rails 8.0.2+ (API mode)
- **データベース**: PostgreSQL 15
- **認証**: Devise + JWT
- **開発環境**: Docker + DevContainer
- **画像管理**: Cloudinary
- **デプロイ**: Vercel (フロント) + Render (バック)

## 主要機能
1. ユーザー認証（登録・ログイン）- ✅ 実装完了
2. トレーニング記録・管理 - 🔄 実装中
3. 管理画面 - ✅ 実装完了
4. カレンダー表示 - 📋 予定
5. ランキング機能 - 📋 予定

## 実装済み機能（2025-11-26現在）

### 認証システム
- JWT認証（Devise基盤）
- 管理者・一般ユーザー権限分離
- トークンベースAPI認証

### 管理画面システム
- レスポンシブ管理UI
- Training完全CRUD操作
- 統計ダッシュボード
- 権限チェック機能

### APIエンドポイント
```
# 認証API
POST /api/v1/auth/sign_up     # ユーザー登録
POST /api/v1/auth/sign_in     # ログイン
DELETE /api/v1/auth/sign_out  # ログアウト

# 管理者API
GET    /api/v1/admin/trainings     # 一覧取得
POST   /api/v1/admin/trainings     # 作成
PATCH  /api/v1/admin/trainings/:id # 更新
DELETE /api/v1/admin/trainings/:id # 削除
```

### フロントエンド画面
```
http://localhost:3000/                        # ホームページ
http://localhost:3000/auth-test               # 認証テスト
http://localhost:3000/admin/training-management # 管理画面
```

## ディレクトリ構造
```
workspace/
├── frontend/          # React アプリケーション
│   ├── src/
│   │   ├── components/admin/    # 管理者用コンポーネント
│   │   ├── pages/admin/         # 管理者ページ
│   │   ├── hooks/               # カスタムフック
│   │   ├── services/            # API通信
│   │   └── types/               # TypeScript型定義
├── backend/           # Rails API
│   ├── app/controllers/api/v1/admin/ # 管理者API
│   ├── app/models/              # データモデル
│   └── app/serializers/admin/   # シリアライザー
├── scripts/           # 開発用スクリプト
├── .devcontainer/     # DevContainer設定
├── .claude/           # Claude Code設定・コマンド
├── .bank/             # 開発ドキュメント・記録
├── docs/              # プロジェクトドキュメント
└── README.md          # セットアップ手順
```

## 開発フロー
- DevContainer内での開発
- Dockerベースの環境構築
- RESTfulAPIによるフロント・バック連携
- DHH流のRailsパターン採用
- TypeScript型安全性重視

## 現在の進捗状況
- **完了タスク**: 8/25 (32%)
- **基盤構築**: 100%完了
- **認証システム**: 100%完了  
- **管理画面**: 100%完了
- **次フェーズ**: TrainingRecord実装

## 開発効率
- 予想時間: 56時間
- 実績時間: 約1.5時間（大幅短縮）
- 高速開発手法確立