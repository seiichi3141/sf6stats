# テスト環境まとめ

## ユニットテスト（Jest）

- 設定: `jest.config.mjs`（next/jest.js を使用、`testEnvironment: jest-environment-jsdom`）。
- セットアップ: `jest.setup.ts`（拡張マッチャー等をここに追加）。
- 配置ルール: 各対象ディレクトリ配下に `__tests__` を作成し、その中に `.test.ts/.test.tsx` を置く。例: `app/__tests__/smoke.test.ts`。
- 実行:
  - `yarn test` または `yarn test:unit`（カバレッジ取得付き）。
  - フラグ例: `--runInBand` で逐次実行。
- カバレッジ: `coverage/` に出力（Git 追跡外）。

## E2E テスト（Playwright）

- 設定: `playwright.config.ts`
  - `webServer`: `yarn dev` を自動起動し `http://localhost:3000`（`PLAYWRIGHT_BASE_URL` で上書き可）。
  - プロジェクト: `chromium` のみ（Safari/Firefox は無効化）。
  - トレース/スクリーンショット/ビデオ: 失敗時に保存。
- 配置: `tests/e2e/` 配下（例: `tests/e2e/home.spec.ts`）。
- 実行:
  - `yarn test:e2e --project=chromium`
  - GUI で確認する場合: `yarn test:e2e:headed`
- 成果物: `test-results/`, `playwright-report/` は `.gitignore` 済み。

## コマンド一覧

- `yarn test`: Jest 実行
- `yarn test:unit`: Jest + カバレッジ
- `yarn test:e2e --project=chromium`: Playwright（自動で dev サーバー起動）
- `yarn test:e2e:headed`: ヘッドありで Playwright（Chromium）
