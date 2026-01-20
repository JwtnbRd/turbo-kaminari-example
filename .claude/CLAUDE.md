# Claude Code 開発ガイド

このドキュメントは、Claude Codeがこのプロジェクトを開発する際のガイドラインです。

## プロジェクト概要

**トレーニング記録Webアプリケーション** - 日々のトレーニングを記録・管理・分析するWebアプリ

### 技術スタック
- **フロントエンド**: React + TypeScript + Vite + TailwindCSS
- **バックエンド**: Ruby on Rails 8.0.2 (API mode)
- **データベース**: PostgreSQL 15 + Redis
- **認証**: Devise + JWT

### 🎯 現在の実装状況（40%完了）
- ✅ **基盤システム**: 開発環境、認証、データベース
- ✅ **管理者機能**: トレーニングマスタ管理画面
- ✅ **ユーザー機能**: トレーニング記録作成・一覧表示
- 🔄 **次の実装**: ダッシュボード・統計表示機能

### 🚀 利用可能な機能
```
# ユーザー向け機能
http://localhost:3000/training-records    # トレーニング記録
http://localhost:3000/auth-test           # 認証テスト

# 管理者向け機能
http://localhost:3000/admin/training-management  # 管理画面
```

## 開発環境

### 起動方法
```bash
# 開発環境の起動
./scripts/dev-start.sh

# または手動で
docker-compose -f .devcontainer/docker-compose.yml up -d
```

### よく使うコマンド
```bash
# Railsコンソール
./scripts/container-backend.sh console

# マイグレーション実行
./scripts/container-backend.sh migrate

# シードデータ投入
./scripts/container-backend.sh seed

# バックエンドのシェル
./scripts/container-backend.sh shell

# フロントエンドのシェル
./scripts/container-frontend.sh shell

# コンテナの再起動
./scripts/container-manage.sh restart
```

## コーディング規約

### 🚨 最重要: 差分を小さく保つ

**レビュー負荷を減らすための原則:**
- ✅ **1PR = 1機能** に絞る
- ✅ **差分は200行以内** を目標にする
- ✅ **動くものを小さく積み上げる**
- ❌ 一度に複数機能を実装しない
- ❌ 大きなリファクタリングを混ぜない

**詳細は MVP_GUIDE.md を参照してください**

### Rails（バックエンド）

#### RESTfulルーティング（DHH流）
- **絶対に使わない**: `collection`, `member`
- **使用するアクション**: `index`, `show`, `new`, `create`, `edit`, `update`, `destroy`のみ
- **複雑な操作**: 新しいリソースとして分割する

**良い例:**
```ruby
# ランキングを別リソース化
resources :point_rankings, only: [:index]
resources :streak_rankings, only: [:index]

# 並び順変更を別リソース化
resources :training_positions, only: [:update]
```

**悪い例（使わない）:**
```ruby
# これは使わない
resources :trainings do
  member do
    post :reorder
  end
end
```

#### モデル設計
- Fat Model, Skinny Controller
- ビジネスロジックはモデルに
- バリデーションは必ず実装
- Scopeを活用してクエリを整理

**例:**
```ruby
class Training < ApplicationRecord
  # Scopes
  scope :published, -> { where(published: true, deleted_at: nil) }
  scope :by_difficulty, ->(difficulty) { where(difficulty: difficulty) }
  
  # Validations
  validates :name, presence: true, length: { maximum: 50 }
  validates :duration, numericality: { greater_than: 0 }
  
  # Instance methods
  def soft_delete
    update(deleted_at: Time.current)
  end
end
```

#### コントローラ設計
- 1アクション = 1責任
- Strong Parametersを必ず使用
- エラーハンドリングはBaseControllerで一元管理

```ruby
class Api::V1::TrainingsController < Api::V1::BaseController
  def index
    @trainings = Training.published.order(:display_order)
    render json: @trainings
  end
  
  def create
    @training = Training.new(training_params)
    if @training.save
      render json: @training, status: :created
    else
      render json: { errors: @training.errors }, status: :unprocessable_entity
    end
  end
  
  private
  
  def training_params
    params.require(:training).permit(:name, :description, :duration)
  end
end
```

#### N+1クエリ対策
- `includes`を必ず使用
- Bulletを有効化して検出

```ruby
# 悪い例
@records = current_user.training_records

# 良い例
@records = current_user.training_records.includes(:training)
```

### React（フロントエンド）

#### コンポーネント設計
- 関数コンポーネント + Hooks
- 1ファイル = 1コンポーネント
- Props型定義は必須

```typescript
interface TrainingCardProps {
  training: Training;
  onClick: (id: number) => void;
}

export const TrainingCard: React.FC<TrainingCardProps> = ({ training, onClick }) => {
  return (
    <div onClick={() => onClick(training.id)}>
      <h3>{training.name}</h3>
      <p>{training.description}</p>
    </div>
  );
};
```

#### カスタムフック
- ロジックの再利用
- APIコールはカスタムフックに

