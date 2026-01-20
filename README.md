y# 開発環境セットアップ手順

## 前提条件

ホストマシンに以下をインストール：

- Docker 環境（Docker Desktop, Colima, Rancher Desktop 等）
- Visual Studio Code
- VS Code 拡張機能: Dev Containers
- Git

## セットアップ手順

### 1. リポジトリをクローン

```bash
git clone [リポジトリURL]
cd suku-suku-squat
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

初回起動時に認証を求められるので、付与されたライセンス情報を使用しつつ、画面の指示に沿って進める

### 4. 開発サーバーの起動

DevContainer 内のルートで以下コマンドを実行：

```bash
# 全サービス（Frontend, Backend, DB, Redis）を起動。基本的にはこれ一個で大丈夫
bash scripts/container-manage.sh start

# バックエンドのみ起動する場合
bash scripts/container-backend.sh start   # バックエンド + データベース

# フロントエンドのみ起動する場合
bash scripts/container-frontend.sh start
```

### アクセス URL

- Frontend (React): http://localhost:3000
- Backend (Rails): http://localhost:4000

## 開発フロー

DevContainer 内部では修正した差分のステージング、コミットまではできますが、push は外部との接続となるため失敗する可能性があります。
その際は push はホストマシンローカルのターミナルから push すれば OK です。

## よく使うコマンド

```bash
# サービスの状態確認
bash scripts/container-manage.sh status

# ログ確認
bash scripts/container-manage.sh logs

# 再起動
bash scripts/container-manage.sh restart

# 停止
bash scripts/container-manage.sh stop
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
docker exec workspace-backend-web-1 rails db:create
docker exec workspace-backend-web-1 rails db:migrate
docker-compose restart backend-web
```

### bundle/npm install が必要な場合

```bash
# Rails
docker exec workspace-backend-web-1 bundle install
docker-compose restart backend-web

# React
docker exec workspace-frontend-web-1 npm install
docker-compose restart frontend-web
```

### ポートが使用中

```bash
# 使用中のポートを確認
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# 該当プロセスを停止するか、docker-compose.ymlでポート変更
```

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
