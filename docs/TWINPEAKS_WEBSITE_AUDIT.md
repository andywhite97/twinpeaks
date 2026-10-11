# TwinPeaks Investment — Website Audit and Restructuring Assessment

Audit date: 10 October 2026 (Africa/Johannesburg)  
Scope: Angular frontend in `front/`, relevant Django integrations in `back/twinpeaks_back/`, and the adjacent product importer.  
Status: Audit only. No application code, database models, APIs, dependencies, or existing assets were changed.

## 1. Executive summary

TwinPeaks has a usable foundation for a professional solutions website: standalone Angular components, lazy route loading, shared page headers and notifications, an API-backed homepage, projects, company information, enquiry capture, and a substantial quotation workflow. A wholesale rewrite is not justified by the inspected architecture.

The main business problem is inconsistent positioning. The homepage offers technology solutions, but shopping categories, featured products, manufacturer links and a persistent cart make retail a major part of the experience. Route metadata, initial HTML and structured data emphasize creative agency services; an application fallback even describes financial advisory. This weakens the intended identity as an Eswatini technology, security and digital solutions provider.

Retail separation is more than deleting `/products` and `/cart`. Product data is used in the homepage, quotation picker, quotation records, order conversion, manufacturer relationships, prerendering, sitemaps, Meta catalog feeds and purchase tracking. Professional quotations must survive the separation, including historical product references and service orders.

The highest priority technical findings are payment reconciliation risks, quotation-token exposure to third-party page tracking, missing enquiry form labels and validation feedback, inconsistent SEO, and a tablet navigation breakpoint gap. Performance opportunities include a 2,165,734-byte favicon, large header images, global theme CSS, globally loaded Swiper, and unnecessary public asset copying.

Recommended direction: retain the existing Angular foundation; establish service-led positioning and dedicated solution pages; improve the lead funnel and technical safeguards; then migrate retail into an independently branded application with explicit ownership of catalog, payments, orders, customer data and analytics. Multi-vendor capabilities require a separate domain design, not merely rebranding this single-store checkout.

## 2. Evidence and limits

Labels used throughout:

- **Confirmed:** directly visible in source, configuration, templates or local asset metadata.
- **Inferred risk:** a likely consequence of a confirmed implementation, requiring runtime or deployment verification.
- **Recommendation:** a proposed future change, not an existing feature or completed action.
- **Unverified:** cannot be established from this checkout alone.

Files are relative to the workspace root unless stated otherwise. Tables use exact source paths or clearly stated directory conventions. Existing planning documents were not treated as proof that their recommendations were implemented.

This is a source-based architecture, template and integration audit. It did not execute checkout, submit enquiries, inspect production customer data, run builds or tests, install packages, or change deployment state. No browser screenshots, Lighthouse measurements, screen-reader sessions, production headers, Search Console data, live API content or payment credentials were examined. Consequently, contrast, actual mobile overflow, runtime hydration, live payment readiness and Core Web Vitals remain unverified. Asset sizes below are raw local bytes, not compressed transfer measurements. Existing `dist/` output was not treated as current source truth.

The frontend is a separate Git checkout; its status was clean during inspection. The workspace root/backend did not provide a usable Git status in this environment. No `AGENTS.md` was found in the inspected workspace. Only this report was created.

## 3. Current website architecture

### 3.1 Frontend foundation

| Layer | Confirmed implementation | Assessment |
|---|---|---|
| Framework | Angular packages pinned to `20.3.16`; RxJS `~7.8.0`; TypeScript `~5.8.2` in `front/package.json` | Consistent declared Angular versions; installed resolution, advisories and current support status were not assessed. |
| Bootstrap | `front/src/main.ts`, `app/app.config.ts` | Standalone application; zoneless change detection; HTTP interceptor; hydration with event replay. |
| Routing | `front/src/app/app.routes.ts` | Lazy `loadComponent` routes, aliases and wildcard fallback; `PreloadAllModules` configured globally. |
| Layout | `app.ts`, `app.html`, `app.css` | One shared navigation/main/footer/toast shell for marketing, retail and private quotation links. No separate retail or customer-document layout. |
| Rendering | `front/angular.json`, `app.config.server.ts`, `app.routes.server.ts` | Application builder, `outputMode: static`; product/project slug enumeration calls APIs at build time. Quotation token pages explicitly use client rendering. |
| State | Signals in cart, quotes, notifications and several pages; ordinary fields plus `markForCheck()` in others | Mostly coherent, but mixed approaches make asynchronous updates harder to reason about. |
| HTTP | `core/services/api.ts`; separate direct HTTP use in homepage/auth | Small shared API wrapper, but weak request typing (`any`) and uneven error handling. |
| Styles | `src/styles.css`, component CSS, `public/css/theme.min.css`, Swiper CSS | Legacy Reign/theme conventions layered with newer component styling and global overrides. |
| Validation | Reactive forms and Django serializers | Server validation exists; client constraints and feedback do not consistently match it. |
| Tests | Karma/Jasmine; many component/service creation tests; meaningful Meta tracking tests | Useful basic scaffolding, limited demonstrated behavior coverage. Backend has checkout tests. No test execution was performed. |

Production API URL is `https://backend.twinpeaksinvestment.com/api`. The development environment declares localhost, but `ApiService`, `AuthService` and `HomepageService` import `environment.ts` directly, while the production replacement in `angular.json` targets `environment.development.ts`. **Confirmed:** normal development serving therefore still uses the production URL for those services. `MetaTrackingService` imports the development file, which is replaced for production. Normalize the import convention later; local form/payment testing against production is a material risk.

### 3.2 Route inventory

All routes below are declared in `front/src/app/app.routes.ts`. Component paths are relative to `front/src/app/`.

