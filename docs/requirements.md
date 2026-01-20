# トレーニング記録Webアプリケーション 詳細要件定義書 v2.1

## 1. プロジェクト概要

### 1.1 目的
ユーザーが日々のトレーニングを記録し、継続的な運動習慣を促進するWebアプリケーション

### 1.2 主要な変更点
- トレーニングマスタデータを管理画面から設定可能に変更
- .devcontainer + Docker-in-Docker構成での開発環境構築
- DHH流RESTfulルーティングの厳守
- Devise認証システムの採用

---

## 2. 開発環境構成

### 2.1 プロジェクトディレクトリ構成

```
training-app/
├── .devcontainer/
│   ├── devcontainer.json
│   └── docker-compose.yml
├── README.md                      # プロジェクト全体の説明
├── CLAUDE.md                      # Claude Code向けの開発ガイド
├── docker-compose.yml             # 本番用docker-compose（オプション）
├── docs/
│   ├── requirements.md            # この要件定義書
│   ├── api-spec.md               # API仕様書
│   └── deployment.md             # デプロイ手順
├── scripts/
│   ├── dev-start.sh              # 開発環境起動スクリプト
│   ├── dev-stop.sh               # 開発環境停止スクリプト
│   ├── container-backend.sh      # バックエンドコンテナ操作
│   ├── container-frontend.sh     # フロントエンドコンテナ操作
│   └── container-manage.sh       # コンテナ管理スクリプト
├── backend/
│   ├── Dockerfile
│   ├── Gemfile
│   ├── Gemfile.lock
│   ├── README.md
│   ├── Rakefile
│   ├── config.ru
│   ├── app/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── serializers/
│   │   ├── jobs/
│   │   └── mailers/
│   ├── bin/
│   ├── config/
│   │   ├── initializers/
│   │   ├── environments/
│   │   ├── database.yml
│   │   ├── routes.rb
│   │   └── storage.yml
│   ├── db/
│   │   ├── migrate/
│   │   ├── seeds.rb
│   │   └── schema.rb
│   ├── lib/
│   ├── log/
│   ├── public/
│   ├── storage/
│   ├── test/                     # または spec/ (RSpec使用時)
│   ├── tmp/
│   └── vendor/
└── frontend/
    ├── Dockerfile
    ├── README.md
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── eslint.config.mjs
    ├── postcss.config.mjs
    ├── tailwind.config.js
    ├── index.html
    ├── public/
    │   └── images/
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── components/
        ├── pages/
        ├── hooks/
        ├── services/
        ├── contexts/
        ├── types/
        ├── utils/
        └── styles/
```

**構成の特徴:**
- ルートに開発用スクリプトを配置（実運用での経験を反映）
- docsディレクトリで仕様書を一元管理
- .devcontainerで開発環境を統一
- backend/frontendを明確に分離

### 2.2 開発用スクリプト

実運用を考慮した開発支援スクリプトを用意します。

**scripts/dev-start.sh:**
```bash
#!/bin/bash
# 開発環境を起動

echo "🚀 Starting development environment..."

# Docker Composeで全サービスを起動
docker-compose -f .devcontainer/docker-compose.yml up -d

echo "⏳ Waiting for services to be ready..."
sleep 5

# バックエンドのセットアップ確認
echo "🔧 Checking backend..."
docker-compose -f .devcontainer/docker-compose.yml exec backend rails db:create db:migrate

echo "✅ Development environment is ready!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo "🗄️  Database: localhost:5432"
```

**scripts/dev-stop.sh:**
```bash
#!/bin/bash
# 開発環境を停止

echo "🛑 Stopping development environment..."
docker-compose -f .devcontainer/docker-compose.yml down

echo "✅ Development environment stopped."
```

**scripts/container-backend.sh:**
```bash
#!/bin/bash
# バックエンドコンテナ操作スクリプト

COMMAND=$1

case $COMMAND in
  "shell")
    docker-compose -f .devcontainer/docker-compose.yml exec backend bash
    ;;
  "console")
    docker-compose -f .devcontainer/docker-compose.yml exec backend rails console
    ;;
  "migrate")
    docker-compose -f .devcontainer/docker-compose.yml exec backend rails db:migrate
    ;;
  "seed")
    docker-compose -f .devcontainer/docker-compose.yml exec backend rails db:seed
    ;;
  "logs")
    docker-compose -f .devcontainer/docker-compose.yml logs -f backend
    ;;
  "test")
    docker-compose -f .devcontainer/docker-compose.yml exec backend bundle exec rspec
    ;;
  *)
    echo "Usage: ./container-backend.sh {shell|console|migrate|seed|logs|test}"
    exit 1
    ;;
esac
```

**scripts/container-frontend.sh:**
```bash
#!/bin/bash
# フロントエンドコンテナ操作スクリプト

COMMAND=$1

case $COMMAND in
  "shell")
    docker-compose -f .devcontainer/docker-compose.yml exec frontend sh
    ;;
  "install")
    docker-compose -f .devcontainer/docker-compose.yml exec frontend npm install
    ;;
  "logs")
    docker-compose -f .devcontainer/docker-compose.yml logs -f frontend
    ;;
  "build")
    docker-compose -f .devcontainer/docker-compose.yml exec frontend npm run build
    ;;
  "test")
    docker-compose -f .devcontainer/docker-compose.yml exec frontend npm test
    ;;
  *)
    echo "Usage: ./container-frontend.sh {shell|install|logs|build|test}"
    exit 1
    ;;
esac
```

**scripts/container-manage.sh:**
```bash
#!/bin/bash
# コンテナ管理スクリプト

COMMAND=$1

case $COMMAND in
  "ps")
    docker-compose -f .devcontainer/docker-compose.yml ps
    ;;
  "restart")
    docker-compose -f .devcontainer/docker-compose.yml restart
    ;;
  "rebuild")
    echo "🔨 Rebuilding containers..."
    docker-compose -f .devcontainer/docker-compose.yml down
    docker-compose -f .devcontainer/docker-compose.yml build --no-cache
    docker-compose -f .devcontainer/docker-compose.yml up -d
    ;;
  "clean")
    echo "🧹 Cleaning up..."
    docker-compose -f .devcontainer/docker-compose.yml down -v
    docker system prune -f
    ;;
  *)
    echo "Usage: ./container-manage.sh {ps|restart|rebuild|clean}"
    exit 1
    ;;
esac
```

