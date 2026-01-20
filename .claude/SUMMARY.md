# プロジェクトサマリー - 重要な決定事項

## 📋 プロジェクト概要

**名前:** トレーニング記録Webアプリケーション  
**用途:** 社内向けツール  
**想定ユーザー数:** 約50人  
**目的:** 社員の運動習慣促進、ランキングでモチベーション維持

---

## 🎯 技術スタック

### フロントエンド
- React 18 + TypeScript
- Vite（Next.jsは使わない）
- TailwindCSS
- React Router v6
- Axios

### バックエンド
- Ruby on Rails 7.1（API mode）
- PostgreSQL 15
- Devise（認証）
- Cloudinary（画像アップロード）

### インフラ
- 開発環境: .devcontainer + Docker-in-Docker
- 本番環境: Vercel（フロント）+ Render（バック）

---

## 💰 コスト

```
Vercel Hobby:           $0/月
Render Web Service:     $7/月
Render PostgreSQL:      $7/月
Cloudinary:             $0/月（無料枠）
------------------------
合計:                 $14/月
年間:                $168
```

**社内50人規模なら完全にこの構成で十分！**

---

## 🎨 主要機能（MVP）

### 管理者
1. トレーニングマスタ管理（CRUD）
2. 画像アップロード

### 一般ユーザー
1. ユーザー登録・ログイン
2. ダッシュボード（統計表示）
3. トレーニング実行（カウントダウン）
4. カレンダー表示（月次）
5. ランキング（ポイント、連続日数）

---

## 🚫 実装しない機能

- パスワードリセット（Deviseデフォルトで十分）
- メール確認（社内ツールなので不要）
- 通知機能
- アチーブメント/バッジ
- データエクスポート
- Sidekiq（バックグラウンドジョブ）
- 複雑な権限管理

**シンプルに保つ！**

---

## 📐 重要な設計方針

### RESTfulルーティング（DHH流）
- `collection`, `member` は使わない
- 標準7アクションのみ使用
- 複雑な操作は別リソース化

### 小さなPR
- **1PR = 1機能**
- **差分200行以内**
- レビュー負荷を減らす

### 画像アップロード
- **Cloudinary** を使用
- 無料枠25GBで十分
- 設定が簡単（5分）

---

## 📂 ディレクトリ構成

```
training-app/
├── .devcontainer/
├── docs/
│   ├── requirements.md
│   ├── MVP_GUIDE.md
│   └── STORAGE_GUIDE.md
├── scripts/
│   ├── dev-start.sh
│   ├── dev-stop.sh
│   ├── container-backend.sh
│   └── container-frontend.sh
├── backend/
│   ├── app/
│   ├── config/
│   └── db/
└── frontend/
    └── src/
```

---

## 🚀 開発フロー

### 環境起動
```bash
./scripts/dev-start.sh
```

### よく使うコマンド
```bash
# Railsコンソール
./scripts/container-backend.sh console

# マイグレーション
./scripts/container-backend.sh migrate

# フロントエンドシェル
./scripts/container-frontend.sh shell
```

### PR作成
1. 小さな機能を実装（差分200行以内）
2. ローカルで動作確認
3. PR作成
4. レビュー → マージ
5. 次の機能へ

---

## 📝 実装順序（20PR程度）

```
Phase 0: 環境構築（3PR）
  → プロジェクト初期化

Phase 1: 認証（3PR）
  → Devise設定、API実装、フロント実装

Phase 2: トレーニングマスタ管理（5PR）
  → モデル、バックエンドAPI、フロント一覧、作成、画像

Phase 3: トレーニング実行（3PR）
  → 記録モデル、選択画面、実行画面

Phase 4: ダッシュボード（2PR）
  → 統計API、画面実装

Phase 5: カレンダー（2PR）
  → API、画面実装

Phase 6: ランキング（2PR）
  → API、画面実装
```

**合計: 約20PR、開発期間: 2-3週間**

---

## 🎯 成功の定義

### 動作するもの
- ✅ 管理者がトレーニングを登録できる
- ✅ ユーザーがトレーニングを実行できる
- ✅ 記録がカレンダーに表示される
- ✅ ランキングが表示される

### コード品質
- ✅ 差分が小さい（200行以内/PR）
- ✅ シンプルな実装
- ✅ 必要最小限の機能

### デプロイ
- ✅ Vercel + Renderにデプロイ済み
- ✅ 社内50人が使える状態

**これだけできればMVP成功！**

---

## 📚 ドキュメント一覧

1. **requirements.md** - 詳細要件定義
2. **CLAUDE.md** - 開発ガイド
3. **MVP_GUIDE.md** - MVP実装ガイド（★重要）
4. **FAQ.md** - デプロイQ&A
5. **STORAGE_GUIDE.md** - 画像アップロード詳細
6. **このファイル** - サマリー

**迷ったら MVP_GUIDE.md を見る！**

---

## ⚡️ クイックスタート

```bash
# 1. プロジェクト作成
mkdir training-app && cd training-app

# 2. ドキュメント配置
mkdir docs
cp requirements.md docs/
cp MVP_GUIDE.md docs/
cp CLAUDE.md ./

# 3. 環境構築開始
# Claude Codeに以下を指示:
# 「MVP_GUIDE.mdとCLAUDE.mdを読んで、
#  Phase 0から実装を開始してください」
```

---

## 🎉 まとめ

- 社内50人向けのシンプルなトレーニング記録アプリ
- Vercel + Render + Cloudinaryで月額$14
- 小さなPR（200行以内）で段階的に実装
- MVP機能のみに絞る（約20PR、2-3週間）
- AWS移行は不要（必要になったら検討）

**シンプルに、小さく、確実に進める！**
