# TwinPeaks Investment — Phase 0 Stabilization Report

Date: 10 October 2026 (Africa/Johannesburg)  
Scope: quotation privacy, payment/inventory correctness, development environment safety and focused verification.  
Status: implementation completed; local checks are recorded below. No deployment, real payment, merchant credential change, database-model removal, e-commerce migration or page redesign was performed.

Paths in this report are relative to `C:/Users/djand/Projects/Twinpeaks`. The starting audit was read at `docs/TWINPEAKS_WEBSITE_AUDIT.md`; findings were rechecked against source before implementation.

## 1. Confirmed defects

1. **Quotation tracking leakage:** the root component sent quotation route paths/full URLs to GA and Meta. GA was loaded and configured in initial HTML, before an Angular route exclusion could take effect. Private document URLs could also become canonical links. Existing Meta initialization occurred before route evaluation.
2. **Inadequate document protections:** quotation API/PDF responses had some noindex handling but no comprehensive no-store/referrer protection across success, decision, error and creation responses. PDF opening used `noopener` without `noreferrer`.
3. **Header-image referrer leakage:** a local browser check detected the synthetic quotation token in the `Referer` of the inline-CSS page-header background image request, despite the document's no-referrer meta tag. This was a same-origin image request; the browser check separately confirmed no GA/Meta scripts on the private document. The image loading mechanism was corrected without changing the image or page layout.
4. **Partial stock allocation:** reconciliation decremented lines individually and returned normally when a later line lacked stock, committing prior decrements. The payment remained pending, making repeated deductions possible.
5. **Stale payment-state writes:** failed/pending branches were not serialized with successful reconciliation. A stale response could overwrite a newer successful payment/order state.
6. **Provider call inside stock transaction:** checkout retained product locks during slow external authentication/payment requests. The provider reference was not persisted until after submission returned, leaving timeout/ambiguous outcomes without a durable reference.
7. **Missing recovery/idempotency path:** each checkout submission created a new attempt; the frontend generated a new event ID each time, did not retain payment references across refresh, and stopped polling on an error without a usable reference-recovery path.
8. **Unsafe environment convention:** normal API services imported production `environment.ts`, but the build replacement targeted `environment.development.ts` in production. Development serving could therefore submit to production. Tests likewise had no safe environment replacement.
9. **Test harness drift:** the application was zoneless while the default Karma test setup expected Zone.js. Existing Home, ProductList and Services test scaffolds lacked required dependencies/methods.

## 2. Implemented quotation privacy protections

### Analytics and navigation

- Removed the GA loader/configuration snippet from `src/index.html`. GA now initializes lazily through `AnalyticsService` only when tracking is allowed in a public production document.
- Removed unconditional root Meta initialization and excluded quotation navigation from root GA/Meta pageview calls.
- Added a shared tracking privacy policy. It blocks tracking in documents initially opened on a quotation, while the current router/browser URL is private, and when payloads contain quotation URLs, encoded quotation URLs or identified personal/token fields. GA and Meta enforce this policy themselves, rather than relying solely on the root component.
- GA-generated page URLs omit query strings/fragments; generated GA events use an empty page referrer. Initial automatic GA pageviews are disabled with `send_page_view: false`.
- Added a guard to every rendered route. Crossing between public and quotation documents uses full-document navigation and cancels the Angular SPA transition. A loaded third-party script cannot safely be unloaded; a fresh private document keeps those scripts away from the token and customer DOM. Leaving a private document also creates a fresh public document, avoiding token-bearing referrer/analytics state reuse.
- Replaced token-bearing quotation canonical URLs with the generic `/quotations` URL. Customer tokens remain in their working browser/API access URLs and have not been rotated or invalidated.
- Development and unit-test analytics are disabled explicitly.

The scope is normal application navigation and the application's integrations, not malicious browser extensions or unrelated scripts injected by a hosting provider. Any additional production tag manager, tracking snippet or proxy instrumentation needs review before deployment.

### Referrers, resources and caching