| Route | Component/source | Rendering and integration | Proposed disposition |
|---|---|---|---|
| `/` | `features/home/home.ts` | Prerender; `/api/homepage/`; nine child sections | Keep; improve service hierarchy; migrate shopping sections. |
| `/products` | `features/products/product-list/product-list.ts` | Prerender base page; category/brand/sort query parameters; pagination | Migrate to retail brand. |
| `/products/:slug` | `features/products/product-detail/product-detail.ts` | API-enumerated prerender; detail, images, related products, cart, quote, sharing | Migrate retail; preserve installation referral path. |
| `/cart` | `features/cart/cart.ts` | Catch-all prerender policy; browser-local cart; MTN MoMo checkout | Migrate; use explicit client rendering for personal checkout state. |
| `/services` | `features/services/service-list/service-list.ts` | Prerender; `/api/services/`; adds service to quote basket | Keep and improve. No service detail route exists. |
| `/projects` | `features/projects/project-list/project-list.ts` | Prerender; `/api/projects/` | Keep as evidence/case studies. |
| `/projects/:slug` | `features/projects/project-detail/project-detail.ts` | API-enumerated prerender; `/api/projects/:slug/` | Keep; improve metadata and enquiry CTA. |
| `/gallery` | Redirect to `/projects` | Client route redirect; old gallery feature remains | Keep alias while needed; retire unused feature after validation. |
| `/about` | `features/leadership/leadership-list/leadership-list.ts` | Prerender; company profile and leaders | Keep; broaden beyond mission/team. |
| `/leadership` | Redirect to `/about` | Alias; no `pathMatch: 'full'` declared | Keep if linked externally; make exact alias behavior deliberate. |
| `/contact` | `features/contact/contact.ts` | Prerender; POST `/api/contact/` | Keep; improve contact consistency and accessible form. |
| `/request-quote` | `features/quotations/request-quote/request-quote.ts` | Prerender shell; local basket; products/services picker; POST `/api/quotations/` | Keep; decouple from retail catalog. |
| `/quotations/:token` | `features/quotations/public-quotation/public-quotation.ts` | Explicit client rendering; token API, PDF, accept/decline; route `noindex, nofollow` | Keep as protected customer-document workflow. |
| `/404` | `features/not-found/not-found.ts` | Prerender; ordinary route metadata | Keep; host must serve correct HTTP status. |
| `**` | Redirect to `/404` | Angular fallback | Keep; does not by itself guarantee HTTP 404 or deep-link hosting support. |

No login, account, order-history, vendor, independent checkout or service-detail routes are declared. No route uses `authGuard` or `canActivate`.

### 3.3 Component inventory

Each directory below contains the corresponding `.ts`, `.html` and `.css` unless noted.

| Group | Components and locations | Role |
|---|---|---|
| Root | `front/src/app/app.*` | Global shell and SEO/analytics lifecycle. |
| Shared | `shared/components/navigation`, `footer`, `page-header`, `loader`, `toast-notifications` | Retain with design/accessibility improvements. |
| Shared retail | `shared/components/product-card` | Retail card, inventory badge and cart toggle; migrate despite its shared location. |
| Homepage | `features/home/components/hero`, `solutions`, `statistics`, `projects`, `testimonials`, `cta` | Service-site building blocks; rewrite copy and validate evidence. |
| Homepage commerce | `features/home/components/featured-products`, `featured-categories` | Explicit shopping sections; migrate. |
| Homepage mixed | `features/home/components/brands` | Manufacturer logos currently link to product filters; retain presentation if useful, revise link semantics. |
| Public pages | Home, ProductList, ProductDetail, Cart, ServiceList, ProjectList, ProjectDetail, LeadershipList, Contact, RequestQuote, PublicQuotation, NotFound | Route mapping above. |
| Unrouted | `features/gallery/gallery-list`, `features/auth/auth` | Legacy gallery and auth scaffold; no current route points to them. Verify import/external dependencies before future removal. |

Shared models: `product.model.ts`, `services.model.ts`, `homepage.model.ts`, `company-profile.model.ts`, `leader.model.ts`, `gallery.model.ts`, `paginated-response.model.ts`. Pipes: `markdown.pipe.ts`, `optimized-image.pipe.ts`, `truncate.pipe.ts`. Product types are also embedded in homepage and quotation dependencies, so directory placement alone is not a reliable domain boundary.

### 3.4 Services, guards and shared functionality

| Service/source | Confirmed responsibility | Assessment |
|---|---|---|
| `core/services/api.ts` | GET, POST, endpoint URL construction | Keep; add typed requests and deliberate error policy. |
| `company-profile.ts`, `homepage.ts` | Company and aggregated homepage content; homepage uses `shareReplay` | Keep; split retail payload from service content later; cached client content lacks explicit refresh. |
| `features/services.ts`, `features/leadership/leadership-service.ts`, `features/projects/project.ts` | Services, leaders and project APIs | Keep; standardize service naming/location without overengineering. |
| `features/products/product.ts` | Products, categories, brands, related products | Migrate. |
| `core/services/cart.ts`, `checkout.ts` | Local cart and MoMo endpoints | Migrate after fixing reliability risks. |
| `core/services/quotation.ts` | Local products/services/custom quote basket | Keep professional workflow; adapt ownership and validation. |
| `notification.service.ts` | Signal-based timed notifications | Keep; supplement with persistent contextual errors. |
| `seo.service.ts`, `structured-data.service.ts` | Title/meta/canonical and JSON-LD | Keep; centralize verified company identity and route-specific metadata. |
| `analytics.service.ts`, `meta-tracking.service.ts` | GA events and Meta commerce events | Split lead analytics from retail analytics; exclude private token URLs. |
| `auth.ts`, `token.ts`, `core/interceptors/auth.ts` | Login POST; localStorage JWTs; attaches bearer header to every HTTP request with a token | No routed login UI, refresh flow or 401 recovery found; review before retention/removal. |
| `core/guards/auth-guard.ts` | Always returns `true` | Unused placeholder, provides no authorization. |
| `features/gallery/gallery.ts` | Legacy gallery API | No current gallery route renders GalleryList. |

### 3.5 Technical debt and unnecessary complexity

**Confirmed:** legacy animation/parallax attributes (`data-zanim-*`, Rellax attributes) and many inline styles persist, but `src/index.html` loads only Swiper as a local script. Much of the legacy vendor tree is copied into output by the public asset glob without being referenced there. Copied files increase artifact size; they are not all browser downloads.

