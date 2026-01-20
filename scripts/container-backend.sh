#!/bin/bash

# Backend (Rails + PostgreSQL) コンテナ管理スクリプト  
# DevContainer内でDocker-in-Dockerを使用してbackendコンテナを管理

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${PROJECT_ROOT}/backend"
COMPOSE_FILE="${BACKEND_DIR}/docker-compose.yml"

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
    echo "使用方法: $0 [start|stop|restart|status|logs|shell|clean|setup|help]"
    echo ""
    echo "コマンド:"
    echo "  start   - バックエンドコンテナ起動（PostgreSQL + Rails）"
    echo "  stop    - バックエンドコンテナ停止"
    echo "  restart - バックエンドコンテナ再起動"  
    echo "  status  - バックエンドコンテナ状態確認"
    echo "  logs    - バックエンドコンテナログ表示 (オプション: -f で追跡)"
    echo "  shell   - Railsコンテナのシェルを開く"
    echo "  clean   - バックエンドコンテナ・ボリューム完全削除"
    echo "  setup   - 初期セットアップ（bundle install + db:setup）"
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
    if [ ! -d "${BACKEND_DIR}" ]; then
        log_error "backendディレクトリが見つかりません: ${BACKEND_DIR}"
        exit 1
    fi

    if [ ! -f "${COMPOSE_FILE}" ]; then
        log_error "docker-compose.ymlが見つかりません: ${COMPOSE_FILE}"
        exit 1
    fi
}

# バックエンドコンテナ起動
start_backend() {
    log_info "バックエンドコンテナを起動中..."
    
    cd "${BACKEND_DIR}"
    
    # 環境変数ファイルの確認
    if [ ! -f ".env" ]; then
        log_warn ".envファイルが見つかりません。基本的な.envファイルを作成します..."
        cat > .env << 'ENV_EOF'
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY=test_primary_key_32_characters_long
ACTIVE_RECORD_ENCRYPTION_DETERMINISTIC_KEY=test_deterministic_key_32_chars
ACTIVE_RECORD_ENCRYPTION_KEY_DERIVATION_SALT=test_salt_32_characters_long
ENV_EOF
    fi
    
    # 既存の問題のあるネットワークを削除（compose用に適切に作成し直すため）
    docker network rm kana_board_backend_default 2>/dev/null || true
    
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
            if docker compose ps --filter "status=running" | grep -q "web"; then
                break
            fi
        else
            if docker-compose ps | grep "Up" | grep -q "web"; then
                break
            fi
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    # 最終状態確認
    show_status
    
    if command -v docker compose &> /dev/null; then
        RUNNING_CHECK=$(docker compose ps --filter "status=running" | grep "web" || echo "")
    else
        RUNNING_CHECK=$(docker-compose ps | grep "Up" | grep "web" || echo "")
    fi
    
    if [ -n "$RUNNING_CHECK" ]; then
        log_success "バックエンドコンテナが正常に起動しました"
        log_info "Rails: http://localhost:3001"
        log_info "PostgreSQL: localhost:5432"
        log_info "ログ確認: ${0} logs"
    else
        log_warn "コンテナの起動に時間がかかっています。ログを確認してください: ${0} logs"
    fi
}

# バックエンドコンテナ停止
stop_backend() {
    log_info "バックエンドコンテナを停止中..."
    
    cd "${BACKEND_DIR}"
    
    if command -v docker compose &> /dev/null; then
        docker compose down
    else
        docker-compose down
    fi
    
    log_success "バックエンドコンテナを停止しました"
}

# バックエンドコンテナ再起動
restart_backend() {
    log_info "バックエンドコンテナを再起動中..."
    stop_backend
    sleep 2
    start_backend
}

# コンテナ状態表示
show_status() {
    log_info "=== バックエンドコンテナ状態 ==="
    
    cd "${BACKEND_DIR}"
    
    if command -v docker compose &> /dev/null; then
        if docker compose ps | grep -q "web"; then
            docker compose ps
            echo ""
            
            # ポート情報
            log_info "=== ポート情報 ==="
            docker compose port web 3001 2>/dev/null || echo "Rails: ポート情報取得できません"
            docker compose port postgresql 5432 2>/dev/null || echo "PostgreSQL: ポート情報取得できません"
        else
            log_warn "バックエンドコンテナは起動していません"
        fi
    else
        if docker-compose ps | grep -q "web"; then
            docker-compose ps
            echo ""
            
            # ポート情報
            log_info "=== ポート情報 ==="
            docker-compose port web 3001 2>/dev/null || echo "Rails: ポート情報取得できません"
            docker-compose port postgresql 5432 2>/dev/null || echo "PostgreSQL: ポート情報取得できません"
        else
            log_warn "バックエンドコンテナは起動していません"
        fi
    fi
    
    echo ""
    # ネットワーク情報
    log_info "=== ネットワーク情報 ==="
    docker network ls | grep "kana_board_backend" || echo "ネットワークが見つかりません"
}

# コンテナログ表示
show_logs() {
    log_info "=== バックエンドコンテナログ ==="
    
    cd "${BACKEND_DIR}"
    
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

# Railsコンテナシェル
open_shell() {
    log_info "=== Railsコンテナのシェルを開いています ==="
    
    cd "${BACKEND_DIR}"
    
    if command -v docker compose &> /dev/null; then
        docker compose exec web bash
    else
        docker-compose exec web bash
    fi
}

# コンテナ・ボリューム完全削除
clean_backend() {
    log_warn "バックエンドコンテナとデータを完全削除します"
    read -p "本当に実行しますか？ (y/N): " -r
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "${BACKEND_DIR}"
        
        log_info "コンテナとボリュームを削除中..."
        if command -v docker compose &> /dev/null; then
            docker compose down -v --remove-orphans
        else
            docker-compose down -v --remove-orphans
        fi
        
        # 残存イメージ削除
        docker images | grep "kana_board_backend" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
        
        log_success "バックエンド環境を完全削除しました"
    else
        log_info "削除をキャンセルしました"
    fi
}

# 初期セットアップ
setup_backend() {
    log_info "=== バックエンド初期セットアップ開始 ==="
    
    cd "${BACKEND_DIR}"
    
    # コンテナが起動しているか確認
    if command -v docker compose &> /dev/null; then
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi
    
    # PostgreSQLコンテナの起動確認
    if ! $COMPOSE_CMD ps | grep -q "postgresql.*Up"; then
        log_warn "PostgreSQLコンテナが起動していません。まず '${0} start' を実行してください"
        exit 1
    fi
    
    log_info "Step 1: Bundle install実行中..."
    if $COMPOSE_CMD run --rm web bundle install; then
        log_success "Bundle install完了"
    else
        log_error "Bundle installに失敗しました"
        exit 1
    fi
    
    log_info "Step 2: データベースセットアップ実行中..."
    if $COMPOSE_CMD run --rm web rails db:setup; then
        log_success "データベースセットアップ完了"
    else
        log_error "データベースセットアップに失敗しました"
        exit 1
    fi
    
    log_success "=== バックエンド初期セットアップ完了 ==="
    log_info "Rails: http://localhost:3001"
    log_info "PostgreSQL: localhost:5432"
}

# メイン処理
main() {
    # Docker環境確認
    check_docker
    check_project_structure
    
    case "${1:-help}" in
        "start")
            start_backend
            ;;
        "stop")
            stop_backend
            ;;
        "restart")
            restart_backend
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
            clean_backend
            ;;
        "setup")
            setup_backend
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

main "$@"