```typescript
export const useTrainings = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/trainings');
      setTrainings(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTrainings();
  }, []);
  
  return { trainings, loading, refetch: fetchTrainings };
};
```

#### 状態管理
- グローバル状態: Zustand または Context API
- ローカル状態: useState
- サーバー状態: カスタムフック

```typescript
// AuthContextの例
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## ディレクトリ構造

### バックエンド
```
backend/
├── app/
│   ├── controllers/
│   │   └── api/
│   │       └── v1/
│   │           ├── base_controller.rb
│   │           ├── trainings_controller.rb
│   │           └── admin/
│   │               ├── base_controller.rb
│   │               └── trainings_controller.rb
│   ├── models/
│   │   ├── user.rb
│   │   ├── training.rb
│   │   └── training_record.rb
│   ├── serializers/
│   │   ├── training_serializer.rb
│   │   └── admin/
│   │       └── training_serializer.rb
│   └── jobs/
│       └── update_user_stats_job.rb
```

### フロントエンド
```
frontend/src/
├── components/
│   ├── common/          # 共通コンポーネント
│   ├── auth/            # 認証関連
│   ├── dashboard/       # ダッシュボード
│   ├── training/        # トレーニング
│   ├── calendar/        # カレンダー
│   ├── ranking/         # ランキング
│   └── admin/           # 管理画面
├── pages/               # ページコンポーネント
├── hooks/               # カスタムフック
├── services/            # API通信
├── contexts/            # Context API
├── types/               # TypeScript型定義
└── utils/               # ユーティリティ
```

## データベース

### マイグレーションのベストプラクティス
```ruby
# マイグレーション作成
rails g migration CreateTrainings

# カラム追加
rails g migration AddPublishedToTrainings published:boolean

# インデックス追加は必ず
add_index :training_records, [:user_id, :completed_at]
add_index :trainings, :published
```

### シードデータ
```ruby
# db/seeds.rb
# 管理者ユーザー
admin = User.create!(
  username: 'admin',
  email: 'admin@example.com',
  password: 'password',
  role: :admin
)

# トレーニングマスタ
Training.create!([
  {
    name: '腕立て伏せ',
    description: '胸と腕を鍛える基本トレーニング',
    duration: 60,
    base_points: 10,
    difficulty: :beginner
  },
  # ...
])
```

## API設計

### エンドポイント命名規則
- 複数形を使用: `/api/v1/trainings`
- IDは`:id`パラメータ: `/api/v1/trainings/:id`
- ネストは1階層まで: `/api/v1/admin/trainings`

### 実装済みAPI一覧

#### 認証API
```bash
POST   /api/v1/auth/sign_up      # ユーザー登録
POST   /api/v1/auth/sign_in      # ログイン
DELETE /api/v1/auth/sign_out     # ログアウト
```

#### 🆕 ユーザー向けAPI
```bash
# トレーニング記録
POST   /api/v1/training_records     # 記録作成
GET    /api/v1/training_records     # 記録一覧取得（ページネーション対応）
GET    /api/v1/training_records/:id # 記録詳細取得
PATCH  /api/v1/training_records/:id # 記録更新
DELETE /api/v1/training_records/:id # 記録削除

# クエリパラメータ
# ?page=1&per_page=20&training_id=1&start_date=2025-01-01&end_date=2025-01-31
```

#### 管理者向けAPI
```bash
# トレーニングマスタ
GET    /api/v1/admin/trainings     # 一覧取得
POST   /api/v1/admin/trainings     # 新規作成
GET    /api/v1/admin/trainings/:id # 詳細取得
PATCH  /api/v1/admin/trainings/:id # 更新
DELETE /api/v1/admin/trainings/:id # 削除
```

### レスポンス形式
```json
// 成功
{
  "id": 1,
  "name": "腕立て伏せ",
  "duration": 60
}

// エラー
{
  "errors": ["Name can't be blank"]
}

// 一覧（ページネーション）
{
  "data": [...],
  "meta": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 100
  }
}
```

## 認証（Devise）

### 重要な設定
```ruby
# config/initializers/devise.rb
config.skip_session_storage = [:http_auth, :params_auth]

# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV['FRONTEND_URL'] || 'http://localhost:3000'
    resource '*',
      credentials: true  # 重要!
  end
end
```

### フロントエンド側
```typescript
// services/api.ts
const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  withCredentials: true  // 重要!
});
```

## テスト

### RSpec（バックエンド）
```ruby
# spec/models/training_spec.rb
RSpec.describe Training, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_numericality_of(:duration) }
  end
  
  describe 'scopes' do
    it 'returns only published trainings' do
      published = create(:training, published: true)
      unpublished = create(:training, published: false)
      
      expect(Training.published).to include(published)
      expect(Training.published).not_to include(unpublished)
    end
  end
end
```

### テスト実行
```bash
# 全テスト実行
./scripts/container-backend.sh test

