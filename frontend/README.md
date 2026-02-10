# オシエージェント - フロントエンド

AI推し活マネージャー「オシエージェント」のフロントエンドアプリケーションです。

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **UI**: React 19
- **言語**: TypeScript 5
- **スタイリング**: Tailwind CSS 4
- **UIコンポーネント**: shadcn/ui (Radix UI)
- **認証**: NextAuth v5 (Google OAuth)
- **データベース**: Firebase Admin (Firestore)
- **バリデーション**: Zod
- **日付処理**: date-fns

## 環境変数

`.env.local.example` をコピーして `.env.local` を作成し、以下の環境変数を設定してください。

```bash
# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Firebase
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Python Backend
NEXT_PUBLIC_PYTHON_BACKEND_URL=http://localhost:8000

# Internal API
INTERNAL_API_KEY=your-internal-api-key

# Cloud Scheduler Auth Token
CLOUD_SCHEDULER_TOKEN=your-scheduler-token
```

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### 3. ビルド

```bash
npm run build
```

### 4. 本番サーバーの起動

```bash
npm start
```

## Dockerでの実行

```bash
# ビルド
docker build -t oshi-agent-frontend .

# 実行
docker run -p 3000:3000 \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e NEXTAUTH_SECRET=your-secret \
  -e GOOGLE_CLIENT_ID=your-id \
  -e GOOGLE_CLIENT_SECRET=your-secret \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json \
  -e NEXT_PUBLIC_PYTHON_BACKEND_URL=http://python-backend:8000 \
  -e INTERNAL_API_KEY=your-api-key \
  -e CLOUD_SCHEDULER_TOKEN=your-token \
  -v /path/to/service-account.json:/app/credentials.json:ro \
  oshi-agent-frontend
```

## ディレクトリ構成

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   ├── (dashboard)/       # ダッシュボード
│   ├── api/               # API Routes (BFF層)
│   └── globals.css        # グローバルスタイル
├── components/            # Reactコンポーネント
│   ├── features/          # 機能別コンポーネント
│   ├── layouts/           # レイアウトコンポーネント
│   ├── shared/            # 共通コンポーネント
│   └── ui/                # UIコンポーネント (shadcn/ui)
├── lib/                   # ライブラリ・ユーティリティ
│   ├── api-client/        # Python Backend APIクライアント
│   ├── auth/              # NextAuth設定
│   ├── firestore/         # Firestoreクライアント
│   └── utils/             # ユーティリティ関数
└── types/                 # TypeScript型定義
```

## 主な機能

### 1. 認証
- Google OAuthによるログイン
- セッション管理 (JWT)

### 2. タイムライン
- 推しに関する情報の一覧表示
- 優先度別フィルタリング
- 推し別フィルタリング

### 3. イベント管理
- イベント情報の表示
- Googleカレンダー連携

### 4. 遠征プラン
- AIによる遠征プラン生成
- 交通手段・宿泊施設の提案
- 予算目安の表示

### 5. 支出管理
- 支出の記録
- 月次レポート表示
- カテゴリ別・推し別集計

### 6. 設定
- 通知設定
- 予算管理設定
- カレンダー連携設定

## セキュリティ対策

1. **認証**: NextAuth v5によるセキュアな認証
2. **API保護**: すべてのAPI Routesでセッション検証
3. **内部API**: Python Backend通信時に`X-Internal-Api-Key`ヘッダーで保護
4. **ジョブAPI**: Cloud Scheduler用のトークン検証を実装
5. **型安全**: TypeScriptによる厳密な型チェック
6. **バリデーション**: Zodによる入力値検証

## 開発ガイドライン

### コーディング規約
- ファイル名: kebab-case
- コンポーネント名: PascalCase
- 関数名: camelCase
- 型/インターフェース名: PascalCase

### コンポーネント設計
- Server Componentsをデフォルトとする
- Client Componentsは必要な箇所のみ
- コンポーネントは150行以内を目安に分割
- Props型は必ず定義

### パフォーマンス
- 画像最適化 (next/image)
- 動的インポート活用
- React Suspense活用
- ローディング状態の実装

### アクセシビリティ
- セマンティックHTML
- ARIAラベルの適切な使用
- キーボード操作対応
- レスポンシブデザイン

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
