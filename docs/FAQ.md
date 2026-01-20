# よくある質問（FAQ）

## Q1: .devcontainer & Docker-in-Docker構成はどうやってデプロイすればいいのか？

### A1: 開発環境と本番環境は完全に独立しています

**重要なポイント:**
- `.devcontainer`と`docker-compose.yml`は**ローカル開発専用**
- 本番デプロイには**直接関係しません**
- 各サービス（フロント・バック）を個別にデプロイ

### 開発環境 vs 本番環境

| 項目 | 開発環境 | 本番環境 |
|------|----------|----------|
| 用途 | ローカル開発 | 本番サービス |
| 構成 | Docker-in-Docker | 独立したサービス |
| 起動方法 | VSCode Dev Container | Vercel/Render/AWS |
| データベース | Dockerコンテナ | マネージドDB |
| ファイル | `.devcontainer/` | デプロイ設定ファイル |

---

## Q2: Vercel（フロント） + Render（Rails）にすんなりデプロイできるのか？

### A2: はい、問題なくデプロイできます！

#### ✅ デプロイの流れ

```
開発環境（.devcontainer）
    ↓ git push
    ↓
GitHub リポジトリ
    ↓
    ├─→ Vercel（自動デプロイ）
    │    - Reactビルド
    │    - 静的ファイル配信
    │
    └─→ Render（自動デプロイ）
         - Railsビルド
         - API起動
         - PostgreSQL接続
```

#### フロントエンド（Vercel）のデプロイ手順

1. **GitHubにプッシュ**
   ```bash
   git add frontend/
   git commit -m "Add frontend"
   git push origin main
   ```

2. **Vercelでインポート**
   - Vercel Dashboard → New Project
   - GitHubリポジトリを選択
   - Root Directory: `frontend`

3. **ビルド設定（自動検出される）**
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **環境変数の設定**
   ```
   VITE_API_URL=https://your-app.onrender.com/api/v1
   ```

**注意点:**
- Viteは自動的にビルド設定を検出
- Dockerfileは**不要**（Vercelが自動処理）
- カスタムドメイン設定可能

#### バックエンド（Render）のデプロイ手順

1. **GitHubにプッシュ**
   ```bash
   git add backend/
   git commit -m "Add backend"
   git push origin main
   ```

2. **Renderで新規サービス作成**
   - Render Dashboard → New → Web Service
   - GitHubリポジトリを選択
   - Root Directory: `backend`

3. **ビルド設定**
   ```
   Build Command: bundle install; rails db:migrate
   Start Command: bundle exec rails server -b 0.0.0.0 -p $PORT
   Environment: Ruby
   ```

4. **PostgreSQLデータベース作成**
   - Render Dashboard → New → PostgreSQL
   - データベース作成後、Web ServiceにリンクさせるとDATABASE_URLが自動設定される

5. **環境変数の設定**
   ```
   RAILS_ENV=production
   SECRET_KEY_BASE=（rails secretで生成）
   FRONTEND_URL=https://your-app.vercel.app
   RAILS_MASTER_KEY=（config/master.keyの内容）
   ```

**注意点:**
- Dockerfileは**任意**（Renderは自動でRuby環境を構築）
- ただしDockerfileがあれば優先的に使用される
- DATABASE_URLは自動設定される

#### デプロイの自動化

**GitHub Actionsで自動デプロイ（オプション）:**
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          cd frontend
          npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
  
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Trigger Render Deploy
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

#### よくある問題と解決策

**問題1: CORSエラー**
```ruby
# backend/config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV['FRONTEND_URL'] || 'http://localhost:3000'
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

**問題2: Devise認証が動かない**
```ruby
# backend/config/environments/production.rb
config.session_store :cookie_store, 
  key: '_training_app_session',
  domain: '.onrender.com',
  same_site: :none,
  secure: true
```

**問題3: 画像アップロードできない**
```ruby
# backend/config/storage.yml
amazon:
  service: S3
  access_key_id: <%= ENV['AWS_ACCESS_KEY_ID'] %>
  secret_access_key: <%= ENV['AWS_SECRET_ACCESS_KEY'] %>
  region: <%= ENV['AWS_REGION'] %>
  bucket: <%= ENV['AWS_BUCKET'] %>