**使い方:**
```bash
# 開発環境の起動
./scripts/dev-start.sh

# バックエンドのRailsコンソールに入る
./scripts/container-backend.sh console

# フロントエンドのシェルに入る
./scripts/container-frontend.sh shell

# コンテナの状態確認
./scripts/container-manage.sh ps

# 開発環境の停止
./scripts/dev-stop.sh
```

### 2.3 .devcontainer構成

**.devcontainer/devcontainer.json:**
```json
{
  "name": "Training App Development",
  "dockerComposeFile": "docker-compose.yml",
  "service": "backend",
  "workspaceFolder": "/workspace",
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "rebornix.ruby",
        "castwide.solargraph",
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint",
        "bradlc.vscode-tailwindcss",
        "ms-azuretools.vscode-docker"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "[ruby]": {
          "editor.defaultFormatter": "rebornix.ruby"
        }
      }
    }
  },
  "forwardPorts": [3000, 3001, 5432],
  "postCreateCommand": "cd /workspace/backend && bundle install && cd /workspace/frontend && npm install"
}
```

**設定のポイント:**
- Docker-in-Docker機能を有効化
- docker-compose.ymlを使用してフロントエンドとバックエンドを同時起動
- ポートフォワーディング: フロント(3000), Rails(3001), PostgreSQL(5432)
- VSCode拡張機能を自動インストール
- コンテナ作成後に依存関係を自動インストール

**.devcontainer/docker-compose.yml:**
```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
    environment:
      - NODE_ENV=development
    command: npm run dev
    
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    volumes:
      - ./backend:/app
    depends_on:
      - db
    environment:
      - RAILS_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/training_app_development
    command: bundle exec rails server -b 0.0.0.0 -p 3001
    
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: training_app_development
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 2.4 技術スタック

**フロントエンド:**
- React 18.x（**Next.jsは使用しない - Viteで十分**）
- TypeScript
- Vite（ビルドツール - 高速な開発体験）
- TailwindCSS（UIスタイリング）
- React Router v6（ルーティング）
- Axios（API通信）
- Zustand または React Context（状態管理）
- Lucide React（アイコン）

**フロントエンドの選択理由:**
- Next.jsは不要: このアプリはSSRやSSGが必須ではない
- Viteで十分: 高速な開発サーバー、HMR、シンプルな設定
- 学習コスト削減: Reactの基本に集中できる
- ビルドが速い: 本番ビルドも高速

**バックエンド:**
- Ruby on Rails 7.1+（API mode）
- PostgreSQL 15
- Devise（認証）
- Cloudinary（画像アップロード - Vercel/Render環境）
- rack-cors（CORS対応）

**必須Gem:**
```ruby
# Gemfile
gem 'devise'
gem 'rack-cors'
gem 'active_model_serializers' # または jbuilder
gem 'cloudinary' # 画像アップロード
gem 'kaminari' # ページネーション
```

**画像ストレージ:**
- 開発環境: ローカルディスク
- Vercel/Render環境: **Cloudinary（無料枠25GB）**
- AWS環境: S3（将来的に移行する場合）

---

## 3. 機能要件

### 3.1 認証機能（Devise）

#### 3.1.1 Devise設定

**導入手順:**
```bash
# Devise インストール
bundle add devise
rails generate devise:install

# User モデル生成
rails generate devise User

# 管理者権限追加のマイグレーション
rails generate migration AddRoleToUsers role:integer
```

**config/initializers/devise.rb 主要設定:**
```ruby
Devise.setup do |config|
  # セッションストア（APIモードではトークンベース認証を検討）
  config.skip_session_storage = [:http_auth, :params_auth]
  
  # パスワード要件
  config.password_length = 6..128
  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/
  
  # トークン認証（オプション）
  config.token_authentication_key = :auth_token
end
```

#### 3.1.2 認証フロー

**SPAとの統合方法（推奨）:**
1. **セッションベース認証（簡単）**
   - Deviseのデフォルト設定を使用
   - Cookie-based sessions
   - CORS設定でcredentials有効化

2. **トークンベース認証（より柔軟）**
   - devise-api または devise_token_auth gem使用を検討
   - または手動でトークン管理

**本プロジェクトでは セッションベース を推奨:**
- 設定が簡単
- Deviseの機能をフル活用
- React側でAxiosの`withCredentials: true`設定

#### 3.1.3 ユーザー管理機能
- ユーザー登録（Devise Registration）
- ログイン/ログアウト（Devise Session）
- パスワードリセット（Devise Recoverable）
- メール確認（Devise Confirmable - オプション）
- プロフィール表示/編集

### 3.2 管理機能

#### 3.2.1 管理者権限
- `User`モデルに`role`カラム（enum）
  - `0: user`（一般ユーザー）
  - `1: admin`（管理者）
- 管理画面へのアクセス制御

#### 3.2.2 トレーニングマスタ管理画面
**機能:**
- トレーニング一覧表示
- トレーニングの新規作成
- トレーニングの編集
- トレーニングの削除（ソフトデリート推奨）
- トレーニングの並び順変更

**管理項目:**
- トレーニング名（必須）
- 説明文（必須）
- 実施時間（秒）（必須）
- 基本獲得ポイント（必須）
- 難易度（初級/中級/上級）（必須）
- 画像/アイコン（任意）
- 公開/非公開ステータス
- 表示順序
- 作成日時/更新日時

**画面構成:**
- 一覧画面（テーブル形式、検索・フィルタ機能付き）
- 新規作成画面（フォーム）
- 編集画面（フォーム）
- 削除確認ダイアログ

### 3.3 ユーザー機能

#### 3.3.1 トレーニング実行機能
- 公開中のトレーニング一覧表示
- トレーニング実行（カウントダウン）
- トレーニング完了記録

#### 3.3.2 記録・統計機能
- カレンダー表示（月次）
- 日別詳細表示
- 統計データ表示

#### 3.3.3 ランキング機能
- ポイントランキング
- 連続日数ランキング

---

## 4. データモデル設計

### 4.1 テーブル設計

#### Usersテーブル（Devise標準 + 拡張）
```ruby
# rails generate devise User 実行後に追加マイグレーション
create_table :users do |t|
  ## Database authenticatable (Devise標準)
  t.string :email,              null: false, default: ""
  t.string :encrypted_password, null: false, default: ""

  ## Recoverable (Devise標準)
  t.string   :reset_password_token
  t.datetime :reset_password_sent_at

  ## Rememberable (Devise標準)
  t.datetime :remember_created_at

  ## Trackable (オプション)
  # t.integer  :sign_in_count, default: 0, null: false
  # t.datetime :current_sign_in_at
  # t.datetime :last_sign_in_at
  # t.string   :current_sign_in_ip
  # t.string   :last_sign_in_ip

  ## Confirmable (オプション)
  # t.string   :confirmation_token
  # t.datetime :confirmed_at
  # t.datetime :confirmation_sent_at
  # t.string   :unconfirmed_email

  ## 追加フィールド
  t.string :username, null: false
  t.integer :role, default: 0, null: false # 0: user, 1: admin

  t.timestamps null: false
  
  t.index :email, unique: true
  t.index :reset_password_token, unique: true
  t.index :username
  # t.index :confirmation_token, unique: true
