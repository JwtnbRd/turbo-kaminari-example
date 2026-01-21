# Kaminari ページネーション問題 デモアプリケーション

## 問題の説明

Rails 7/8環境でKaminariのページネーションリンクが、Turbo Stream更新時にPOST/PATCHパラメータによって汚染される問題を再現し、その解決策を実装したデモです。

## 🎨 UI改善機能

### ステータス表示
- **✅ confirmed**: 緑背景（承認済み）
- **📝 published**: 青背景（公開中）
- **📁 archived**: 赤背景（アーカイブ）
- **📄 draft**: 黄背景（下書き）

### アクションボタン
- **✅ Confirm**: 緑ボタン（未承認 → 承認）
- **🔄 Unconfirm**: 赤ボタン（承認済み → 下書きに戻す）
- ホバーエフェクト付き

## 再現手順

### 1. アプリケーション起動

```bash
rails server -p 3000
```

http://localhost:3000 にアクセス

### 2. 問題の再現

1. **初期状態の確認**
   - ページネーションリンクが正常（例: `/posts?page=2`）
   - 各投稿のステータスが色分け表示

2. **問題の発生**
   - ✅ Confirmボタンをクリック
   - ステータスが「confirmed」に変更（緑背景）
   - テーブルがTurbo Streamで更新される

3. **問題の確認**
   - ページネーションリンクにマウスホバーして確認
   - **問題**: URLが `/posts/ID?page=2` や `/posts/ID/confirm...` のようにPATCHリクエストの残骸を含む

4. **Unconfirm機能のテスト**
   - 🔄 Unconfirmボタンをクリック
   - ステータスが「draft」に戻る（黄背景）

### 3. 解決策の実装

現在は `_pagination.html.erb` パーシャルで解決策が適用済み：

```erb
<%
  # safe_params解決策
  safe_params = params.is_a?(Hash) ? params.except(:action, :controller, :authenticity_token, :_method) : {}
  safe_params = safe_params.merge(action: :index, id: nil)
%>
<%= paginate records, params: safe_params %>
```

## ファイル構成

### コントローラ
- `app/controllers/posts_controller.rb` - confirmアクション実装

### ビュー
- `app/views/posts/index.html.erb` - メインページ
- `app/views/posts/_posts_container.html.erb` - Turbo Stream更新対象
- `app/views/posts/_table_content.html.erb` - テーブル内容
- `app/views/posts/_pagination.html.erb` - 解決策適用のページネーション

### 設定
- `config/routes.rb` - confirmルート追加
- `config/initializers/kaminari_config.rb` - 5件/ページ設定

## Before/After比較

### Before（問題のある状態）
```erb
<!-- 汚染される -->
<%= paginate @posts %>
```
→ Confirm実行後、ページネーションリンクが `/posts/1/confirm?page=2` のように汚染される

### After（解決済み状態）
```erb
<!-- 洗浄される -->
<%= render 'pagination', records: @posts %>
```
→ Confirm実行後もページネーションリンクは正常な `/posts?page=2` を維持

## 技術詳細

- **Rails**: 8.0.4
- **Kaminari**: 1.2.2
- **Hotwire/Turbo**: 標準搭載
- **データベース**: SQLite3
- **データ**: 20件のサンプルPost（5件/ページで4ページ構成）

## 重要なポイント

1. **safe_params ロジック**：`params.except(:action, :controller, :authenticity_token, :_method)`
2. **Turbo Stream対応**：confirmアクション内で同じ構造を維持
3. **パーシャル分離**：ページネーション部分を独立したパーシャルに抽出