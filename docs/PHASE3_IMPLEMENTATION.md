# TwinPeaks Frontend V2 — Phase 3

Date: 11 October 2026. Scope: corporate pages and lead generation in `front-v2/`. No deployment, legacy frontend changes, backend changes, data changes or new dependencies.

## Implemented features

Completed `/about`, `/contact` and `/request-quote` as lazy Angular 20 standalone pages using the existing theme service, signals, Reactive Forms, shared layout, Poppins, official logo and local technology concept images. Preserved the six solution areas and all existing routes, including issued private quotations and `/services` compatibility.

About includes introduction and solution/contact CTAs, approved company positioning, values, six practical benefits, capabilities and final quotation CTA. API overview, mission and vision are displayed only when non-placeholder copy exists. There are no invented biographies, team portraits, milestones, customer counts or certifications. The verified `GET /api/leaders/` currently returns an empty array, so no team section is rendered. A team section remains dependent on verified copy and approved portraits.

Contact includes validated name, email, telephone, optional organization, service selection, message and permission to contact the customer about the enquiry. The API-backed contact panel provides telephone/email/WhatsApp actions only when the corresponding fields exist, plus location, office hours and quotation CTA. WhatsApp is a direct contact action with no customer information in its URL and no external request until clicked.

Quotation requests include customer type, conditional business name, multiple solution categories, project description, location, optional budget/timeline/preferred assessment date, contact permission, review summary and confirmed receipt reference. Dates are explicitly preferences, not bookings. No payment, retail, customer account or document upload functionality is introduced.

## Design and reference decisions

Reviewed the approved About/Contact/Quote mockups under `Downloads/light_mode/` and `Downloads/dark_mode/`, alongside existing tokens, refined shared UI, layout and earlier architecture/implementation reports. Followed their split technology hero, restrained blue accents, bordered surfaces, two-column contact/quotation composition, numbered form sections and supporting information hierarchy. Both themes share one DOM and consume existing CSS variables.

Used existing optimized WebP concept imagery, labeled as concepts rather than actual offices/installations. No prominent scenery, social-media promotion, new UI library, animation dependency or invented FAQ response guarantees. Mockup phone numbers, office locations, staff identities, milestones and customer statistics were not treated as business facts. Mobile stacks columns and fields with native controls, visible focus and existing reduced-motion behavior.

## Verified backend contracts

Source: `back/twinpeaks_back/contact/{models,serializers,views,urls,tasks}.py`, company and leadership serializers/views/routes. Existing clients remain unchanged.

| Endpoint | Usage and limitations |
|---|---|
| `GET /api/company/` | Existing `CompanyStore`; published company/contact fields; honest loading/unavailable states and retry. Missing fields are omitted. |
| `GET /api/projects/:slug/` | Validated contextual project slug must resolve to the same published slug and a nonempty title. Unverified references are omitted; the form remains usable. |
| `POST /api/contact/` | Sends exactly `name`, `email`, `message`. Telephone, organization, approved category/context and contact permission are labeled lines in the existing message TextField. These are not structured database fields. A valid returned integer id and creation timestamp confirm persistence. |
| `POST /api/quotations/` | Sends `name`, `email`, digit-only `phone_number`, `company_name`, `address`, `message`, `items`. Each chosen category becomes one supported custom-description item with quantity 1. Budget, timeline, customer type, assessment preference, description/context and permission use the existing bounded message field. |
| `GET /api/leaders/` | Read-only content verification only; empty locally. No invented frontend endpoint or fallback personnel. |

The quotation serializer explicitly supports multiple custom-description items. This avoids interpreting frontend slugs as database IDs or silently matching unavailable/ambiguous service records. Staff will see “Custom requirement” items with the requested category in their descriptions. They must assess/price them before issuing a quotation; no zero-price promise is shown to visitors. A requested quotation response must contain the expected `TP-Q-YYYY-NNNN…` number, requested status and UUID token. Only the reference is retained in transient UI state; the returned access token is not stored, logged, placed in metadata or navigated to automatically.

