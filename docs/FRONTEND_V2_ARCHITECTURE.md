# TwinPeaks frontend v2 architecture

**Phase 2 update:** Solutions and Projects overview/detail routes are now implemented. Detail resolvers supply SSR-safe metadata, breadcrumbs and 404/503 response status. The original Phase 1 inventory below is historical; see [PHASE2_IMPLEMENTATION.md](PHASE2_IMPLEMENTATION.md) for current scope, service mapping, gallery/filter design and verification. Browser checks now use `npm run build:qa` with dedicated fixture ports 18181/18182, leaving ordinary local development on 8000/4201 unchanged.

Phase 1 creates an independent Angular 20 standalone application in `front-v2/`. The existing `front/` and Django application remain the reference for API behavior and are not edited by this phase. This is a local review build, not a replacement production deployment.

## Application structure

```text
front-v2/
  angular.json                 separate build, serve and test targets
  public/assets/
    brand/                     unmodified official logo PNGs
    fonts/                     locally hosted Poppins + OFL license
    images/                    explicitly conceptual technology hero
  src/
    index.html                 early theme selection; no-referrer; no trackers
    main.ts / main.server.ts   browser and server bootstrap
    server.ts                  Node HTTP/static server and Angular SSR
    environments/              production default / development replacement
    styles/_tokens.scss        shared palette, theme and design tokens
    styles.scss                responsive component presentation
    app/
      core/api/                typed inspected Django contracts and clients
      core/state/              singleton company signal store
      core/theme/              preference resolution and browser lifecycle
      core/seo/                title, description, robots, canonical and OG
      shared/layout/           header, footer, mobile dialog, theme toggle
      shared/ui/               cards, headings, CTAs, buttons, states, icons
      features/home/           implemented homepage and six solution mappings
      features/quotations/     existing private quotation workflow
      features/page-shell/     clearly labeled future-page previews
      features/not-found/      not-found UI
      app.routes*.ts           lazy browser routes and rendering policy
  tests/browser-checks.cjs    isolated synthetic API + SSR/browser checks
  test-results/              ignored QA evidence and review screenshots
```

Strict TypeScript and Angular template checks are enabled. Components use OnPush, signals for local state and standalone imports. Reactive Forms handle quotation decline reasons. Requests use RxJS, `switchMap` for changing quotation tokens and `takeUntilDestroyed` for lifecycle cancellation. The application uses Angular 20's zoneless change detection; no Zone.js dependency is introduced.

## Rendering and routing

Public pages render at request time through Angular SSR and hydrate in the browser. Build-time route extraction does not fetch project slugs or require a running backend. Private quotations are explicitly client rendered: their customer data is not embedded in SSR HTML or transfer-cache payloads. The Node handler supplies private document response headers. A future hosting integration must retain these rules.

