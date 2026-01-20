# MVP実装ガイド - 最小限の機能で段階的に

## 🎯 重要な方針

### レビュー負荷を減らすために
- ✅ **1PR = 1機能** に絞る
- ✅ **差分は200行以内** を目標
- ✅ **動くものを小さく積み上げる**
- ❌ 一度に複数機能を実装しない
- ❌ 大きなリファクタリングを混ぜない

---

## 📝 実装順序（小さなステップで）

### Phase 0: 環境構築（1日）
```
PR#1: プロジェクト初期化
  - .devcontainer設定のみ
  - docker-compose.yml
  - README.md
  差分: 50行程度

PR#2: Railsプロジェクト作成
  - rails new backend --api
  - 基本的なGemfile
  差分: 100行程度

PR#3: Reactプロジェクト作成
  - npm create vite@latest frontend
  - 基本的なpackage.json
  差分: 100行程度
```

### Phase 1: 認証機能（2-3日）
```
PR#4: Deviseインストール
  - Devise gem追加
  - User model作成
  - マイグレーション実行
  差分: 150行程度

PR#5: 認証API実装
  - SessionsController
  - RegistrationsController
  - CORS設定
  差分: 150行程度

PR#6: フロントエンド認証
  - AuthContext
  - LoginForm
  - RegisterForm
  差分: 200行程度
```

### Phase 2: トレーニングマスタ管理（2-3日）
```
PR#7: Trainingモデル
  - Trainingモデル作成
  - マイグレーション
  - シードデータ
  差分: 100行程度

PR#8: 管理画面バックエンド
  - Admin::TrainingsController
  - Serializer
  差分: 150行程度

PR#9: 管理画面フロントエンド（一覧）
  - TrainingList コンポーネント
  - 一覧表示のみ
  差分: 100行程度

PR#10: 管理画面フロントエンド（作成）
  - TrainingForm コンポーネント
  - 新規作成機能のみ
  差分: 100行程度

PR#11: 画像アップロード
  - Cloudinary設定
  - 画像アップロード機能
  差分: 100行程度
```

### Phase 3: トレーニング実行（2日）
```
PR#12: トレーニング記録モデル
  - TrainingRecordモデル
  - API実装
  差分: 100行程度

PR#13: トレーニング選択画面
  - TrainingSelect コンポーネント
  差分: 100行程度

PR#14: トレーニング実行画面
  - TrainingExecution コンポーネント
  - カウントダウン機能
  差分: 150行程度
```

### Phase 4: ダッシュボード（1日）
```
PR#15: ユーザー統計
  - UserStatモデル
  - 統計API
  差分: 100行程度

PR#16: ダッシュボード画面
  - Dashboard コンポーネント
  差分: 150行程度
```

### Phase 5: カレンダー（1日）
```
PR#17: カレンダーAPI
  - CalendarDaysController
  差分: 100行程度

PR#18: カレンダー画面
  - CalendarView コンポーネント
  差分: 150行程度
```

### Phase 6: ランキング（1日）
```
PR#19: ランキングAPI
  - PointRankingsController
  - StreakRankingsController
  差分: 150行程度

PR#20: ランキング画面
  - RankingView コンポーネント
  差分: 100行程度
```

---

## 🚫 実装しない機能（MVP範囲外）

### やらないこと
- ❌ パスワードリセット機能（Deviseのデフォルト機能で十分）
- ❌ メール確認機能（社内ツールなので不要）
- ❌ プロフィール画像
- ❌ 通知機能
- ❌ アチーブメント/バッジ
- ❌ ソーシャル機能（いいね、コメント）
- ❌ データエクスポート
- ❌ Sidekiq（バックグラウンドジョブ）
- ❌ 複雑なバリデーション
- ❌ 詳細な権限管理（admin/user の2段階のみ）
- ❌ 監査ログ
- ❌ 多言語対応

### 最小限にする機能
- ⚠️ エラーハンドリング: 基本的なもののみ
- ⚠️ バリデーション: 必須項目チェック程度
- ⚠️ テスト: 重要な部分のみ（全機能は後回し）
- ⚠️ UI/UX: シンプルなデザイン（凝った装飾なし）

---

## 📐 コーディング規約（差分を小さく保つ）

### バックエンド（Rails）

#### 1. コントローラは薄く保つ
```ruby
# ✅ Good - シンプル
class Api::V1::TrainingsController < Api::V1::BaseController
  def index
    @trainings = Training.published.order(:display_order)
    render json: @trainings
  end
end

# ❌ Bad - 複雑すぎ
class Api::V1::TrainingsController < Api::V1::BaseController
  def index
    @trainings = Training.published
                        .includes(:category, :user)
                        .where(active: true)
                        .order(:display_order)
                        .page(params[:page])
    
    # 複雑な加工処理...
    render json: custom_serialization(@trainings)
  end
end
```