- Added an early document `no-referrer` meta policy.
- Public quotation PDF opening now uses `noopener,noreferrer`.
- Shared PageHeader loads its existing decorative image through an image element with `referrerpolicy="no-referrer"`, retaining its cover positioning and overlay. This fixes the image leak observed in the local browser test. No header imagery or information architecture was redesigned.
- Added backend middleware for all `/api/quotations/` responses, including JSON/PDF, accept/decline, validation, missing-token and authentication/error responses:

```http
Cache-Control: private, no-store, max-age=0
Pragma: no-cache
Expires: 0
Referrer-Policy: no-referrer
X-Robots-Tag: noindex, nofollow, noarchive
```

- Added `front/public/_headers` with a global no-referrer rule and private quotation no-store/noindex rules for hosts that support that format. The Angular asset pipeline copies this file into browser output.
- Checkout source URL validation accepts only the configured public `/cart` URL and removes its query/fragment. Meta CAPI derives the source URL from configured public `/cart`, protecting even historical stored URLs that might contain private links. No quotation/customer document URL is forwarded from a supplied payment source URL.

**Hosting limitation:** `_headers` is not honored by GitHub Pages. The repository has a GitHub Pages deployment script/CNAME; the actual deployed edge configuration was not inspected or changed. Document meta/image policies work locally, but frontend HTTP no-store requires a supported host or edge configuration. Do not treat the added file as proof of deployed cache protection. Configure equivalent response headers for `/quotations/*`, including the SPA fallback response, and verify them before release. No client-side meta tag is claimed to implement HTTP cache control.

Quotation API serializers retain their existing bearer-token customer data contract. Tokens still grant access to viewing, PDF and permitted decisions; privacy is enforced through analytics isolation, caching and referrer policy rather than by breaking existing customer access. Public token links remain sensitive: hosting/API access logs should redact token paths, and existing CDN caches must be purged as part of an approved release.

## 3. Payment reconciliation and inventory improvements

### Allocation and state transitions

`orders/reconciliation.py` now provides the shared reconciliation function used by HTTP polling and the management command.

1. Provider status is fetched outside the allocation transaction.
2. Reconciliation locks Order, then Payment, then actual Product rows in consistent primary-key order. It avoids locking a nullable product outer join, which is problematic on PostgreSQL.
3. All order lines are examined before any stock decrement. Duplicate product lines are aggregated; missing products, empty/invalid lines or insufficient aggregate stock require manual review.
4. Returned provider amount/currency are checked against the saved payment when present. A mismatch goes to review without inventory allocation.
5. Valid allocation and payment/order updates are atomic. Conditional stock updates occur in a savepoint, so an unexpected conflict rolls back every prior decrement.
6. Provider success sets the durable existing Payment `successful` state, including orders awaiting manual stock review. Repeat successful, pending or failed responses cannot allocate again or downgrade that state.
7. Failed payments ignore stale pending responses. An authoritative late success can be reconciled under locks and allocated once where the order is safe to allocate.
8. Existing review/cancelled/paid records are not automatically allocated again. This prevents attempts to “repair” historical partial allocations without evidence. Newly created ambiguous submissions are distinguished by `REQUESTING`/`REQUEST_UNKNOWN` and can allocate once after a confirmed success.

No schema/model changes or migrations were required. Existing quote conversion and professional order models remain intact.

### Checkout and provider errors

- Checkout creates the Order, item snapshots and Payment with a locally generated provider UUID before contacting MoMo. Product locks are released before provider requests or notification calls.
- The exact persisted reference is supplied to MoMo. Submission transport failures, server errors and ambiguous response statuses retain that reference and a pending payment with an order requiring review. They do not trigger another charge automatically.
- Authentication failures and definitive submission rejection produce a persisted failed payment; provider status parsing/transport failures leave existing payment/inventory state unchanged. Raw provider/network exception details are not exposed to customers.
- The existing unique `meta_event_id` also identifies a checkout attempt. Repeating the same ID and matching customer/basket returns the existing payment; changing the basket/customer for that ID returns 409. Concurrent submissions of the same ID create one order/reference and one provider call.
- Checkout responses retain the existing payment response fields. A persisted rejected or ambiguous attempt now returns its status/reference rather than losing the record through an error-only response. Clients must inspect `order_status`/`payment_status`; creation does not mean paid.
- Order acknowledgement wording reflects pending, paid, failed and review states rather than always asserting that a phone prompt was sent.

