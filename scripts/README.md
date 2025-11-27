# データインポート

- スクリプト: `scripts/fetch-and-import.ts`
- 対象期間: 2023-06 〜 2025-10 の月次データ
- 取得先:
  - 使用率: `/stats/usagerate/{YYYYMM}`, `/stats/usagerate_master/{YYYYMM}`
  - ダイヤ: `/stats/dia/{YYYYMM}`, `/stats/dia_master/{YYYYMM}`
- 実行コマンド: `yarn db:import:stats`（ts-node --transpile-only --compiler-options '{"module":"commonjs","moduleResolution":"node"}'）
- 取得データの保存先: `data/raw/{YYYYMM}/` に JSON を保存（usagerate/dia 全体・master）
- 注意: 公開 API への多数アクセスとなるため、スクリプト内で軽いインターバルを入れています。
- 403 回避用ヘッダー: 環境変数 `SF6_COOKIE`（ブラウザからコピーした Cookie 文字列）と `SF6_UA`（User-Agent 上書き）をセット可能。例:  
  `SF6_COOKIE="..." SF6_UA="Mozilla/5.0 ..." yarn db:import:stats`
- インポート先: SQLite `prisma/dev.db`（Prisma スキーマ準拠）
