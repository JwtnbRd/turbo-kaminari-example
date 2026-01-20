---
description: TDDサイクルのGreen段階。Red段階で作成した失敗するテストを最小限の実装で通します
argument-hint:
allowed-tools: Write, Read, Edit, Bash
---

TDD（Test Driven Development）のGreen段階を実行します。Red段階で作成された失敗するテストケースを、最小限の実装で通すことに集中します。

## 実行内容

### Phase 1: 失敗テストの分析

**現在の失敗状況を分析**

1. **テスト実行結果の確認**
   ```bash
   # 失敗テストの詳細を確認
   npm test -- --verbose
   bundle exec rspec --format documentation
   pytest -v
   ```

2. **失敗理由の分類**
   - メソッド/関数が存在しない
   - クラス/モジュールが存在しない
   - 戻り値が期待値と異なる
   - 例外が発生していない/異なる例外

### Phase 2: 最小限の実装

**原則: 最小限の実装でテストを通す**

重要な考え方：
- 完璧な実装は行わない
- テストが通る最小限のコードのみ
- パフォーマンスや拡張性は後で考える
- コードの美しさより動作を優先

**質問1: 実装アプローチ**
最小限でテストを通すための方針を選択：

1. **スタブ実装** - 固定値を返す
2. **フェイク実装** - 動作するが不完全
3. **部分実装** - 一部機能のみ実装

### Phase 3: 段階的実装

**ステップ1: 基本構造の作成**

存在しないクラス/関数の作成例：

**JavaScript/TypeScript**
```javascript
class TargetService {
  static process(data) {
    // 最初は何もしない、またはエラーを投げる
    throw new Error('Not implemented');
  }
}

module.exports = TargetService;
```

**Ruby**
```ruby
class TargetService
  def self.process(data)
    # 最初は何もしない、またはエラーを投げる
    raise 'Not implemented'
  end
end
```

**ステップ2: テストを通すための実装**

段階的にテストを通していく：

1. **正常系テストを通す最小実装**
2. **異常系テストを通すための実装追加**

例：
```javascript
class TargetService {
  static process(data) {
    // バリデーション追加
    if (!data || !data.required_field) {
      throw new Error('Invalid input');
    }

    return {
      id: 1, // 固定値
      result: 'success'
    };
  }
}
```

### Phase 4: テスト実行と確認

**実装後のテスト実行**
```bash
# 全テスト実行
npm test
bundle exec rspec
pytest

# 特定のテストファイルのみ
npm test target.test.js
bundle exec rspec spec/target_spec.rb

# ウォッチモードで継続的実行
npm test -- --watch
```

**期待される結果**
- ✅ Red段階で作成したテストがすべて通る
- ✅ 既存のテストも引き続き通る
- ✅ 新しい機能が動作する

**よくある問題と対処**

1. **テストが通らない場合**
   - 実装とテストの期待値を再確認
   - エラーメッセージの詳細を分析

2. **既存テストが壊れた場合**
   - 回帰バグの発生
   - 既存機能への影響を最小化

### Phase 5: 実装の妥当性確認

**手動での動作確認**
- 実際にアプリケーションを動かしてテスト
- エラーケースの動作確認
- 統合的な動作の確認

## 実装パターン例

### パターン1: スタブから段階的実装

```javascript
// Step 1: スタブ実装
function calculate(amount) {
  return 0; // 最初は固定値
}

// Step 2: 簡単なロジック追加
function calculate(amount) {
  return amount * 0.1; // 10%固定
}

// Step 3: より複雑なロジック
function calculate(amount) {
  if (amount < 1000) return 0;
  return amount * 0.1;
}
```

### パターン2: データ構造の段階的実装

```javascript
// Step 1: 空の実装
class Repository {
  findById(id) {
    return null;
  }

  save(entity) {
    return entity;
  }
}

// Step 2: インメモリ実装
class Repository {
  constructor() {
    this.data = new Map();
    this.nextId = 1;
  }

  findById(id) {
    return this.data.get(id) || null;
  }

  save(entity) {
    if (!entity.id) {
      entity.id = this.nextId++;
    }
    this.data.set(entity.id, entity);
    return entity;
  }
}
```

## 成果物

1. **動作するコード** - テストを通す最小限の実装
2. **テスト実行結果** - すべてのテストが通ることの確認
3. **リファクタリング計画** - Refactor段階での作業予定

## 注意事項

- **完璧を求めない** - 最小限の実装に徹する
- **テストファーストを維持** - テストが要求する以上は実装しない
- **既存機能を壊さない** - 回帰テストを必ず実行

Green段階を開始しますか？現在の失敗テストを確認して実装を始めましょう。