**Compatibility limit:** `meta_event_id` remains optional for existing API consumers. The updated frontend always sends and retains it; consumers omitting an attempt ID do not receive cross-request deduplication. Different IDs are separate payment attempts by design.

### Frontend recovery

- Reuses the attempt ID after an uncertain POST and prevents duplicate in-flight submissions.
- Stores only the attempt ID, payment reference and product-ID/quantity signature in sessionStorage for recovery; it adds no customer name, phone, email or notes to that storage.
- Restores the existing reference after refresh and checks its status without starting a new payment.
- Uses non-overlapping status requests, a 45-second request timeout and a limit of 60 status responses per automatic polling run. Errors/paused polling offer a check of the same reference.
- Shows a review state with an explicit instruction not to pay again. Only paid/failed terminal results can clear the attempt and allow continued shopping/new payment.
- A recovered paid result does not clear a different/new basket or attribute those new items to the old purchase.
- Development submissions omit the optional analytics source URL; they still use the local API and configured local backend currency/provider settings.

### Independent reconciliation components

Added `python manage.py reconcile_momo`:

- Default behavior lists pending references without provider calls or changes.
- `--apply --limit N` checks existing MoMo references and uses the same atomic reconciliation function.
- It never requests a new payment and does not generate a callback endpoint.
- Provider status errors leave state unchanged. Tests mock all external requests.

The codebase contains a Celery app/settings, but defaults use an in-memory broker and the inspected Render manifest declares no reconciliation worker/beat service. No working scheduled reconciliation system or provider callback is assumed. The command is an available operator/scheduler component, **not an automatically running reconciliation service**. It has not been executed against real provider references.

## 4. Development environment safety

All runtime imports now use `environments/environment`.

- Production uses the existing `environment.ts` production API endpoint and analytics setting.
- Development replaces `environment.ts` with `environment.development.ts`; the default `ng serve` configuration is development.
- Karma tests use the same development replacement, with telemetry disabled.
- Production has no reverse/development-source replacement.
- Source inspection found the production API host only in production environment configuration, not hardcoded HTTP service endpoints. Public-site SEO/sharing URLs remain intentionally distinct from API submission URLs.
- HTTP tests verify ApiService, AuthService and HomepageService use `http://127.0.0.1:8000/api`.
- Compiled bundle inspection confirmed development output contains the local API and excludes the production backend URL; production output contains the production backend URL and excludes the local API.

`ng build` still defaults to production, and explicitly serving/building production remains an intentional production-targeted operation. Developers should use the default development serve target and a local backend for test submissions.

## 5. Files modified or added

### Frontend

| Group | Files |
|---|---|
| Build/test/environment | `front/angular.json`; `front/tsconfig.app.json`; `front/src/test.ts` (new); `front/src/index.html`; `front/src/environments/environment.ts`; `front/src/environments/environment.development.ts` |
| Root routing/privacy | `front/src/app/app.ts`; `front/src/app/app.routes.ts`; `front/src/app/app.spec.ts`; `front/src/app/core/guards/quotation-document-boundary.ts` and `.spec.ts` (new) |
| Tracking | `front/src/app/core/services/tracking-privacy.service.ts` and `.spec.ts` (new); `analytics.service.ts`; `analytics.service.spec.ts` (new); `meta-tracking.service.ts`; `meta-tracking.service.spec.ts` |
| API/environment verification | `front/src/app/core/services/api.ts`; `api.spec.ts`; `auth.spec.ts`; `homepage.spec.ts` (new); `checkout.ts` |
| Payment UI | `front/src/app/features/cart/cart.ts`, `cart.html`, `cart.spec.ts` |
| Quotation document | `front/src/app/features/quotations/public-quotation/public-quotation.ts` |
| Header resource privacy | `front/src/app/shared/components/page-header/page-header.html`, `page-header.css`, `page-header.spec.ts` (new) |
| Existing test scaffold repairs | `front/src/app/features/home/home.spec.ts`; `front/src/app/features/products/product-list/product-list.spec.ts`; `front/src/app/features/services.spec.ts` |
| Supported-host policy | `front/public/_headers` (new) |

