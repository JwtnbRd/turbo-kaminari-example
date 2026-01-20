---
description: TDDサイクルのRed段階。失敗するテストを作成し、次に実装すべき機能を明確にします
argument-hint: [feature-name]
allowed-tools: Write, Read, Bash
---

TDD（Test Driven Development）のRed段階を実行します。具体的な機能要件に対して、まず失敗するテストケースを作成し、実装すべき内容を明確にします。

## 実行内容

### Phase 1: テスト対象の明確化

**質問1: 実装対象機能**
今回のTDDサイクルで実装する機能を特定してください：

1. **新規機能の追加**
   - 具体的な機能名: $1
   - 期待される振る舞い
   - 入力と出力

2. **既存機能の拡張**
   - 拡張対象の機能
   - 追加される振る舞い
   - 既存機能への影響

3. **バグ修正**
   - 問題となっている振る舞い
   - 期待される正常な振る舞い
   - 再現条件

**質問2: テストレベル**
作成するテストのレベルを選択：

1. **単体テスト（Unit Test）** - 個別の関数・メソッド
2. **統合テスト（Integration Test）** - コンポーネント間の連携
3. **エンドツーエンドテスト（E2E Test）** - ユーザー視点の操作

### Phase 2: テストケース設計

Given-When-Then形式でテストケースを整理：

```
Given: [前提条件]
When: [実行する操作]
Then: [期待される結果]
```

### Phase 3: 失敗するテストの実装

技術スタックに応じたテストコードを作成：

**JavaScript/TypeScript (Jest)**
```javascript
describe('$1', () => {
  test('有効な情報で処理できる', () => {
    // Given
    const testData = { /* テストデータ */ };

    // When
    const result = targetFunction(testData);

    // Then
    expect(result).toBeDefined();
    expect(result.property).toBe(expectedValue);
  });
});
```

**Ruby (RSpec)**
```ruby
describe '$1' do
  it 'processes valid data' do
    # Given
    test_data = { }

    # When
    result = target_method(test_data)

    # Then
    expect(result).to be_present
    expect(result.property).to eq(expected_value)
  end
end
```

### Phase 4: テスト実行と結果確認

失敗するテストを実行して、実装が必要であることを確認：

```bash
# テスト実行
npm test        # JavaScript/TypeScript
bundle exec rspec  # Ruby
pytest          # Python
```

期待される結果：
- ✅ テストが実行される
- ❌ すべてのテストが失敗する
- ✅ 失敗理由が明確（実装がないため）

## 成果物

1. **テストファイル** - 新しく作成されたテストケース
2. **テスト実行結果** - 失敗したテストの一覧
3. **次ステップの計画** - Green段階での作業内容

Red段階を開始しますか？実装したい機能名を教えてください。