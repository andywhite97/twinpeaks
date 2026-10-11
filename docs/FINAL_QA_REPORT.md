# Final Phase 4 QA report

Date: 11 October 2026. Result: **frontend checks pass; production release is blocked** by the matrix in [PHASE4_PRODUCTION_READINESS](PHASE4_PRODUCTION_READINESS.md). No deployment, production submission/payment/customer decision, backend edit or credential change occurred.

## Environments and evidence separation

| Environment | What was exercised | Limits |
|---|---|---|
| Isolated Angular QA | Optimized build; mock API 18181, SSR/browser 18182; synthetic company/services/projects/contact/quotation responses | Functional/contract regressions only; not live backend/provider proof |
| Actual local Django + v2 | Public APIs on 8000; optimized development-origin SSR on 18184; published local content; GET-only browser checks and media HEAD | Confirms this local dataset/connectivity, not production records/operations |
| Isolated Django tests | Existing `twinpeaks.test_settings`; SQLite `:memory:`, in-memory storage, mocked notification paths | Actual Django code, synthetic records; no PostgreSQL locking or real provider delivery |
| Production read-only HTTP probes | Existing frontend public pages, robots/sitemaps and public backend company/services/projects/leaders/homepage endpoints | One-time availability/header observations; no private links, form writes or payments |

Runtime: bundled **Node 24.19.0**, Angular framework/compiler 20.3.33, CLI/build/SSR 20.3.39, headless Edge 156 on Windows. Existing dependencies were used; no package installation/update or lockfile change. Angular/browser worker checks used approved local execution. No Lighthouse or axe package was available; custom accessibility checks are labeled accordingly.

## Final test results

Evidence is in `front-v2/test-results/` unless a `phase4/` subpath is shown.

| Check | Result | Evidence |
|---|---|---|
| Final production pipeline | Passed, exit 0; **368.20kB initial raw / 100.94kB estimated transfer**, within 500kB warning/750kB error budgets; production environment + static precompression | `phase4-build-production.log`, `phase4-production-artifact.json` |
| Optimized isolated QA build | Passed, exit 0; explicit optimization and source-map false | `phase4-build-optimized-qa.log`, `phase4-qa-compression.json` |
| Optimized local API build | Passed, exit 0 | `phase4-build-optimized-local.log`, `phase4-local-compression.json` |
| Angular units | **71 passed**, exit 0; 64 previous tests + 7 Phase 4 additions | `phase4-unit-tests.log` |
| Browser/SSR regressions | **41 passed**, exit 0; all previous 34 scenarios + 7 Phase 4 scenarios | `phase4-browser-checks.log`, `phase4/phase4-browser-results.json` |
| Custom accessibility | **18 page/theme audits passed** for asserted DOM/contrast checks | `phase4/phase4-custom-accessibility.json` |
| Actual local public pages | **13 routes; 156 theme/width checks**, zero browser errors; requests GET only | `phase4-local-checks.log`, `phase4/local-readonly-and-performance.json` |
| Django system checks | Passed: no issues | `phase4-django-check.log` |
| Existing Django contact/core tests | **12 passed**, exit 0; isolated SQLite; notification mocks | `phase4-django-isolated-tests.log` |
| Runtime dependency audit | **0 advisories**, exit 0 | `phase4-npm-runtime-audit.json` |
| Full dependency audit | **6 high, 0 critical**; exit 1 indicates advisories | `phase4-npm-audit.json` |
| Production/local environment literals | Production API present; local/QA APIs absent from final browser JS | `phase4-production-artifact.json` |
| Build asset hygiene | No production browser maps; unused original concept PNG excluded; source remains; gzip/Brotli derivatives present | `phase4-production-artifact.json` |
| Source preservation | 531 existing files compared; 425 protected legacy/backend/lockfile entries unchanged | `phase4-source-preservation.json` |
| Content distinction | Local model counts/public responses recorded without customer access | `phase4-local-content-counts.json`, `phase4-content-and-live-url-evidence.json` |

Final on-disk `dist/front-v2/` is the **production** artifact with compressed static derivatives. It was built only, not deployed. Earlier optimized local/QA artifacts used different origins and must not be substituted for it.

