# Active Storage 画像アップロード設定ガイド

## 概要

このドキュメントでは、開発環境・Vercel+Render・AWSそれぞれでのActive Storageの設定方法を説明します。

---

## 環境別のストレージ構成

### 📊 比較表

| 環境 | ストレージ | 設定難易度 | コスト | 推奨度 |
|------|----------|-----------|--------|--------|
| 開発環境 | ローカルディスク | ★☆☆☆☆ | 無料 | ✅ |
| Render | **Render Disks** | ★★☆☆☆ | $1/月〜 | ✅ 推奨 |
| Render | **AWS S3** | ★★★☆☆ | $0.02/月〜 | ◎ |
| Vercel + Render | **AWS S3** | ★★★☆☆ | $0.02/月〜 | ✅ 推奨 |
| AWS ECS | **AWS S3** | ★★★☆☆ | $0.02/月〜 | ✅ |

---

## 🚨 重要: Renderのストレージ制限

### Renderの問題点

**Render Web Serviceは一時ファイルシステムを使用:**
- ファイルはコンテナの再起動で**消える**
- デプロイの度にアップロードファイルが**消える**
- 永続的なストレージではない

```ruby
# ❌ これはRenderでは動かない（ファイルが消える）
config.active_storage.service = :local
```

### 解決策: 2つの選択肢

#### 1. Render Disks（シンプル）
- Renderが提供する永続ストレージ
- 設定が簡単
- コスト: $1/月〜

#### 2. AWS S3（推奨）
- 業界標準のオブジェクトストレージ
- スケーラブル
- コスト: 従量課金（激安）

---

## 1. 開発環境（ローカル）

### 設定

**config/environments/development.rb:**
```ruby
Rails.application.configure do
  # ローカルディスクを使用
  config.active_storage.service = :local
end
```

**config/storage.yml:**
```yaml
local:
  service: Disk
  root: <%= Rails.root.join("storage") %>
```

**特徴:**
- ✅ 設定不要
- ✅ 無料
- ✅ すぐに使える
- ❌ ローカル環境のみ

**ファイル保存場所:**
```
backend/storage/
├── xx/
│   └── yy/
│       └── ファイル名
```

---

## 2. Render環境

### オプションA: Render Disks（簡単）

#### 手順

**1. Render Dashboardでディスク作成**
```
Render Dashboard
  → Disks
  → New Disk
  
Name: training-app-storage
Mount Path: /var/data/storage
Size: 1GB ($1/月) または 10GB ($10/月)
```

**2. Web Serviceにディスクをアタッチ**
```
Web Service設定
  → Disks
  → Add Disk
  → training-app-storage を選択
```

**3. Rails設定**

**config/environments/production.rb:**
```ruby
Rails.application.configure do
  # Render Disksを使用
  config.active_storage.service = :render_disk
end
```

**config/storage.yml:**
```yaml
render_disk:
  service: Disk
  root: /var/data/storage
```

**環境変数（不要）:**
- 特になし

**メリット:**
- ✅ 設定が簡単
- ✅ Render内で完結
- ✅ 追加のAWSアカウント不要

**デメリット:**
- ⚠️ ストレージサイズ上限あり
- ⚠️ CDN配信できない（画像読み込みが遅くなる可能性）
- ⚠️ スケールしにくい

**料金:**
```
1GB:  $1/月
10GB: $10/月
50GB: $50/月
```

**社内ツール（50人）での想定使用量:**
- トレーニング画像: 約50枚 × 200KB = 10MB
- ユーザーアップロード画像: 少量
- **合計: 100MB以下**
- **推奨プラン: 1GB ($1/月) で十分**

---

### オプションB: AWS S3（推奨）

#### なぜS3を推奨するのか？

**Render Disks vs AWS S3:**
| 項目 | Render Disks | AWS S3 |
|------|-------------|--------|
| 初期設定 | 簡単 | やや複雑 |
| コスト（1GB） | $1/月 | $0.023/月 |
| コスト（10GB） | $10/月 | $0.23/月 |
| スケーラビリティ | 制限あり | 無制限 |
| CDN配信 | 不可 | 可能（CloudFront） |
| AWSへの移行 | 要移行作業 | そのまま使える |

**50人の社内ツールでも、S3を推奨する理由:**
1. **コストが安い**: 100MBなら月額$0.002（約0.3円）
2. **将来性**: AWSに移行する際に設定変更不要
3. **信頼性**: 99.999999999%の耐久性
4. **バックアップ**: 自動的に複数箇所に保存