end
```

**app/models/user.rb:**
```ruby
class User < ApplicationRecord
  # Devise modules
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  
  # Enums
  enum role: { user: 0, admin: 1 }
  
  # Associations
  has_many :training_records, dependent: :destroy
  has_one :user_stat, dependent: :destroy
  
  # Validations
  validates :username, presence: true, uniqueness: true, length: { minimum: 3, maximum: 20 }
  
  # Callbacks
  after_create :create_user_stat
  
  # Instance methods
  def admin?
    role == 'admin'
  end
end
```

#### Trainingsテーブル
```ruby
create_table :trainings do |t|
  t.string :name, null: false
  t.text :description, null: false
  t.integer :duration, null: false # 秒単位
  t.integer :base_points, null: false
  t.integer :difficulty, default: 0, null: false # 0: beginner, 1: intermediate, 2: advanced
  t.integer :display_order, default: 0, null: false
  t.boolean :published, default: true, null: false
  t.datetime :deleted_at # ソフトデリート用
  t.timestamps
  
  t.index :published
  t.index :deleted_at
  t.index :display_order
end
```

**app/models/training.rb:**
```ruby
class Training < ApplicationRecord
  # Enums
  enum difficulty: { beginner: 0, intermediate: 1, advanced: 2 }
  
  # Active Storage
  has_one_attached :image
  
  # Associations
  has_many :training_records, dependent: :restrict_with_error
  
  # Scopes
  scope :published, -> { where(published: true, deleted_at: nil) }
  scope :with_deleted, -> { unscope(where: :deleted_at) }
  default_scope { where(deleted_at: nil).order(:display_order) }
  
  # Validations
  validates :name, presence: true, length: { maximum: 50 }
  validates :description, presence: true, length: { maximum: 500 }
  validates :duration, presence: true, numericality: { greater_than: 0 }
  validates :base_points, presence: true, numericality: { greater_than: 0 }
  validates :difficulty, presence: true
  validates :display_order, numericality: { greater_than_or_equal_to: 0 }
  
  # Instance methods
  def soft_delete
    update(deleted_at: Time.current)
  end
  
  def restore
    update(deleted_at: nil)
  end
  
  def image_url
    Rails.application.routes.url_helpers.rails_blob_url(image, only_path: true) if image.attached?
  end
end
```

#### TrainingRecordsテーブル
```ruby
create_table :training_records do |t|
  t.references :user, null: false, foreign_key: true
  t.references :training, null: false, foreign_key: true
  t.integer :points_earned, null: false
  t.datetime :completed_at, null: false
  t.timestamps
  
  t.index [:user_id, :completed_at]
  t.index :completed_at
end
```

**app/models/training_record.rb:**
```ruby
class TrainingRecord < ApplicationRecord
  # Associations
  belongs_to :user
  belongs_to :training
  
  # Validations
  validates :points_earned, presence: true, numericality: { greater_than: 0 }
  validates :completed_at, presence: true
  
  # Callbacks
  after_create :update_user_stats
  
  # Scopes
  scope :today, -> { where(completed_at: Time.current.beginning_of_day..Time.current.end_of_day) }
  scope :this_month, -> { where(completed_at: Time.current.beginning_of_month..Time.current.end_of_month) }
  
  private
  
  def update_user_stats
    UpdateUserStatsJob.perform_later(user.id)
  end
end
```

#### UserStatsテーブル（集計用キャッシュ）
```ruby
create_table :user_stats do |t|
  t.references :user, null: false, foreign_key: true, index: { unique: true }
  t.integer :total_points, default: 0, null: false
  t.integer :current_streak, default: 0, null: false
  t.integer :longest_streak, default: 0, null: false
  t.integer :total_training_count, default: 0, null: false
  t.date :last_training_date
  t.datetime :updated_at, null: false
  
  t.index :total_points
  t.index :current_streak
