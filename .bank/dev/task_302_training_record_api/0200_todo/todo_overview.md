# TASK-302 TODO概要（簡素化版）

## 🚀 実装方針
**テストコードなし**で迅速に実装を進める。動作確認は手動テスト（cURL）で実施。

## ⏰ 推定時間
- **総予定時間**: 1.5時間（テストコード省略により半減）
- **Phase1**: 45分（モデル詳細化）
- **Phase2**: 45分（API実装・動作確認）

## 📋 実装TODO

### Phase 1: モデル詳細化（45分）
- [ ] 1-1: 現在のTrainingRecordモデル確認
- [ ] 1-2: バリデーション追加
- [ ] 1-3: Scope追加（recent, by_date等）
- [ ] 1-4: インスタンスメソッド追加（calculate_points等）

### Phase 2: API実装（45分）
- [ ] 2-1: TrainingRecordsController作成
- [ ] 2-2: create/indexアクション実装
- [ ] 2-3: ルーティング設定
- [ ] 2-4: cURLによる動作確認

## 🎯 最小完了条件
1. **POST /api/v1/training_records** - 記録作成API動作
2. **GET /api/v1/training_records** - 一覧取得API動作
3. **統計更新** - UserStat自動更新（簡素版）
4. **手動確認** - cURLで全機能動作確認

## 📝 動作確認項目

### API確認用cURLコマンド
```bash
# 1. ユーザーログイン（JWT取得）
curl -X POST http://localhost:3001/api/v1/auth/sign_in \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"test@example.com","password":"password123"}}'

# 2. 記録作成
curl -X POST http://localhost:3001/api/v1/training_records \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"training_record":{"training_id":1,"reps":20,"duration":300}}'

# 3. 記録一覧取得
curl -X GET http://localhost:3001/api/v1/training_records \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -H "Content-Type: application/json"
```

---

**次のアクション**: Phase 1から開始