`navigation.css` contains rules for a second navigation vocabulary (`.site-nav`, `.nav-panel`, `.nav-toggle`, `.brand`) that the active template does not use. Large templates and some classes are compressed into single lines, hindering review. Auth and gallery scaffolding add conceptual overhead without active routes. Multiple SEO/planning documents at the workspace/frontend roots are a documentation-maintenance risk; consolidate only after comparing them with implementation.

`ProductList` and `ProductDetail` subscribe to route streams and issue nested HTTP subscriptions without cancellation. Rapid changes can allow older responses to overwrite newer state. `ProductDetail` does not reset/destroy its existing related-products Swiper when a new slug is loaded. `ProjectDetail` and `PublicQuotation` read a route snapshot only; navigation between parameters on the same component can retain the previous record. Use cancellable route-driven loading and deliberate lifecycle cleanup.

Brands and testimonials queue Swiper initialization after view checks without an existing-instance guard, then destroy/recreate the instance. This can restart state on later checks; frequency and visible impact require browser verification. Testimonials also access `window` without a platform guard, unlike brands/categories, making the prerender path with multiple testimonials a potential build failure. Prefer a small shared adapter or simpler static grids where interaction adds little value.

`LeadershipList` assigns company data to ordinary fields without `markForCheck()` in that callback. In the zoneless/OnPush app, a later company response may not render until another notification. Most other OnPush HTTP callbacks explicitly mark for check. Normalize this pattern.

## 4. UI/UX and business positioning findings

### 4.1 Homepage

**Confirmed:** section sequence is hero → solutions → shopping categories → featured products → statistics → projects → brands → testimonials → CTA (`features/home/home.html`). This gives retail space before project evidence. Generic phrases such as “Focused offerings for ambitious teams,” “some cool facts,” and “Excited to start your next project?” do not explain security installation, technical support, local coverage or business outcomes.

The hero has a full-height desktop container and a 38rem mobile minimum. **Inferred risk:** relevant service information and proof may be pushed far below the first screen on small/short devices. The arrow links to `#about-us`, but this ID is absent from the assembled home template/sections. The fallback “Request a quote” CTA targets `/contact`, while the navigation quote CTA targets `/request-quote`. API-configured destinations may differ; live settings were not examined.

The homepage hides the loading state after an API error and renders fallback/empty sections without an error or retry message. A sparse site can appear successful even when its content request failed. Keep an informative fallback, direct contact CTA and recoverable error state.

**Recommendation:** lead with “Technology, security and digital solutions in Eswatini,” subject to business approval, followed by specific installation/support outcomes. Prioritize solution pillars, real project evidence, delivery process, support commitments, testimonials and a consultation/site-assessment CTA. Manufacturer logos can demonstrate supported technology, but should not imply certifications or formal partnerships without evidence.

### 4.2 Navigation and footer

**Confirmed:** Products precedes Services; the global cart is shown on every route, including quotation pages. Navigation uses a text-only “Twinpeaks” brand even though logo assets exist. There are seven text destinations including the quote CTA plus the cart.

The template uses `navbar-expand-lg` (theme desktop expansion at 992px), while custom open/closed menu behavior is defined only below 768px. The collapse element lacks Bootstrap's `collapse` class. **Confirmed CSS mismatch:** from 768–991px the custom `.is-open` behavior has no matching display rules, while the desktop expansion has not begun. **Inferred consequence:** an always-visible stacked menu and ineffective toggle; verify at 768, 820 and 991px before fixing. Escape and link-click close behavior exist; focus return, click-away behavior and active-page `aria-current` are not implemented.

Footer contact details come from the company API but are rendered as text, including phone/email/WhatsApp. The contact page hardcodes different data. The email there is `contact@twinpeaksinvestments.com` (plural) while the main site and schema use the singular domain and schema email is `info@twinpeaksinvestment.com`. Ownership/deliverability of either address is unverified. The phone URI lacks the `+` used in visible international text. Standardize a verified company record and clickable contact methods.

No privacy, terms or retail policy routes/links are declared. Footer columns reserve space for four medium-width groups but currently populate only Company and Explore. The absolute-positioned copyright footer is an overlap risk on unusual content heights; inspect before changing.

### 4.3 Services, projects and about

**Confirmed:** services are short API cards with quote buttons and no detail routes. The process section describes software production and server launch, which is unsuitable as a universal installation/security process. Service headings skip directly to `h5`. Recommend service-specific benefits, scope, site assessment, installation, commissioning, training and maintenance steps where relevant.

Projects support images, location, category and completion date, but the detail page offers only “Back to projects.” Add a contextual “Request a similar solution” CTA and case-study content: customer problem, installed solution, scope and verifiable outcome. The current project detail duplicates an `h1` already provided by PageHeader; harmonize hierarchy. About likewise relies on mission/vision/team with generic fallbacks and little explicit company capability evidence. A literal `.` is present immediately after the team `@for` opening block in `leadership-list.html` and will render with each entry.

### 4.4 Mobile and interface consistency

**Confirmed positives:** responsive column classes, mobile spacing/type rules, full-width mobile hero CTAs, touch-height rules for buttons/inputs, explicit focus-visible outline, reduced-motion CSS, lazy images and toast announcements.

**Recommendations requiring visual validation:** align section spacing and card radius/shadow treatment; reduce excessive uppercase/letter spacing; check two-column retail cards at 320–390px; check basket title/quantity/remove rows with long titles; verify header contrast over photographs, fixed-nav offsets, tablet menu behavior and 200–400% zoom. `overflow-x: clip` can hide overflow symptoms rather than resolve their cause. CSS reduced motion does not stop JavaScript Swiper autoplay; provide pause behavior and respect reduced-motion preferences in slider configuration. Team social links revealed through hover need keyboard/touch verification.

## 5. Lead generation assessment

