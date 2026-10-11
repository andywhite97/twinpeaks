# TwinPeaks frontend v2 — Phases 1–2

Independent Angular 20 application. Implemented: homepage, Solutions overview/detail, Projects overview/detail, shared UI/API/theme foundation and existing private quotation viewing/PDF/decisions. Other planned routes remain explicit development previews. See [Phase 2 report](docs/PHASE2_IMPLEMENTATION.md).

```powershell
npm ci
npm start
# http://127.0.0.1:4201 — uses http://127.0.0.1:8000/api
npm run build
```

See [architecture](docs/FRONTEND_V2_ARCHITECTURE.md) and [implementation report](docs/PHASE1_IMPLEMENTATION.md). No deployment is performed. Production builds select the production API; use development builds for local test data.

```powershell
$env:CHROME_BIN='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
npm test -- --browsers=ChromeHeadless
npm run build:qa
# Set PLAYWRIGHT_MODULE to an existing Playwright module path if it is not resolvable.
$env:PHASE2_QA='1'
npm run test:e2e
```

Browser checks reserve ports 18181/18182 and use a synthetic local API, including synthetic quotation decisions. They leave the development backend/frontend on 8000/4201 alone. Build QA immediately before browser checks; development and production builds point to different APIs. Phase 2 screenshots use clearly labeled synthetic portfolio fixtures and do not establish production records or project outcomes.

Phase 4 release assessment: [production readiness](docs/PHASE4_PRODUCTION_READINESS.md). Release remains blocked; no deployment is authorized by passing tests.

`npm run build` now generates byte-equivalent Brotli/gzip static derivatives using built-in Node tooling. Deploy the complete SSR/browser artifact; the Node host negotiates compression, validates hosts and supplies security/cache headers. A reverse proxy must preserve these policies. Do not deploy an optimized QA/local build.

```powershell
npx ng build --configuration qa,production --optimization=true --source-map=false
node scripts/precompress.cjs
$env:PHASE2_QA='1'
$env:PHASE3_QA='1'
$env:PHASE4_QA='1'
npm run test:e2e
# Optional actual-local public API checks, GET only:
npx ng build --configuration development,production --optimization=true --source-map=false
node scripts/precompress.cjs
node tests/readiness-local.cjs
```

The explicit optimization flag is needed when combining configurations because QA/development set optimization false. The local runner uses SSR port 18184 and API 8000. Playwright must already be available (`PLAYWRIGHT_MODULE` can point to an external installation). Custom accessibility/lab metrics are not a Lighthouse score, WCAG certification or operational production verification. Backend write tests use the existing isolated `twinpeaks.test_settings`, never the configured ordinary database/provider.
