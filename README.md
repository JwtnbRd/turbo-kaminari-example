# Rails 8 Application

シンプルなRails 8アプリケーション

## 開発環境セットアップ

### 前提条件

ホストマシンに以下をインストール：

- Docker 環境（Docker Desktop, Colima, Rancher Desktop 等）
- Visual Studio Code
- VS Code 拡張機能: Dev Containers
- Git
- Ruby 3.3+
- Rails 8.0+

## セットアップ手順

### 1. 新規Rails アプリケーション作成

```bash
rails new . --database=postgresql --skip-test
```

### 2. DevContainer を起動

VS Code でプロジェクトを開き、以下のいずれかで起動：

- 右下の「Reopen in Container」をクリック
- または `Cmd/Ctrl + Shift + P` → 「Dev Containers: Reopen in Container」

※初回は 5-10 分程度かかります

### 3. Claude Code の起動

Claude は DevContainer 内のルートで稼働します。DevContainer 内のターミナルで以下を実行：

```bash
claude
# 直前のコンテキストを引き継ぐ際は
claude -c
```

### 4. Docker環境でのセットアップ

```bash
# Dockerfileがない場合は作成が必要
docker-compose build
docker-compose up -d db redis
docker-compose run --rm web bundle install
```

### 5. データベース初期化

```bash
docker-compose run --rm web rails db:create
docker-compose run --rm web rails db:migrate
```

### 6. アプリケーション起動

```bash
docker-compose up
```

### アクセス URL

- アプリケーション: http://localhost:3000

## Scaffoldでリソース生成

```bash
# 例：Postリソースの生成
docker-compose run --rm web rails generate scaffold Post title:string body:text published:boolean

# マイグレーション実行
docker-compose run --rm web rails db:migrate
```

## よく使うコマンド

```bash
# Railsコンソール
docker-compose run --rm web rails console

# Railsサーバー起動
docker-compose up

# データベースリセット
docker-compose run --rm web rails db:drop db:create db:migrate

# gem インストール
docker-compose run --rm web bundle install

# 新しいgemを追加後
docker-compose build
```

## トラブルシューティング

### コンテナが起動しない

```bash
# クリーンアップして再起動
docker-compose down -v
docker-compose build --no-cache
bash scripts/container-manage.sh start
```

### Rails のデータベースエラー

```bash
docker-compose run --rm web rails db:create
docker-compose run --rm web rails db:migrate
docker-compose restart web
```

### bundle install が必要な場合

```bash
# Rails
docker-compose run --rm web bundle install
docker-compose restart web
```

### ポートが使用中

```bash
# 使用中のポートを確認
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# 該当プロセスを停止するか、docker-compose.ymlでポート変更
```

## 技術スタック
- **Framework**: Ruby on Rails 8.0+
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Container**: Docker & Docker Compose

---

# MCP サーバーの設定

> **注意**: この設定内容は精査されておらず、正確性が保証されていません。

Claude Code で MCP サーバーを使用する設定です。

## 自動セットアップ

DevContainer 内で以下のスクリプトを実行：

```bash
# MCP サーバー設定スクリプトを作成
cat > ~/setup-mcp.sh << 'EOF'
#!/bin/bash

# Claude 設定ディレクトリ
CLAUDE_CONFIG_DIR="/home/node/.claude"
mkdir -p "$CLAUDE_CONFIG_DIR"

# 既存設定のバックアップ
if [ -f "$CLAUDE_CONFIG_DIR/claude_desktop_config.json" ]; then
    cp "$CLAUDE_CONFIG_DIR/claude_desktop_config.json" \
       "$CLAUDE_CONFIG_DIR/claude_desktop_config.json.backup"
fi

# Serena MCP と Tsumiki の設定
cat > "$CLAUDE_CONFIG_DIR/claude_desktop_config.json" << 'CONFIG'
{
    "mcpServers": {
        "serena": {
            "command": "npx",
            "args": ["-y", "@serena/mcp-server"],
            "env": {
                "WORKSPACE_DIR": "/workspace"
            }
        },
        "tsumiki": {
            "command": "npx",
            "args": ["-y", "@tsumiki/mcp-server"],
            "env": {}
        }
    }
}
CONFIG

echo "✅ MCP 設定完了。Claude Code を再起動してください"
EOF

# 実行
bash ~/setup-mcp.sh
```

## 手動設定

`~/.claude/claude_desktop_config.json` を編集：

```json
{
  "mcpServers": {
    "serena": {
      "command": "npx",
      "args": ["-y", "@serena/mcp-server"],
      "env": {
        "WORKSPACE_DIR": "/workspace"
      }
    },
    "tsumiki": {
      "command": "npx",
      "args": ["-y", "@tsumiki/mcp-server"],
      "env": {}
    }
  }
}
```

設定後、Claude Code を再起動して反映。

## MCP サーバーの確認

Claude Code で以下のように確認：

- "Available MCP servers"コマンドを実行
- または設定画面で MCP サーバーの状態を確認

# 🔗 関連資料

- [Docker-in-Docker 公式ドキュメント](https://docs.docker.com/engine/security/protect-access/#use-tls-https-to-protect-the-docker-daemon-socket)
- [VSCode DevContainers](https://code.visualstudio.com/docs/remote/containers)
- [Docker Compose](https://docs.docker.com/compose/)