Confirmed limits: name 120, organization 150, normalized quote phone 8–15 digits, address 1,000, quote message 4,000, custom item description 2,000, quantity 1–99. Frontend project description is bounded at 3,000 to leave room for structured context; the complete message is checked before POST. Contact message is bounded at 4,000 in the UI; the backend TextField has no equivalent serializer maximum.

## Validation and submission behavior

- Native accessible inputs/selects/textareas/checkboxes with label associations, autocomplete, required indicators, inline errors, descriptions, `aria-invalid`, fieldsets/legends and alert/status feedback. Quotation business name becomes required only for businesses; at least one category and contact permission are required.
- No POST before validation; quotation review performs no POST. Confirmation requires a valid backend response, not a button click or generic HTTP success.
- Component-scoped submission state blocks concurrent/repeated clicks and blocks further sends after confirmed success. Contact controls and quotation editing are disabled while pending. Requests cancel when components are destroyed. Successful forms clear customer fields.
- Server 400 responses map known field keys to generic validation messages without echoing server payloads. Other rejected requests preserve inputs. Unknown validation errors receive a generic message instead of guessed facts.
- Network loss, timeout, 5xx and malformed successful responses are treated as uncertain: the request may already be saved. No automatic retry. Resending requires a deliberate acknowledgement after the customer checks the outcome. Editing/reviewing does not bypass that guard.
- 429 honors numeric/date `Retry-After`, uses a conservative 60-second fallback when absent/invalid, disables submission during the wait and performs no automatic POST. These are client safeguards; the existing anonymous backend throttle remains authoritative.
- Query context uses only one of the six known `solution` slugs, exact `enquiry=site-assessment`, and bounded ASCII project slugs verified through the public project API. Arbitrary parameters never fill customer identity or become request content. Client context changes cancel previous project requests and update pristine category selections without overwriting edited fields.

## Security, privacy and SEO

No analytics or new third-party scripts. Customer inputs remain in component memory; no local/session storage, URL parameters, logging or metadata receives form contents. Only theme preference is stored. Confirmation never displays a private access token. Direct API POSTs continue using the existing empty-referrer/no-store client and eight-second timeout.

Public pages have distinct static titles/descriptions, canonical/Open Graph metadata and breadcrumbs. SSR renders blank forms and public company/context information; entered customer data and review summaries are browser state and are not SSR transfer state. Form-page responses now have `private, no-store, max-age=0` in SSR route configuration, Node hosting and `_headers`. All pages keep no-referrer. Existing private quotation client rendering, headers, metadata normalization, PDF links and accept/decline components are preserved.

Legal routes use a reusable preview layout, explicitly marked “Legal copy awaiting approval,” and retain noindex. Functional contact permission is not presented as acceptance of nonexistent approved terms, marketing consent or a company privacy policy. Approved privacy/terms information is a release dependency.

## Changed and new files

Paths below are relative to `front-v2/` unless stated otherwise.

| Area | Files |
|---|---|
| Corporate page | New `src/app/features/about/about.ts` |
| Lead pages/context | New `src/app/features/leads/contact.ts`, `contact.html`, `request-quote.ts`, `request-quote.html`, `lead-context.ts` |
| Shared form UI/state/helpers | New `src/app/shared/forms/form-ui.ts`, `company-contact.ts`, `submission.ts`, `lead-helpers.ts` |
| Routing/legal | Updated `src/app/app.routes.ts`, `app.routes.server.ts`, `features/page-shell/page-shell.ts` |
| Theme-aware styling | New `src/styles/_leads.scss`; updated `src/styles.scss` |
| Hosting | Updated `src/server.ts`, `public/_headers` with form-document no-store |
| Unit/browser QA | New `src/app/features/leads/leads.spec.ts`, `tests/phase3-checks.cjs`, `tests/capture-corporate.cjs`; extended `tests/browser-checks.cjs` |
| Report | New `docs/PHASE3_IMPLEMENTATION.md` |

