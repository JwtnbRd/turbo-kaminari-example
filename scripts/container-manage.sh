#!/bin/bash

# 統合コンテナ管理スクリプト
# DevContainer内でDocker-in-Dockerを使用して全コンテナを一括管理

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Docker-in-Docker環境変数読み込み
if [ -f "${PROJECT_ROOT}/.env" ]; then
    source "${PROJECT_ROOT}/.env"
    export FRONTEND_SOURCE
    export BACKEND_SOURCE  
    export WORKSPACE_SOURCE
fi

# 色付き出力用の関数
log_info() {
    echo -e "\033[0;36m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[0;32m[SUCCESS]\033[0m $1"
}

log_error() {
    echo -e "\033[0;31m[ERROR]\033[0m $1"
}

# Dockerデーモンの起動を待つ
wait_for_docker() {
    log_info "Dockerデーモンの起動を待っています..."
    local max_attempts=30
    local attempt=0
    
    while ! docker info > /dev/null 2>&1; do
        attempt=$((attempt + 1))
        if [ $attempt -ge $max_attempts ]; then
            log_error "Dockerデーモンの起動がタイムアウトしました"
            exit 1
        fi
        sleep 1
    done
    log_success "Dockerデーモンが起動しました"
}

# サービス起動
start() {
    log_info "全サービスを起動中..."
    
    # プロジェクトルートに移動
    cd "${PROJECT_ROOT}"
    
    # docker-compose.ymlの存在確認
    if [ ! -f "docker-compose.yml" ]; then
        log_error "docker-compose.yml が ${PROJECT_ROOT} に見つかりません"
        exit 1
    fi
    
    # 通常のサービスを起動（testプロファイルは除外）
    docker-compose up -d frontend-web backend-web backend-db backend-redis
    
    # 起動状態を確認
    log_info "サービスの起動を確認中..."
    sleep 5
    
    # ヘルスチェック
    if docker-compose ps | grep -q "Up"; then
        log_success "全コンテナが正常に起動しました"
        
        # 実行中のサービスを表示
        docker-compose ps
        
        echo ""
        log_info "アクセスURL:"
        log_info "Frontend: http://localhost:3000"
        log_info "Backend:  http://localhost:4000"
        log_info "PostgreSQL: localhost:5432"
        log_info "Redis: localhost:6379"
    else
        log_error "一部のコンテナが起動に失敗しました"
        docker-compose ps
        docker-compose logs --tail=50
        exit 1
    fi
}

# サービス停止
stop() {
    log_info "全サービスを停止中..."
    
    cd "${PROJECT_ROOT}"
    docker-compose down
    
    log_success "全サービスが停止しました"
}

# サービス再起動
restart() {
    stop
    start
}

# ログ表示
logs() {
    cd "${PROJECT_ROOT}"
    
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# ステータス確認
status() {
    cd "${PROJECT_ROOT}"
    
    log_info "サービスステータス:"
    docker-compose ps
}

# テスト実行
test() {
    log_info "テストを実行中..."
    
    cd "${PROJECT_ROOT}"
    docker-compose --profile test run --rm backend-test
}

# ヘルプ表示
show_help() {
    cat << EOF
使用方法: $(basename "$0") [コマンド] [オプション]

コマンド:
    start       全サービスを起動
    stop        全サービスを停止
    restart     全サービスを再起動
    status      サービスの状態を表示
    logs [service]  ログを表示（サービス名は省略可能）
    test        テストを実行
    help        このヘルプを表示

例:
    $(basename "$0") start
    $(basename "$0") logs backend-web
    $(basename "$0") status
EOF
}

# メイン処理
main() {
    case "${1:-}" in
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        status)
            status
            ;;
        logs)
            logs "${2:-}"
            ;;
        test)
            test
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "不明なコマンド: ${1:-}"
            show_help
            exit 1
            ;;
    esac
}

# Dockerデーモンの起動を確認してからメイン処理を実行
wait_for_docker
main "$@"