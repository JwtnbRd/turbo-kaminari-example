---
description: TDDサイクルのRefactor段階。Green段階で作成した動作するコードの品質を、テストを維持したまま向上させます
argument-hint:
allowed-tools: Write, Read, Edit, Bash
---

TDD（Test Driven Development）のRefactor段階を実行します。Green段階で作成された「動作するが品質が低い」コードを、テストが通り続けることを確認しながら、品質を向上させます。

## 実行内容

### Phase 1: リファクタリング対象の特定

**現在のコードの問題点を特定**

1. **コードの臭い（Code Smells）の検出**
   - 重複コード（Duplicated Code）
   - 長すぎるメソッド（Long Method）
   - 大きすぎるクラス（Large Class）
   - 長いパラメータリスト（Long Parameter List）
   - データクラス（Data Class）

2. **設計原則の確認**
   - SOLID原則の遵守
   - DRY（Don't Repeat Yourself）
   - YAGNI（You Aren't Gonna Need It）

**質問1: 優先すべきリファクタリング**
最も重要な改善点を選択：

1. **可読性の向上** - 変数名、メソッド名の改善
2. **重複の除去** - 共通処理の抽出
3. **責任の分離** - 単一責任原則の適用
4. **パフォーマンス改善** - 効率的なアルゴリズム
5. **拡張性向上** - 将来の変更に備えた設計

### Phase 2: 安全なリファクタリング

**原則: レッド・グリーン・リファクターサイクル**

重要な考え方：
- テストを壊さない
- 小さな変更を積み重ねる
- 各変更後にテストを実行
- 機能の振る舞いを変更しない

### Phase 3: 基本的なリファクタリング

**1. 変数・メソッド名の改善**

Before:
```javascript
function calc(x, y) {
  return x * y * 0.1;
}
```

After:
```javascript
function calculateTaxAmount(price, quantity) {
  const TAX_RATE = 0.1;
  return price * quantity * TAX_RATE;
}
```

**2. マジックナンバーの定数化**

Before:
```javascript
function isAdult(age) {
  return age >= 18;
}
```

After:
```javascript
const ADULT_AGE_THRESHOLD = 18;

function isAdult(age) {
  return age >= ADULT_AGE_THRESHOLD;
}
```

**3. メソッド抽出（Extract Method）**

Before:
```javascript
function processOrder(order) {
  // バリデーション
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must have items');
  }

  // 税額計算
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.quantity;
  }
  const tax = total * 0.1;

  return { total, tax, finalAmount: total + tax };
}
```

After:
```javascript
function processOrder(order) {
  validateOrder(order);
  const subtotal = calculateSubtotal(order.items);
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;

  return { subtotal, tax, total };
}

function validateOrder(order) {
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must have items');
  }
}

function calculateSubtotal(items) {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function calculateTax(amount) {
  const TAX_RATE = 0.1;
  return amount * TAX_RATE;
}
```

### Phase 4: 設計パターンの適用

**Strategy Pattern の適用例**

Before:
```javascript
function calculateShipping(type, weight) {
  if (type === 'standard') {
    return weight * 5;
  } else if (type === 'express') {
    return weight * 10;
  } else if (type === 'overnight') {
    return weight * 20;
  }
  throw new Error('Unknown shipping type');
}
```

After:
```javascript
class ShippingStrategy {
  calculate(weight) {
    throw new Error('Must implement calculate method');
  }
}

class StandardShipping extends ShippingStrategy {
  calculate(weight) {
    return weight * 5;
  }
}

class ExpressShipping extends ShippingStrategy {
  calculate(weight) {
    return weight * 10;
  }
}

class ShippingCalculator {
  constructor(strategy) {
    this.strategy = strategy;
  }

  calculate(weight) {
    return this.strategy.calculate(weight);
  }
}
```

### Phase 5: テスト実行と品質チェック

**継続的テスト実行**
```bash
# ウォッチモードでテスト実行
npm test -- --watch
bundle exec rspec --watch

# 変更のたびに実行
git add . && npm test
```

**静的解析ツールの活用**
```bash
# ESLint (JavaScript/TypeScript)
npx eslint src/

# RuboCop (Ruby)
bundle exec rubocop

# Code Coverage
npm run coverage
```

### Phase 6: パフォーマンス最適化

**配列操作の最適化**
```javascript
// Before: 複数回のループ
const result = items
  .filter(item => item.active)
  .map(item => item.name)
  .filter(name => name.length > 3);

// After: 1回のループ
const result = items.reduce((acc, item) => {
  if (item.active && item.name.length > 3) {
    acc.push(item.name);
  }
  return acc;
}, []);
```

**メモ化の適用**
```javascript
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveFunction = memoize((n) => {
  return fibonacci(n);
});
```

## チェックリスト

### 基本的な品質確認
- [ ] すべてのテストが通る
- [ ] コードに重複がない
- [ ] 関数・クラス・変数名が適切
- [ ] マジックナンバーが定数化されている
- [ ] 1つの関数が1つの責任を持つ

### 設計品質の確認
- [ ] SOLID原則が守られている
- [ ] 適切なレベルで抽象化されている
- [ ] 依存関係が適切に管理されている
- [ ] 拡張しやすい構造になっている

### パフォーマンス確認
- [ ] 不要な処理が削除されている
- [ ] 効率的なアルゴリズムが使われている
- [ ] メモリリークがない

## 成果物

1. **改善されたコードベース** - 可読性・保守性・パフォーマンスの向上
2. **テスト結果** - すべてのテストが継続して通ること
3. **品質レポート** - 静的解析・パフォーマンス測定結果

## 注意事項

- **機能を変更しない** - 振る舞いはそのまま保つ
- **小さな変更を積み重ねる** - 大規模な変更は避ける
- **テストを頻繁に実行** - 変更のたびに確認
- **過剰なリファクタリングを避ける** - 必要十分な改善に留める

Refactor段階を開始しますか？現在のコードの品質分析から始めましょう。