| Confirmed finding | Evidence | Recommended improvement |
|---|---|---|
| Contact captures name/email/message; posts to backend; success/error toasts; resets on success | `features/contact/contact.ts` | Retain a low-friction enquiry path; add optional phone, service interest and preferred contact method where useful. |
| Contact fields have placeholders but no labels; quote fields and basket controls also lack accessible names | `contact.html`, `request-quote.html` | Add persistent associated labels, required indicators, help text, autocomplete and field-specific errors. |
| Quote form marks touched fields but template displays no field errors | `request-quote.ts/html` | Explain invalid name/email/phone and focus the first invalid control. Map server errors back to fields. |
| Phone validators require 8–15 digits; `+268` and spaces are rejected | `request-quote.ts`, `cart.ts`; backend serializers | Normalize common formats before validation and explain accepted country format. |
| Direct quote requires a nonempty basket; picker loads six products plus services | `request-quote.ts` | Offer a direct service/site-assessment enquiry; basket should be optional for visitors unsure what equipment they need. |
| Product/service picker loads eagerly with no error callbacks | `request-quote.ts` | Load only when needed; distinguish loading/error/empty; keep custom requirement path usable offline from catalog. |
| Frontend quote quantity lacks server max 99/integer enforcement; several text max lengths are missing | `quotation.ts`, `request-quote.ts`; `contact/serializers.py` | Match constraints and display actionable feedback. |
| Stored basket assumes parsed data is valid; write exceptions are not caught | `core/services/quotation.ts` | Validate a versioned schema and gracefully handle restricted/quota-full storage. |
| Contact button says “Give us a shot”; CTA labels vary | Templates above | Use “Send enquiry,” “Request a consultation,” or “Book a site assessment” with clear next steps. |
| No response-time promise, follow-up choice or privacy explanation in the forms | Contact/quote templates | State a realistic business-approved response window and how submitted details will be used. |
| GA lead helper methods exist but are not called by contact/quote submission code | `analytics.service.ts`, contact/quote components | Track successful lead submissions and contact clicks; connect quote reference to internal sales outcomes without sending personal data to analytics. |
| Backend persists enquiries and uses Bird email acknowledgement/team notification; provider exceptions are logged | `contact/views.py`, `contact/tasks.py` | Preserve this useful workflow; add delivery monitoring/retry and an accountable sales owner. Current “tasks” functions run synchronously, not as a demonstrated queue. |

Recommended funnel: service detail → relevant project/proof → consultation/site assessment → minimal form → durable reference/confirmation → assigned follow-up → issued quotation → acceptance → installation/support. Track qualified enquiries, accepted quotes and resulting revenue alongside raw form counts. Add prominent click-to-call and verified WhatsApp enquiry links; current WhatsApp functionality in product detail is social sharing, not direct support.

## 6. E-commerce dependency map

### 6.1 End-to-end map

```text
Home + navigation + footer
  ├─ featured categories/products → ProductCard → CartService
  ├─ brands → /products?brand=slug
  └─ product/service/custom quotation → QuotationService → /api/quotations/

/products + /products/:slug → ProductService
  └─ /api/products/, /categories/, /brands/, products/:slug/related/
       └─ products.Product / ProductCategory / ProductImage
            └─ homepage.Brand (shared manufacturer record)

/cart → CheckoutService → /api/checkout/momo/
  └─ orders.Order + OrderItem + Payment
       ├─ products.Product (inventory and server pricing)
       ├─ MTN MoMo Collection API
       ├─ Bird order notifications
       └─ Meta Conversions API purchase
  └─ GET /api/checkout/momo/:uuid/ → provider reconciliation

ProductDetail / ProductCard / Cart → MetaTrackingService → Meta Pixel
products/views.py → /api/meta/catalog-feed.csv → Meta catalog
app.routes.server.ts → product API enumeration → static product HTML
core/sitemaps.py → product URLs on frontend domain

Professional quotations → contact.Quotation + QuotationItem
  ├─ products.Product (optional)
  ├─ services.Service (optional)
  └─ converted_order → orders.Order, including service/custom lines

TwinPeaksImporter → local supplier import/SQLite/image downloads → JSON export
  └─ adjacent catalog tooling; no direct Angular/runtime API connection established
```

### 6.2 API and backend ownership inventory

| Endpoint/domain | Backend evidence | Separation impact |
|---|---|---|
| `GET products/`, `products/:slug/`, `products/:slug/related/`, `categories/`, `brands/` | `products/urls.py`, `views.py`, `models.py`, `serializers.py` | Retail-owned catalog and inventory; professional site should not depend on retail primary keys for general enquiry. |
| `GET homepage/` | `homepage/views.py` imports Product/ProductCategory and serializes featured records | Split or revise contract before retiring product app. It currently caches for five minutes. |
| Manufacturer Brand | `products/models.py` FK to `homepage.Brand` | Shared ownership must be decided; professional partner/supported-brand directory can remain. |
| Duplicate `GET brands/` route | Both `homepage/urls.py` and `products/urls.py`; homepage include occurs first in `twinpeaks/urls.py` | Homepage view shadows product-brand view. Product filters receive active featured homepage brands rather than necessarily all brands with active products. Give endpoints distinct purposes later. |
| `POST checkout/momo/`, `GET checkout/momo/:uuid/` | `orders/urls.py`, `views.py`, `momo.py` | Move provider configuration, settlement ownership, inventory reconciliation and pending-payment responsibility together. |
| Order/payment history | `orders/models.py`, `orders/admin.py` | Preserve records and references; no customer order-history UI/API route found in inspected routing. |
| Meta catalog/feed | `products/views.py`, `orders/meta.py`; frontend `meta-tracking.service.ts` | Catalog slugs, event IDs, currency, landing URLs and dataset ownership must remain aligned across migration. |
| Quotation create/public/PDF/decisions | `contact/urls.py`, `views.py`, `serializers.py`, `models.py`, `admin.py` | Retain professional workflow, public tokens, expiry and historical snapshots. |
| Quotation conversion | `contact/models.py`: `converted_order`, `convert_to_order()` | Service/custom quotations also become `orders.Order`. The whole order app cannot be removed as retail-only. |
| Retired invoice domain | `invoices/models.py` contains retirement notice; no invoice include in main URLs | Do not assume a working invoicing integration exists. Define future professional billing separately. |
| Importer | `TwinPeaksImporter/README.md`, `services/exporter.py` | Potential migration/reuse of supplier ingestion; operational production linkage remains unverified. |

### 6.3 Checkout and payment findings

