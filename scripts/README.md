# データインポート

- スクリプト: `scripts/fetch-and-import.ts`
- 対象期間: 2023-06 〜 2025-10 の月次データ
- 取得先:
  - 使用率: `/stats/usagerate/{YYYYMM}`, `/stats/usagerate_master/{YYYYMM}`
  - ダイヤ: `/stats/dia/{YYYYMM}`, `/stats/dia_master/{YYYYMM}`
- 実行コマンド: `yarn db:import:stats`（ts-node/transpileは未設定。`ts-node` or `ts-node/register` を利用するか、事前に `tsc` でビルドして実行する）
- インポート先: SQLite `prisma/dev.db`（Prisma スキーマ準拠）