# 特定ファイルのみ
docker-compose exec backend bundle exec rspec spec/models/training_spec.rb
```

## 画像アップロード（Cloudinary）

### Cloudinary設定

**Vercel + Render環境では Cloudinary を使用します。**

**理由:**
- ✅ 無料枠25GBで十分（社内50人）
- ✅ 設定が簡単（5分）
- ✅ CDN配信標準装備
- ✅ 画像変換が自動

**Gemfile:**
```ruby
gem 'cloudinary'
```

**config/storage.yml:**
```yaml
cloudinary:
  service: Cloudinary
  cloud_name: <%= ENV['CLOUDINARY_CLOUD_NAME'] %>
  api_key: <%= ENV['CLOUDINARY_API_KEY'] %>
  api_secret: <%= ENV['CLOUDINARY_API_SECRET'] %>
```

**config/environments/production.rb:**
```ruby
config.active_storage.service = :cloudinary
```

**Render環境変数:**
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

**モデル:**
```ruby
class Training < ApplicationRecord
  has_one_attached :image
  
  def image_url
    return nil unless image.attached?
    image.url
  end
end
```

---

## デプロイ

### Vercel + Render構成

**フロントエンド（Vercel）:**
- ビルドコマンド: `npm run build`
- 出力ディレクトリ: `dist`
- 環境変数: `VITE_API_URL`

**バックエンド（Render）:**
- ビルドコマンド: `bundle install; rails db:migrate`
- 起動コマンド: `bundle exec rails server -b 0.0.0.0 -p $PORT`
- 環境変数: `RAILS_ENV=production`, `SECRET_KEY_BASE`, `FRONTEND_URL`

## トラブルシューティング

### コンテナが起動しない
```bash
# ログ確認
docker-compose -f .devcontainer/docker-compose.yml logs

# クリーンビルド
./scripts/container-manage.sh rebuild
```

### データベース接続エラー
```bash
# データベースの再作成
./scripts/container-backend.sh shell
rails db:drop db:create db:migrate db:seed
```

### フロントエンドが表示されない
```bash
# node_modulesの再インストール
./scripts/container-frontend.sh shell
rm -rf node_modules package-lock.json
npm install
```

## 実装の優先順位

### ✅ 完了済み（10/25タスク - 40%）
1. ✅ 環境構築（.devcontainer, Docker）
2. ✅ Devise認証（ユーザー登録・ログイン）
3. ✅ データベーススキーマ作成（4テーブル）
4. ✅ JWT認証システム完全実装
5. ✅ Trainingモデル詳細実装
6. ✅ 管理者用Training API実装
7. ✅ 管理画面UI実装
8. ✅ TrainingRecordモデル・API実装
9. ✅ ユーザー向けトレーニング記録UI実装
10. ✅ 基本的なトレーニング実行・記録機能

### 🔄 実装中・次候補
11. 🎯 ダッシュボード・統計表示機能（推奨次タスク）
12. 📅 カレンダー表示機能
13. 🏆 ランキング機能
14. 🔔 通知機能
15. 🚀 デプロイ設定

### 💡 今後の拡張候補
- ソーシャル機能（フォロー、コメント）
- トレーニングプラン作成
- パフォーマンス分析
- データエクスポート
- モバイルアプリ対応

## 参考リンク

- [Rails Guides](https://guides.rubyonrails.org/)
- [Devise Documentation](https://github.com/heartcombo/devise)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)

## Tsumiki（AI駆動開発フレームワーク）

このプロジェクトではTsumiki開発フレームワークを採用しています。

### 利用可能なTsumikiコマンド

#### 基本セットアップ
- `/tsumiki-init-tech-stack` - 技術スタック選定（既にCLAUDE.mdがあるため通常は不要）

#### Kairo（包括的開発フロー）
- `/tsumiki-kairo-requirements` - EARS記法による要件定義書作成
- `/tsumiki-kairo-design` - 詳細設計書作成（アーキテクチャ・データ・API・UI設計）

#### TDD（テスト駆動開発）
- `/tsumiki-tdd-red` - 失敗するテストケース作成
- `/tsumiki-tdd-green` - 最小限の実装でテスト成功
- `/tsumiki-tdd-refactor` - コード品質向上（テスト維持）

### Tsumiki開発原則

1. **段階的な開発**
   - 要件定義 → 設計 → TDDサイクル
   - 小さな単位での確実な前進

2. **EARS記法による要件定義**
   - 曖昧性の排除
   - 受け入れ基準の明確化

3. **TDDによる品質担保**
   - Red → Green → Refactor サイクル
   - テストファーストの徹底

### 使用例

新機能開発時の推奨フロー：
```
1. /tsumiki-kairo-requirements  # 要件定義
2. /tsumiki-kairo-design       # 設計書作成
3. /tsumiki-tdd-red           # テスト作成
4. /tsumiki-tdd-green         # 実装
5. /tsumiki-tdd-refactor      # リファクタリング
```

---

**開発を始める前に:**
1. `docs/requirements.md`を必ず読む
2. スクリプトに実行権限を付与: `chmod +x scripts/*.sh`
3. 環境変数ファイルを作成: `.env.development`
4. 開発環境を起動: `./scripts/dev-start.sh`
