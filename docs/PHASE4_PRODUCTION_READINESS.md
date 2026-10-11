# TwinPeaks Frontend V2 — production readiness

Date: 11 October 2026. **Decision: NOT READY for production cutover.** Phase 4 frontend corrections and QA are complete for review; backend, operational, legal/content and retail-continuity gates remain. No deployment, DNS change, backend modification, credential change or production write occurred.

Related deliverables: [backend proposal](BACKEND_REMEDIATION_PLAN.md), [content approvals](CONTENT_READINESS_CHECKLIST.md), [URL/deployment/rollback plan](FRONTEND_MIGRATION_PLAN.md), [final QA report](FINAL_QA_REPORT.md).

## Assessment basis

Reviewed the architecture/audit and Phase 0, 1, 2, 2.5 and 3 reports; current Angular routes, layouts, theme/SEO/state/API clients, forms/private quotations, images/fonts/SCSS, SSR hosting/build configuration and prior tests. Reviewed Django contact/quotation models, serializers, views, URLs, admin, notifications, middleware, settings, sitemap and isolated tests. Checked supplied brand sources and retained existing approved logo/font/concept assets.

Source findings, local integration, synthetic tests and production probes are explicitly separate. A single successful frontend page or local test does not establish production health, deliverability, actual business facts or WCAG certification.

## Release-blocker matrix

| ID / priority | Finding and evidence | Required next action | Gate |
|---|---|---|---|
| C1 — Critical | Production public backend: company/services timed out at 12 seconds; projects/leaders/homepage and advertised backend sitemap returned 500. `phase4-content-and-live-url-evidence.json` | Backend/infrastructure owner diagnoses health using sanitized logs, restores API/CORS/sitemap and performs staging/production read-only verification | Block release |
| C2 — Critical | PDF view inserts unescaped customer text into ReportLab paragraph markup; installed parser supports resource-loading markup. `contact/views.py:PublicQuotationPdfView`, installed ReportLab defaults | Approve backend escaping/resource constraints and isolated security tests; retain existing tokens | Block release; no exploit performed |
| C3 — Critical | V2 has no retail routes; a blanket root swap would send products/cart to 404. Existing products remain reachable in production | Approve and prove retail/legacy asset and SPA-boundary continuity, or delay cutover | Block main-origin replacement |
| H1 — High | No backend idempotency/status reconciliation; retry after lost response can duplicate contact/quote entities | Approve additive receipts/outbox/reconciliation or explicitly review residual risk before release | Backend decision required |
| H2 — High | Public view/expiry saves can race decisions; issue action lacks final-state/pricing-approval guard | Approve conditional transitions/issuance validation and PostgreSQL race tests | Backend integrity gate |
| H3 — High | Synchronous Bird sends can outlast frontend eight-second timeout; actual delivery/worker health unverified | Verify durable notification design, provider routing/timeouts and controlled staging delivery | Operational gate |
| H4 — High | Contact responses echo PII without private/no-store middleware; log/path/provider redaction unverified | Approve backend/proxy privacy changes and verify all response statuses/logging | Privacy gate |
| H5 — High | Privacy/Terms remain clearly unapproved noindex previews | Obtain company-approved legal copy based on actual processing/workflows | Content release blocker |
| H6 — High | Local overview/mission/vision placeholders; no services; project placeholder copy and unrelated image | Correct authoritative production content through separate approval; confirm contact information/media permissions | Content gate |
| H7 — High | No deployed v2 SSR/proxy/CORS/TLS/headers/compression/rollback evidence | Complete approved staging deployment and controlled smoke tests; no automatic deployment | Hosting gate |
| H8 — High | Six high dev-tooling advisories through braces/Karma; runtime audit zero | Resolve via supported tooling change or record security-owner disposition; keep dev servers private | Toolchain review gate |
| M1 — Medium | Strict script/style/connect CSP and Trusted Types not integrated; basic CSP only | Design Angular-compatible nonce/hash policy and stage report-only/enforcement tests | Security review |
| M2 — Medium | Full-resolution logo/favicon and TTF files remain costly; no backend image derivatives | Produce approved identity-preserving smaller assets/WOFF2 pipeline and backend image renditions separately | Performance follow-up |
| M3 — Medium | Manual assistive technology, real-device Safari, zoom/soft keyboard and field performance untested | Complete manual/device QA and monitor actual deployed performance | Accessibility/quality review |
| M4 — Medium | Authoritative sitemap/robots/index coverage incomplete; Search Console/backlink export unavailable | Recover sitemap, validate route matrix and obtain search/link inventory | SEO cutover gate |
| L1 — Low | FAQs/team content omitted because not approved/verified | Publish only after approval; omission is preferable to fictional content | Optional content |
| L2 — Low | Privacy/context links flagged by geometric target scan | Review WCAG inline-text/spacing exceptions rather than treating every small text link as an automatic failure | Manual review |

Priorities reflect this assessment, not a guarantee of exploitability or a business-approved release policy. Critical/high unresolved items require explicit disposition before a cutover. Backend remediation is proposed, not automatically started.

## Implemented frontend-only corrections

