# コーディング規約

## 🚨 最重要原則: 差分を小さく保つ

**レビュー負荷を減らすための原則:**
- ✅ **1PR = 1機能** に絞る
- ✅ **差分は200行以内** を目標にする
- ✅ **動くものを小さく積み上げる**
- ❌ 一度に複数機能を実装しない
- ❌ 大きなリファクタリングを混ぜない

## Rails（バックエンド）規約

### RESTfulルーティング（DHH流）
- **絶対に使わない**: `collection`, `member`
- **使用するアクション**: `index`, `show`, `new`, `create`, `edit`, `update`, `destroy`のみ
- **複雑な操作**: 新しいリソースとして分割する

### モデル設計
- Fat Model, Skinny Controller
- ビジネスロジックはモデルに
- バリデーションは必ず実装
- Scopeを活用してクエリを整理

### コントローラ設計
- 1アクション = 1責任
- Strong Parametersを必ず使用
- エラーハンドリングはBaseControllerで一元管理

### N+1クエリ対策
- `includes`を必ず使用
- Bulletを有効化して検出

## React（フロントエンド）規約

### コンポーネント設計
- 関数コンポーネント + Hooks
- 1ファイル = 1コンポーネント
- Props型定義は必須（TypeScript）

### カスタムフック
- ロジックの再利用
- APIコールはカスタムフックに

### 状態管理
- グローバル状態: Zustand または Context API
- ローカル状態: useState
- サーバー状態: カスタムフック

## ファイル命名規則

### バックエンド
- Controller: `api/v1/trainings_controller.rb`
- Model: `training.rb`
- Serializer: `training_serializer.rb`

### フロントエンド
- Component: `TrainingCard.tsx`
- Hook: `useTrainings.ts`
- Type: `types/training.ts`
- Service: `services/api.ts`

## エラーハンドリング
- 予期されるエラーの適切な処理
- ユーザーへの分かりやすいエラーメッセージ
- ログ出力の実装

## セキュリティ
- 秘匿情報をコードから排除
- バリデーションは必須
- SQLインジェクション対策
- XSS対策