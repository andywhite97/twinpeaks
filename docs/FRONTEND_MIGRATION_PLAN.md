# Frontend transition and rollback plan — not deployed

Date: 11 October 2026. Existing production/retail remains untouched. V2 deployment, DNS, proxy changes, backend sitemap changes and retail migration require separate approval.

## Verified URL evidence

Source route inventory: `front/src/app/app.routes.ts`. Source sitemap logic: `back/twinpeaks_back/core/sitemaps.py`. Read-only production probes and captured metadata: `front-v2/test-results/phase4-content-and-live-url-evidence.json`.

- Production `/`, `/services` and `/products` responded 200; the latter two resolve to trailing-slash pages with slashless canonical URLs. Products remain live; no retail redirect was applied.
- Production `/sitemap.xml` is reachable and lists `/`, `/products`, `/services`, `/gallery`, `/about`, `/contact`, with 2026-05-28 lastmod values.
- Production `/robots.txt` allows crawling and points to **`https://backend.twinpeaksinvestment.com/sitemap.xml`**, which returned 500 in this run. Its Googlebot/Bingbot groups separately allow all paths; a new generic robots restriction would not automatically govern those groups.
- Search did not return results for `site:twinpeaksinvestment.com`; this is **not proof of no indexed pages**. Search Console, indexed-URL exports, backlinks and sanitized access analytics were unavailable. Sitemap-listed URLs are important submitted candidates, not confirmed index coverage.
- Local backend sitemap is functioning but emits HTTPS loopback URLs from local configuration and includes legacy static paths plus its one local project. Never publish those local URLs as production sitemap entries.

## Migration matrix

| Current URL / pattern | V2 behavior now | Proposed transition / SEO action | Release gate |
|---|---|---|---|
| `/` | SSR corporate homepage, indexable | Retain URL/canonical, replace only after coordinated release | Production API/content/retail continuity |
| `/services` (including trailing slash) | Node 301 to `/solutions`; browser compatibility redirect | One permanent hop to equivalent solutions overview; avoid chains | Verify both proxy/direct requests and client navigation |
| `/solutions` | New SSR overview | Add to authoritative sitemap | Scope/service content approval |
| `/solutions/:slug` | Six supported editorial detail pages; unknown slugs 404 | Add exactly the six approved slugs | Unique service mappings, approved copy |
| `/projects` | SSR API-backed list | Retain route; add sitemap coverage where missing | Production API and published portfolio readiness |
| `/projects/:slug` | Actual published detail; 404/503 distinguished | Preserve existing slugs and backlinks; escape/encode XML URLs; use actual updated_at if available | Do not copy synthetic/local fixture slugs into production |
| `/gallery` | Node 301 to `/projects`; browser alias | Replace static sitemap gallery entry with canonical projects; preserve backlink route | Proxy/client boundary QA |
| `/about` | SSR corporate page | Retain URL/canonical; publish approved company copy | Mission/vision/profile approval |
| `/leadership` | Node 301 to `/about`; browser alias | Retain legacy alias; do not invent staff pages | Verify any known backlinks |
| `/contact` | SSR blank form, no-store | Retain URL; no PII in metadata or URLs | API reliability, approved privacy information |
| `/request-quote` | SSR blank form, browser review/submission, no-store | Retain URL; optional sitemap inclusion as public form page | Backend operational/idempotency risk disposition |
| `/quotations/:token` | Same URL/API contract; client rendered; private/no-store/noindex | Retain indefinitely for existing issued links; no token regeneration, sitemap entry, analytics or token-bearing redirect | Test controlled existing-token fixtures through proxy and origin |
| `/products` | V2 has no retail implementation | **Continue serving legacy 200** until separately approved retail transition | Critical: do not send this path to V2 wildcard |
| `/products/:slug` | V2 has no retail implementation | Preserve legacy product URLs; later use exact equivalent new-retail mapping | Inventory/backlink/export, new company readiness |
| `/cart` | V2 has no cart/payment implementation | Keep existing legacy cart/checkout and required assets/API workflows | Controlled staging MoMo/order continuity tests; no real payments here |
| Category/search/cart query URLs | Existing retail query/state behavior, not a separate v2 route | Inventory from real links/access data; preserve functionality and review canonicals separately | No blanket redirect or accidental query leakage |
| `/privacy`, `/terms` | Noindex, explicitly unapproved legal preview | Remove noindex only after actual approved copy is published | Legal approval |
| `/404` | SSR 404/noindex | Keep recovery UI | No generic 200 fallback |
| Other unknown URLs | V2 retains original path, SSR 404/noindex | Return genuine 404; never mass-redirect missing products to corporate home | Retail paths must first be routed to legacy |
| `/robots.txt` | No new published file added in this phase | Coordinate host-owned robots and sitemap URL; never treat robots as authorization | Choose one production configuration |
| `/sitemap.xml` | Existing backend/static production sources unchanged | Restore authoritative sitemap service and include canonical corporate plus retained retail/project URLs | Backend/proxy approval required |

No standalone checkout/orders/auth route was found in the inspected legacy Angular route table; checkout is part of `/cart`. Inventory actual external links before assuming this exhausts historical URLs.

## Corporate/retail coexistence

Recommended immediate state: keep the complete existing production application operational and review v2 on an isolated environment. Do not swap the root origin to a corporate-only application until retail continuity is proven.

