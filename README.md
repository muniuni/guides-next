# n-GUIDES

## 概要

n-GUIDESは、感性評価システムGUIDES（The General and Universal Image Data Evaluation System）をNext.jsで実装した移植版です。スライダーを用いた画像の感性評価プロジェクトを簡単に作成・共有できるプラットフォームを提供します。

## デモ

[https://guides-next-ids.vercel.app](https://guides-next-ids.vercel.app)

## 技術スタック

- Next.js 15 (App Router)
- React 19
- TypeScript
- Prisma ORM + PostgreSQL
- NextAuth（認証）
- AWS S3（画像ストレージ）
- Material-UI (MUI)
- Recharts
- react-markdown + remark-gfm（Markdownレンダリング）

## 主な機能

- ユーザー認証（サインアップ / ログイン / ログアウト）
- プロジェクト作成・編集・削除
- 画像アップロード（AWS S3）
- 画像感性評価（スライダーUI）
- メトリクスダッシュボード（チャート表示）
- 評価結果のCSVエクスポート
- Markdown対応のプロジェクト説明・同意フォーム

## インストール

### 前提条件

- Node.js v18以上
- PostgreSQL
- AWSアカウント（S3バケット）

### クローンと依存関係のインストール

```bash
git clone https://github.com/muniuni/guides-next.git
cd guides-next
npm install
```

### 環境変数の設定

プロジェクトルートに`.env.local`ファイルを作成し、以下を設定してください：

```dotenv
# データベース
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
# 認証
NEXTAUTH_SECRET="任意のランダム文字列"
NEXTAUTH_URL="http://localhost:3000"
# API
NEXT_API_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"
# AWS S3
AWS_REGION="ap-northeast-1"
AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
S3_BUCKET_NAME="your-s3-bucket-name"
```

### データベースのマイグレーション

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで[http://localhost:3000](http://localhost:3000)にアクセスしてください。

## ライセンス

MIT License. 詳細は`LICENSE`ファイルを参照してください。

## 参照

GUIDES（オリジナル）: [https://github.com/iiojun/guides](https://github.com/iiojun/guides)