end
```

**app/models/user_stat.rb:**
```ruby
class UserStat < ApplicationRecord
  # Associations
  belongs_to :user
  
  # Validations
  validates :total_points, numericality: { greater_than_or_equal_to: 0 }
  validates :current_streak, numericality: { greater_than_or_equal_to: 0 }
  validates :longest_streak, numericality: { greater_than_or_equal_to: 0 }
  validates :total_training_count, numericality: { greater_than_or_equal_to: 0 }
  
  # Instance methods
  def recalculate!
    records = user.training_records.order(:completed_at)
    
    self.total_points = records.sum(:points_earned)
    self.total_training_count = records.count
    self.last_training_date = records.last&.completed_at&.to_date
    
    calculate_streaks(records)
    
    save!
  end
  
  private
  
  def calculate_streaks(records)
    return if records.empty?

    dates = records.pluck(:completed_at).map(&:to_date).uniq.sort

    current = 0
    longest = 0
    streak = 1

    dates.each_cons(2) do |prev_date, curr_date|
      # 営業日ベースでの連続性をチェック
      if business_days_between(prev_date, curr_date) == 1
        streak += 1
      else
        longest = [longest, streak].max
        streak = 1
      end
    end

    longest = [longest, streak].max

    # 現在の連続日数を計算（営業日ベース）
    today = Date.today
    yesterday_business = previous_business_day(today)

    if dates.last == today || dates.last == yesterday_business
      current = 1
      (dates.size - 2).downto(0) do |i|
        break if business_days_between(dates[i], dates[i + 1]) != 1
        current += 1
      end
    end

    self.current_streak = current
    self.longest_streak = longest
  end

  private

  def business_days_between(start_date, end_date)
    (start_date...end_date).count do |date|
      date.on_weekday? && !Holidays.on(date, :jp).any?
    end
  end

  def previous_business_day(date)
    date -= 1
    while !date.on_weekday? || Holidays.on(date, :jp).any?
      date -= 1
    end
    date
  end
end
```

---

## 5. RESTfulルーティング設計（DHH流）

### 5.1 基本方針
- `collection`や`member`を使わない
- すべてRails標準の7つのアクション（index, show, new, create, edit, update, destroy）で表現
- 複雑な操作は新しいリソースとして分割

### 5.2 APIルーティング設計

```ruby
# config/routes.rb
Rails.application.routes.draw do
  # Devise routes
  devise_for :users, path: 'api/v1/auth', controllers: {
    sessions: 'api/v1/auth/sessions',
    registrations: 'api/v1/auth/registrations'
  }
  
  namespace :api do
    namespace :v1 do
      # 現在のユーザー情報
      resource :current_user, only: [:show, :update], controller: 'current_user'
      
      # ユーザー情報（他ユーザーの参照用）
      resources :users, only: [:show]
      
      # トレーニングマスタ（一般ユーザー用）
      resources :trainings, only: [:index, :show]
      
      # トレーニング記録
      resources :training_records, only: [:index, :create, :show]
      
      # カレンダーデータ（リソース化）
      resources :calendar_days, only: [:index, :show]
      # GET /api/v1/calendar_days?year=2025&month=11
      # GET /api/v1/calendar_days/:date (e.g., 2025-11-14)
      
      # ランキング（リソース化）
      resources :point_rankings, only: [:index]
      resources :streak_rankings, only: [:index]
      
      # ユーザー統計
      resource :user_stat, only: [:show]
      # GET /api/v1/user_stat
      
      # 管理者用ルーティング
      namespace :admin do
        resources :trainings # 7つのアクション全て
        
        # 並び順変更は別リソース化
        resources :training_positions, only: [:update]
        # PUT /api/v1/admin/training_positions/:id
        # params: { position: 3 }
      end
    end
  end
end
```

### 5.3 コントローラ設計

#### 5.3.1 ベースコントローラ

**app/controllers/api/v1/base_controller.rb:**
```ruby
class Api::V1::BaseController < ApplicationController
  before_action :authenticate_user!
  
  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from ActiveRecord::RecordInvalid, with: :unprocessable_entity
  rescue_from ActionController::ParameterMissing, with: :bad_request
  
  private
  
  def not_found(exception)
    render json: { error: exception.message }, status: :not_found
  end
  
  def unprocessable_entity(exception)
    render json: { errors: exception.record.errors.full_messages }, status: :unprocessable_entity
  end
  
  def bad_request(exception)
    render json: { error: exception.message }, status: :bad_request
  end
end
```

**app/controllers/api/v1/admin/base_controller.rb:**
```ruby
class Api::V1::Admin::BaseController < Api::V1::BaseController
  before_action :ensure_admin!
  
  private
  
  def ensure_admin!
    unless current_user.admin?
      render json: { error: 'Unauthorized' }, status: :forbidden
    end
  end
end
```

#### 5.3.2 認証コントローラ（Devise拡張）

**app/controllers/api/v1/auth/sessions_controller.rb:**
```ruby
class Api::V1::Auth::SessionsController < Devise::SessionsController
  respond_to :json
  
  private
  
  def respond_with(resource, _opts = {})
    render json: {
      user: {
        id: resource.id,
        email: resource.email,
        username: resource.username,
        role: resource.role
      }
    }, status: :ok
  end
  
  def respond_to_on_destroy
    if current_user
      render json: { message: 'Logged out successfully' }, status: :ok
    else
      render json: { error: 'No active session' }, status: :unauthorized
    end
  end
end
```

**app/controllers/api/v1/auth/registrations_controller.rb:**
```ruby
class Api::V1::Auth::RegistrationsController < Devise::RegistrationsController
  respond_to :json
  
  private
  
  def sign_up_params
    params.require(:user).permit(:username, :email, :password, :password_confirmation)
  end
  
  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: {
        user: {
          id: resource.id,
          email: resource.email,
          username: resource.username,
          role: resource.role
        }
      }, status: :created
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
```

#### 5.3.3 トレーニングコントローラ

**app/controllers/api/v1/trainings_controller.rb:**
```ruby
class Api::V1::TrainingsController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: [:index, :show]
  
  def index
    @trainings = Training.published.includes(image_attachment: :blob)
    render json: @trainings, each_serializer: TrainingSerializer
  end
  
  def show
    @training = Training.published.find(params[:id])
    render json: @training, serializer: TrainingSerializer
  end
