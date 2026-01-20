# API設計書

## API概要

### 設計方針
- **RESTful API設計** (DHH流)
- **JSON形式**でのデータ交換
- **セッションベース認証** (Devise Cookie)
- **CORS設定**によるSPA連携
- **バージョニング** (`/api/v1/`)

### 基本仕様
- **Base URL**: `http://localhost:3001/api/v1`
- **Content-Type**: `application/json`
- **認証方式**: Cookie Session (withCredentials: true)
- **文字エンコーディング**: UTF-8

## 認証API

### POST /api/v1/auth/sign_in
ユーザーログイン

**Request:**
```json
{
  "user": {
    "email": "user@example.com",
    "password": "password123"
  }
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe",
    "role": "user",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Invalid email or password."
}
```

### POST /api/v1/auth
ユーザー登録

**Request:**
```json
{
  "user": {
    "username": "john_doe",
    "email": "user@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe",
    "role": "user",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

**Response (422 Unprocessable Entity):**
```json
{
  "errors": [
    "Email has already been taken",
    "Password confirmation doesn't match Password"
  ]
}
```

### DELETE /api/v1/auth/sign_out
ログアウト

**Request:** Body不要

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

### GET /api/v1/current_user
現在のユーザー情報取得

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "john_doe",
  "role": "user",
  "created_at": "2025-01-01T00:00:00.000Z"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

## トレーニングAPI

### GET /api/v1/trainings
トレーニング一覧取得（一般ユーザー用・公開済みのみ）

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "腕立て伏せ",
    "description": "胸筋と腕力を鍛える基本的なトレーニング",
    "duration": 60,
    "base_points": 10,
    "difficulty": "beginner"
  },
  {
    "id": 2,
    "name": "スクワット",
    "description": "下半身を強化するトレーニング",
    "duration": 90,
    "base_points": 15,
    "difficulty": "intermediate"
  }
]
```

### GET /api/v1/trainings/:id
特定トレーニング詳細取得

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "腕立て伏せ",
  "description": "胸筋と腕力を鍛える基本的なトレーニング。正しいフォームで実施してください。",
  "duration": 60,
  "base_points": 10,
  "difficulty": "beginner"
}
```

## 管理者用トレーニングAPI

### GET /api/v1/admin/trainings
トレーニング管理一覧（管理者のみ）

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "腕立て伏せ",
    "description": "胸筋と腕力を鍛える",
    "duration": 60,
    "base_points": 10,
    "difficulty": "beginner",
    "published": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
]
```

### POST /api/v1/admin/trainings
トレーニング作成（管理者のみ）

**Request:**
```json
{
  "training": {
    "name": "プランク",
    "description": "体幹を鍛えるトレーニング",
    "duration": 30,
    "base_points": 8,
    "difficulty": "beginner",
    "published": true
  }
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "name": "プランク",
  "description": "体幹を鍛えるトレーニング",
  "duration": 30,
  "base_points": 8,
  "difficulty": "beginner",
  "published": true,
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-01-01T00:00:00.000Z"
}
```

**Response (422 Unprocessable Entity):**
```json
{
  "errors": [
    "Name can't be blank",
    "Duration must be greater than 0"
  ]
}
```

### PUT /api/v1/admin/trainings/:id
トレーニング更新（管理者のみ）

**Request:**
```json
{
  "training": {
    "name": "プランク（改良版）",
    "base_points": 12
  }
}
```

**Response (200 OK):**
```json
{
  "id": 3,
  "name": "プランク（改良版）",
  "description": "体幹を鍛えるトレーニング",
  "duration": 30,
  "base_points": 12,
  "difficulty": "beginner",
  "published": true,
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-01-01T12:00:00.000Z"
}
```

## トレーニング記録API

### GET /api/v1/training_records
ユーザーの記録一覧