**Confirmed strengths:** backend recalculates totals from active products, validates integer quantities/duplicates, locks records, checks stock and prevents a successful Payment from decrementing stock again through the normal successful path. Payment credentials remain server-side. Order items snapshot names, slugs and prices; optional product references help retain history.

**Confirmed high-priority defects/risks:**

1. In `orders/views.py::reconcile_payment`, inventory is decremented line by line. If a later item lacks stock, the function returns normally from the atomic block with `payment_review`, so earlier decrements commit while payment remains pending. A subsequent poll can decrement earlier lines again. This follows directly from the transaction/control flow; reproduce with a multi-item stock race and ensure all-or-nothing allocation before retrying.
2. Provider reconciliation and CAPI delivery happen through the public status GET. A callback URL can be sent by `momo.py`, but no callback handler or background reconciliation job appears in the inspected routes/tasks. If customers leave, payment/order confirmation can remain stale until another caller polls. Establish authoritative reconciliation independent of the browser.
3. Frontend status polling has no maximum duration or backoff; a single error terminates it. Payment state is memory-only, and refresh loses the reference. The template's payment branch hides the form even after failure, so instructions to start a new payment have no retry control. `payment_review` falls through to “Approve payment on your phone.” Add explicit recovery and reconciliation states.
4. Checkout creates a new order/payment for each POST and has no request idempotency key. Provider network/JSON exceptions are not normalized by `MomoCollectionClient`; an external request can succeed while the client loses confirmation. Define recovery for ambiguous outcomes before permitting retries.
5. Checkout performs external token/payment requests while inside a database transaction with product locks. Slow providers extend lock time. Backend status GET also performs provider requests and possibly synchronous CAPI delivery. Review concurrency, timeout and worker capacity.
6. MoMo defaults are sandbox with `MOMO_CURRENCY=EUR`, while `SHOP_CURRENCY=SZL`; checkout explicitly returns 503 on mismatch. This is a confirmed default configuration issue, not proof production is misconfigured. Validate actual merchant environment and currencies through an authorized readiness check.
7. No shipping address, delivery charge, fulfillment selection, tax breakdown, return-policy acceptance or order-management journey appears in the frontend checkout. These are scope gaps for a standalone retail business, not evidence that current offline fulfillment is impossible.

Cart localStorage holds complete product snapshots, so price/stock can become stale. Backend pricing validation is essential and already exists. Client `setQuantity()` does not reject NaN/fractions; restoring cart records validates only minimally. Product cards enable cart actions based on stock even when price is absent, whereas backend checkout requires `product.price` to exist. Improve the distinction between purchasable items and quote-only items.

### 6.4 Future marketplace scope

**Confirmed:** inspected models represent one catalog and one checkout merchant; no vendor model, seller ownership field, seller onboarding route, commission, payout, split-order or seller fulfillment system was found.

**Recommendation:** launch the separate retail brand with a bounded single-store domain first. Before multi-vendor work, design seller verification/access control, listing moderation, vendor-specific stock, commissions and payouts, split fulfillment, disputes/returns, payment-provider capabilities and financial reconciliation. Reusable Angular catalog UI is a starting point, not evidence of marketplace readiness.

## 7. Technical quality

### 7.1 Accessibility

**Confirmed:** contact/quote fields use placeholder-only identification; quote quantity controls lack item-specific accessible names; invalid quote fields have no rendered errors. Cart labels wrap their inputs and product filter selects have explicit labels, demonstrating patterns to reuse. Toasts have status/alert semantics, navigation toggle exposes expanded state, and shared headers have breadcrumb navigation.

PageHeader creates an `h1`; project detail/cart content add other `h1`s. Heading levels across services/solutions/about skip levels. The cart link is assigned `role="status"`, which replaces its normal link semantics; announce its count in a separate status element. No skip-to-content link is present. The hero scroll arrow has no accessible label. Add clear hierarchy, associated errors (`aria-describedby`), invalid state, a skip link, keyboard focus behavior and sensible link semantics. Persistent field errors should not rely on disappearing toasts.

