# Repository Guidelines

## 基本方針

- すべての回答・コミュニケーションは必ず日本語で行うこと（最優先事項）。
- 記述は簡潔・具体的にし、不要な敬語や冗長表現を避ける。

## プロジェクト構成

- `app/` に Next.js App Router のページとレイアウトを配置。`app/page.tsx` がトップビュー、`app/layout.tsx` がメタデータと共有ラッパー。グローバルスタイルは `app/globals.css`。
- `public/` は静的アセット置き場（favicon, 画像）。参照は絶対パス（例: `/logo.svg`）で行う。
- 主な設定ファイルは `next.config.ts`、`tsconfig.json`、`eslint.config.mjs`、`postcss.config.mjs`、Tailwind v4 の設定。ロックファイルは `package-lock.json`。
- 機能別のユーティリティは利用箇所付近に置き、小さく目的特化のコンポーネントを優先。

## ビルド・テスト・開発コマンド

- `npm run dev` — 開発サーバーを <http://localhost:3000> で起動。
- `npm run build` — 本番ビルド作成。リリース前のコンパイルチェックに必須。
- `npm start` — 本番ビルドをローカル配信し動作確認。
- `npm run lint` — Next.js 設定付き ESLint。コミット前に必ず実行。

## コーディング規約・命名

- 技術スタック: TypeScript + React 19 + Next.js 16 (App Router) + Tailwind 4。
- フォーマット: インデント2スペース、シングルクォート推奨、適用可能な箇所で末尾カンマ可。import は階層の浅い順→アルファベット順。
- コンポーネントは PascalCase (`PlayerCard.tsx`)、フックやユーティリティは camelCase (`useMatchData`, `formatStats`)。ファイル名はデフォルトエクスポートに合わせる。
- コンポーネントは軽量に保ち、デフォルトはサーバーコンポーネント。インタラクションが必要な場合のみ `"use client"` を付与。
- 型安全を優先し、`any` の使用は避ける。API レスポンス型は薄いインターフェースでもよいので共有定義を作成。

## テスト指針

- 現状、自動テストは未設定。追加する場合は対象機能に近い `app/` 配下へ配置（例: `app/(feature)/__tests__/component.test.tsx`）。
- 大きな UI 変更前に高速レンダリングと基本的インタラクションをカバーするテストを推奨。React Testing Library の利用を想定。
- 回帰防止のため、主要なルート/コンポーネントごとに最低1つのスモークテストを用意し、失敗時はビルドを落とす運用を想定。
- CI を導入する場合は `npm run lint` と `npm run build` を必須ジョブに設定。

## コミット・PR ガイド

- コミットメッセージは命令形で簡潔に（例: `Add match summary card`, `Fix build error on lint`）。無関係な変更をまとめない。
- PR では変更内容、必要理由、検証手順（使用コマンド）、フォローアップを記載。UI 変更はスクリーンショットや動画を添付。
- 関連 Issue/タスクを本文で参照。レビュー依頼前に `npm run lint` と本番ビルドを実行または結果を明記。
- ブランチは `feature/<topic>` または `fix/<topic>` など用途が分かる名前を推奨。

## 環境設定・秘密管理

- 環境変数は `.env.local` に記述し、バージョン管理に含めない。必要なキーがあれば README か PR 説明に明記。
- 外部 API を叩く場合は server component で処理し、クライアントに秘密情報を渡さない。fetch は Next.js のキャッシュポリシーを適切に設定。
- Tailwind v4 は CSS ファイルで `@import "tailwindcss";` を使う。カスタムトークンは極力共通レイヤーにまとめ、クラス名の乱立を避ける。
- デプロイは Next.js 標準のビルド成果物を想定（Vercel 互換）。`npm run build` を通したアーティファクトのみを配備する。
- i18n 設定は未導入。今後追加する場合はルート単位の分割と翻訳キー命名規則を事前に決めてから着手すること。