No dependencies/environment/API client/theme-service/private-quotation components were changed. QA artifacts, logs, baselines and screenshots are in ignored `front-v2/test-results/`.

## Verification

All automated POSTs are synthetic on isolated API port 18181; SSR/browser QA uses 18182 and leaves the ordinary backend on 8000 untouched. No real enquiry, quotation creation, email delivery, payment or private customer document viewing is exercised. Verification used bundled Node 24.19.0 and headless Edge 156.

| Check | Final result and evidence in `front-v2/test-results/` |
|---|---|
| Angular production build | Passed, exit 0; initial browser bundle **367.36 kB raw / 100.79 kB estimated transfer**, within budgets; `phase3-build-production.log` |
| QA and development builds | Passed, exit 0; `phase3-build-qa.log`, `phase3-build-development.log` |
| Unit regressions | **64 passed**, exit 0: all 48 prior tests plus 16 new lead tests; `phase3-unit-tests.log` |
| Browser/SSR regressions | **34 passed**, exit 0: all 25 earlier scenarios plus nine Phase 3 scenarios; `phase3-browser-checks.log`, `phase3-browser-results.json` |
| Browser errors | Zero runtime/hydration exceptions; no non-local browser requests in QA |
| Responsive behavior | About/Contact/Quote in both themes at 320, 375, 390, 768, 1024 and 1440px; earlier page matrices also passed |
| API behavior | Contract key sets/custom items, validation, conditional business name, multiselect, pending controls, single submission, success, preserved inputs, 400, 429, 503, network loss, malformed responses and explicit ambiguous retry |
| Privacy and SSR | Blank public forms/static metadata, form no-store headers, empty POST referrers, no persistent customer inputs/tokens; prior private document/PDF/accept/decline tests passed |
| Environment isolation | Production bundle includes production API and excludes development/QA API literals; development does the reverse; `phase3-production-environment.json`, `phase3-development-environment.json` |
| Local-content capture | **12 screenshots**, 36 new-page theme/width checks; actual local company API, **GET only**, zero browser errors; `phase3-local-capture.log`, `phase3-local-capture.json` |
| Source preservation | **321 baseline files checked**; only three expected v2 routing/hosting files changed. No unexpected change, including legacy/backend/credentials/private quotation components; `phase3-source-preservation.json` |

The final on-disk `dist/front-v2/` is a development build used for local captures. Production verification was completed separately; build the production configuration again for any later authorized release. No infrastructure blocked the frontend checks. Real notification delivery and production operations remain unverified.

The initial verification exposed duplicate wrapper/input IDs; these were corrected by using `fieldId` for the shared wrapper. Quotation server-validation messages initially disappeared when conditional controls were recreated after review; component-scoped field messages now persist until the affected value changes. Keyboard focus moves to invalid controls, the review heading, the first edited field and confirmed receipt after rendering. Fixture typing/providers, a strict required-label selector and an existing filter assertion that read before rendering were also corrected. Failed preliminary runs are not counted as final passes.

### Screenshots and visual review

Final captures below use actual local published company contact information and blank customer forms. Concept media is labeled. All six page/theme combinations were captured at desktop 1440px and mobile 390px; widths beyond those captures were checked separately. Inspected rendered desktop/mobile output for composition, typography, image treatment, field spacing, contact-detail wrapping and dark-theme separation. The implementation follows the approved composition while omitting unverified people, metrics, maps/addresses, response guarantees and project outcomes.

