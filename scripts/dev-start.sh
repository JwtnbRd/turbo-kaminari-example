#!/bin/bash

# DevContainer環境起動スクリプト
# monorepo対応版

set -e

echo "=== DevContainer Development Environment Setup ==="
echo "Date: $(date)"
echo "User: $(whoami)"
echo "Working Directory: $(pwd)"

# 環境変数設定
export NODE_ENV=development
export RAILS_ENV=development

# Docker-in-Docker環境変数確認
echo ""
echo "--- Docker-in-Docker Environment Variables Check ---"
if [ -f ".env" ]; then
    echo "✅ .env file found"
    if grep -q "WORKSPACE_SOURCE" .env && grep -q "BACKEND_SOURCE" .env && grep -q "FRONTEND_SOURCE" .env; then
        echo "✅ Docker-in-Docker environment variables configured"
        source .env
        echo "   WORKSPACE_SOURCE: ${WORKSPACE_SOURCE}"
        echo "   BACKEND_SOURCE: ${BACKEND_SOURCE}"
        echo "   FRONTEND_SOURCE: ${FRONTEND_SOURCE}"
    else
        echo "⚠️  .env file exists but missing required variables"
        echo "   Running environment variable generation script..."
        if [ -f "scripts/generate-workspace-env.sh" ]; then
            bash scripts/generate-workspace-env.sh
            source .env
        else
            echo "❌ Environment variable generation script not found"
        fi
    fi
else
    echo "⚠️  .env file not found"
    echo "   Creating Docker-in-Docker environment variables..."
    if [ -f "scripts/generate-workspace-env.sh" ]; then
        bash scripts/generate-workspace-env.sh
        if [ -f ".env" ]; then
            source .env
            echo "✅ Environment variables generated and loaded"
        else
            echo "❌ Failed to generate environment variables"
        fi
    else
        echo "❌ Environment variable generation script not found"
    fi
fi

# Node.js環境確認
echo ""
echo "--- Node.js Environment Check ---"
if command -v node &> /dev/null; then
    echo "Node.js version: $(node --version)"
    echo "npm version: $(npm --version)"
else
    echo "ERROR: Node.js not found"
    exit 1
fi

# Ruby環境確認
echo ""
echo "--- Ruby Environment Check ---"
if command -v ruby &> /dev/null; then
    echo "Ruby version: $(ruby --version)"
    echo "Gem version: $(gem --version)"
    echo "Bundler version: $(bundle --version)"
else
    echo "ERROR: Ruby not found"
    exit 1
fi

# Frontend依存関係インストール
echo ""
echo "--- Frontend Dependencies Check ---"
if [ -d "frontend" ]; then
    echo "✅ Frontend directory exists"
    if [ -f "frontend/package.json" ]; then
        echo "✅ package.json found"
        if [ -f "frontend/Dockerfile" ]; then
            echo "✅ Dockerfile found"
        else
            echo "⚠️  Dockerfile not found in frontend directory"
        fi
        if [ -f "frontend/docker-compose.yml" ]; then
            echo "✅ docker-compose.yml found"
        else
            echo "⚠️  docker-compose.yml not found in frontend directory"
        fi
        
        cd frontend
        if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
            echo "Installing frontend dependencies..."
            if npm install; then
                echo "✅ Frontend dependencies installed successfully"
            else
                echo "❌ Failed to install frontend dependencies"
                cd ..
                exit 1
            fi
        else
            echo "✅ Frontend dependencies already up to date"
        fi
        cd ..
    else
        echo "❌ package.json not found in frontend directory"
    fi
else
    echo "❌ Frontend directory not found"
fi

