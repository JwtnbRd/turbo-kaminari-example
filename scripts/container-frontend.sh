#!/bin/bash

# Frontend (React) コンテナ管理スクリプト
# DevContainer内でDocker-in-Dockerを使用してfrontendコンテナを管理

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"
COMPOSE_FILE="${FRONTEND_DIR}/docker-compose.yml"

# Docker-in-Docker環境変数読み込み
if [ -f "${PROJECT_ROOT}/.env" ]; then
    source "${PROJECT_ROOT}/.env"
    export FRONTEND_SOURCE
    export BACKEND_SOURCE
    export WORKSPACE_SOURCE
fi

# 色付きログ出力
log_info() { echo -e "\033[0;36m[INFO]\033[0m $1"; }
log_success() { echo -e "\033[0;32m[SUCCESS]\033[0m $1"; }
log_warn() { echo -e "\033[0;33m[WARN]\033[0m $1"; }
log_error() { echo -e "\033[0;31m[ERROR]\033[0m $1"; }

# 使用方法表示
show_help() {
    echo "使用方法: $0 [start|stop|restart|status|logs|shell|clean|help]"
    echo ""
    echo "コマンド:"
    echo "  start   - フロントエンドコンテナ起動（React）"
    echo "  stop    - フロントエンドコンテナ停止"
    echo "  restart - フロントエンドコンテナ再起動"
    echo "  status  - フロントエンドコンテナ状態確認"
    echo "  logs    - フロントエンドコンテナログ表示 (オプション: -f で追跡)"
    echo "  shell   - Reactコンテナのシェルを開く"
    echo "  clean   - フロントエンドコンテナ・ボリューム完全削除"
    echo "  help    - このヘルプを表示"
    echo ""
}

# Docker環境確認
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Dockerがインストールされていません"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker daemonにアクセスできません"
        exit 1
    fi

    if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
        log_error "docker composeが利用できません"
        exit 1
    fi
}

# プロジェクト構造確認
check_project_structure() {
    if [ ! -d "${FRONTEND_DIR}" ]; then
        log_error "frontendディレクトリが見つかりません: ${FRONTEND_DIR}"
        exit 1
    fi

    if [ ! -f "${COMPOSE_FILE}" ]; then
        log_error "docker-compose.ymlが見つかりません: ${COMPOSE_FILE}"
        exit 1
    fi
}

# バックエンドネットワーク確認
ensure_backend_network() {
    if ! docker network ls | grep -q "kana_board_backend_default"; then
        log_info "バックエンドネットワークが見つかりません。バックエンドを先に起動します..."
        "${PROJECT_ROOT}/scripts/container-backend.sh" start
        sleep 5
    fi
}

# フロントエンドコンテナ起動
start_frontend() {
    log_info "フロントエンドコンテナを起動中..."
    
    cd "${FRONTEND_DIR}"
    
    ensure_backend_network
    
    # 環境変数ファイルの確認
    if [ ! -f ".env.local" ]; then
        log_warn ".env.localファイルが見つかりません。基本的な.env.localファイルを作成します..."
        cat > .env.local << 'ENV_EOF'
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=/kana-board/api/v1
BACKEND_API_URL=http://web:3001
ALLOWED_ORIGINS=http://localhost:3000,https://p.kanamic.net
ENV_EOF
    fi
    
    # Docker Compose使用（dockerコマンドではcompose）
    if command -v docker compose &> /dev/null; then
        docker compose up -d
    else
        docker-compose up -d
    fi
    
    # 起動確認（最大60秒待機）
    log_info "コンテナの起動を確認中..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if command -v docker compose &> /dev/null; then
            if docker compose ps --filter "status=running" | grep -q "app"; then
                break
            fi
        else
            if docker-compose ps | grep "Up" | grep -q "app"; then
                break
            fi
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    # 最終状態確認
    show_status
    
    if command -v docker compose &> /dev/null; then
        RUNNING_CHECK=$(docker compose ps --filter "status=running" | grep "app" || echo "")
    else
        RUNNING_CHECK=$(docker-compose ps | grep "Up" | grep "app" || echo "")
    fi
    
    if [ -n "$RUNNING_CHECK" ]; then
        log_success "フロントエンドコンテナが正常に起動しました"
        log_info "React: http://localhost:3000"
        log_info "ログ確認: ${0} logs"
    else
        log_warn "コンテナの起動に時間がかかっています。ログを確認してください: ${0} logs"
    fi
}

