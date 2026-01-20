#!/bin/bash

# DevContainer開発環境停止スクリプト
# DevContainer内でDocker-in-Dockerを使用した開発環境を包括的に停止

set -e

# 設定変数（汎用化）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# ディレクトリ名の設定（ポート自動取得前に必要）
FRONTEND_DIR="${FRONTEND_DIR:-frontend}"
BACKEND_DIR="${BACKEND_DIR:-backend}"

# Docker Compose設定からポート情報を自動取得する関数
get_compose_ports() {
    local compose_file="$1"
    local dir="$2"
    
    if [ -f "$compose_file" ] && command -v docker compose &> /dev/null; then
        cd "$dir" 2>/dev/null || return 1
        # docker-compose.ymlからポート設定を抽出（published側のポートを取得）
        docker compose config 2>/dev/null | grep 'published:' | sed -E 's/.*published:\s*"([0-9]+)".*/\1/' | tr '\n' ' ' | sed 's/ *$//'
        cd "${PROJECT_ROOT}" 2>/dev/null || true
    fi
}

# ポート情報の自動取得（フォールバック付き）
FRONTEND_PORTS_AUTO=$(get_compose_ports "${PROJECT_ROOT}/${FRONTEND_DIR}/docker-compose.yml" "${PROJECT_ROOT}/${FRONTEND_DIR}")
BACKEND_PORTS_AUTO=$(get_compose_ports "${PROJECT_ROOT}/${BACKEND_DIR}/docker-compose.yml" "${PROJECT_ROOT}/${BACKEND_DIR}")

# 停止対象の設定（自動取得 → 環境変数 → デフォルト値の順で決定）
FRONTEND_PORTS="${FRONTEND_PORTS:-${FRONTEND_PORTS_AUTO:-4000}}"
BACKEND_PORTS="${BACKEND_PORTS:-${BACKEND_PORTS_AUTO:-3000}}"
DATABASE_PORTS="${DATABASE_PORTS:-5432}"
CHECK_PORTS="${CHECK_PORTS:-${FRONTEND_PORTS} ${BACKEND_PORTS} ${DATABASE_PORTS}}"

# プロセス停止対象の設定
NODEJS_PROCESSES="${NODEJS_PROCESSES:-npm run dev next dev webpack esbuild}"
RAILS_PROCESSES="${RAILS_PROCESSES:-rails server puma}"
DATABASE_PROCESSES="${DATABASE_PROCESSES:-postgres}"

# 色付きログ出力
log_info() { echo -e "\033[0;36m[INFO]\033[0m $1"; }
log_success() { echo -e "\033[0;32m[SUCCESS]\033[0m $1"; }
log_warn() { echo -e "\033[0;33m[WARN]\033[0m $1"; }
log_error() { echo -e "\033[0;31m[ERROR]\033[0m $1"; }

log_info "=== DevContainer開発環境停止 ==="
log_info "実行日時: $(date)"
log_info "実行ユーザー: $(whoami)"

# デバッグ情報（環境変数DEBUGが設定されている場合のみ表示）
if [ -n "$DEBUG" ]; then
    echo ""
    log_info "--- ポート自動取得デバッグ情報 ---"
    log_info "フロントエンドポート (自動取得): '${FRONTEND_PORTS_AUTO}'"
    log_info "バックエンドポート (自動取得): '${BACKEND_PORTS_AUTO}'"
    log_info "フロントエンドポート (最終): '${FRONTEND_PORTS}'"
    log_info "バックエンドポート (最終): '${BACKEND_PORTS}'"
    log_info "確認対象ポート: '${CHECK_PORTS}'"
fi

# Docker環境確認と停止
if command -v docker &> /dev/null && docker info &> /dev/null 2>&1; then
    echo ""
    log_info "--- 開発コンテナ停止 ---"
    
    # Serena MCP サーバー停止 (Claude Code管理)
    log_info "Serena MCP サーバーを停止中..."
    if command -v claude &> /dev/null; then
        claude mcp remove serena 2>/dev/null || true
        log_info "Serena MCPサーバーの停止を試行しました"
    else
        log_info "Claude Code CLIが見つからないため、MCP停止をスキップします"
    fi
    
    # 統合管理スクリプトを使用してコンテナ停止
    "${SCRIPT_DIR}/container-manage.sh" stop
    
    log_success "開発コンテナの停止が完了しました"
else
    echo ""
    log_warn "--- Docker環境利用不可 ---"
    log_info "コンテナクリーンアップをスキップします"
fi

# 開発サーバー停止
echo ""
log_info "--- ローカル開発サーバー停止 ---"

# Node.js開発サーバー停止
log_info "Node.js開発サーバーを停止中..."
for process in $NODEJS_PROCESSES; do
    pkill -f "$process" 2>/dev/null || true
done
# ポート別のNode.jsプロセス停止
for port in $FRONTEND_PORTS; do
    pkill -f "node.*$port" 2>/dev/null || true
done

# Rails開発サーバー停止
log_info "Rails開発サーバーを停止中..."
for process in $RAILS_PROCESSES; do
    pkill -f "$process" 2>/dev/null || true
done
# ポート別のRubyプロセス停止
for port in $BACKEND_PORTS; do
    pkill -f "ruby.*$port" 2>/dev/null || true
done

# データベース関連プロセス停止（DevContainer外のローカルプロセスのみ）
log_info "ローカルデータベースプロセスを停止中..."
for process in $DATABASE_PROCESSES; do
    pkill -f "$process.*localhost" 2>/dev/null || true
done

log_success "ローカル開発サーバーの停止が完了しました"

# ポート確認
echo ""
log_info "--- ポート状態確認 ---"
for port in $CHECK_PORTS; do
    if command -v lsof &> /dev/null && lsof -i :$port >/dev/null 2>&1; then
        log_warn "ポート $port はまだ使用中です"
        lsof -i :$port
    else
        log_info "ポート $port は解放されています"
    fi
done

# 一時ファイルクリーンアップ
echo ""
log_info "--- 一時ファイルクリーンアップ ---"
cd "${PROJECT_ROOT}"

if [ -d "${FRONTEND_DIR}" ]; then
    log_info "フロントエンドの一時ファイルをクリーンアップ中..."
    cd "${FRONTEND_DIR}"
    rm -rf .next/cache 2>/dev/null || true
    rm -rf tmp 2>/dev/null || true
    cd "${PROJECT_ROOT}"
fi

if [ -d "${BACKEND_DIR}" ]; then
    log_info "バックエンドの一時ファイルをクリーンアップ中..."
    cd "${BACKEND_DIR}"
    rm -rf tmp/cache 2>/dev/null || true
    rm -rf tmp/pids 2>/dev/null || true
    cd "${PROJECT_ROOT}"
fi

log_success "一時ファイルクリーンアップが完了しました"

echo ""
log_info "--- コンテナクリーンアップ（オプション） ---"
if command -v docker &> /dev/null && docker info &> /dev/null 2>&1; then
    log_info "停止コンテナと未使用リソースをクリーンアップできます"
    log_info "実行方法: ./scripts/container-manage.sh clean"
else
    log_info "コンテナクリーンアップは不要です"
fi

echo ""
log_success "=== 開発環境停止完了 ==="
log_success "全ての開発プロセスが終了しました"
log_info "環境はシャットダウンまたは再起動の準備ができています"