end
```

**app/controllers/api/v1/training_records_controller.rb:**
```ruby
class Api::V1::TrainingRecordsController < Api::V1::BaseController
  def index
    @records = current_user.training_records
                           .includes(:training)
                           .order(completed_at: :desc)
                           .page(params[:page])
                           .per(20)
    
    render json: @records, each_serializer: TrainingRecordSerializer
  end
  
  def create
    @training = Training.published.find(training_record_params[:training_id])
    
    @record = current_user.training_records.build(
      training: @training,
      points_earned: @training.base_points,
      completed_at: Time.current
    )
    
    if @record.save
      render json: @record, serializer: TrainingRecordSerializer, status: :created
    else
      render json: { errors: @record.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def show
    @record = current_user.training_records.find(params[:id])
    render json: @record, serializer: TrainingRecordSerializer
  end
  
  private
  
  def training_record_params
    params.require(:training_record).permit(:training_id)
  end
end
```

**app/controllers/api/v1/calendar_days_controller.rb:**
```ruby
class Api::V1::CalendarDaysController < Api::V1::BaseController
  def index
    year = params[:year].to_i
    month = params[:month].to_i
    start_date = Date.new(year, month, 1)
    end_date = start_date.end_of_month
    
    @records = current_user.training_records
                           .where(completed_at: start_date.beginning_of_day..end_date.end_of_day)
                           .group("DATE(completed_at)")
                           .select("DATE(completed_at) as date, 
                                    SUM(points_earned) as total_points, 
                                    COUNT(*) as training_count")
    
    calendar_data = @records.map do |record|
      {
        date: record.date,
        total_points: record.total_points,
        training_count: record.training_count
      }
    end
    
    render json: {
      year: year,
      month: month,
      days: calendar_data
    }
  end
  
  def show
    date = Date.parse(params[:id]) # id は 'YYYY-MM-DD' 形式
    
    @records = current_user.training_records
                           .includes(:training)
                           .where(completed_at: date.beginning_of_day..date.end_of_day)
                           .order(:completed_at)
    
    render json: {
      date: date,
      records: @records.map { |r| TrainingRecordSerializer.new(r).as_json },
      total_points: @records.sum(:points_earned),
      training_count: @records.count
    }
  end
end
```

**app/controllers/api/v1/point_rankings_controller.rb:**
```ruby
class Api::V1::PointRankingsController < Api::V1::BaseController
  def index
    period = params[:period] || 'all' # week, month, all
    
    rankings = case period
    when 'week'
      get_weekly_rankings
    when 'month'
      get_monthly_rankings
    else
      get_all_time_rankings
    end
    
    render json: {
      period: period,
      rankings: rankings,
      current_user_rank: find_current_user_rank(rankings)
    }
  end
  
  private
  
  def get_all_time_rankings
    UserStat.includes(:user)
            .order(total_points: :desc)
            .limit(100)
            .map.with_index(1) do |stat, index|
      {
        rank: index,
        user_id: stat.user.id,
        username: stat.user.username,
        points: stat.total_points,
        streak: stat.current_streak,
        is_current_user: stat.user.id == current_user.id
      }
    end
  end
  
  def get_monthly_rankings
    start_date = Time.current.beginning_of_month
    
    User.joins(:training_records)
        .where(training_records: { completed_at: start_date..Time.current })
        .select('users.*, SUM(training_records.points_earned) as month_points')
        .group('users.id')
        .order('month_points DESC')
        .limit(100)
        .map.with_index(1) do |user, index|
      {
        rank: index,
        user_id: user.id,
        username: user.username,
        points: user.month_points.to_i,
        is_current_user: user.id == current_user.id
      }
    end
  end
  
  def get_weekly_rankings
    start_date = Time.current.beginning_of_week
    
    User.joins(:training_records)
        .where(training_records: { completed_at: start_date..Time.current })
        .select('users.*, SUM(training_records.points_earned) as week_points')
        .group('users.id')
        .order('week_points DESC')
        .limit(100)
        .map.with_index(1) do |user, index|
      {
        rank: index,
        user_id: user.id,
        username: user.username,
        points: user.week_points.to_i,
        is_current_user: user.id == current_user.id
      }
    end
  end
  
  def find_current_user_rank(rankings)
    rankings.find { |r| r[:is_current_user] }&.dig(:rank)
  end
end
```

**app/controllers/api/v1/streak_rankings_controller.rb:**
```ruby
class Api::V1::StreakRankingsController < Api::V1::BaseController
  def index
    @rankings = UserStat.includes(:user)
                        .order(current_streak: :desc, longest_streak: :desc)
                        .limit(100)
    
    rankings_data = @rankings.map.with_index(1) do |stat, index|
      {
        rank: index,
        user_id: stat.user.id,
        username: stat.user.username,
        current_streak: stat.current_streak,
        longest_streak: stat.longest_streak,
        is_current_user: stat.user.id == current_user.id
      }
    end
    
    render json: {
      rankings: rankings_data,
      current_user_rank: rankings_data.find { |r| r[:is_current_user] }&.dig(:rank)
    }
  end
end
```

**app/controllers/api/v1/user_stat_controller.rb:**
```ruby
class Api::V1::UserStatController < Api::V1::BaseController
  def show
    @stat = current_user.user_stat || current_user.create_user_stat
    
    render json: {
      total_points: @stat.total_points,
      current_streak: @stat.current_streak,
      longest_streak: @stat.longest_streak,
      total_training_count: @stat.total_training_count,
      last_training_date: @stat.last_training_date
    }
  end
end
```

**app/controllers/api/v1/current_user_controller.rb:**
```ruby
class Api::V1::CurrentUserController < Api::V1::BaseController
  def show
    render json: {
      id: current_user.id,
      email: current_user.email,
      username: current_user.username,
      role: current_user.role,
      created_at: current_user.created_at
    }
  end
  
  def update
    if current_user.update(user_params)
      render json: {
        id: current_user.id,
        email: current_user.email,
        username: current_user.username,
        role: current_user.role
      }
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  private
  
  def user_params
    params.require(:user).permit(:username, :email, :password, :password_confirmation)
  end
end
```

#### 5.3.4 管理画面コントローラ

**app/controllers/api/v1/admin/trainings_controller.rb:**
```ruby
class Api::V1::Admin::TrainingsController < Api::V1::Admin::BaseController
  before_action :set_training, only: [:show, :update, :destroy]
  
  def index
    @trainings = Training.with_deleted.order(:display_order)
    render json: @trainings, each_serializer: Admin::TrainingSerializer
  end
  
  def show
    render json: @training, serializer: Admin::TrainingSerializer
  end
  
  def create
    @training = Training.new(training_params)
    
    if @training.save
      render json: @training, serializer: Admin::TrainingSerializer, status: :created
    else
      render json: { errors: @training.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def update
    if @training.update(training_params)
      render json: @training, serializer: Admin::TrainingSerializer
    else
      render json: { errors: @training.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def destroy
    @training.soft_delete
    head :no_content
  end
  
  private
  
  def set_training
    @training = Training.with_deleted.find(params[:id])
  end
  
  def training_params
    params.require(:training).permit(
      :name, :description, :duration, :base_points, 
      :difficulty, :display_order, :published, :image
    )
  end
end
```

**app/controllers/api/v1/admin/training_positions_controller.rb:**
```ruby
class Api::V1::Admin::TrainingPositionsController < Api::V1::Admin::BaseController
  def update
    @training = Training.find(params[:id])
    new_position = params[:position].to_i
    
    Training.transaction do
      if new_position < @training.display_order
        # 上に移動
        Training.where('display_order >= ? AND display_order < ?', new_position, @training.display_order)
                .update_all('display_order = display_order + 1')
      elsif new_position > @training.display_order
        # 下に移動
        Training.where('display_order > ? AND display_order <= ?', @training.display_order, new_position)
                .update_all('display_order = display_order - 1')
      end
      
      @training.update!(display_order: new_position)
    end
    
    render json: @training, serializer: Admin::TrainingSerializer
  end
end
```

---

## 6. Serializer設計

### 6.1 Active Model Serializers

**app/serializers/training_serializer.rb:**
```ruby
class TrainingSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :duration, :base_points, :difficulty, :display_order, :image_url
  
  def image_url
    object.image_url
  end
end
```

**app/serializers/training_record_serializer.rb:**
```ruby
class TrainingRecordSerializer < ActiveModel::Serializer
  attributes :id, :points_earned, :completed_at
  belongs_to :training
end
```

**app/serializers/admin/training_serializer.rb:**
```ruby
class Admin::TrainingSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :duration, :base_points, :difficulty, 
             :display_order, :published, :deleted_at, :image_url, :created_at, :updated_at
  
  def image_url
    object.image_url
  end
end
```

---

## 7. CORS設定

**config/initializers/cors.rb:**
```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV['FRONTEND_URL'] || 'http://localhost:3000'
    
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      expose: ['Authorization']
  end
end
```

**config/initializers/session_store.rb:**
```ruby
Rails.application.config.session_store :cookie_store, 
  key: '_training_app_session',
  domain: :all,
  same_site: :lax,
  secure: Rails.env.production?
```

---

## 8. フロントエンド実装

### 8.1 ディレクトリ構成

```
frontend/src/
├── components/
│   ├── common/
│   │   ├── Navigation.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ProtectedRoute.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   └── StatsCard.tsx
│   ├── training/
│   │   ├── TrainingSelect.tsx
│   │   ├── TrainingExecution.tsx
│   │   └── TrainingCard.tsx
│   ├── calendar/
│   │   ├── CalendarView.tsx
│   │   └── DayDetail.tsx
│   ├── ranking/
│   │   ├── RankingView.tsx
│   │   └── RankingCard.tsx
│   └── admin/
│       ├── TrainingList.tsx
│       ├── TrainingForm.tsx
│       └── ImageUpload.tsx
├── pages/
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Training.tsx
│   ├── Calendar.tsx
│   ├── Ranking.tsx
│   └── admin/
│       └── TrainingManagement.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useTrainings.ts
│   ├── useRanking.ts
│   └── useTrainingRecords.ts
├── services/
│   ├── api.ts
│   └── auth.ts
├── contexts/
│   └── AuthContext.tsx
├── types/
│   └── index.ts
├── utils/
│   └── helpers.ts
└── App.tsx
```

### 8.2 認証関連の実装

**services/api.ts:**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  withCredentials: true, // 重要: Cookieを送信
  headers: {
    'Content-Type': 'application/json',
  },
});

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 未認証の場合はログインページへ
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**services/auth.ts:**
```typescript
import api from './api';
import { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await api.post('/auth/sign_in', { user: credentials });
    return response.data.user;
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post('/auth', { user: data });
    return response.data.user;
  },

  logout: async (): Promise<void> => {
    await api.delete('/auth/sign_out');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/current_user');
    return response.data;
  },
};
```

**contexts/AuthContext.tsx:**
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const user = await authService.login({ email, password });
    setUser(user);
  };

  const register = async (username: string, email: string, password: string, passwordConfirmation: string) => {
    const user = await authService.register({ username, email, password, password_confirmation: passwordConfirmation });
    setUser(user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**components/common/ProtectedRoute.tsx:**
```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

### 8.3 TypeScript型定義

**types/index.ts:**
```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Training {
  id: number;
  name: string;
  description: string;
  duration: number;
  base_points: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  display_order: number;
  published: boolean;
  image_url?: string;
}

export interface TrainingRecord {
  id: number;
  user_id: number;
  training_id: number;
  training?: Training;
  points_earned: number;
  completed_at: string;
}

export interface UserStats {
  total_points: number;
  current_streak: number;
  longest_streak: number;
  total_training_count: number;
  last_training_date?: string;
}

export interface RankingUser {
  rank: number;
  user_id: number;
  username: string;
  points: number;
  streak?: number;
  current_streak?: number;
  longest_streak?: number;
  is_current_user?: boolean;
}

export interface CalendarDay {
  date: string;
  total_points: number;
  training_count: number;
}
```

---

## 9. デプロイメント戦略

### 9.1 開発環境 vs 本番環境の違い

| 項目 | 開発環境 | 本番環境 |
|------|----------|----------|
| 構成 | .devcontainer + Docker-in-Docker | 独立したサービス |
| フロント | Vite dev server (HMR有効) | 静的ファイルビルド → CDN |
| バック | Rails server (開発モード) | Rails server (本番モード) |
| DB | Docker PostgreSQL | マネージドDB |
| 認証 | Cookie (localhost) | Cookie (secure, same_site) |

### 9.2 Vercel + Render デプロイ構成

#### 9.2.1 フロントエンド（Vercel）

**デプロイ手順:**
1. `frontend/`ディレクトリをGitHubリポジトリにプッシュ
2. Vercelでプロジェクトをインポート
3. ビルド設定:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`
4. 環境変数設定:
   - `VITE_API_URL`: RailsのRender URL（例: `https://training-app-api.onrender.com/api/v1`）

**vite.config.ts設定:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1')
      }
    }
  }
});
```

#### 9.2.2 バックエンド（Render）

**デプロイ手順:**
1. `backend/`ディレクトリをGitHubリポジトリにプッシュ
2. Renderで新しいWeb Serviceを作成
3. ビルド設定:
   - Build Command: `bundle install; rails db:migrate; rails db:seed`
   - Start Command: `bundle exec rails server -b 0.0.0.0 -p $PORT`
   - Root Directory: `backend`
4. PostgreSQLデータベースを作成してリンク
5. 環境変数設定:
   - `RAILS_ENV`: `production`
   - `SECRET_KEY_BASE`: `rails secret`で生成
   - `DATABASE_URL`: 自動設定（Render PostgreSQL）
   - `FRONTEND_URL`: VercelのURL（例: `https://your-app.vercel.app`）
   - `RAILS_MASTER_KEY`: `config/master.key`の内容

