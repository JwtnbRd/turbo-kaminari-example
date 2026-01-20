# 次セッションへの引き継ぎプロンプト

## 📋 セッション引き継ぎ情報

### プロジェクト状態

**プロジェクト名**: suku-suku-squat（トレーニング記録Webアプリケーション）
**開発期間**: 1週間MVP
**現在のフェーズ**: 設計完了、実装開始前

### 完了済み作業

#### ✅ Phase 1: Tsumikiフレームワーク導入
- `.claude/commands/tsumiki-kairo-*.md` コマンド4つを作成
- 要件定義 → 設計 → タスク分割 → 実装のワークフロー確立

#### ✅ Phase 2: 要件定義 (`/tsumiki-kairo-requirements`)
- EARS記法による要件定義書作成
- 13の機能要件を定義
- 成果物: `docs/spec/requirements.md`

#### ✅ Phase 3: 設計 (`/tsumiki-kairo-design`)
- アーキテクチャ設計（モノリシック3層）
- データモデル設計（4テーブル）
- API設計（RESTful、14エンドポイント）
- UI設計（6画面、TailwindCSS）
- 成果物: `docs/design/` 配下4ファイル

#### ✅ Phase 4: タスク分割 (`/tsumiki-kairo-tasks`)
- 25タスクへの分割
- 日次スケジュール（Day 1-7）
- 依存関係・クリティカルパス分析
- 成果物: `docs/tasks/1week-mvp-tasks.md`

#### ✅ Phase 5: 作業履歴の保存
- `.bank/dev/01_mvp_planning/` 配下に作業記録を保存
- 計画書、TODO、分析結果を整理

### 次に実行すべきアクション

```bash
/tsumiki-kairo-implement
```

**このコマンドで実装フェーズを開始します。**

### 実装の進め方

#### 1. 最初のタスク（クリティカルパス）

**TASK-001: 開発環境セットアップ**
- タイプ: DIRECT
- 推定時間: 2時間
- 内容:
  - `.devcontainer/` 設定確認
  - `docker-compose.yml` 確認
  - コンテナ起動確認
  - ヘルパースクリプト動作確認

**完了基準**:
- [ ] Docker環境が正常に起動する
- [ ] `./scripts/dev-start.sh` で開発環境が立ち上がる
- [ ] フロントエンド（localhost:3000）にアクセスできる
- [ ] バックエンド（localhost:3001）にアクセスできる

#### 2. タスク実行の原則

**TDDタスクの場合**:
1. **Red**: 失敗するテストを書く
2. **Green**: 最小限の実装でテストを通す
3. **Refactor**: コードを改善する

**DIRECTタスクの場合**:
1. 実装詳細に従って直接実装
2. 完了基準を確認
3. 動作確認

#### 3. クリティカルパス（優先実装順）

```
TASK-001: 開発環境セットアップ (2h)
  ↓
TASK-002: Rails API初期化 + 基本設定 (3h)
  ↓
TASK-101: React + Vite初期化 (2h)
  ↓
TASK-102: ルーティング + レイアウト (2h)
  ↓
TASK-201: データベース初期化 (1h)
  ↓
TASK-302: 管理者用TrainingコントローラAPI (3h)
  ↓
TASK-401: UserStatモデル実装 (4h) ← **連続日数ロジック**
  ↓
TASK-601: ランキングコントローラAPI (4h) ← **4種ランキング**
```

**合計**: 27時間（クリティカルパス）

### 重要な技術的決定事項

#### 連続日数計算ロジック（TASK-401で実装）

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

#### ランキングAPI仕様（TASK-601で実装）

**エンドポイント**:
- `GET /api/v1/point_rankings?period=all` - 累計ポイント
- `GET /api/v1/point_rankings?period=week` - 週次（月曜起算）
- `GET /api/v1/point_rankings?period=month` - 月次（月初起算）
- `GET /api/v1/streak_rankings` - 連続日数

**レスポンス形式**:
```json
{
  "period": "week",
  "rankings": [
    {
      "rank": 1,
      "user_id": 2,
      "username": "alice_smith",
      "points": 450,
      "is_current_user": false
    }
  ],
  "current_user_rank": 2
}
```

### 参照ドキュメント

#### 設計確認時
- `docs/design/architecture.md` - システム全体構成
- `docs/design/data.md` - テーブル定義・ER図
- `docs/design/api.md` - エンドポイント仕様
- `docs/design/ui.md` - 画面設計・デザインシステム

#### 実装時
- `docs/tasks/1week-mvp-tasks.md` - **最重要**: 全25タスクの詳細
- `.claude/CLAUDE.md` - コーディング規約・開発ガイド
- `docs/spec/requirements.md` - 受け入れ基準