```

### 結論: すんなりデプロイできます！

- ✅ .devcontainer構成は本番デプロイに影響しない
- ✅ VercelとRenderは自動的に環境を構築
- ✅ 環境変数さえ正しく設定すれば動作する
- ✅ 初回デプロイは30分程度で完了

---

## Q3: 将来的にAWSにデプロイする場合、ECR + ECSがいいのか？

### A3: はい、ECR + ECS Fargateが最適です

#### AWS構成の推奨アーキテクチャ

```
┌──────────────────────────────────────┐
│        CloudFront (CDN)              │
│     SSL証明書（ACM）                  │
└─────────┬────────────────────────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
[S3]        [ALB]
React     SSL終端
静的配信    │
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
[ECS Fargate] [RDS]
Rails API   PostgreSQL
    │
    ▼
[ECR]
Dockerイメージ
```

#### なぜECS Fargateなのか？

**ECS Fargate vs その他の選択肢:**

| サービス | 学習コスト | 管理コスト | オートスケール | 推奨度 |
|---------|-----------|-----------|--------------|-------|
| ECS Fargate | 低 | 低（サーバーレス） | ◎ | ✅ 推奨 |
| ECS EC2 | 低 | 中（EC2管理必要） | ○ | △ |
| EKS | 高 | 高（K8s知識必要） | ◎ | △ |
| Elastic Beanstalk | 低 | 低 | ○ | △ |
| Lambda | 中 | 低 | ◎ | × Rails不向き |

**ECS Fargateの利点:**
- ✅ サーバー管理不要（Serverless）
- ✅ 自動スケーリング
- ✅ コンテナベースで開発環境と一致
- ✅ コスト最適化（使った分だけ課金）
- ✅ AWSネイティブで他サービスと連携しやすい

#### AWS ECS構成の詳細

**1. フロントエンド: S3 + CloudFront**
```
S3バケット
  ↓ ビルド済みファイル配置
CloudFront
  ↓ CDN配信
  ↓ SSL/TLS (ACM)
  ↓ キャッシュ
ユーザー
```

**設定:**
- S3: 静的ウェブサイトホスティング
- CloudFront: キャッシュ戦略、SSL証明書
- Route 53: カスタムドメイン

**2. バックエンド: ECS Fargate**
```
GitHub
  ↓ Push
GitHub Actions
  ↓ ビルド
ECR (コンテナレジストリ)
  ↓ プル
ECS Fargate (コンテナ実行)
  ↓ 
ALB (ロードバランサー)
  ↓
CloudFront / ユーザー
```

**ECS設定:**
```yaml
# Task Definition例
{
  "family": "training-app-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "YOUR_ECR_REPO:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "RAILS_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "SECRET_KEY_BASE",
          "valueFrom": "arn:aws:secretsmanager:..."
        }
      ]
    }
  ]
}
```

**3. データベース: RDS PostgreSQL**
```
RDS PostgreSQL
  ↓ VPC内で接続
ECS Fargate
  ↓
セキュリティグループで制御
```

**設定:**
- インスタンスタイプ: db.t3.micro（開発）/ db.t3.small（本番）
- Multi-AZ: 本番環境では有効化
- 自動バックアップ: 有効
- 暗号化: 有効

**4. その他のサービス**

**Active Storage用: S3**
```ruby
# config/storage.yml
amazon:
  service: S3
  access_key_id: <%= ENV['AWS_ACCESS_KEY_ID'] %>
  secret_access_key: <%= ENV['AWS_SECRET_ACCESS_KEY'] %>
  region: ap-northeast-1
  bucket: training-app-uploads
```

**バックグラウンドジョブ: Sidekiq + ElastiCache Redis**
```
ECS Fargate (Sidekiq)
  ↓ ジョブキュー
ElastiCache Redis
  ↑ ジョブ取得
ECS Fargate (Rails)
```

**ログ・監視: CloudWatch**
- ログ収集: CloudWatch Logs
- メトリクス: CPU, メモリ, リクエスト数
- アラーム: 異常検知時に通知

#### デプロイフロー（GitHub Actions）

```yaml
# .github/workflows/deploy-aws.yml
name: Deploy to AWS ECS

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build React App
        run: |
          cd frontend
          npm install
          npm run build
      
      - name: Deploy to S3
        run: |
          aws s3 sync frontend/dist s3://training-app-frontend --delete
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"

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
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster training-app-cluster \
            --service backend-service \
            --force-new-deployment