**config/environments/production.rb の重要な設定:**
```ruby
Rails.application.configure do
  # セッション設定
  config.session_store :cookie_store, 
    key: '_training_app_session',
    domain: '.onrender.com', # Renderのドメイン
    same_site: :none,
    secure: true

  # CORS許可
  config.hosts << ENV['FRONTEND_URL']&.gsub(/https?:\/\//, '')
  
  # Active Storage設定（本番環境）
  config.active_storage.service = :amazon # または :google, :azure
end
```

**Active Storageの設定（config/storage.yml）:**
```yaml
# 開発環境
local:
  service: Disk
  root: <%= Rails.root.join("storage") %>

# 本番環境（AWS S3の例）
amazon:
  service: S3
  access_key_id: <%= ENV['AWS_ACCESS_KEY_ID'] %>
  secret_access_key: <%= ENV['AWS_SECRET_ACCESS_KEY'] %>
  region: <%= ENV['AWS_REGION'] %>
  bucket: <%= ENV['AWS_BUCKET'] %>
```

#### 9.2.3 デプロイメントの流れ

```
開発環境 (.devcontainer)
    ↓
Git Push
    ↓
    ├─→ Vercel (フロントエンド)
    │    - 自動ビルド & デプロイ
    │    - CDN配信
    │    - 環境変数: VITE_API_URL
    │
    └─→ Render (バックエンド)
         - 自動ビルド & デプロイ
         - マネージドPostgreSQL
         - 環境変数: FRONTEND_URL, SECRET_KEY_BASE等
```