Karma logged a browser-shutdown warning in one preliminary successful run; final command results are reported by exit code/test counts. An initial combined QA/production configuration retained QA's optimization=false and failed its bundle budget; explicit `--optimization=true --source-map=false` corrected the **test build command**. It was not a production-bundle regression, and failed preliminary checks are not counted as passes. A content inventory import was corrected to the actual `core.models.CompanyProfile` path; the final guarded ORM inventory completed.

## Functional/security coverage

Retained checks cover homepage empty/loading/error states, theme startup/system/manual/blocked-storage behavior, mobile modal focus/Escape/restore, skip link/reduced motion and token-free private metadata/referrers. Phase 2 checks cover all solutions, mapping absence/error/retry, project filtering/detail/gallery/404/503/related context. Phase 3 checks cover validation, supported payload fields/custom multiselect items, conditional company fields, review, duplicate guards, 400/429/503/network loss/malformed responses, preserved values and explicit retry acknowledgement.

Phase 4 adds: unknown route 404 without URL replacement; permanent public aliases; basic security/cache headers; untrusted Host rejection before static files; compression negotiation/byte equivalence; DOM/contrast checks; invalid/review/edit keyboard focus; and private decision outcome validation/status reload. No real token was fetched. Existing isolated Django tests exercise actual view/PDF/accept/conflict/decline/privacy contracts with synthetic records; this does not establish production PDF operation or resolve unsafe markup/state races.

The actual local route set comprises homepage, Solutions, all six solution details, Projects, its one published detail, About, Contact and Request Quote. Both themes were checked at **320, 375, 390, 768, 1024 and 1440px**. Source/API endpoints remain unchanged. A GET to a real private quotation/PDF can mutate viewed/expiry state, so it was intentionally excluded.

## Accessibility assessment against relevant WCAG 2.2 AA checks

| Criterion area | Tested finding | Remaining review |
|---|---|---|
| 1.3.1 / 4.1.2 structure, name/role | One main/h1, language, unique IDs, labels, descriptions, image alternatives; native forms/dialog/buttons | Real screen-reader announcements, order and component semantics |
| 1.4.3 text contrast | Retained theme token checks meet normal-text AA on tested surfaces/buttons | Actual photographic overlays/zoom/high-contrast modes and every dynamic state |
| 1.4.11 non-text contrast | Dedicated field-border tokens; minimum computed border/background ratio **3.514:1** across audited forms | Native controls/checkmarks/focus in other engines/OS settings |
| 2.1.1 / 2.1.2 keyboard | Dialog trap/Escape/restoration, filters/gallery, forms, review/edit focus pass | Full real-device/browser keyboard sequence |
| 2.4.7 / 2.4.11 focus | Visible outline inspected; validation/review/edit focus tested; sticky-header scroll padding retained | Focus obstruction at 200–400% zoom and mobile soft keyboard |
| 2.5.8 target size | Buttons have existing 44/48px treatment; footer/breadcrumb link heights improved; geometric scan records small links | Privacy text links and “Need to discuss your request?” require inline/spacing exception review; not every small link is an automatic failure |
| 3.3.1 / 3.3.2 / 4.1.3 errors/status | Native labels/required flags, field feedback, alerts/status and safe confirmation/focus tested | NVDA/JAWS/VoiceOver notification behavior and cognitive usability |
| Motion/reflow | Reduced-motion regression and six responsive widths pass | OS preferences, zoom, orientation and actual devices |

No claim of full WCAG compliance, screen-reader certification, Safari coverage or automated axe audit. Geometric measurements and computed colors are a limited custom audit, not a replacement for assistive-technology testing.

## Performance measurements

Protocol: actual local public APIs, Angular production optimizations, Node loopback SSR, headless Edge; three fresh browser contexts per desktop/mobile mode. Server/OS/backend caches were warm. Desktop 1440×1000 unthrottled; mobile 390×844 with CDP CPU 4×, latency 150ms, download 1.6Mbps and upload 750kbps. Browser context is cold; mobile viewport is an emulation, not a physical device. LCP/CLS/FCP/long tasks use PerformanceObserver APIs during a short navigation observation window. These are **lab measurements, not Lighthouse or field Core Web Vitals**. Browser/cache/favicon/resource timing can vary between runs.

| Median, three runs | Desktop before / after compression | Mobile before / after compression |
|---|---|---|
| TTFB | 89.2 / 68.6 ms | 77.6 / 126.2 ms |
| FCP | 504 / 520 ms | 1,216 / 1,196 ms |
| Observed LCP | 504 / 520 ms | 1,268 / 1,224 ms |
| Observed CLS | 0 / 0 | 0.0173 / 0.0173 |
| Total observed long-task time | 133 / 106 ms | 920 / 959 ms |
| Resource transfer bytes | 1,761,686 / 1,212,208 | 1,297,141 / 1,156,168 |

