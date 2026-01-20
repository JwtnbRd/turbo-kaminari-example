#!/bin/bash

echo "=== TASK-302 TrainingRecord API 動作テスト ==="
echo

# 環境設定
BASE_URL="http://localhost:3001/api/v1"
echo "Base URL: $BASE_URL"
echo

# Step 1: ユーザーログイン（JWT取得）
echo "Step 1: ユーザーログイン"
echo "curl -X POST $BASE_URL/auth/sign_in \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"user\":{\"email\":\"test@example.com\",\"password\":\"password123\"}}'"
echo

# JWT_TOKENはレスポンスから手動でコピーしてください
echo "⚠️ 上記コマンドのレスポンスからJWTトークンをコピーして、以下のJWT_TOKEN変数に設定してください"
echo "JWT_TOKEN=\"[ここにJWTトークンを貼り付け]\""
echo

# Step 2: トレーニング記録作成
echo "Step 2: トレーニング記録作成"
echo "curl -X POST $BASE_URL/training_records \\"
echo "  -H 'Authorization: Bearer \$JWT_TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"training_record\":{\"training_id\":1,\"reps\":20,\"duration\":300,\"weight\":10.5,\"notes\":\"調子が良かった\"}}'"
echo

# Step 3: トレーニング記録一覧取得
echo "Step 3: トレーニング記録一覧取得"
echo "curl -X GET $BASE_URL/training_records \\"
echo "  -H 'Authorization: Bearer \$JWT_TOKEN' \\"
echo "  -H 'Content-Type: application/json'"
echo

# Step 4: フィルタ付き一覧取得
echo "Step 4: フィルタ付き一覧取得（training_id=1）"
echo "curl -X GET '$BASE_URL/training_records?training_id=1&page=1&per_page=10' \\"
echo "  -H 'Authorization: Bearer \$JWT_TOKEN' \\"
echo "  -H 'Content-Type: application/json'"
echo

# Step 5: 管理者でログイン（比較用）
echo "Step 5: 管理者ログイン"
echo "curl -X POST $BASE_URL/auth/sign_in \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"user\":{\"email\":\"admin@example.com\",\"password\":\"password123\"}}'"
echo

echo "=== 実行手順 ==="
echo "1. 上記のStep 1を実行してJWTトークンを取得"
echo "2. JWT_TOKEN変数に設定"
echo "3. Step 2〜4を順次実行"
echo "4. 各レスポンスでJSON形式のデータが返却されることを確認"
echo

echo "=== 期待される動作 ==="
echo "✅ Step 2: 201 Created + 作成された記録のJSON"
echo "✅ Step 3: 200 OK + 記録一覧のJSON（data/metaプロパティ）"
echo "✅ Step 4: 200 OK + フィルタされた記録一覧"
echo "❌ 未認証: 401 Unauthorized"