# フロントエンドコンテナ停止
stop_frontend() {
    log_info "フロントエンドコンテナを停止中..."
    
    cd "${FRONTEND_DIR}"
    
    if command -v docker compose &> /dev/null; then
        docker compose down
    else
        docker-compose down
    fi
    
    log_success "フロントエンドコンテナを停止しました"
}

# フロントエンドコンテナ再起動
restart_frontend() {
    log_info "フロントエンドコンテナを再起動中..."
    stop_frontend
    sleep 2
    start_frontend
}

# コンテナ状態表示
show_status() {
    log_info "=== フロントエンドコンテナ状態 ==="
    
    cd "${FRONTEND_DIR}"
    
    if command -v docker compose &> /dev/null; then
        if docker compose ps | grep -q "app"; then
            docker compose ps
            echo ""
            
            # ポート情報
            log_info "=== ポート情報 ==="
            docker compose port app 3000 2>/dev/null || echo "React: ポート情報取得できません"
        else
            log_warn "フロントエンドコンテナは起動していません"
        fi
    else
        if docker-compose ps | grep -q "app"; then
            docker-compose ps
            echo ""
            
            # ポート情報
            log_info "=== ポート情報 ==="
            docker-compose port app 3000 2>/dev/null || echo "React: ポート情報取得できません"
        else
            log_warn "フロントエンドコンテナは起動していません"
        fi
    fi
    
    echo ""
    # ネットワーク情報
    log_info "=== ネットワーク情報 ==="
    docker network ls | grep "kana_board_backend" || echo "バックエンドネットワークが見つかりません"
}

# コンテナログ表示
show_logs() {
    log_info "=== フロントエンドコンテナログ ==="
    
    cd "${FRONTEND_DIR}"
    
    local follow_flag=""
    if [ "$2" = "-f" ] || [ "$2" = "--follow" ]; then
        follow_flag="-f"
    fi
    
    if command -v docker compose &> /dev/null; then
        if [ -n "$follow_flag" ]; then
            docker compose logs -f
        else
            docker compose logs --tail=50
        fi
    else
        if [ -n "$follow_flag" ]; then
            docker-compose logs -f
        else
            docker-compose logs --tail=50
        fi
    fi
}

# Reactコンテナシェル
open_shell() {
    log_info "=== Reactコンテナのシェルを開いています ==="
    
    cd "${FRONTEND_DIR}"
    
    if command -v docker compose &> /dev/null; then
        docker compose exec app bash
    else
        docker-compose exec app bash
    fi
}

# コンテナ・ボリューム完全削除
clean_frontend() {
    log_warn "フロントエンドコンテナとデータを完全削除します"
    read -p "本当に実行しますか？ (y/N): " -r
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "${FRONTEND_DIR}"
        
        log_info "コンテナとボリュームを削除中..."
        if command -v docker compose &> /dev/null; then
            docker compose down -v --remove-orphans
        else
            docker-compose down -v --remove-orphans
        fi
        
        # 残存イメージ削除
        docker images | grep "kana_board_frontend" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
        
        log_success "フロントエンド環境を完全削除しました"
    else
        log_info "削除をキャンセルしました"
    fi
}

# メイン処理
main() {
    # Docker環境確認
    check_docker
    check_project_structure
    
    case "${1:-help}" in
        "start")
            start_frontend
            ;;
        "stop")
            stop_frontend
            ;;
        "restart")
            restart_frontend
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$@"
            ;;
        "shell")
            open_shell
            ;;
        "clean")
            clean_frontend
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

main "$@"