Evidence: `phase4/local-readonly-and-performance-before-compression.json` and `phase4/local-readonly-and-performance.json`. The verified optimization is byte-equivalent compressed delivery; **no statistically established timing or field-score improvement is claimed**. Desktop/mobile resource sets can differ (favicon/lazy-image timing), so aggregate byte differences are observations rather than a universal transfer guarantee. Brotli/gzip checks independently compare decoded response bodies with the originals.

Responsive image selection is confirmed: desktop homepage chooses the 1120px technology WebP; mobile chooses its 560px variant. Existing concept files range roughly 15–67kB per variant. Project APIs have no verified thumbnail/rendition contract; the actual local project main PNG is **1,771,328 bytes** (HEAD evidence `phase4-project-media.json`). The same source is used in its hero/gallery; no imaginary width/quality API was introduced.

Large remaining assets: horizontal logo 368,455 bytes, favicon/icon 408,205 bytes, Poppins TTF weights 155,996–160,316 bytes each. Identity sources are unchanged; smaller approved logo/favicon derivatives and WOFF2/subset generation are recommended, not fabricated. Font tools were unavailable and no dependency was installed merely to convert them. One existing semibold font is preloaded; image lazy-loading, dimensions/fallbacks and allowlisted WebP srcsets are retained.

SSR HTML compression is not implemented in the Node handler; configure and verify it through the separately approved proxy layer. Build budgets measure browser bundles, not all images/fonts, server startup, field latency or total page cost. Final production sizes/compression manifest are recorded in the build log and artifact report.

Final production precompression verified **30 files**: 984,170 original bytes, 353,078 Brotli bytes and 379,450 gzip bytes. Every derivative was decompressed and compared byte-for-byte to its source. This manifest covers all selected built text/font assets, not solely initial navigation, and leaves official PNGs unchanged.

## Real production observations and operational blockers

Read-only production frontend `/`, `/services`, `/products`, `/robots.txt`, `/sitemap.xml`: reachable. These observations do not verify checkout/payment behavior or customer submissions.

Public backend company/services: **timeout at 12 seconds**. Projects/leaders/homepage/backend sitemap: **HTTP 500**. No error response body, credentials or private document was captured; no root cause/uptime conclusion is claimed. Production CORS/content/PDF/provider behavior remains unverified. The browser's current timeout is eight seconds. The [migration plan](FRONTEND_MIGRATION_PLAN.md) records actual sitemap/robots inconsistencies and unknown index coverage.

Additional approval-required blockers: PDF markup/resource handling, state/issuance races and pricing review, absent idempotency/reconciliation, synchronous notifications, contact cache/log protections, legal/content approval, strict CSP, retail continuity and deployed SSR/proxy/rollback evidence. See [backend proposal](BACKEND_REMEDIATION_PLAN.md). Existing braces/Karma advisories remain in the dev toolchain; runtime audit zero is not a blanket security guarantee.

## Reproduction

```powershell
cd front-v2
$env:CHROME_BIN='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
npm test -- --browsers=ChromeHeadless
node node_modules/@angular/cli/bin/ng.js build --configuration qa,production --optimization=true --source-map=false
node scripts/precompress.cjs
$env:PHASE2_QA='1'; $env:PHASE3_QA='1'; $env:PHASE4_QA='1'
# Point PLAYWRIGHT_MODULE at an already available Playwright module if necessary.
npm run test:e2e
node node_modules/@angular/cli/bin/ng.js build --configuration development,production --optimization=true --source-map=false
node scripts/precompress.cjs
node tests/readiness-local.cjs # requires public local API; GET only
npm run build               # final production artifact; build only
npm audit --omit=dev --json
npm audit --json             # expected nonzero if current advisories remain
```

Django checks used `manage.py check` and `manage.py test contact core --settings=twinpeaks.test_settings --noinput` with `PHASE0_POSTGRES=0` and test-process Bird keys cleared; ordinary database/provider configuration files were not edited. Do not run write tests with ordinary production settings.

All five deliverables and evidence are ready for review. Backend remediation, deployment and any next phase remain unstarted.