# Backend依存関係インストール
echo ""
echo "--- Backend Dependencies Check ---"
if [ -d "backend" ]; then
    echo "✅ Backend directory exists"
    if [ -f "backend/Gemfile" ]; then
        echo "✅ Gemfile found"
        if [ -f "backend/Dockerfile" ]; then
            echo "✅ Dockerfile found"
        else
            echo "⚠️  Dockerfile not found in backend directory"
        fi
        if [ -f "backend/docker-compose.yml" ]; then
            echo "✅ docker-compose.yml found"
        else
            echo "⚠️  docker-compose.yml not found in backend directory"
        fi
        
        cd backend
        if [ ! -d "vendor/bundle" ] || [ "Gemfile" -nt "vendor/bundle" ]; then
            echo "Installing backend dependencies..."
            if bundle install --path vendor/bundle; then
                echo "✅ Backend dependencies installed successfully"
            else
                echo "❌ Failed to install backend dependencies"
                cd ..
                exit 1
            fi
        else
            echo "✅ Backend dependencies already up to date"
        fi
        cd ..
    else
        echo "❌ Gemfile not found in backend directory"
    fi
else
    echo "❌ Backend directory not found"
fi

# Docker環境確認とオプション
echo ""
echo "--- Docker Environment Check ---"

# Docker socket権限設定
if [ -S /var/run/docker.sock ]; then
    if sudo chown root:docker /var/run/docker.sock 2>/dev/null && sudo chmod 660 /var/run/docker.sock 2>/dev/null; then
        echo "Docker socket permissions: configured"
    else
        echo "Docker socket permissions: unable to configure (may need sudo)"
    fi
fi

if command -v docker &> /dev/null; then
    echo "Docker version: $(docker --version 2>/dev/null || echo 'Docker CLI installed')"
    if docker info &> /dev/null 2>&1; then
        echo "Docker daemon: accessible"
        DOCKER_AVAILABLE=true
        
        # ボリュームマウント状態確認（Docker-in-Docker環境）
        if [ -n "${DEVCONTAINER}" ] && [ -n "${WORKSPACE_SOURCE}" ]; then
            echo ""
            echo "--- Docker-in-Docker Volume Mount Check ---"
            # ホストパスアクセス確認
            if docker run --rm -v "${WORKSPACE_SOURCE}:/test" alpine test -d "/test" 2>/dev/null; then
                echo "✅ Volume mount test successful"
                echo "   Host path accessible: ${WORKSPACE_SOURCE}"
            else
                echo "❌ Volume mount test failed"
                echo "   Host path may not be accessible: ${WORKSPACE_SOURCE}"
                echo "   Container startup may fail"
            fi
        fi
        
    else
        echo "Docker daemon: not accessible"
        DOCKER_AVAILABLE=false
    fi
else
    echo "Docker: not available"
    DOCKER_AVAILABLE=false
fi


# 開発環境の準備完了
echo ""
echo "=== Development Environment Ready ==="
echo "Frontend: http://localhost:3000 (direct) / http://localhost:4000 (container)"
echo "Backend:  http://localhost:3001 (direct) / http://localhost:3000 (container)" 
echo "PostgreSQL: localhost:5432"
echo ""

if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "🐳 Container-based Development:"
    echo "  Start all containers: ./scripts/container-manage.sh start"
    echo "  Backend only:         ./scripts/container-backend.sh start"  
    echo "  Frontend only:        ./scripts/container-frontend.sh start"
    echo "  Container status:     ./scripts/container-manage.sh status"
    echo ""
    
    # 子コンテナ自動起動オプション
    if [ "$1" = "--containers" ] || [ "$1" = "-c" ]; then
        echo "🚀 Auto-starting containers..."
        if ./scripts/container-manage.sh start; then
            echo "✅ All containers started successfully"
        else
            echo "❌ Failed to start some containers"
            echo "   Check container logs for details"
        fi
        echo ""
    elif [ "$1" = "--backend-only" ] || [ "$1" = "-b" ]; then
        echo "🚀 Auto-starting backend containers..."
        if ./scripts/container-backend.sh start; then
            echo "✅ Backend containers started successfully"
        else
            echo "❌ Failed to start backend containers"
            echo "   Check backend logs: ./scripts/container-backend.sh logs"
        fi
        echo ""
    elif [ "$1" = "--frontend-only" ] || [ "$1" = "-f" ]; then
        echo "🚀 Auto-starting frontend containers..."
        if ./scripts/container-frontend.sh start; then
            echo "✅ Frontend containers started successfully"
        else
            echo "❌ Failed to start frontend containers"
            echo "   Check frontend logs: ./scripts/container-frontend.sh logs"
        fi
        echo ""
    else
        echo "💡 Add flags to auto-start containers:"
        echo "  --containers/-c     Auto-start all containers"
        echo "  --backend-only/-b   Auto-start backend only"
        echo "  --frontend-only/-f  Auto-start frontend only"
        echo ""
    fi
