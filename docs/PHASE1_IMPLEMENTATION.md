# TwinPeaks frontend rebuild — Phase 1 implementation

Date: 10 October 2026. Scope: new homepage and application foundation in `front-v2/`, with compatibility for issued private quotation links. Status: ready for local design/integration review; no deployment. Phase 2 has not started.

## Implemented outcome

- Independent Angular 20 standalone application with strict TypeScript/templates, lazy routes, signals, OnPush, Reactive Forms, SCSS, request-time SSR and hydration.
- Complete homepage: approved tagline and capability positioning, Explore Solutions and Request a Quote CTAs, four benefits, six solution areas, published featured-project integration, Consult → Plan → Implement → Support, final CTA and API-backed company footer.
- Shared UI/layout/state components and typed clients for inspected Django contracts. Project/image failures, missing data, loading and empty states, retries and request cancellation are supported.
- Centralized light/dark design tokens, system preference detection, manual persistence, early startup theme selection, OS updates without a manual override, desktop/mobile toggles and reduced motion.
- Existing quotation view, PDF URL, acceptance and decline contracts preserved. No token generation, invalidation or record mutation beyond synthetic test decisions.
- All other requested routes prepared as explicit noindex development previews. `/services` redirects to `/solutions`. No new retail functionality or e-commerce migration.

The approved mockups guided styling. Their apparent statistics, staff, outcomes, contact details and certifications were not treated as company records. Homepage review screenshots intentionally use an empty portfolio and unpublished contact fields. Real runtime project records and contacts come from the existing API. The hero photograph is labeled as a concept, not an actual client installation.

## Assessment and verified contracts

Reviewed the existing frontend configuration, route/integration patterns and architectural audit before creating v2. Backend inspection covered company, active services, homepage aggregate, project list/detail, contact and public quotation serializers/views/URLs under `back/twinpeaks_back/`. See [architecture](FRONTEND_V2_ARCHITECTURE.md) for the API matrix and route inventory.

Confirmed constraints: services have no slug/detail endpoint; the company singleton can return 404; projects are arrays with optional images; requested/draft/under-review quotation responses omit pricing/items; decisions are restricted by existing backend state. The new UI uses explicit frontend solution slugs rather than pretending an unverified service API exists.

## Files created and scope preservation

All application/configuration/assets/test changes are inside the new `front-v2/` folder:

| Area | Created files |
|---|---|
| Workspace | `package.json`, `package-lock.json`, `angular.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`, `.gitignore`, `README.md` |
| Bootstrap/rendering | `src/index.html`, `main.ts`, `main.server.ts`, `server.ts`, `test.ts`; `src/app/app.ts`, `app.config.ts`, `app.config.server.ts`, `app.routes.ts`, `app.routes.server.ts` |
| Environments/styles | `src/environments/environment.ts`, `environment.development.ts`; `src/styles.scss`, `src/styles/_tokens.scss` |
| API | `src/app/core/api/contracts.ts`, `api-client.ts`, `content-api.ts`, `quotation-api.ts` |
| Core state/theme/SEO | `src/app/core/state/company-store.ts`, `core/theme/theme.service.ts`, `core/seo/seo.service.ts` |
| Layout | `src/app/shared/layout/navigation.ts`, `site-header.ts`, `mobile-navigation.ts`, `site-footer.ts`, `theme-toggle.ts` |
| UI | `src/app/shared/ui/icon.ts`, `buttons.ts`, `headings.ts`, `states.ts`, `cards.ts`, `process-steps.ts`, `cta-section.ts`, `hero-section.ts`, `toast-notification.ts`; `src/app/shared/media.ts` |
| Features | `src/app/features/home/home.ts`, `home.html`, `solution-categories.ts`; `features/page-shell/page-shell.ts`; `features/not-found/not-found.ts`; `features/quotations/public-quotation.ts`, `public-quotation.html` |
| Unit regressions | `src/app/core/api/api.spec.ts`, `core/theme/theme.spec.ts`, `core/seo/seo.spec.ts`, `shared/media.spec.ts`, `features/home/home.spec.ts`, `features/quotations/public-quotation.spec.ts` |
| Browser QA | `tests/browser-checks.cjs` and ignored `test-results/` logs, reports, screenshots and source baseline |
| Hosting/assets | `public/_headers`; `public/assets/brand/horizontal_lockup.png`, `icon_only.png`; `fonts/Poppins-Regular.ttf`, `Poppins-SemiBold.ttf`, `Poppins-Bold.ttf`, `OFL.txt`; `images/technology-concept.png`, `images/README.md` |