```

#### コスト試算（東京リージョン）

**社内ツール（50人、月間500〜1,000PV想定）:**
```
ECS Fargate (0.25vCPU, 0.5GB):  $30/月
RDS db.t3.micro:                 $15/月
ALB:                             $20/月
S3 (ストレージ+転送):             $1/月
Route 53:                         $1/月
------------------------------------
合計:                           $67/月
```

**注: 50人規模の社内ツールならオーバースペック**
- ALBは不要かもしれない（単一インスタンスで十分）
- RDSも小さいインスタンスで十分

**より現実的な構成（50人向け）:**
```
ECS Fargate (0.25vCPU, 0.5GB):  $30/月
RDS db.t4g.micro:                $12/月
S3 (ストレージ+転送):             $1/月
Route 53:                         $1/月
------------------------------------
合計:                           $44/月
```

**Vercel + Render比較（50人規模）:**
```
Vercel Hobby (個人用):          $0/月
Render Web Service:             $7/月
Render PostgreSQL:              $7/月
AWS S3 (画像保存):             $0.003/月（無視できる）
------------------------------------
合計:                          $14/月

または

Vercel Pro (商用):            $20/月
Render Web Service:            $7/月
Render PostgreSQL:             $7/月
AWS S3:                       $0.003/月
------------------------------------
合計:                         $34/月
```

**結論:**
- **社内ツール50人なら Vercel + Render で十分！**
- 月額$14（個人）または$34（商用）で運用可能
- AWSへの移行は必要になったら検討すればOK

#### なぜEKSではなくECSなのか？

**EKS（Kubernetes）が必要なケース:**
- ✅ マルチクラウド戦略（AWS以外も使う）
- ✅ Kubernetesの豊富なエコシステムが必要
- ✅ 大規模・複雑なマイクロサービス構成
- ✅ K8s経験豊富なチームがいる

**このプロジェクトでECSを推奨する理由:**
- ✅ AWS特化で十分（マルチクラウド不要）
- ✅ 学習コストが低い
- ✅ 運用が簡単（マネージド度が高い）
- ✅ コストが安い（EKSはコントロールプレーン料金が高い）
- ✅ 小〜中規模に最適

#### 移行戦略（Render → AWS）

**社内ツール（50人規模）の場合:**

**フェーズ1: Vercel + Render（推奨）**
- コスト: $14/月（個人）/ $34/月（商用）
- 開発期間: 1-2ヶ月
- ユーザー数: 50人
- **この規模ならずっとこの構成でOK！**

**フェーズ2: AWS ECS移行（将来的に必要なら）**
- コスト: $44/月〜
- 移行期間: 1週間
- 移行タイミング: 
  - ユーザー数が200人を超えた時
  - より高度な機能が必要になった時
  - 会社の方針でAWS統一が必要な時

**重要: 50人規模ならVercel + Renderで十分です**
- パフォーマンス的に全く問題なし
- コストも最小限
- AWS移行のメリットは少ない

**AWS移行を検討すべきケース:**
- ✅ ユーザー数が200人を超える
- ✅ トラフィックが急増する
- ✅ 複雑なバックグラウンドジョブが必要
- ✅ 他のAWSサービスとの連携が必要
- ✅ 会社の全システムをAWSで統一したい

---

## まとめ

### Q1: .devcontainer & Docker-in-Dockerのデプロイ
**A: 開発環境と本番環境は完全に独立。デプロイには影響しない。**

### Q2: Vercel + Renderにすんなりデプロイできるか
**A: はい、問題なくデプロイ可能。環境変数の設定だけ注意。**

### Q3: AWS移行時はECR + ECSがいいか
**A: はい、ECS Fargateが最適。学習コスト・運用コスト・スケーラビリティのバランスが良い。**

### 推奨デプロイ戦略

```
開発環境: .devcontainer (ローカル)
    ↓
MVP・初期: Vercel + Render ($14/月)
    ↓
成長期: AWS ECS + S3 ($71/月〜)
    ↓
拡大期: AWS ECS (Auto Scaling) ($200/月〜)
```

**ポイント:**
- 最初は低コストで素早く始める
- ユーザーが増えたらAWSに移行
- ECS Fargateでサーバーレスに運用
- 必要に応じてスケールアウト