#### 作業記録
- `.bank/dev/01_mvp_planning/0100_plan/plan.md` - プロジェクト計画
- `.bank/dev/01_mvp_planning/0200_todo/todo_overview.md` - TODO全体像
- `.bank/dev/01_mvp_planning/0300_analyze/completed_work.md` - 完了作業分析

### 開発環境情報

**技術スタック**:
- フロントエンド: React 18 + TypeScript + Vite + TailwindCSS
- バックエンド: Ruby on Rails 7.1 (API mode)
- データベース: PostgreSQL 15
- 認証: Devise（セッションベース）

**ディレクトリ構造**:
```
/workspace
├── frontend/          # React SPA
├── backend/           # Rails API
├── .devcontainer/     # Docker設定
├── scripts/           # ヘルパースクリプト
├── docs/
│   ├── spec/          # 要件定義
│   ├── design/        # 設計ドキュメント
│   └── tasks/         # タスク計画
└── .bank/
    └── dev/
        └── 01_mvp_planning/  # 作業記録
```

**よく使うコマンド**:
```bash
# 開発環境起動
./scripts/dev-start.sh

# バックエンドシェル
./scripts/container-backend.sh shell

# フロントエンドシェル
./scripts/container-frontend.sh shell

# マイグレーション実行
./scripts/container-backend.sh migrate

# Railsコンソール
./scripts/container-backend.sh console
```

### 実装開始前の確認事項

#### 環境確認
- [ ] Dockerが起動している
- [ ] `.env.development` ファイルが存在する
- [ ] `./scripts/*.sh` に実行権限がある (`chmod +x scripts/*.sh`)

#### ドキュメント確認
- [ ] `docs/tasks/1week-mvp-tasks.md` を読む
- [ ] TASK-001の実装詳細を確認する
- [ ] 完了基準を理解する

#### 作業方針確認
- [ ] ベイビーステップで進める（小さく確実に）
- [ ] TDDサイクルを守る（Red → Green → Refactor）
- [ ] 各タスク完了時に動作確認する
- [ ] 依存関係を確認してから次タスクに進む

---

## 🚀 次セッション開始時のプロンプト例

以下のプロンプトでセッションを開始することを推奨します:

```
前回のセッションでTsumikiフレームワークを使った1週間MVP開発の計画フェーズ（要件定義・設計・タスク分割）が完了しました。

今回から実装フェーズに入ります。

以下のドキュメントを確認済みです:
- docs/spec/requirements.md（要件定義）
- docs/design/（設計4ファイル）
- docs/tasks/1week-mvp-tasks.md（25タスク計画）

次のコマンドで実装を開始してください:

/tsumiki-kairo-implement

最初のタスクはTASK-001（開発環境セットアップ）です。
クリティカルパスに従って、依存関係を考慮しながら順次実装を進めてください。
```

---

## 📝 補足情報

### ユーザーからの重要なフィードバック

1. **ランキング要望**: 「連続日数と、週次、月次のランキングはほしいなあ」
   - → 4種類のランキングを実装予定
   - → TASK-601/602で対応

2. **開発期間**: 1週間でMVPを完成させる
   - → 25タスク、56時間の計画
   - → クリティカルパス27時間（余裕あり）

3. **VIP（MVP）範囲**: 基本機能 + 4種ランキング
   - → 画像アップロード、パスワードリセットなどは除外
   - → シンプルなUI（凝った装飾なし）

### 懸念事項・リスク

**時間的制約**:
- 1週間（56時間）で25タスク
- クリティカルパス27時間 → 余裕バッファ29時間
- リスク: 予期せぬバグ・技術的課題

**技術的課題**:
- 連続日数計算ロジックの正確性
- ランキングクエリのパフォーマンス
- セッション認証のCORS設定

**対策**:
- ベイビーステップで小さく確実に進める
- 各タスク完了時に動作確認
- TDDでバグを早期発見

### 成功の定義

**機能面**:
- ✅ 管理者がトレーニングを登録できる
- ✅ ユーザーがアカウント作成・ログインできる
- ✅ ユーザーがトレーニングを実行・記録できる
- ✅ ダッシュボードで統計が表示される
- ✅ カレンダーでトレーニング実行状況が確認できる
- ✅ 4種類のランキングが表示される
- ✅ 連続日数が正しく計算・表示される

**技術面**:
- ✅ すべての基本機能が動作する
- ✅ フロントエンドとバックエンドが正常に連携する
- ✅ 認証機能が適切に動作する
- ✅ データの整合性が保たれる

---

**このドキュメントを次セッションで参照し、スムーズに実装を開始してください。**