These recommendations follow [W3C's form-label guidance](https://www.w3.org/WAI/tutorials/forms/labels/). Full WCAG conformance cannot be established through source review.

### 7.2 SEO and content discoverability

| Confirmed finding | Evidence | Action |
|---|---|---|
| Creative-agency metadata conflicts with intended technology/security business | `app.routes.ts`, `src/index.html`, `structured-data.service.ts` | Align titles/descriptions/schema with approved positioning and real Eswatini service coverage. |
| Fallback describes “financial advisory and wealth management” | `app.ts` | Correct centrally; currently relevant to routes without explicit description, including project details. |
| Project detail has no per-project SEO update; product detail does | `project-detail.ts`, `product-detail.ts` | Add project-specific title, description, canonical, social image and relevant schema. |
| Default OG URL is always homepage unless explicitly supplied | `seo.service.ts` | Derive social URL from the normalized route, not just canonical. |
| Canonical concatenates `router.url`, including query strings | `app.ts` | Define index/canonical policy for product filters and sort states; strip irrelevant tracking parameters. |
| `/cart`, `/request-quote`, `/404` default to index/follow | Route data and SEO default | Define indexing intentionally; noindex personal utility/error pages, assess lead landing page separately. |
| Schema references `/img/logo.png`, absent from inspected public assets | `structured-data.service.ts`, `front/public/img/` | Use an existing verified logo; current OG image does exist. |
| Schema declares founding year 2015 and regional coverage without source verification | `structured-data.service.ts` | Confirm facts; include verified address/contact/hours and a consistent entity identifier. |
| Static public sitemap still lists `/gallery`; dynamic backend sitemap lists `/projects` and active products/projects | `public/sitemap.xml`, `core/sitemaps.py` | Establish one authoritative generation strategy and update migration mappings. |
| Robots points to a sitemap on backend hostname | `public/robots.txt` | Verify discovery/cross-host submission and Search Console setup; source alone does not confirm acceptance. |
| `/gallery` and wildcard redirects are Angular routing behavior | `app.routes.ts` | Use host/server redirects for legacy migration and proper 404 status for missing resources. |

Static prerendering is a useful SEO/performance foundation, but product/project enumeration relies on API availability and catalog size during build. New slugs require a new build or a working host fallback; runtime SSR is not established by `outputMode: static`. Publish freshness and deployment behavior must be designed explicitly. [Angular documents prerender parameter resolution as build-time work](https://angular.dev/guide/prerendering).

Add dedicated service detail pages, verified local business information, case-study metadata, and route-aware breadcrumbs. Validate generated HTML and actual response status for unknown product/project paths rather than assuming the Angular 404 page controls server status.

### 7.3 Loading performance and assets

| Confirmed local asset | Raw bytes | Implication |
|---|---:|---|
| `front/public/favicon.ico` | 2,165,734 | Exceptionally large shared icon; optimize first. |
| `front/public/img/headers/gallery.jpg` | 1,687,724 | Used by project page headers; prioritize responsive modern format. |
| `front/public/img/headers/about.jpg` | 535,892 | Above-the-fold background; optimize. |
| `front/public/css/theme.min.css` | 443,865 | Global theme cost; inspect used styles before reducing. |
| `front/public/vendors/swiper/swiper-bundle.min.js` | 135,676 | Loaded globally even for non-slider pages. |
| `front/public/vendors/fontawesome/all.min.js` | 1,196,706 | Copied asset; not loaded by inspected index. Do not count as current page transfer. |

**Confirmed strengths:** Cloudinary transformation pipe, responsive `srcset`/sizes on many catalog/project images, lazy loading and fixed dimensions, deferred Swiper script, build budgets and lazy routes. **Limits:** `OptimizedImagePipe` only transforms Cloudinary URLs; local headers/background images and other hosts receive no compression from it. Background hero images have no explicit preload/fetch priority. Broad Google font weight requests and duplicate preconnect declarations add avoidable complexity.

Incorrect/missing asset references include statistics `../assets/img/line-icons/icons/download.svg` and testimonials `/assets/img/backgrounds/testimonial.jpg` where inspected files are under `/img/...`; index icon links reference PNG and tile files not found at public root. Paths are especially vulnerable on nested routes when relative. Prefer consistent root paths and verify deep routes.

**Recommendation:** measure representative pages on a mobile network, optimize largest shared/above-fold assets, preload only the real hero LCP resource if measurement supports it, load slider code where needed, reduce font variants, and audit theme/public asset usage. Do not claim achieved scores or a need for new libraries before measuring.

### 7.4 Security, privacy and error handling

**Confirmed positives:** backend default permission is authenticated, public views explicitly opt in, contact/quote creation uses anonymous throttling, contact message listing requires admin, monetary totals are server-calculated, Markdown escapes raw HTML and uses normal Angular `innerHTML` sanitization, and external links commonly use `noopener noreferrer`. Public quotation decisions check allowed state under a transaction, and token pages are excluded from prerender with route noindex and backend X-Robots-Tag.

**Confirmed privacy gap:** `App` tracks every navigation with GA route path and Meta full URL, including `/quotations/:token`. Those URLs are bearer access links; forwarding them to third parties reveals access tokens. Quote API serializers return customer email, phone, address and message to anyone holding the token. No frontend route exclusion or explicit Referrer-Policy is implemented in inspected code. Exclude token pages from page tracking, suppress token-bearing URLs, and use appropriate no-store/referrer headers; inspect hosting first. Noindex is not an access-control boundary.

No consent gate or privacy UI is visible before GA/Meta initialization. Backend CAPI transmits hashed email/phone and request IP/user agent. Review business-approved privacy disclosures, tracking choices and dataset ownership; this audit does not determine legal compliance.

`authInterceptor` attaches JWTs without checking API origin. TokenService uses localStorage without storage exception handling and lacks refresh/401 handling. These are latent risks while auth is unused; an unrestricted interceptor could forward a token if future HTTP calls target another origin. The permissive auth guard is not a substitute for backend authorization.

The backend config defaults `DEBUG=True`, SSL redirect/secure cookies off and HSTS zero, all environment overridable. CORS-all-origins defaults false. These are **configuration risks**, not confirmed production exposures. Verify deployed settings/headers and credential management in a separate authorized operational review.

Public checkout/status/quotation token views have no explicit throttles, and settings supplies rates but no global throttle classes. Creation contact/quote views explicitly throttle anonymous traffic; authenticated traffic is outside that particular throttle. Add deliberate abuse protection based on actual traffic. No frontend-wide HTTP error mapping/retry policy is implemented; provider exceptions and missing picker error callbacks require specific handling, not indiscriminate retries of payments.

## 8. Recommended website structure

### 8.1 Positioning and information architecture

Proposed positioning: **TwinPeaks Investment — technology, security and digital solutions in Eswatini**, emphasizing consultation, design, installation, integration and ongoing support. Validate actual service capability before publishing any category or commitment.

Proposed main navigation: **Solutions · Projects · About · Contact**, with a prominent **Request a consultation** CTA. Keep Home accessible through the brand; an explicit Home link is optional. Add **Support** only when there is a staffed, defined service. After retail launch, use a clearly named secondary external store link rather than a TwinPeaks cart.

| Proposed route | Purpose | Status |
|---|---|---|
| `/` | Outcome-focused positioning, solution pillars, local proof and lead CTA | Existing route, restructure later. |
| `/services` | Solutions overview; retain existing URL equity | Existing route, improve later. |
| `/services/security-systems` | Security/CCTV/access-control installation scope, assessment, proof and CTA | Proposed; confirm offerings. |
| `/services/it-networking` | IT/networking infrastructure, deployment and support | Proposed; confirm offerings. |
| `/services/digital-solutions` | Web/software and relevant digital services | Proposed; confirm offerings. |
| `/services/technical-support` | Support, maintenance and installation assistance | Proposed; define coverage and response commitments. |
| `/projects`, `/projects/:slug` | Evidence-based case studies | Existing routes; improve. |
| `/about` | Company identity, capabilities, team and verified trust information | Existing route; improve. |
| `/contact` | Unified verified contact record and general enquiries | Existing route; improve. |
| `/request-quote` | Service/site-assessment and custom requirements | Existing route; simplify. |
| `/quotations/:token` | Private issued quotation experience | Existing route; retain safeguards and remove tracking. |
| `/privacy`, `/terms` | Business-approved information/policies | Proposed; content ownership required. |

The four solution pages are examples derived from the user's intended business scope, not confirmation that each detailed offering currently exists in live CMS content. Avoid inventing certifications, customer results or support guarantees.

Keep a professional solutions CMS/API boundary for company, services, projects, testimonials and quotations. Retail should own catalog, inventory, shopping, payments and customer order operations. Share stable UI primitives or contracts only where they earn their maintenance cost; do not require a monorepo rewrite or shared runtime backend just to preserve card styles.

### 8.2 Relationship to the future store

Retail brand → “Need professional installation?” → TwinPeaks service enquiry with explicit customer consent and a stable referral description/reference. TwinPeaks → named external retail brand for equipment purchasing. Avoid making a professional enquiry depend on a retail product record remaining available. Decide who sells equipment, who contracts installation, and who owns warranties/support before cross-brand content is written.

## 9. Keep / Improve / Remove / Migrate classification

“Remove” means a future candidate after dependency checks, not authorization to delete anything now. Some assets need both improvement and migration.

| Classification | Scope | Rationale / prerequisite |
|---|---|---|
| **Keep** | Angular standalone foundation, lazy routes, strict TypeScript/template settings, HTTP abstraction, notification primitives | Useful foundation; avoid unnecessary rewrite. |
| **Keep + Improve** | Navigation/footer/PageHeader, Home hero/solutions/proof/CTA, Services, About, Projects, Contact | Align positioning, accessibility, verified contact information and content hierarchy. |
| **Keep + Improve** | QuotationService, RequestQuote, PublicQuotation and contact quotation backend | Central professional sales workflow; detach retail picker and preserve history/tokens. |
| **Keep + Improve** | Professional order/quote conversion capability | Orders are shared with service quotations; define domain ownership before moving models. |
| **Keep + Improve** | SEO/schema, image optimization, enquiry notifications | Fix identity, paths, route policy and operational delivery monitoring. |
| **Migrate** | ProductList/ProductDetail/ProductCard, ProductService/models, categories/gallery images, retail brand filters | Retail-owned presentation/data. Preserve IDs/slugs/history mapping as appropriate. |
| **Migrate** | CartService/Cart, CheckoutService, retail Order/Payment operations, MoMo adapter | Move alongside merchant credentials, settlement responsibility and pending-payment runbook. |
| **Migrate** | FeaturedCategories/FeaturedProducts, catalog feed, commerce Pixel/CAPI events | Retail discovery/tracking; remove from TwinPeaks only after destination is ready. |
| **Improve / split** | Homepage payload and Brand relationship; GA lead tracking vs Meta commerce tracking | Mixed professional/retail responsibilities. |
| **Reuse selectively** | Image pipe, loader, accessible card primitives, importer JSON workflow | Reuse code patterns with separate business identity and data contracts. |
| **Remove candidate** | Unrouted Auth scaffold, always-true guard, unused token/auth plumbing | First establish whether any external consumers depend on these utilities. |
| **Remove candidate** | Unrouted legacy GalleryList/GalleryService/model, obsolete CSS selectors/animation attributes and unused public vendors | Confirm usage with imports/assets and redirects; preserve project content and legacy URL behavior. |
| **Remove candidate from TwinPeaks after migration** | Retail nav/cart links, retail prerender enumeration and product sitemap entries | Require working store, redirects, analytics and operational handover. |

## 10. Prioritized recommendations

Priority: **P0** address before migration or increased checkout traffic; **P1** high business/accessibility value; **P2** planned quality improvements; **P3** later strategic work. Effort is relative, not an estimate or commitment.

| Priority | Recommendation | Evidence / impact | Effort and dependency |
|---|---|---|---|
| P0 | Prevent partial/repeated stock decrement; design independent reconciliation and idempotent payment recovery | `orders/views.py`; financial/stock correctness | Large; backend owner, payment sandbox and concurrency tests. |
| P0 | Exclude quotation tokens from GA/Meta and enforce private-document cache/referrer policy | `app.ts`, public quote APIs | Small–medium; frontend plus hosting/API configuration. |
| P0 | Record domain ownership before deleting/moving order/product apps | Quote FKs/conversion, homepage imports and Brand FK | Medium; business and backend agreement. |
| P1 | Correct business positioning across visible copy, route metadata, initial HTML and schema | Confirmed conflicting descriptions | Medium; approved capability/company facts. |
| P1 | Add accessible labels and useful validation to contact/quote forms; normalize phones | Templates and serializer mismatch | Medium; coordinated frontend/backend validation. |
| P1 | Fix 768–991px navigation behavior and CTA destination consistency | Navigation CSS/template and homepage defaults | Small; browser verification. |
| P1 | Normalize environment imports to prevent unintended production testing | `angular.json` and service imports | Small; build/serve environment verification. |
| P1 | Add service detail pages and contextual project/quote CTA funnel | No service detail routes; weak project conversion path | Medium–large; content and routing design. |
| P1 | Restore recoverable payment status UI, bounded polling and reference recovery | `cart.ts/html` | Medium; authoritative backend state and privacy policy. |
| P1 | Optimize favicon/header images and fix asset/contact/schema paths | Measured assets and mismatched paths | Small–medium; asset generation and verified contacts. |
| P2 | Cancel stale loads, handle parameter changes, improve error/empty/retry states and slider lifecycle | Product/project/quote/home code | Medium; focused behavior checks. |
| P2 | Establish indexing, canonical, sitemap, host 404 and prerender freshness policy | SEO/rendering configuration | Medium; hosting and content publishing process. |
| P2 | Add lead analytics, sales follow-up ownership and email delivery retry/monitoring | Unused lead helpers; synchronous Bird functions | Medium; marketing/operations ownership. |
| P2 | Reduce unused theme/public vendors and standardize maintainable patterns | Global assets, legacy attributes and mixed state conventions | Medium; usage inventory and visual regression review. |
| P3 | Migrate retail brand with explicit merchant/customer/analytics handover | Cross-domain dependency map | Large; destination brand/domain/store operations. |
| P3 | Design marketplace capabilities as a distinct expansion | No seller/commission/payout model found | Very large; business, payment and fulfillment requirements. |

## 11. Proposed implementation phases

No phase has been implemented by this audit.

### Phase 0 — Baseline, ownership and operational safety

Confirm deployed version, environments, hosting behavior, real contact record, service capabilities and merchant/payment readiness. Capture page screenshots, performance baseline and API contracts. Assign ownership of leads, quotes, professional orders and retail records. Resolve payment stock/reconciliation risks and private-token tracking before traffic expansion.

Exit criteria: reviewed domain map; reconciled pending-payment procedure; meaningful stock/idempotency tests; no third-party token transmission; known production configuration and rollback plan.

### Phase 1 — Professional positioning and lead funnel

Approve information architecture/copy; correct metadata/schema; update homepage hierarchy, navigation, footer, contact consistency, accessible forms, phone handling and CTA destinations. Preserve functioning retail during transition. Add service pages and contextual case-study CTAs, with a direct consultation path.

Exit criteria: agreed service proposition visible above fold; usable contact/quote journeys on mobile/tablet/keyboard; successful leads receive durable references and assigned follow-up.

### Phase 2 — Technical quality and maintainability

Correct environment behavior, assets and error handling; simplify sliders; address route cancellation/state updates; optimize images/shared assets; define render freshness, indexing and hosting status policy; implement meaningful lead measurement and email-delivery monitoring.

Exit criteria: relevant behavioral checks pass; representative performance/accessibility measurements meet agreed targets; deep routes and missing routes return appropriate content/status; no unexplained production API calls from local development.

### Phase 3 — Independent retail launch and migration

Create separate branding/domain/application boundary. Prepare product/category/brand/media and historical reference mapping, move retail operations/payment configuration and analytics/catalog URLs, and keep existing service quotations/orders accessible. Validate retail order lifecycle, fulfillment, returns and installation referrals. Plan incremental cutover and rollback.

Use one-to-one host/server redirects where pages have an equivalent destination; do not redirect every product to the store homepage. Update internal links, canonical URLs, catalog feed, sitemaps and search tooling. This follows [Google's URL migration guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).

Exit criteria: catalog links and checkout verified on new brand; pending payments accounted for; professional quotation URLs preserved; customer/merchant ownership clear; redirects verified; operational sign-off and rollback available. Only then retire TwinPeaks shopping components and stale dependencies.

### Phase 4 — Marketplace expansion

Design vendor onboarding, seller access, catalog moderation, split fulfillment, commission/payout ledger and disputes. Select payment and operational capabilities only after requirements are validated. Keep TwinPeaks professional services independent of marketplace runtime availability.

Exit criteria: seller/merchant responsibilities, financial reconciliation and support operations are defined and tested before multi-vendor launch.

## 12. Risks, dependencies and verification backlog

| Risk/dependency | Required decision or verification |
|---|---|
| Shared order domain | Quotations for services/custom work convert to the same Order model used by checkout. Define professional order handling before extracting retail. |
| Historical references | Preserve product/service snapshots, quote numbers/tokens, converted orders and payment audit history. No destructive schema migration is justified yet. |
| Browser-local state | Cart and quote localStorage cannot automatically transfer to a new origin. Communicate the transition and decide whether a consented migration mechanism is necessary. |
| Private quote URLs | Existing customer links must continue working; prevent tracking/cache/referrer leakage and verify expiry/decision/PDF behavior. |
| Payment cutover | Identify pending/ambiguous/review payments and provider callbacks before switching credentials, endpoints or domains. |
| Merchant and branding | New brand, domain, settlement ownership, customer support, warranty and installation contracts are not supplied. |
| CMS content and claims | Live hero/services/projects/company content not examined; verify achievements, team information, locations and service promises. |
| Static build coupling | Product/project APIs must be reachable for slug enumeration; define publish trigger, failure handling and new-slug behavior. |
| Hosting | GitHub Pages deployment script/CNAME exist, but live platform, redirects, fallback and response headers are unverified. No public `404.html` fallback asset was found. |
| Shared brands and endpoints | Resolve duplicate `brands/` URL behavior and decide supported-vendor vs retail manufacturer ownership. |
| Analytics | Decide separate lead/store properties/datasets and catalog identifiers; validate deduplication, consent choices and referral attribution. |
| Notifications | Bird functions are synchronous; delivery errors are logged without a demonstrated durable retry queue. Confirm provider setup and operational monitoring. |
| Dependency security | Pinned declaration does not prove vulnerability-free resolution. Review lockfile/advisories separately without assuming an upgrade is needed. |
| Retired invoices | No working invoice model/API demonstrated; define professional billing requirements before promising automated invoicing. |
| Importer | Establish whether exported products are used operationally, how they reach Django, and whether supplier media/content may be reused. |

Recommended verification before implementation sign-off:

- Browser checks at 320, 390, 768, 820, 991, 1024 and 1440px; landscape, long content, keyboard-only operation and zoom; screen-reader labels/errors/menu semantics; reduced motion and slider pause.
- Measure home/services/project/contact/catalog under a mobile network profile; inspect LCP/CLS/INP and actual compressed transfers. No scores are asserted here.
- Validate contact/quote invalid fields, international phone formats, backend field errors, catalog outage, blocked storage, duplicate submission and acknowledgement delivery.
- Exercise multi-item stock races, repeat successful reconciliation, partial allocation, provider timeout/ambiguous result, polling failure, refresh recovery, payment review and browser abandonment in a sandbox.
- Inspect prerendered per-route metadata, private route tracking/network behavior, canonical queries, sitemap URLs, missing-slug status, and direct deep-link hosting.
- Confirm deployed DEBUG/CORS/HTTPS/cookie/cache/referrer policy and secret management without exposing credentials.

## 13. Recommended immediate next step

Approve the service-led information architecture and assign frontend/backend/business owners to Phase 0. Preserve the existing application while addressing payment correctness, quotation privacy and lead-form usability. Then implement the professional site improvements before undertaking a staged, independently branded retail migration.