#### 手順

**1. AWS S3バケット作成**

```bash
# AWS CLIで作成（または管理コンソールから）
aws s3 mb s3://training-app-uploads --region ap-northeast-1

# パブリックアクセスをブロック（推奨）
aws s3api put-public-access-block \
  --bucket training-app-uploads \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

**管理コンソールでの作成:**
```
AWS Console → S3 → Create bucket

Bucket name: training-app-uploads
Region: Asia Pacific (Tokyo) ap-northeast-1
Block all public access: ✅ チェック
Bucket Versioning: Disable
Default encryption: Enable (SSE-S3)
```

**2. IAMユーザー作成とポリシー設定**

**IAMユーザー作成:**
```
AWS Console → IAM → Users → Add user

User name: training-app-s3-user
Access type: Programmatic access

Attach policies: なし（カスタムポリシーを作成）
```

**カスタムポリシー（最小権限）:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::training-app-uploads",
        "arn:aws:s3:::training-app-uploads/*"
      ]
    }
  ]
}
```

**アクセスキーをダウンロード:**
- Access Key ID: `AKIAIOSFODNN7EXAMPLE`
- Secret Access Key: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

**3. Rails設定**

**Gemfile に追加:**
```ruby
gem 'aws-sdk-s3', require: false
```

```bash
bundle install
```

**config/storage.yml:**
```yaml
amazon:
  service: S3
  access_key_id: <%= ENV['AWS_ACCESS_KEY_ID'] %>
  secret_access_key: <%= ENV['AWS_SECRET_ACCESS_KEY'] %>
  region: ap-northeast-1
  bucket: training-app-uploads
```

**config/environments/production.rb:**
```ruby
Rails.application.configure do
  # AWS S3を使用
  config.active_storage.service = :amazon
end
```

**4. Renderに環境変数を設定**

```
Render Dashboard → Web Service → Environment

AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=ap-northeast-1
AWS_BUCKET=training-app-uploads
```

**5. デプロイ**

```bash
git add .
git commit -m "Add AWS S3 configuration"
git push origin main

# Renderが自動的に再デプロイ
```

#### CORS設定（必須）

フロントエンドから直接S3にアクセスする場合はCORS設定が必要です。

**S3バケットのCORS設定:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "https://your-app.vercel.app",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

**設定方法:**
```
S3 Console → Bucket → Permissions → CORS configuration
上記のJSONを貼り付け
```

---

## 3. AWS ECS環境

### 設定（Renderと同じ）

AWS ECSで動かす場合も、S3を使用します。設定はRenderと同じです。

**違い:**
- IAMロールを使える（よりセキュア）
- アクセスキー不要

**config/storage.yml（IAMロール使用時）:**
```yaml
amazon:
  service: S3
  region: ap-northeast-1
  bucket: training-app-uploads
  # アクセスキー不要（IAMロールで自動認証）
```

**ECS Task RoleにS3ポリシーをアタッチ:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::training-app-uploads",
        "arn:aws:s3:::training-app-uploads/*"
      ]
    }
  ]
}
```

---

## 4. 実装例

### コントローラでの使用

**app/controllers/api/v1/admin/trainings_controller.rb:**
```ruby
class Api::V1::Admin::TrainingsController < Api::V1::Admin::BaseController
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
  
  private
  
  def training_params
    params.require(:training).permit(:name, :description, :duration, :base_points, :image)
  end
end
```

### モデルでの定義

**app/models/training.rb:**
```ruby
class Training < ApplicationRecord
  has_one_attached :image
  
  validates :image, content_type: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'],
                    size: { less_than: 5.megabytes }
  
  def image_url
    return nil unless image.attached?
    
    # 開発環境: ローカルURL
    # 本番環境: S3のURL
    Rails.application.routes.url_helpers.rails_blob_url(image, only_path: false)
  end
end
```

### フロントエンドでの実装

**React（画像アップロード）:**
```typescript
const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('training[image]', file);
  formData.append('training[name]', name);
  formData.append('training[description]', description);
  // ... 他のフィールド

  try {
    const response = await api.post('/admin/trainings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Upload success:', response.data);
  } catch (error) {
    console.error('Upload error:', error);
  }
};
```

**React（画像表示）:**
```tsx
interface Training {
  id: number;
  name: string;
  image_url?: string;
}