Documentation created: `docs/FRONTEND_V2_ARCHITECTURE.md` and this report. Official source assets in Downloads/OneDrive were read/copied, not modified. A SHA-256 baseline comparison of **311 existing frontend/backend files** reports **zero changes** during Phase 1 (`front-v2/test-results/source-preservation.json`). Existing Phase 0 changes already present in those files were preserved. No database migration/model/API/credential changes and no production deployment occurred.

## Security and privacy

No GA, Meta Pixel or other third-party analytics run in v2. Fonts, logos, icons and the hero are local. Public quotation pages are client rendered; SSR HTML contains no customer document. All pages use no-referrer; private quotation hosting responses are no-store/private and noindex/nofollow/noarchive. Quotation API reads and all posts request no-store and empty referrers. PDF links use explicit no-referrer plus noopener/noreferrer. Metadata strips quotation tokens/query strings. Node SSR has an explicit site/loopback host allowlist and does not opt into trusting forwarded headers.

The existing backend remains the authority for quotation state and PDF generation. Acceptance/decline are not payment operations. UI guards prevent duplicate concurrent clicks, cancel old requests when a route token changes and offer retry/reload guidance for ambiguous failures. Existing records/tokens remain unchanged.

The initially selected Angular 20.3.16 dependencies had advisories; v2 was patched to framework/compiler **20.3.33** and CLI/build/SSR **20.3.39**, remaining within Angular 20. A fresh lockfile resolved npm's old peer-tree conflict without forced peer bypasses. `karma-coverage` was added because Angular's Karma builder requires it; no application UI framework, analytics package or Playwright dependency was added.