fi

# Claude Code & Serena MCP自動起動
echo ""
echo "--- Claude Code & Serena MCP Environment Setup ---"
if command -v claude &> /dev/null; then
    echo "✅ Claude Code CLI found"
    
    # Claude Code設定ディレクトリの確認と作成
    CLAUDE_CONFIG_DIR="${CLAUDE_CONFIG_DIR:-/home/node/.claude}"
    if [ ! -d "$CLAUDE_CONFIG_DIR" ]; then
        echo "📁 Creating Claude config directory: $CLAUDE_CONFIG_DIR"
        mkdir -p "$CLAUDE_CONFIG_DIR"
    fi
    
    # Serena MCP接続状況確認と自動起動
    echo "🔍 Checking Serena MCP connection status..."
    
    MCP_RETRY_COUNT=0
    MCP_MAX_RETRIES=3
    MCP_CONNECTED=false
    
    while [ $MCP_RETRY_COUNT -lt $MCP_MAX_RETRIES ] && [ "$MCP_CONNECTED" = false ]; do
        if [ $MCP_RETRY_COUNT -gt 0 ]; then
            echo "🔄 Retry attempt $MCP_RETRY_COUNT/$MCP_MAX_RETRIES..."
            sleep 2
        fi
        
        # MCP接続状況確認
        if claude mcp list 2>/dev/null | grep -q "serena.*Connected"; then
            echo "✅ Serena MCP server already connected"
            MCP_CONNECTED=true
        else
            echo "⚠️  Serena MCP server not connected, attempting to add..."

            # uvx availability check
            if ! command -v uvx &> /dev/null; then
                echo "⚠️  uvx not found, checking PATH..."
                export PATH="/home/node/.local/bin:$PATH"
                if ! command -v uvx &> /dev/null; then
                    echo "❌ uvx still not found after PATH update"
                    echo "   Installing uv/uvx..."
                    if curl -LsSf https://astral.sh/uv/install.sh | sh; then
                        export PATH="/home/node/.local/bin:$PATH"
                        echo "✅ uv/uvx installed successfully"
                    else
                        echo "❌ Failed to install uv/uvx"
                        MCP_RETRY_COUNT=$MCP_MAX_RETRIES  # Skip further retries
                        continue
                    fi
                else
                    echo "✅ uvx found after PATH update"
                fi
            fi

            # Serena MCP追加
            if claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena-mcp-server --context ide-assistant --project /workspace 2>/dev/null; then
                echo "✅ Serena MCP server added successfully"

                # 接続確認
                sleep 1
                if claude mcp list 2>/dev/null | grep -q "serena.*Connected"; then
                    echo "✅ Serena MCP connection verified"
                    MCP_CONNECTED=true
                else
                    echo "❌ Serena MCP connection verification failed"
                fi
            else
                echo "❌ Failed to add Serena MCP server"
            fi
        fi
        
        MCP_RETRY_COUNT=$((MCP_RETRY_COUNT + 1))
    done
    
    if [ "$MCP_CONNECTED" = true ]; then
        echo "🎉 Serena MCP server is ready for use!"
    else
        echo "⚠️  Serena MCP server connection failed after $MCP_MAX_RETRIES attempts"
        echo "   Manual setup may be required: claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena-mcp-server --context ide-assistant --project /workspace"
    fi
    
else
    echo "⚠️  Claude Code CLI not found"
    echo "   Serena MCP auto-setup skipped"
fi

echo ""
echo "📝 Direct Development:"
echo "  Frontend: cd frontend && npm run dev"
echo "  Backend:  cd backend && bundle exec rails server -p 3001"
echo ""
echo "🤖 AI Assistant:"
echo "  Serena MCP: AI-powered development assistance available in Claude Code"
echo ""
echo "Happy coding! 🚀"