const TrainingCard: React.FC<{ training: Training }> = ({ training }) => {
  return (
    <div>
      {training.image_url ? (
        <img src={training.image_url} alt={training.name} />
      ) : (
        <div>画像なし</div>
      )}
      <h3>{training.name}</h3>
    </div>
  );
};
```

---

## 5. コスト試算（社内ツール50人想定）

### シナリオ

- ユーザー数: 50人
- トレーニングマスタ画像: 50枚
- 1画像あたり: 200KB
- ユーザーアップロード: なし（管理者のみ）

### Render Disks

```
ストレージ使用量: 50枚 × 200KB = 10MB
必要プラン: 1GB ($1/月)

月額コスト: $1
年間コスト: $12
```

### AWS S3

```
ストレージ料金:
  10MB × $0.023/GB = 10/1024 × $0.023 = $0.0002/月

リクエスト料金（概算）:
  - PUT: 50回（初回アップロード） = $0.0025
  - GET: 500回/月（画像表示） = $0.0002/月
  
月額コスト: $0.003（約0.5円）
年間コスト: $0.036（約5円）
```

**結論: S3は圧倒的に安い！**

### ユーザーが増えた場合

**1,000人に増えた場合:**

| 項目 | Render Disks | AWS S3 |
|------|--------------|--------|
| ストレージ | 200MB → 1GB | 200MB |
| 月額コスト | $1 | $0.005 |
| 年間コスト | $12 | $0.06 |

---

## 6. 推奨構成（社内ツール50人向け）

### フェーズ1: MVP開発（1-2ヶ月）

```
開発環境: ローカルディスク
本番環境: Render Disks (1GB, $1/月)
```

**理由:**
- ✅ 設定が簡単
- ✅ すぐに始められる
- ✅ AWSアカウント不要

**予算:**
```
Vercel: $0
Render Web Service: $7/月
Render PostgreSQL: $7/月
Render Disks: $1/月
--------------------
合計: $15/月
```

### フェーズ2: 本格運用（3ヶ月目〜）

```
開発環境: ローカルディスク
本番環境: AWS S3
```

**理由:**
- ✅ コストが激安（月額$0.003）
- ✅ 将来的なAWS移行に備える
- ✅ 業界標準の構成

**予算:**
```
Vercel: $0
Render Web Service: $7/月
Render PostgreSQL: $7/月
AWS S3: $0.003/月（無視できる）
--------------------
合計: $14/月
```

---

## 7. トラブルシューティング

### 画像がアップロードできない

**1. Gemが入っているか確認**
```bash
# Gemfileに追加
gem 'aws-sdk-s3', require: false

# インストール
bundle install
```

**2. 環境変数が設定されているか確認**
```bash
# Railsコンソールで確認
rails console

ENV['AWS_ACCESS_KEY_ID']
ENV['AWS_SECRET_ACCESS_KEY']
ENV['AWS_REGION']
```

**3. S3バケットのアクセス権限確認**
```bash
# AWS CLIで確認
aws s3 ls s3://training-app-uploads
```

### 画像URLが表示されない

**モデルにimage_urlメソッドがあるか確認:**
```ruby
class Training < ApplicationRecord
  has_one_attached :image
  
  def image_url
    return nil unless image.attached?
    Rails.application.routes.url_helpers.rails_blob_url(image, only_path: false)
  end
end
```

**Serializerで公開しているか確認:**
```ruby
class TrainingSerializer < ActiveModel::Serializer
  attributes :id, :name, :image_url
  
  def image_url
    object.image_url
  end
end
```

### CORS エラーが出る

**S3バケットのCORS設定を確認:**
```json
[
  {
    "AllowedOrigins": ["https://your-app.vercel.app"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## まとめ

### 社内ツール（50人）での推奨構成

**開発初期（MVP）:**
```
✅ Render Disks (1GB, $1/月)
理由: 設定が簡単、すぐ始められる
```

**本格運用:**
```
✅ AWS S3（月額$0.003）
理由: 激安、スケーラブル、業界標準
```

### 設定の難易度

```
開発環境（ローカル） ★☆☆☆☆（設定不要）
    ↓
Render Disks        ★★☆☆☆（5分で設定完了）
    ↓
AWS S3             ★★★☆☆（30分で設定完了）
```

### コスト比較（年間）

```
Render Disks: $12/年
AWS S3:      $0.036/年（約5円）
```

**結論: 最終的にはAWS S3を推奨しますが、MVPではRender Disksでも十分です！**