The server engine explicitly allows the configured site hostname and loopback development hostnames. It does not enable arbitrary hosts or trust forwarded proxy headers. Deployment must verify the canonical host and trusted reverse-proxy configuration against [Angular's SSR security guidance](https://angular.dev/best-practices/security#preventing-server-side-request-forgery-ssrf).

| Route | Phase 1 behavior |
|---|---|
| `/` | Complete homepage, indexed metadata |
| `/solutions`, `/solutions/:slug` | Development preview; noindex |
| `/services` | Compatibility redirect to `/solutions` |
| `/projects`, `/projects/:slug` | Development preview; noindex |
| `/about`, `/contact`, `/request-quote` | Development preview; noindex |
| `/quotations/:token` | Private view, PDF link, accept/decline; noindex |
| `/privacy`, `/terms` | Development preview, not approved legal content |
| `/404` | Not-found page, HTTP 404 on direct SSR request |
| Unknown paths | Angular redirects to `/404` |

The server runtime is required for this rendering approach. Deploying only `dist/front-v2/browser` would require a separately specified fallback and header configuration and would lose public SSR. [Angular SSR guidance](https://v20.angular.dev/guide/ssr) explains the rendering model. Future routes intentionally remain incomplete: their existence does not imply that their forms or content are implemented.

## Shared components

Implemented: SiteHeader, MobileNavigation, SiteFooter, ThemeToggle, HeroSection, PageHeader, SectionHeading, PrimaryButton, SecondaryButton, SolutionCard, ProjectCard, FeatureCard, ProcessSteps, CTASection, LoadingState, EmptyState, ErrorState and ToastNotification. Icons are small local SVG paths rather than another component library. Layout styles are centralized in SCSS for a single visual system; splitting them by component can follow if growth makes this useful.

## Design and theme tokens

Official palette: `#0B3D91`, `#1E88E5`, `#00B4D8`, `#E5EAF0`, `#1A1A1A`, `#FFFFFF`. Typography is locally hosted Poppins, weights 400, 600 and 700.

| Token | Light | Dark |
|---|---|---|
| Background | #F6F9FD | #071525 |
| Surface | #FFFFFF | #10263F |
| Primary text | #07152D | #F5F9FF |
| Secondary text | #405670 | #B9C9DB |
| Border | #DCE7F2 | #27445F |
| Accent | #0B3D91 | #2196F3 |
| Text on accent buttons | #FFFFFF | #071525 |

Spacing tokens range from 0.25rem to 6rem; radii are 0.5rem, 0.875rem and 1.5rem. Content width is capped at 1240px. Focus indicators are visible in both themes. Controls have at least 48px button heights. The mobile navigation is a native modal dialog with explicit keyboard cycling, Escape dismissal and browser focus restoration. Desktop navigation changes to mobile below 1100px to keep tablet layouts usable. Grids adapt at 900px and 599px.

An inline script chooses the theme before stylesheet/app startup. Valid `twinpeaks-theme` storage overrides the OS; otherwise `prefers-color-scheme` is used, with light fallback. Blocked storage is tolerated. ThemeService synchronizes the same root attributes after hydration and listens to OS changes until a manual override is selected. Both themes share the same DOM. Reduced motion removes animation and transition effects. A future strict CSP must authorize the early script and its inline startup style with hashes/nonces rather than removing them.

## Verified API boundary

Contracts were read from Django `core/serializers.py`, `services/serializers.py`, `homepage/serializers.py`, `contact/serializers.py`, their views and URL registrations under `back/twinpeaks_back/`.

| Client | Existing endpoint | Behavior |
|---|---|---|
| CompanyApi | `GET /api/company/` | Singleton company profile; can return 404 |
| ServicesApi | `GET /api/services/` | Active service list: id/title/description/icon |
| ProjectsApi | `GET /api/projects/?featured=true` | Published active featured projects, array |
| ProjectsApi | `GET /api/projects/:slug/` | Existing project detail contract prepared |
| HomepageApi | `GET /api/homepage/` | Marketing subset of existing aggregate |
| ContactApi | `POST /api/contact/` | name/email/message contract prepared; no Phase 1 enquiry form |
| QuotationApi | `POST /api/quotations/` | Existing request contract prepared; no Phase 1 request form |
| QuotationApi | `GET /api/quotations/public/:token/` | Existing token unchanged |
| QuotationApi | `POST .../:token/accept/`, `decline/` | Existing decisions; decline sends reason |
| QuotationApi | `GET .../:token/pdf/` | Existing server PDF generation via protected link |

There is no verified service slug/detail endpoint. Six frontend presentation slugs provide future navigation, not backend identifiers. Published service descriptions are matched by normalized title, then homepage solution descriptions, then the approved capability summary. Featured project data comes from the dedicated project endpoint; missing images show an honest placeholder. Null list responses normalize to empty arrays. The aggregate's commerce, statistics and testimonials are not rendered. Contact fields come only from the company API, with honest missing/error states.

ApiClient applies an eight-second timeout, empty referrers and no-store for private reads and writes. API errors remain visible to callers for UI recovery. Media paths resolve against the API origin; non-HTTP protocols and URLs containing credentials are rejected. Backend text renders through Angular interpolation, not raw HTML.

## Environments and private documents

`environment.ts` is the production source: `https://backend.twinpeaksinvestment.com/api`. Development build, default `ng serve` and unit tests replace it with `http://127.0.0.1:8000/api`. All services import the same environment entry point. Local builds therefore do not silently write to production.

No GA, Meta Pixel, third-party font or analytics libraries are installed. Canonical and Open Graph URLs for private quotations use `/quotations`, excluding the token and query string. Referrer policy is `no-referrer` globally. Private document HTTP responses use `Cache-Control: private, no-store, max-age=0` and `X-Robots-Tag: noindex, nofollow, noarchive`; PDF links also use `noopener noreferrer` and explicit no-referrer. `public/_headers` supplies equivalent supplemental rules for hosts that support that format. Existing Phase 0 Django protections are relied on and not changed. Token-bearing requests still reach the intended backend; any proxy/server log policy must separately redact quotation paths.

## Local development

Use Node compatible with Angular 20 (the verified local build used the bundled Node runtime), then:

```powershell
cd front-v2
npm ci
npm start                    # development API, localhost:4201
npm run build               # production endpoint; does not deploy
npm run build:development   # local API
$env:PORT='4001'
npm run serve:ssr           # serves the most recent build
```

Run the existing Django server locally on port 8000 for real development data and configure its existing CORS policy for the new local frontend origin. Do not use production builds for test submissions. Production API access, live company records and issued customer quotations were not exercised as part of isolated QA.

Unit tests use headless Chromium/Edge: set `CHROME_BIN` if needed and run `npm test -- --browsers=ChromeHeadless`. Browser checks require an externally available Playwright module through `PLAYWRIGHT_MODULE`; build development first, then `npm run test:e2e`. They reserve ports 8000/4201, refuse an occupied mock API port, use only synthetic records, and stop their servers on normal completion. They are not production or real PDF-content verification.