In the Tracking/API rows, unqualified filenames are in `front/src/app/core/services/`.

### Backend

| Group | Files |
|---|---|
| Reconciliation | `back/twinpeaks_back/orders/reconciliation.py` (new); `orders/views.py`; `orders/momo.py` |
| Checkout tracking/notification | `back/twinpeaks_back/orders/serializers.py`; `orders/meta.py`; `orders/tasks.py` |
| Payment tests | `back/twinpeaks_back/orders/tests.py`; `orders/test_stabilization.py` (new) |
| Operator command | `back/twinpeaks_back/orders/management/__init__.py`; `orders/management/commands/__init__.py`; `orders/management/commands/reconcile_momo.py` (new) |
| Quotation/privacy | `back/twinpeaks_back/contact/middleware.py` (new); `contact/tests.py`; `twinpeaks/settings.py` |
| Isolated checks | `back/twinpeaks_back/twinpeaks/test_settings.py` (new) |

Unqualified backend paths in this table are relative to `back/twinpeaks_back/`.

### Documentation and local QA

`docs/PHASE0_STABILIZATION_REPORT.md` is new. The original audit was left unchanged. `.phase0-qa/` holds disposable logs, browser builds, the isolated PostgreSQL cluster, and local `build-browser.cjs`/`privacy-smoke.cjs` verification scripts. These are local QA artifacts, not application deployment assets or a production database.

No changes were made to `package.json`, `package-lock.json`, `requirements.txt`, database models, migrations, production credential files or the Render manifest. Missing packages already declared by those manifests were restored locally to run checks: Angular packages through `npm install --ignore-scripts`, and adminlte-django, django-components, reportlab plus their declared supporting packages in `back/.venv`. django-vite was aligned to its existing pinned `3.1.0` version. No dependency upgrade/fix campaign was undertaken.

## 6. Tests and verification results

| Check | Result / boundary |
|---|---|
| Angular unit tests in headless Edge, final source | **47 passed**; includes GA/Meta private events, encoded/nested URL rejection, private document boundaries, root navigation, PDF resource policy, environment endpoints and checkout recovery. |
| Django full test suite on isolated PostgreSQL 18 | **39 passed**, no skips; includes real separate-connection database concurrency with mocked provider I/O. |
| Django system checks | Passed with zero issues under isolated `twinpeaks.test_settings`. This is not a deployed-settings security certification. |
| Initial SQLite relevant-suite run | 30 passed with two lock-dependent tests skipped at that stage; replaced by the broader PostgreSQL run above. |
| TypeScript application `--noEmit` | Passed during verification; Angular unit/browser compilation additionally checks templates. |
| Supplemental production browser-only build | Passed; skips API route enumeration and does not replace the normal production static build. Initial bundle warning around 688 kB versus 500 kB warning budget remains. |
| Supplemental development browser-only build | Passed; used for compiled API endpoint verification. |
| Compiled environment URL assertions | Passed: development local=true/production=false; production local=false/production=true. |
| Normal Angular production static build | **Failed during API-backed route extraction timeout**, including the final retry (74.038 seconds). Browser/server bundles compiled before extraction failed; zero static routes were prerendered. No successful static production build is claimed. |
| Local headless-browser quotation privacy smoke | **Passed** with synthetic quotation/API fixtures and vendor stubs; all external traffic was intercepted. Verified private script exclusion, no token referrers, PDF noreferrer feature, acceptance, full-document exit, private browser-back navigation and public event queue exclusion. |

Important payment regression coverage:

- A later unavailable line commits no earlier stock deduction; repeated review reconciliation stays terminal.
- Successful payment cannot deduct twice or be downgraded by stale failed/pending responses.
- Duplicate historical product lines are aggregated; deleted products/legacy review/cancelled orders do not auto-allocate.
- A simulated conditional-update conflict rolls back previous deductions.
- Pending ambiguous submission followed by success allocates once; returned amount/currency mismatch requires review.
- Transport timeout persists reference; request replay returns the same payment; conflicting replay returns 409.
- Provider calls occur outside an atomic transaction in the checkout recovery test.
- Timeout/malformed status responses leave payment/inventory unchanged.
- Concurrent same-payment reconciliation deducts once; competing paid orders cannot oversell; concurrent same checkout ID causes one order and one provider call.
- The command defaults to no network and `--apply` only queries existing payments.

Quotation regression tests exercise existing-token viewing, actual PDF bytes, acceptance, decline, conflict, missing-token and validation responses with privacy headers. Tokens remain unchanged. Local browser checks use synthetic customer data and do not validate real GA/Meta delivery, merchant processing, production caching or provider callbacks.

The test harness uses an in-memory SQLite default or the explicitly opted-in local PostgreSQL instance at `127.0.0.1:55432`. It overrides database/provider settings and uses dummy/no credentials. Only disposable test databases were created/dropped. No production or existing business database was migrated, flushed or edited.

Initial check failures included sandbox build-worker access restrictions, missing installed manifest dependencies, zoneless test configuration drift, incomplete test mocks, and an isolated ALLOWED_HOSTS fixture mismatch. Those local issues were resolved. The remaining static-build timeout is not reported as a successful build.

Logs are retained under `.phase0-qa/`: `angular-unit.log`, `django-tests.log`, `production-static-build.log`, `production-browser-build.log`, `development-browser-build.log`, and `privacy-smoke.log`.

## 7. Remaining operational risks