**認証のポイント:**
- Deviseのセッションベース認証
- `withCredentials: true`でCookieを送信
- CORS設定で`credentials: true`
- 本番環境では`secure: true`と`same_site: :none`

### 9.3 AWS デプロイ構成（将来的）

#### 9.3.1 推奨構成: ECS Fargate + ECR

**アーキテクチャ:**
```
┌─────────────────────────────────────────┐
│          CloudFront (CDN)               │
└─────────────┬───────────────────────────┘
              │
       ┌──────┴──────┐
       │             │
       ▼             ▼
   [S3 Static]   [ALB]
   React App     │
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    [ECS Fargate]     [RDS]
    Rails API      PostgreSQL
        │
        ▼
    [ECR]
    Docker Images
```

**サービス構成:**

1. **フロントエンド:**
   - S3 + CloudFront
   - または AWS Amplify Hosting

2. **バックエンド:**
   - ECS Fargate (コンテナオーケストレーション)
   - ECR (コンテナレジストリ)
   - Application Load Balancer
   - RDS PostgreSQL

3. **ストレージ:**
   - S3 (Active Storage用)

4. **その他:**
   - Route 53 (DNS)
   - ACM (SSL証明書)
   - CloudWatch (ログ・監視)
   - ElastiCache Redis (Sidekiq用 - オプション)

**ECS vs EKS:**
| 項目 | ECS | EKS |
|------|-----|-----|
| 学習コスト | 低 | 高 |
| 管理コスト | AWS管理 | より複雑 |
| 柔軟性 | AWS特化 | Kubernetes標準 |
| 推奨 | ✅ 小〜中規模 | 大規模・マルチクラウド |

**このプロジェクトでは ECS Fargate を推奨:**
- シンプルなアーキテクチャ
- サーバーレスコンテナ実行
- オートスケーリング対応
- コスト効率が良い

#### 9.3.2 デプロイフロー（ECS）

**backend/Dockerfile (本番用):**
```dockerfile
FROM ruby:3.2

WORKDIR /app

# 依存関係のインストール
COPY Gemfile Gemfile.lock ./
RUN bundle install

# アプリケーションコードのコピー
COPY . .

# アセットのプリコンパイル
RUN RAILS_ENV=production bundle exec rails assets:precompile

EXPOSE 3001

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "3001", "-e", "production"]
```

**GitHub Actions例（.github/workflows/deploy.yml）:**
```yaml
name: Deploy to ECS

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1
      
      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: training-app-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG ./backend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster training-app-cluster \
            --service backend-service \
            --force-new-deployment
```

