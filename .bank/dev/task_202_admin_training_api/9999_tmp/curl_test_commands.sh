#!/bin/bash
# 管理者用Training API cURLテスト

echo "=== 管理者用Training API cURLテスト ==="

# 1. 管理者ログインしてJWT取得
echo -e "\n1. 管理者ログイン"
ADMIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/auth/sign_in \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "email": "admin@example.com",
      "password": "password123"
    }
  }')

echo "管理者ログイン結果: $ADMIN_RESPONSE"

# JWTトークン抽出
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "管理者JWT: $ADMIN_TOKEN"

# 2. 一般ユーザーログインしてJWT取得
echo -e "\n2. 一般ユーザーログイン"
USER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/auth/sign_in \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "email": "user@example.com",
      "password": "password123"
    }
  }')

USER_TOKEN=$(echo $USER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "一般ユーザーJWT: $USER_TOKEN"

# 3. 管理者でTraining一覧取得
echo -e "\n3. 管理者でTraining一覧取得"
curl -s -X GET http://localhost:3001/api/v1/admin/trainings \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq '.[0] | {id, name, difficulty, published}'

# 4. 一般ユーザーでTraining一覧アクセス（403エラー期待）
echo -e "\n4. 一般ユーザーでTraining一覧アクセス（403エラー期待）"
curl -s -X GET http://localhost:3001/api/v1/admin/trainings \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"

# 5. 管理者でTraining作成
echo -e "\n5. 管理者でTraining作成"
curl -s -X POST http://localhost:3001/api/v1/admin/trainings \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "training": {
      "name": "API作成テストスクワット",
      "description": "cURLで作成されたテストトレーニングです",
      "duration": 45,
      "base_points": 8,
      "difficulty": "intermediate",
      "published": true
    }
  }' | jq '{id, name, difficulty, published}'

echo -e "\n=== cURLテスト完了 ==="