1. **Frontend HTTP policy:** identify the actual hosting layer and activate/verify quotation no-store, no-referrer and noindex headers on real direct links and fallback responses. GitHub Pages ignores `_headers`. Backend/unit tests cannot establish edge/CDN behavior or purge previously cached content.
2. **Static production build:** API-dependent route enumeration must complete reliably before publishing. Investigate backend availability/build timeout/network conditions; do not publish browser-only QA output as a substitute without a separately reviewed rendering/hosting decision.
3. **Background reconciliation:** the new command is not scheduled. Assign an operator and configure a durable scheduler/worker only after infrastructure and provider access are confirmed. A browser leaving still needs independent monitoring of pending/unknown references.
4. **No stock reservation:** stock is allocated on provider success. Two customers may pay for competing stock; one can require manual review without overselling. Define fulfillment/refund/replenishment handling. No refund API or automatic resolution is invented here.
5. **Historical partial allocations:** existing `payment_review` records may already contain partial deductions. They are quarantined from repeat allocation, not automatically repaired. Reconcile them against provider and stock evidence before changing financial/inventory state.
6. **Ambiguous/crashed submissions:** persisted `REQUESTING`/`REQUEST_UNKNOWN` references may have been accepted, rejected or never submitted. Retry/poll errors must not prompt a new charge. Provider-not-found requires operator investigation, not an assumption of failure.
7. **Merchant environment:** the inspected Render manifest declares sandbox MoMo EUR while shop currency is SZL. The existing currency mismatch guard remains. No merchant/environment values were changed; actual merchant readiness was not checked.
8. **Older API clients:** clients omitting `meta_event_id` lack request replay deduplication. Review external consumers before making an attempt ID mandatory. Client upgrades should handle returned payment states explicitly.
9. **Privacy beyond application code:** redact token-bearing access logs, review additional installed tracking, and maintain private-link handling in email/support tools. GA Enhanced Measurement/history events should be reviewed/disabled for manual pageview accounting; `send_page_view: false` alone does not disable history measurement. Private-document exclusion is implemented independently of that setting. See [Google's pageview documentation](https://developers.google.com/analytics/devguides/collection/ga4/views?hl=en).
10. **Notification and CAPI operations:** Bird notifications remain synchronous and logged on failure; no durable email retry worker is introduced. CAPI purchase delivery remains tied to HTTP status requests, not the command, and concurrent retries can deliver the same event ID more than once for provider deduplication. Allocation correctness does not imply guaranteed analytics/email delivery.
11. **Dependencies:** restoration reported 44 npm vulnerabilities (1 low, 10 moderate, 30 high, 3 critical) for the resolved existing dependency tree. No `npm audit fix` was applied. Advisory applicability/remediation needs a separate focused review; this phase does not certify dependency security.
12. **Session recovery limits:** sessionStorage recovery is limited to that browser tab and storage availability. A lost reference/attempt or changed checkout details may require support; no customer-account order-history system was added.

## 8. Deployment considerations

No deployment was performed. Before an approved release:

1. Review the code and retain backups of application artifacts and business records. No database migrations are required for these changes.
2. Resolve the normal static-build timeout and verify generated routes/deep-link fallback behavior. Publish the verified production artifact, not `.phase0-qa/` output by default.
3. Release backend and frontend together so frontend attempt recovery/state handling matches the updated checkout response semantics. Existing public quotation tokens/endpoints continue to work.
4. Activate appropriate frontend edge headers and purge cached quotation HTML/API/PDF responses. Ensure proxies honor backend `no-store`. Verify headers on 200, 404/409, PDFs and SPA fallbacks; verify image and PDF referrers in a browser.
5. Check direct quotation entry, public→private, private→public and browser back/forward paths. Verify no third-party analytics requests or event payloads contain tokens/customer details. Review any separately configured GA/Meta/tag-manager behavior.
6. In an authorized provider sandbox, verify persisted references, rejected/unknown states, abandonment and reconciliation. Do not infer working real payments from mocked tests.
7. Assign ownership/runbook for paid-but-unallocated orders and historical reviews. Stage the `reconcile_momo` operator command before scheduling it; confirm broker/scheduler availability separately.
8. Verify local development endpoints and preserve the existing production API configuration. Do not deploy `twinpeaks.test_settings` or its dummy settings.

For an Nginx-based frontend, an equivalent quotation location can use the following reviewed pattern, adapted to the actual site's root. This is a deployment example, not an installed server configuration:

```nginx
location ^~ /quotations/ {
    add_header Cache-Control "private, no-store, max-age=0" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
    try_files $uri /index.html =404;
}
```

Ensure inherited/header rules and fallback handling preserve these headers. A client-side noindex/meta policy does not replace the HTTP response policy. [Referrer-Policy behavior is documented by MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy).

## 9. Rollback instructions

Before release, reverting the changed application files or restoring the previous approved artifacts is a code-only rollback; there is no migration to reverse. Preserve any existing user changes and do not run blanket Git resets or database flushes.

After checkout attempts have been created with this implementation, a blind rollback is unsafe: the old reconciliation code reintroduces the stock bug and does not understand the safe ambiguous-submission workflow. Pause new checkout activity first, preserve all Order/Payment/reference/event-ID records and inventory evidence, and retain the fixed reconciliation component or reconcile open attempts before returning to a previous application release. Do not reset successful payment markers, auto-credit stock, recreate orders or resubmit provider requests as part of rollback.

Keep quotation privacy guards/header policies during any rollback that retains quotation customer access. Returning to the old initial GA snippet reintroduces token leakage; roll back unrelated code selectively or apply an equivalent tracking exclusion first. Existing tokens must not be rotated merely to roll back this code.

For local QA cleanup, stop only the isolated PostgreSQL instance associated with `.phase0-qa/postgres`; do not stop other installed database services. Local QA artifacts can be retained for evidence. No recursive deletion or production cleanup was performed.

## 10. Completion note

Phase 0 stops here. No Phase 1 redesign or retail migration has started. Final verification: 47 Angular tests passed; 39 Django tests passed on isolated PostgreSQL; local browser privacy smoke passed; supplemental browser-only builds passed. The final normal static production build failed at API-backed route extraction with a timeout, and frontend HTTP cache/header activation remains a hosting/deployment requirement.

Application dependency manifests were verified unchanged and the frontend diff passed its whitespace check. No production verification or deployment is claimed. The isolated `.phase0-qa/postgres` instance was shut down successfully; its disposable files/logs were retained without recursive deletion.
