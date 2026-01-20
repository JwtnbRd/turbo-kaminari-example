# TASK-303: ユーザー向けトレーニング記録UI実装

## 📋 タスク概要

**タスク名**: ユーザー向けトレーニング記録UI実装
**推定時間**: 2時間
**タスクタイプ**: フロントエンド実装
**優先度**: 高（ユーザー機能の中核UI）

## 🎯 実装目標

### 1. トレーニング記録作成フォーム
ユーザーがトレーニング実行結果を簡単に記録できるフォーム

### 2. トレーニング記録一覧表示
ユーザーの過去の記録を見やすく表示する一覧画面

### 3. API連携
TASK-302で実装したTrainingRecord APIとの完全連携

## 🔧 技術仕様

### 実装する画面・コンポーネント

#### 1. トレーニング記録作成フォーム
**ファイル**: `frontend/src/components/training/TrainingRecordForm.tsx`

**フォーム項目**:
```typescript
interface TrainingRecordFormData {
  training_id: number;
  reps?: number;
  duration?: number;  // 秒
  weight?: number;
  notes?: string;
}
```

**UI要件**:
- トレーニング選択（ドロップダウン）
- 回数入力（数値）
- 実施時間入力（分:秒形式）
- 重量入力（kg、小数点対応）
- メモ入力（テキストエリア）
- 送信ボタン
- バリデーションメッセージ表示

#### 2. トレーニング記録一覧
**ファイル**: `frontend/src/components/training/TrainingRecordList.tsx`

**表示項目**:
- 実施日時
- トレーニング名
- 回数・時間・重量
- 獲得ポイント
- メモ（省略表示）

**機能要件**:
- ページネーション
- フィルタリング（トレーニング別、期間別）
- ソート（日付順）
- レスポンシブ対応

#### 3. メインページ
**ファイル**: `frontend/src/pages/TrainingRecords.tsx`

**レイアウト**:
- ヘッダー（タイトル、統計サマリー）
- 記録作成フォーム（折りたたみ可能）
- 記録一覧表示
- フィルタ・検索バー

#### 4. カスタムフック
**ファイル**: `frontend/src/hooks/useTrainingRecords.ts`

**機能**:
```typescript
export const useTrainingRecords = () => {
  // 記録一覧取得
  const { records, loading, error, refetch } = useRecords();

  // 記録作成
  const createRecord = async (data: TrainingRecordFormData) => {};

  // フィルタリング
  const filterRecords = (filters: FilterOptions) => {};

  return { records, loading, error, createRecord, filterRecords, refetch };
};
```

### API連携仕様

#### 使用するエンドポイント
```typescript
// 記録作成
POST /api/v1/training_records
{
  "training_record": {
    "training_id": 1,
    "reps": 20,
    "duration": 300,
    "weight": 10.5,
    "notes": "調子が良かった"
  }
}

// 記録一覧取得
GET /api/v1/training_records?page=1&per_page=20&training_id=1
```

### デザイン・UX仕様

#### デザインシステム
- **フレームワーク**: TailwindCSS
- **コンポーネント**: 既存の管理画面と統一
- **カラー**: 一貫性のあるブランドカラー
- **アイコン**: Heroicons使用

#### レスポンシブ対応
```css
/* モバイル */
sm: 640px
- フォームを縦並びレイアウト
- 一覧はカード型表示

/* タブレット */
md: 768px
- フォームを横2列レイアウト
- 一覧はテーブル表示

/* デスクトップ */
lg: 1024px
- フルレイアウト
- サイドバー形式も検討
```

#### UXフロー
1. **記録作成フロー**
   ```
   トレーニング選択 → 数値入力 → メモ入力 → 確認 → 送信 → 成功通知
   ```

2. **一覧表示フロー**
   ```
   ページ読み込み → 記録一覧取得 → 表示 → フィルタ/ページ切り替え
   ```

## 🧪 実装方針

### Phase 1: カスタムフック実装（30分）
1. `useTrainingRecords.ts` 作成
2. API通信ロジック実装
3. 状態管理（loading, error等）

### Phase 2: フォームコンポーネント（45分）
1. `TrainingRecordForm.tsx` 作成
2. フォーム状態管理（React Hook Form）
3. バリデーション実装
4. API連携

### Phase 3: 一覧コンポーネント（30分）
1. `TrainingRecordList.tsx` 作成
2. 記録表示ロジック
3. ページネーション
4. フィルタリング

### Phase 4: メインページと動作確認（15分）
1. `TrainingRecords.tsx` 作成
2. ルーティング設定
3. 全体動作確認

## ✅ 完了条件

### 機能要件
- [ ] 記録作成フォーム動作（全フィールド対応）
- [ ] 記録一覧表示（ページネーション対応）
- [ ] API連携正常動作
- [ ] バリデーション適切動作
- [ ] レスポンシブ対応

### 品質要件
- [ ] TypeScript型安全性
- [ ] エラーハンドリング実装
- [ ] ローディング状態表示
- [ ] ユーザビリティ良好

### 技術要件
- [ ] 既存コンポーネント再利用
- [ ] TailwindCSSスタイル統一
- [ ] React Hook Form活用
- [ ] カスタムフック抽象化

## 🚨 注意事項

### 既存システムとの整合性
- 管理画面のデザイン統一
- 認証システムとの連携
- エラーメッセージの一貫性

### パフォーマンス考慮
- 大量データでのレンダリング最適化
- API呼び出し頻度制御
- 状態更新の最適化

### セキュリティ
- XSS対策（入力サニタイズ）
- CSRF保護（既存システム準拠）
- JWT認証確認

## 🔄 テストシナリオ

### 手動テスト項目
1. **記録作成テスト**
   - 全フィールド入力 → 成功
   - 必須フィールドのみ → 成功
   - 無効値入力 → エラー表示
   - 未認証状態 → リダイレクト

2. **一覧表示テスト**
   - 記録0件 → 空状態表示
   - 記録複数件 → 正常表示
   - ページネーション → 正常動作
   - フィルタリング → 正常動作

3. **レスポンシブテスト**
   - モバイル表示 → レイアウト適応
   - タブレット表示 → レイアウト適応
   - デスクトップ表示 → フルレイアウト

## 📁 実装ファイル構成

```
frontend/src/
├── components/training/
│   ├── TrainingRecordForm.tsx      🆕 記録作成フォーム
│   ├── TrainingRecordList.tsx      🆕 記録一覧表示
│   └── TrainingRecordCard.tsx      🆕 個別記録カード
├── pages/
│   └── TrainingRecords.tsx         🆕 メインページ
├── hooks/
│   └── useTrainingRecords.ts       🆕 カスタムフック
├── types/
│   └── training.ts                 🔄 型定義更新
└── services/
    └── trainingRecordApi.ts        🆕 API通信
```

---

**作成日**: 2025-11-26
**作成者**: Claude
**前提タスク**: TASK-302完了（TrainingRecord API実装）
**次タスク**: TASK-304（ダッシュボード統計表示）