#### 2. バリデーションは最小限
```ruby
# ✅ Good - 必要最小限
class Training < ApplicationRecord
  validates :name, presence: true
  validates :duration, numericality: { greater_than: 0 }
end

# ❌ Bad - やりすぎ
class Training < ApplicationRecord
  validates :name, presence: true, 
                   length: { minimum: 3, maximum: 50 },
                   format: { with: /\A[a-zA-Z0-9\s]+\z/ },
                   uniqueness: { case_sensitive: false }
  validates :duration, numericality: { 
    greater_than: 0, 
    less_than: 3600,
    only_integer: true 
  }
  # 複雑なカスタムバリデーション...
end
```

#### 3. Serializerもシンプルに
```ruby
# ✅ Good - 必要な属性のみ
class TrainingSerializer < ActiveModel::Serializer
  attributes :id, :name, :duration, :base_points
end

# ❌ Bad - 不要な属性まで含める
class TrainingSerializer < ActiveModel::Serializer
  attributes :id, :name, :duration, :base_points, :created_at, 
             :updated_at, :deleted_at, :user_count, :average_rating
  
  has_many :training_records
  has_many :categories
  # 複雑な関連...
end
```

### フロントエンド（React）

#### 1. コンポーネントは小さく
```typescript
// ✅ Good - 1コンポーネント = 1責任
const TrainingCard: React.FC<{ training: Training }> = ({ training }) => {
  return (
    <div className="p-4 border rounded">
      <h3>{training.name}</h3>
      <p>{training.duration}秒</p>
    </div>
  );
};

// ❌ Bad - 複数の責任を持つ
const TrainingCard: React.FC<{ training: Training }> = ({ training }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // 複雑な状態管理...
  // 複雑なロジック...
  
  return (
    <div>
      {/* 複雑なUI... */}
    </div>
  );
};
```

#### 2. APIコールはカスタムフックに
```typescript
// ✅ Good - シンプルなフック
export const useTrainings = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const res = await api.get('/trainings');
      setTrainings(res.data);
      setLoading(false);
    };
    fetch();
  }, []);
  
  return { trainings, loading };
};

// ❌ Bad - 複雑すぎる
export const useTrainings = () => {
  // キャッシュ、リトライ、エラーハンドリング、
  // ページネーション、フィルタリング...など
  // 200行以上のコード
};
```

#### 3. スタイリングはTailwindのみ
```tsx
// ✅ Good - Tailwindのみ
<div className="p-4 bg-white rounded-lg shadow">
  <h2 className="text-2xl font-bold">タイトル</h2>
</div>

// ❌ Bad - カスタムCSSやstyled-components
const StyledDiv = styled.div`
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  // 複雑なCSS...
`;
```

---

## 📦 PRのテンプレート

```markdown
## 概要
- 〇〇機能を実装

## 変更内容
- ファイル名: 変更内容（簡潔に）
- ファイル名: 変更内容（簡潔に）

## テスト方法
1. 〇〇する
2. △△が表示される

## スクリーンショット（UI変更時のみ）
[画像]

## チェックリスト
- [ ] 動作確認済み
- [ ] コンフリクトなし
- [ ] 差分200行以内
```

---

## 🎯 MVP の定義（これだけできればOK）

### 管理者ができること
1. ログイン
2. トレーニングマスタ作成（名前、説明、時間、ポイント、画像）
3. トレーニングマスタ一覧表示
4. トレーニングマスタ編集
5. トレーニングマスタ削除

### 一般ユーザーができること
1. ユーザー登録
2. ログイン
3. ダッシュボード表示（累計ポイント、連続日数）
4. トレーニング選択
5. トレーニング実行（カウントダウン）
6. トレーニング記録保存
7. カレンダー表示（月次、日別ポイント）
8. ランキング表示（ポイント、連続日数）

**これ以外は実装しない！**

---

## 💡 実装のコツ

### 1. まず動くものを作る
```
完璧なコード × 動かない
  より
汚いコード ○ 動く
```

### 2. リファクタリングは別PR
```
PR#10: 機能実装
PR#11: リファクタリング（必要なら）
```

### 3. テストは重要な部分のみ
```
✅ 認証周り
✅ データ保存
❌ 画面表示
❌ スタイリング
```

### 4. エラーハンドリングは最小限
```ruby
# ✅ これで十分
rescue_from ActiveRecord::RecordNotFound, with: :not_found

def not_found
  render json: { error: 'Not found' }, status: :not_found
end
```

---

## 🚀 推奨開発フロー

```
1. ローカルで動作確認
   ↓
2. 小さな単位でコミット
   ↓
3. PR作成（差分200行以内）
   ↓
4. レビュー
   ↓
5. マージ
   ↓
6. 次の機能へ（繰り返し）
```

---

## まとめ

### やること
- ✅ 小さなPR（差分200行以内）
- ✅ 1PR = 1機能
- ✅ 動くものを積み上げる
- ✅ MVP機能のみ実装

### やらないこと
- ❌ 大きな差分
- ❌ 複雑な実装
- ❌ MVP範囲外の機能
- ❌ 過度な最適化

**シンプルに、小さく、確実に進める！**