A future main-domain cutover needs either (a) an independently approved retail handoff with verified equivalent URLs, or (b) explicit reverse-proxy routing of retained retail paths to the legacy application. Option (b) also needs **asset isolation and SPA boundary behavior**. HTTP path splitting alone is insufficient: legacy Angular RouterLinks can continue rendering its own homepage without requesting v2 HTML, and root-relative assets/cached runtimes can collide. Demonstrate deliberate full-document navigation across application boundaries, separate asset namespaces/manifests, fallback behavior and cache invalidation in staging. Any required legacy/frontend/backend/proxy edits are future authorized work, not Phase 4 changes.

Do not proxy unknown paths indiscriminately to a generic SPA index. Preserve each application's correct status codes and private headers. If the retail migration is delayed, keep the legacy origin complete rather than sacrificing working retail to meet a corporate launch date.

## SEO and private-route rules

V2 static pages have route-specific title/description, canonical/Open Graph URL and breadcrumbs where appropriate. Canonicals exclude query strings. Project title/description/image come from published records; placeholder content must be corrected at source. Private quotation canonicals remove the token and OG images/breadcrumbs are omitted; actual document access is through the unchanged private URL.

Choose one authoritative XML sitemap implementation. Extend the existing backend's public sitemap under separate approval or generate a reviewed release artifact from actual published records. Include `/`, `/solutions`, six solution slugs, `/projects`, valid published project slugs, `/about`, `/contact` and optionally `/request-quote`. Include retained retail URLs while they remain live. Exclude private tokens, cart/checkout, errors, aliases and unapproved legal previews. Use real modification dates or omit lastmod; do not stamp invented history.

Robots/noindex must be tested together. Private tokens are capabilities, not authentication protected by robots. Exclude them from all sitemap/link discovery and retain noindex/no-store headers. Blocking crawling can prevent a crawler from seeing noindex; do not assume a Disallow rule removes an already indexed URL. See [Google noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing). Keep all bot-specific groups consistent if they are retained. Do not publish a token in removal requests, analytics exports or migration spreadsheets.

The three v2 alias 301s are implemented locally in `src/server.ts`; in-app routes preserve compatibility. Static-only deployments would need equivalent host redirects and SSR/status handling. No existing production redirect is activated by these source changes.

## Release hosting checklist

1. Freeze and archive the current legacy artifact, reverse-proxy configuration and release manifest; record immutable restore locations and responsible operators.
2. Build v2 using `npm ci` and `npm run build` on a supported runtime; this generates Angular SSR/browser files plus gzip/Brotli derivatives. Preserve the complete `dist/front-v2` tree. Do not deploy `qa`, development or optimized-loopback artifacts.
3. Frontend API/site origins are compile-time environment constants, not runtime secrets. `PORT` configures the Node listener. No database, merchant or provider credentials belong in frontend files. Pin/verify the deployed Node version independently of the local test runtime.
4. Run `server/server.mjs` under a supervised service/container behind a trusted HTTPS proxy. Configure the canonical host/optional www-to-canonical redirect deliberately. The Node host allowlist accepts the configured origin hostname and explicit loopback; it rejects other Host values before static/SSR handling. Do not enable arbitrary forwarded-host trust to bypass it.
5. Proxy only approved hostnames, forward the correct Host/protocol through a reviewed trusted topology, and do not expose the Node port publicly. Configure HTTPS/TLS and HSTS only after domain/TLS readiness; no DNS/HSTS change was made here.
6. Confirm Django HTTPS, explicit CORS origins, exposed Retry-After and API health. GET production failures must be resolved before launch. No frontend endpoint substitution masks those failures.
7. Serve hashed JS/CSS with immutable caching; stable logos/fonts/images with short revalidation; public SSR HTML with no-cache; forms/private documents with private/no-store. Ensure `Vary: Accept-Encoding`, correct content types and a single compression layer. Preserve quotation API/PDF headers through CDN/proxy. Redact token paths and customer bodies in access/error logs.
8. Node supplies the basic CSP/embedding/referrer/MIME protections. `_headers` is host-specific supplemental configuration, not an operational guarantee. Strict script/style/connect policy needs Angular-compatible nonce/hash handling and report-only verification before enforcement. See [Angular CSP guidance](https://angular.dev/best-practices/security#content-security-policy).
9. Approve retail routing/assets, content/legal copy, sitemap/robots, privacy, accessibility/manual testing and notification/reconciliation risk disposition. Keep the separate store/marketplace project out of this release.

## Controlled smoke tests after a separately approved deployment

Check homepage/solution/project/about/contact/request routes, refreshes/deep links, theme persistence, 301s, genuine 404s, sitemap/robots and actual response headers. Verify API CORS/connectivity and image/font/compressed-asset delivery. Use explicitly authorized staging/internal test records and a safe notification sink to verify submission, replay/reconciliation, issued PDF and decisions; never substitute fixtures for operational evidence. Do not trigger real customer decisions or payments as smoke tests.

Confirm retained products/cart, legacy asset delivery and full-page application boundaries. Inspect sanitized operational logs/queue metrics and service health. Monitor errors and request outcomes during a limited rollout; decide rollback based on agreed thresholds rather than an invented success score.

## Rollback

Restore the prior complete legacy artifact and routing/cache configuration. Keep backend records/tokens unchanged; new enquiries already saved must still be processed. Restore DNS only if a separately approved DNS transition occurred; this phase performed none. Avoid a partial rollback that sends old retail paths to new v2 runtime files. Invalidate changed HTML/asset-routing caches as needed, retain fingerprinted old assets for cached clients, and verify private links after rollback. Document the operator, commands, artifact hash and recovery time in the actual release runbook before approval.