#### 9.3.3 コスト比較（月額概算）

**Vercel + Render (初期推奨):**
- Vercel Hobby: $0 (個人プロジェクト) / Pro: $20/月
- Render Web Service: $7/月
- Render PostgreSQL: $7/月
- **合計: $14/月（個人）/ $34/月（商用）**

**AWS ECS (スケール時):**
- ECS Fargate: ~$30/月（0.25 vCPU, 0.5 GB）
- RDS t3.micro: ~$15/月
- ALB: ~$20/月
- S3 + CloudFront: ~$5/月
- **合計: $70/月〜**

---

## 10. 開発フェーズ

### Phase 1: 環境構築とベース実装（1-2週間）
- [ ] .devcontainer設定
- [ ] Docker-in-Docker環境構築
- [ ] Rails APIモード初期設定
- [ ] React + TypeScript + Vite セットアップ
- [ ] データベース設計・マイグレーション
- [ ] Devise認証機能実装

### Phase 2: 管理機能実装（1週間）
- [ ] 管理者権限設定
- [ ] トレーニングマスタCRUD
- [ ] Active Storage設定（画像アップロード）
- [ ] 並び順変更機能

### Phase 3: ユーザー機能実装（2週間）
- [ ] ユーザー登録・ログイン（Devise）
- [ ] ダッシュボード
- [ ] トレーニング実行機能
- [ ] カレンダー表示
- [ ] ランキング機能

### Phase 4: バックグラウンドジョブ（1週間）
- [ ] Sidekiq設定
- [ ] ユーザー統計更新ジョブ
- [ ] ランキングキャッシュ更新ジョブ

### Phase 5: テスト・デプロイ（1週間）
- [ ] RSpecテスト作成
- [ ] E2Eテスト（Cypress）
- [ ] Vercel + Render デプロイ
- [ ] 本番環境動作確認

---

## 11. Claude Code向け実装指示

### 11.1 最初のステップ

```bash
# プロジェクトディレクトリ作成
mkdir training-app
cd training-app

# .devcontainer設定ファイル作成
mkdir -p .devcontainer
touch .devcontainer/devcontainer.json
touch .devcontainer/docker-compose.yml

# フロントエンド・バックエンドディレクトリ作成
mkdir frontend backend
```

### 11.2 実装優先順位

1. ✅ `.devcontainer`構成
2. ✅ Railsプロジェクト初期化（API mode）
3. ✅ Devise導入・設定
4. ✅ Reactプロジェクト初期化（Vite + TypeScript）
5. ✅ データベーススキーマ作成
6. ✅ 認証システム（Devise + React連携）
7. ✅ 管理画面（トレーニングマスタCRUD）
8. ✅ ユーザー機能（トレーニング実行・記録）
9. ✅ カレンダー・ランキング機能
10. ✅ デプロイ設定

### 11.3 コーディング規約

**Rails:**
- RuboCop設定を使用
- N+1クエリを避ける（Bullet gem使用）
- バックグラウンドジョブはSidekiqを推奨
- RESTful設計を厳守（collection/member禁止）
- Deviseの標準機能を優先的に使用

**React:**
- ESLint + Prettier使用
- 関数コンポーネント + Hooks
- カスタムフックで再利用可能なロジック分離
- TypeScript strict mode有効化

### 11.4 重要なGem

```ruby
# Gemfile
source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '3.2.0'

# Core
gem 'rails', '~> 7.1.0'
gem 'pg', '~> 1.5'
gem 'puma', '~> 6.0'

# Authentication
gem 'devise', '~> 4.9'

# CORS
gem 'rack-cors'

# Serialization
gem 'active_model_serializers', '~> 0.10.13'

# Image Upload
gem 'image_processing', '~> 1.12'

# Background Jobs
gem 'sidekiq', '~> 7.0'

# Pagination
gem 'kaminari', '~> 1.2'

# 営業日計算
gem 'holidays', '~> 8.0'

group :development, :test do
  gem 'rspec-rails', '~> 6.0'
  gem 'factory_bot_rails', '~> 6.2'
  gem 'faker', '~> 3.2'
  gem 'pry-rails'
  gem 'rubocop-rails', require: false
  gem 'bullet'
end

group :development do
  gem 'annotate'
end
```

---

## 12. まとめ

### 12.1 開発環境とデプロイの関係

✅ **開発環境 (.devcontainer + Docker-in-Docker):**
- ローカル開発専用
- フロント・バック・DBが1つの環境で動く
- VSCode Dev Containersで快適な開発体験

✅ **Vercel + Render デプロイ:**
- 開発環境の構成とは**完全に独立**
- 各サービスが個別にデプロイ
- Devise + Cookie認証で簡単に実装
- **問題なくデプロイ可能**

✅ **AWS ECS デプロイ（将来）:**
- より柔軟なスケーリングが必要な場合
- ECS Fargate + ECR の組み合わせが最適
- 初期はVercel + Renderで開始し、必要に応じてAWSへ移行推奨

### 12.2 推奨デプロイ戦略

**フェーズ1（MVP）:** Vercel + Render
- コスト: $14/月
- セットアップ時間: 1-2時間
- スケーラビリティ: 小〜中規模
- 認証: Devise + Cookie (セッションベース)

**フェーズ2（成長期）:** AWS ECS
- コスト: $70/月〜
- セットアップ時間: 1-2日
- スケーラビリティ: 中〜大規模

### 12.3 Deviseを使うメリット

1. **実装が簡単**: 認証周りのベストプラクティスがすべて含まれている
2. **セキュリティ**: 長年の実績があり、脆弱性対応も迅速
3. **機能が豊富**: パスワードリセット、メール確認、ロック機能など
4. **SPA対応**: Cookie認証で問題なく動作
5. **拡張性**: 必要に応じてトークン認証への移行も可能

この要件定義書をベースに、Claude Codeで段階的に実装を進めることができます！