| Change | Purpose / verification |
|---|---|
| Host/request validation before static/SSR serving | Restricts configured site/loopback hosts, origin-form requests and GET/HEAD; untrusted static Host tests return 400 |
| Basic response security headers | No-referrer, nosniff, frame denial, conservative CSP (`base-uri`, `object-src`, `frame-ancestors`, `form-action`) and disabled unused camera/microphone/geolocation; mirror in `_headers` |
| Cache policy | Public HTML no-cache; contact/request/private HTML private/no-store; only fingerprinted JS/CSS immutable; stable assets one-hour revalidation |
| gzip/Brotli precompression | Built-in Node tooling creates verified byte-equivalent derivatives; Node negotiates q-values and Vary correctly, with uncompressed fallback; no new dependency |
| Build hygiene | Production source maps explicitly disabled; unused 1.785MB original concept PNG/Markdown omitted from build copy while source preserved; preload one existing semibold font |
| Correct missing-route behavior | Unknown URLs render at the original URL with SSR 404/noindex; no generic redirect/soft-404 |
| Existing public aliases | V2 Node 301/browser compatibility for services→solutions, gallery→projects, leadership→about; no retail redirect |
| Accessible control/focus treatment | Input/select/textarea borders have dedicated contrast tokens; visible checkbox focus retained; footer/breadcrumb target heights improved; keyboard tests cover invalid/review/edit focus |
| Defensive validation mapping | Only own known field keys map server validation; generic errors retain input and do not echo server payloads |
| Private decision uncertainty | An error or mismatched decision response does not claim success; decisions remain disabled until status reload; existing token/PDF/accept/decline contracts retained |

These headers do not establish a strict XSS CSP or deployed infrastructure security. [Angular's CSP guidance](https://angular.dev/best-practices/security#content-security-policy) requires compatible nonce handling for inline script/style behavior. Input boundaries are checked against the [WCAG non-text contrast criterion](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html); broader manual conformance remains pending.

## Feature and integration review

Homepage/navigation, both themes, six solution templates, portfolio/category filtering/gallery, About, Contact and quotation request are implemented and covered by the retained regression suites. Empty/error/loading states, retries, metadata, query-context validation and SSR/hydration pass the tested scenarios. V2 uses actual API company/service/project records, with no synthetic production fallback or guessed service IDs.

Contact uses the existing three-field POST; additional user details are labeled message text. Quote requests use supported custom-description items; budget/timeline/assessment preferences are bounded message text, location is address, customer type is not an invented writable API field. Confirmation means saved request, not email delivery, booked appointment, agreed scope or price. Neither frontend workflow provides durable cross-reload/multi-tab idempotency.

Issued quotation URLs remain unchanged. Private documents are client rendered, excluded from customer SSR/transfer state, noindex and no-store. Metadata never includes the token; no analytics run in v2. PDF URLs use no-referrer and no opener. Live private documents were not opened because GET/PDF can update viewed/expiry state. Private workflows are verified using isolated synthetic responses and existing isolated Django tests only.

Actual local integration checks cover 13 public routes, six solution detail pages and the one published local project, in both themes at all six requested widths. Production static homepage/services/products and robots/root sitemap are reachable, but public backend API probes failed. Production data, CORS, PDF generation and provider delivery remain unverified.

## Verification summary

- Unit suite: **71 passing tests**, including all earlier regressions and seven Phase 4 additions.
- Browser/SSR suite: **41 passing scenarios**, including prior phases and seven Phase 4 scenarios; zero runtime/hydration errors.
- Custom accessibility audit: 18 page/theme cases; landmarks, h1, document language, IDs, labels, descriptions, alternatives and control-border contrast. Minimum measured form border/background contrast **3.514:1**. Prior text/button contrast and mobile-dialog keyboard tests retained.
- Actual local GET-only integration: 13 public routes, **156 theme/width checks**, zero browser errors; six cold-browser homepage lab samples before/after compression.
- Django system check: passed. Existing contact/core tests: **12 passed** in isolated SQLite memory with notifications mocked; no production/customer writes. PostgreSQL concurrency and real provider delivery not exercised.
- Dependency audit: zero runtime advisories; full audit six high findings, no critical. Audit exit 1 denotes findings, not a passed clean audit.
- Final production build/environment/compression verification is recorded in [FINAL_QA_REPORT](FINAL_QA_REPORT.md). No Lighthouse score or field Core Web Vitals claim is made.

## Modified files and preservation

Frontend source/config: `front-v2/src/server.ts`, new `src/hosting-policy.ts`/`.spec.ts`, `src/index.html`, `angular.json`, `package.json`, `public/_headers`, `src/styles.scss`, `_tokens.scss`, `_leads.scss`, `src/app/app.routes.ts`, `core/seo/page-resolvers.ts`/`.spec.ts`, `features/leads/contact.ts`, `request-quote.ts`, `leads.spec.ts`, `features/quotations/public-quotation.ts`/`.html`/`.spec.ts`.

Tooling: new `front-v2/scripts/precompress.cjs`, `tests/phase4-checks.cjs`, `tests/readiness-content.py`, `tests/readiness-local.cjs`; extended `tests/browser-checks.cjs`. README includes current build/QA guidance. Five required reports were created under `docs/`. QA artifacts are under ignored `front-v2/test-results/`, with Phase 4 browser/local captures isolated in its `phase4/` subfolder so previous screenshots remain intact.

The Phase 4 baseline covers 531 existing files; final preservation evidence inventories expected v2 edits and asserts no legacy/backend/credential/package-lock changes. Official source media/font files were preserved byte-for-byte. No image generation, dependency installation, backend migration or production configuration change occurred.

## Recommended next actions

Approve review of the backend/infrastructure remediation proposal and resolve production availability/PDF/state risks first. Complete content/legal approvals and prove retail/asset continuity in staging. Review manual accessibility, dependency disposition, strict CSP and identity/media optimization. Only after these gates and an approved rollback runbook should a separate deployment decision be made.

Phase 4 stops here for approval. No backend remediation, retail migration or deployment proceeds automatically.
