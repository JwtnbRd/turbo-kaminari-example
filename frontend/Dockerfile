# Node.js 20をベースイメージとして使用
FROM node:20-alpine

# 作業ディレクトリの設定
WORKDIR /app

# ユーザーを追加（セキュリティ向上）
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係のインストール（開発用も含む）
RUN npm ci

# アプリケーションコードをコピー
COPY . .

# nodeユーザーに権限を付与
RUN chown -R nextjs:nodejs /app
USER nextjs

# ポート3000を開放
EXPOSE 3000

# 開発サーバーの起動
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]