# Blood Lab Flashcards

医学検査値の暗記をサポートするフラッシュカードアプリケーション。

## 技術スタック

- Vite
- React
- TypeScript
- Tailwind CSS (CDN)

## ローカル開発環境のセットアップ

### 必要条件

- Node.js (v14以上)
- npm

### インストール手順

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

開発サーバーが起動したら、ブラウザで [http://localhost:5173](http://localhost:5173) にアクセスしてください。

### ビルド

```bash
# 本番用にビルド
npm run build
```

ビルドされたファイルは `dist/` ディレクトリに出力されます。

## GitHub Pages へのデプロイ手順

このプロジェクトは GitHub Actions を使用して自動デプロイされます。

1. リポジトリの Settings > Pages でソースを `gh-pages` ブランチに設定
2. `main` ブランチに変更をプッシュすると、GitHub Actions が自動的にビルドして `gh-pages` ブランチにデプロイ
3. アプリケーションは以下の URL で公開されます：
   https://yuta-884.github.io/blood-lab-flashcards/

### 機能

- PWA（Progressive Web App）対応 - オフラインでも使用可能
- ダークモード対応 - OS設定に自動追従と手動切替
- サウンドフィードバック - 操作音で学習体験を向上