Final `npm audit --omit=dev` reports **zero known runtime vulnerabilities**. Full audit reports **six high findings** traced to `braces` through `chokidar`/Karma and its builder/reporters. The suggested fix is a breaking Karma downgrade; it was not forced. These are unresolved development/test-tooling advisories, not a claim that the project is vulnerability-free. Keep local tooling bound to loopback, do not expose Karma/dev servers, and review a supported runner/dependency remedy before release. Advisory: [braces stack exhaustion](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

## Verification results

Executed with bundled Node **24.19.0** and headless Microsoft Edge **156**. Commands ran from `front-v2/`; Angular worker/browser checks needed sandbox escalation. No production endpoint was used for submissions. Browser tests use an isolated synthetic API on port 8000 and the new SSR server on port 4201.

| Check | Result and evidence |
|---|---|
| Development build | Passed; `test-results/build-development.log` |
| Production build | Passed, exit 0; initial browser bundle 330.46kB raw / 92.27kB estimated transfer, within budget; `test-results/build-production.log` |
| Unit regressions | **30 passed**, exit 0; `test-results/unit-tests.log` |
| Browser/SSR regressions | **15 passed**, exit 0; `browser-checks.log`, `browser-results.json`, `ssr.log` |
| Responsive widths | 320, 375, 390, 768, 1024, 1440; no horizontal overflow in both themes |
| Theme behavior | Initial system/manual preference, persistence, OS updates, blocked storage fallback, startup script before application JS |
| Keyboard | Mobile modal cycling, Escape, focus restoration, navigation dismissal, skip-to-main; reduced motion |
| Contrast | Text, secondary text and accent on theme backgrounds/surfaces/tints, plus button text: WCAG AA normal-text ratio ≥4.5 in both themes |
| API/portfolio | Correct endpoints, null lists, loading, failure/retry, empty response, synthetic project link, broken image fallback, cancellation |
| Quotation | Existing token view; synthetic accept/decline; PDF URL/content-type contract; private headers; token-free metadata; no customer SSR HTML |
| Runtime privacy | No third-party browser requests or quotation referrers; zero browser runtime exceptions in suite |
| Environment bundles | Both passed: development contains local API and excludes production API; production contains production API and excludes local API. `environment-development.json`, `environment-production.json` |
| Existing source preservation | 311 hashes checked; zero changes |
| Dependency audit | Runtime: zero; full development tree: six high findings, zero critical |

The first browser pass exposed a native-dialog focus gap; explicit Tab/Shift+Tab wrapping corrected it. The patched SSR engine initially fell back to CSR for the local hostname, which caused the SSR/HTTP-404 checks to fail; the explicit allowlist corrected both, and all browser checks passed on rerun. Karma logged process-shutdown warnings after all 30 successful tests; its command completed with exit 0. These are documented observations rather than hidden passes.

This verification does **not** establish production API availability, real project/contact accuracy, real issued quotation behavior, PDF layout/content, real-device Safari/iOS compatibility, full screen-reader/WCAG conformance, Core Web Vitals, live CORS/hosting headers or deployment readiness. No Django tests were rerun in this phase because backend code was unchanged. No live payment or enquiry was initiated.

## Review screenshots

Captured from the tested development app with synthetic empty content, not production data:

- `front-v2/test-results/homepage-light.png` — desktop 1440px.
- `front-v2/test-results/homepage-dark.png` — desktop 1440px.
- `front-v2/test-results/homepage-light-mobile.png` — mobile 390px.
- `front-v2/test-results/homepage-dark-mobile.png` — mobile 390px.

## Remaining work and deployment dependencies

1. **Phase 2 content/pages:** solution overview/detail, projects/detail, about, contact and quotation request forms. Existing shells make their incomplete status explicit. Privacy/terms require approved content before release.
2. **Real integration review:** start the unchanged Django backend locally; confirm CORS for `http://127.0.0.1:4201`, company profile completeness, service-title mappings and published featured projects. Do not infer missing production records from QA screenshots.
3. **Service mapping:** agree stable mapping between the six solution categories and existing service ids; no service-slug endpoint currently exists. Any later API expansion needs separate authorization/review.
4. **Hosting:** use a supported Node SSR runtime, configured site hostname/port, validated reverse proxy behavior and TLS. Recheck private no-store/no-referrer/noindex headers across CDN/proxy/backend, redact quotation paths in access logs, and test issued links before any eventual cutover. `_headers` is host-specific supplemental configuration, not proof of deployed behavior.
5. **Performance:** hero PNG is approximately 1.8MB, with additional local TTF/logo costs outside JS budget. Assess responsive optimized delivery, font subsets and real performance measurements before release. No fabricated Lighthouse score is supplied.
6. **Security/accessibility:** resolve or explicitly accept remaining dev-tooling advisories, define CSP hashes/nonces for the early theme code, and conduct real-device/screen-reader checks.
7. **Retail:** remains operational in the old application. No migration, removal or cutover plan was executed.

For local commands, API contracts and folder structure see [FRONTEND_V2_ARCHITECTURE.md](FRONTEND_V2_ARCHITECTURE.md) and `front-v2/README.md`. `npm start` defaults to the local API; a production build explicitly selects the production API and is never a safe choice for test submissions. Do not deploy this Phase 1 preview as a full website replacement while lead forms and legal pages remain previews.

Phase 1 stops here for review. Phase 2 recommendations above are pending work, not an instruction to execute them automatically.