| Page | Light desktop | Dark desktop | Light mobile | Dark mobile |
|---|---|---|---|---|
| About | [View](../front-v2/test-results/phase3-about-light.png) | [View](../front-v2/test-results/phase3-about-dark.png) | [View](../front-v2/test-results/phase3-about-light-mobile.png) | [View](../front-v2/test-results/phase3-about-dark-mobile.png) |
| Contact | [View](../front-v2/test-results/phase3-contact-light.png) | [View](../front-v2/test-results/phase3-contact-dark.png) | [View](../front-v2/test-results/phase3-contact-light-mobile.png) | [View](../front-v2/test-results/phase3-contact-dark-mobile.png) |
| Request a Quote | [View](../front-v2/test-results/phase3-request-quote-light.png) | [View](../front-v2/test-results/phase3-request-quote-dark.png) | [View](../front-v2/test-results/phase3-request-quote-light-mobile.png) | [View](../front-v2/test-results/phase3-request-quote-dark-mobile.png) |

QA evidence is ignored by Git, following the existing project pattern; preserve these artifacts separately when sharing the review. Reproduce with:

```powershell
cd front-v2
npm run build:qa
$env:PHASE2_QA='1'
$env:PHASE3_QA='1'
# Set PLAYWRIGHT_MODULE to an already available Playwright installation.
npm run test:e2e
$env:CHROME_BIN='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
npm test -- --browsers=ChromeHeadless
npm run build
npm run build:development
node tests/capture-corporate.cjs  # local API GET-only captures, SSR port 18183
```

## Local content review and launch dependencies

Read-only local API inspection on 11 October 2026 confirms company profile name “Twinpeaks Investment”; overview and mission “Coming soon”; vision “Coming Soon”; telephone `+26879700129`; WhatsApp `26879700129`; email `support@twinpeaksinvestment.com`; address “Ngwane Park, Manzini”; hours “0600-1800hrs”. Contact details are published API content, not independent business verification. Confirm spelling, hours format and operational channels before release. Replace placeholder overview/mission/vision with approved copy; they are currently omitted from the public story/purpose content. The leadership list is empty; no approved personnel/portrait dataset was supplied.

Carry forward Phase 2.5 content issues: no active service records; one published CCTV project with placeholder descriptions and an unrelated booking-dashboard image. This phase does not edit those records. Administrators must correct published content and confirm editorial service/project mappings before launch.

Neither public creation endpoint supports idempotency keys or a public request-status lookup. UI safeguards cannot guarantee exactly-once creation across lost responses, reloads, multiple tabs or deliberate retries. Backend idempotency and durable status/reconciliation are separate authorized backend work. Do not claim the acknowledgement removes this risk.

Notification delivery is separate from persistence. Existing synchronous notification calls may delay responses; the frontend timeout can occur after a save. No provider delivery/CORS/production availability testing was performed. Confirm real email routing and provider behavior in an authorized staging environment before launch.

Contact response bodies echo customer fields and do not explicitly set private/no-store backend headers like quotations. The client uses no-store, but reverse proxies/server response headers, request/body logging, HTTPS, CORS, retention/access controls and notification logging need operational review. Do not expose a debug backend or QA server publicly. Existing anonymous IP throttling is not a complete spam prevention strategy; no CAPTCHA or unsupported anti-spam endpoint is invented here.

Earlier development-tooling dependency advisories remain outside this dependency-free phase. Full screen-reader/WCAG certification, real devices/Safari, production caching and operational notification delivery are not established by these tests.

## Deployment and rollback

No deployment performed. Review the pages/screenshots and supply approved legal/company content first. Deploy only a production build with the existing production environment; never deploy `qa` output. Confirm the actual host applies `_headers` or equivalent Node/proxy rules. Quotation privacy rules must continue to take precedence.

Rollback is frontend-only: restore the previous deployed v2 artifact or revert the Phase 3 routes, legal layout, stylesheet inclusion and form-hosting additions, then remove the new corporate/form files. Keep prior theme/private quotation behavior and headers. No database rollback, migration or token regeneration is needed; any requests created after a later authorized deployment must remain in the backend.

Stop after Phase 3 for review. No later phase begins automatically.