**Query Parameters:**
- `page`: ページ番号 (optional, default: 1)
- `per_page`: 1ページあたりの件数 (optional, default: 20)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "training": {
        "id": 1,
        "name": "腕立て伏せ",
        "duration": 60
      },
      "points_earned": 10,
      "completed_at": "2025-01-15T09:00:00.000Z",
      "created_at": "2025-01-15T09:01:00.000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 3,
    "total_count": 45,
    "per_page": 20
  }
}
```

### POST /api/v1/training_records
トレーニング記録作成

**Request:**
```json
{
  "training_record": {
    "training_id": 1
  }
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "training": {
    "id": 1,
    "name": "腕立て伏せ",
    "duration": 60,
    "base_points": 10
  },
  "points_earned": 10,
  "completed_at": "2025-01-15T09:00:00.000Z",
  "created_at": "2025-01-15T09:00:00.000Z"
}
```

**Response (422 Unprocessable Entity):**
```json
{
  "errors": [
    "Training must exist"
  ]
}
```

## 統計・ダッシュボードAPI

### GET /api/v1/user_stat
現在のユーザー統計

**Response (200 OK):**
```json
{
  "total_points": 150,
  "current_streak": 5,
  "longest_streak": 12,
  "total_training_count": 23,
  "last_training_date": "2025-01-15"
}
```

## カレンダーAPI

### GET /api/v1/calendar_days
月次カレンダーデータ

**Query Parameters:**
- `year`: 年 (required)
- `month`: 月 (required)

**Example:** `/api/v1/calendar_days?year=2025&month=1`

**Response (200 OK):**
```json
{
  "year": 2025,
  "month": 1,
  "days": [
    {
      "date": "2025-01-01",
      "total_points": 15,
      "training_count": 2
    },
    {
      "date": "2025-01-03",
      "total_points": 10,
      "training_count": 1
    }
  ]
}
```

### GET /api/v1/calendar_days/:date
特定日の詳細記録

**Example:** `/api/v1/calendar_days/2025-01-15`

**Response (200 OK):**
```json
{
  "date": "2025-01-15",
  "records": [
    {
      "id": 1,
      "training": {
        "name": "腕立て伏せ"
      },
      "points_earned": 10,
      "completed_at": "2025-01-15T09:00:00.000Z"
    },
    {
      "id": 2,
      "training": {
        "name": "スクワット"
      },
      "points_earned": 15,
      "completed_at": "2025-01-15T19:00:00.000Z"
    }
  ],
  "total_points": 25,
  "training_count": 2
}
```

## ランキングAPI

### GET /api/v1/point_rankings
ポイントランキング

**Query Parameters:**
- `period`: ランキング期間 (optional, values: `all`, `week`, `month`, default: `all`)

**Response (200 OK):**
```json
{
  "period": "all",
  "rankings": [
    {
      "rank": 1,
      "user_id": 2,
      "username": "alice_smith",
      "points": 450,
      "is_current_user": false
    },
    {
      "rank": 2,
      "user_id": 1,
      "username": "john_doe",
      "points": 380,
      "is_current_user": true
    }
  ],
  "current_user_rank": 2
}
```

### GET /api/v1/streak_rankings
連続日数ランキング

**Response (200 OK):**
```json
{
  "rankings": [
    {
      "rank": 1,
      "user_id": 3,
      "username": "bob_wilson",
      "current_streak": 15,
      "longest_streak": 20,
      "is_current_user": false
    },
    {
      "rank": 2,
      "user_id": 1,
      "username": "john_doe",
      "current_streak": 5,
      "longest_streak": 12,
      "is_current_user": true
    }
  ],
  "current_user_rank": 2
}
```

## エラーレスポンス

### 共通エラー形式

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden"
}
```

**404 Not Found:**
```json
{
  "error": "Record not found"
}
```

**422 Unprocessable Entity:**
```json
{
  "errors": [
    "Name can't be blank",
    "Email has already been taken"
  ]
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error"
}
```

## CORS設定

### Development環境
```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:3000'
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

### Production環境
```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV['FRONTEND_URL'] || 'https://your-app.vercel.app'
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

## レート制限（将来的）

現在のMVPでは実装しないが、将来的には以下を検討：

```ruby
# Gemfile
gem 'rack-attack'

# config/initializers/rack_attack.rb
Rack::Attack.throttle('requests by ip', limit: 300, period: 5.minutes) do |request|
  request.ip
end

Rack::Attack.throttle('logins per ip', limit: 5, period: 20.seconds) do |request|
  if request.path == '/api/v1/auth/sign_in' && request.post?
    request.ip
  end
end
```

## API仕様書生成

### OpenAPI/Swagger連携（将来的）
```ruby
# Gemfile
gem 'rswag'

# 自動生成されるSwagger UI
# GET /api-docs
```

## パフォーマンス最適化

### 1. N+1クエリ対策
```ruby
# training_records_controller.rb
def index
  @records = current_user.training_records
                         .includes(:training)  # N+1回避
                         .order(completed_at: :desc)
                         .page(params[:page])
end
```

### 2. JSONシリアライゼーション最適化
```ruby
# Active Model Serializers使用
class TrainingRecordSerializer < ActiveModel::Serializer
  attributes :id, :points_earned, :completed_at
  belongs_to :training, serializer: TrainingSerializer
end
```

### 3. キャッシュ戦略
```ruby
# ランキングデータのメモリキャッシュ（5分間）
def get_point_ranking(period)
  Rails.cache.fetch("ranking:#{period}:#{Time.current.beginning_of_hour}", expires_in: 5.minutes) do
    calculate_ranking(period)
  end
end
```

## セキュリティ考慮事項

### 1. Strong Parameters
```ruby
def training_params
  params.require(:training).permit(:name, :description, :duration, :base_points, :difficulty, :published)
end
```

### 2. 権限チェック
```ruby
class Api::V1::Admin::BaseController < Api::V1::BaseController
  before_action :ensure_admin!

  private

  def ensure_admin!
    render json: { error: 'Forbidden' }, status: :forbidden unless current_user&.admin?
  end
end
```

### 3. CSRF保護
```ruby
# application_controller.rb
protect_from_forgery with: :null_session
```

このAPI設計により、フロントエンドとの効率的な連携と、将来的な機能拡張に対応した堅牢なAPIアーキテクチャを実現します。