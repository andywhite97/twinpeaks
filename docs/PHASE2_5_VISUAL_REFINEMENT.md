# TwinPeaks frontend v2 — Phase 2.5 visual refinement

Review completed 11 October 2026 (Africa/Johannesburg); implementation began 10 October.

Scope: refine the existing Angular application, not rebuild it. No deployment or Phase 3 work. The agent made no changes to backend records, APIs, models, migrations, credentials, routes, theme service or private quotation workflow source.

## Implemented changes

- Added restrained, photographic corporate technology presentations: three new **concept** photographs covering security/access equipment, workplace/POS equipment and network/digital equipment. They are labeled “Concept visual,” not represented as TwinPeaks offices, customer installations or completed projects. Approval of these new review assets is still required before launch.
- Optimized new media and the existing homepage concept image to 560px/1120px WebP variants. A shared allowlisted `srcset` helper only generates known local variant URLs; it never assumes a backend resizing endpoint.
- Homepage retains its sections: stronger image balance, coordinated CTA widths, photo-led solution cards with compact category badges, refined benefit strip, quieter section transitions and improved final CTA.
- Solutions overview now uses the same reusable SolutionCard as the homepage, with detailed capability lists. Photo panels replace enormous decorative icon placeholders; flex card bodies and consistent image ratios support aligned card rows.
- Shared PageHeader supports an optional visual hero, while retaining breadcrumbs, h1, metadata architecture and accessible actions. Solutions/detail/projects overview use labeled concepts. Project detail uses its actual published main image when available; generated concepts are never substituted for missing project imagery.
- The reusable solution detail page has category-specific editorial headings and CTAs, an image-led hero and a consultation-intent panel. Capabilities remain planning topics and assessment-dependent scope, not service guarantees.
- Removed visitor-facing explanations about unique/unmatched API records and backend dependencies. An absent service mapping now invites visitors to discuss requirements and confirm available scope; errors and retries remain available. Administrator mapping issues are documented below.
- Refined project images, equal-row cards, hover/focus states, related project cards, gallery controls, empty states and contextual CTAs. Broken/missing project images remain honest placeholders. ProjectCard resets image failure state if its actual source changes.
- Expanded centralized theme tokens with raised/quiet surfaces, hero glow, hover shadow and accessible image-caption colors. Existing palette and light/dark preference service are retained. Dark raised surface is `#122941`, chosen after contrast verification.

No UI library, animation package or other dependency was added. Reduced motion suppresses card movement and existing transitions. Typography remains local Poppins; official logos are retained. No prominent mountains, outdoor adventure scenery, social-media section, fabricated metrics or testimonials are introduced.

## Design comparison

Reviewed the approved local light/dark mockups, especially the homepage, Solutions, service detail and Projects compositions. The existing implementation was intentionally sparse; this refinement moves closer to their photographic card headers, compact icon badges, split text/media heroes, blue section accents and stronger CTA panels.

| Original objective | Refined result | Deliberate distinction |
|---|---|---|
| Technology-led photographic presentation | Equipment-focused concept images, actual project imagery where published | Does not reuse fictitious branded office buildings or claim a company headquarters |
| Categories immediately recognizable | Relevant photo, small icon badge, clear heading, concise summary | Three lightweight photographs are reused across paired categories rather than six large downloads |
| Premium corporate hierarchy | Strong Poppins headings, compact section spacing, aligned CTAs, controlled gradient surfaces | No heavy neon, mountain scenery or animation dependency |
| Light/dark consistency | One component structure with shared token surfaces and overlays | No separate dark page templates |
| Published project credibility | Backend cards/gallery/facts; honest empty portfolio when no data exists | Mockup projects, outcomes and statistics are not treated as real records |
| Useful consultation messaging | Service-specific heading/CTA and scope planning | Missing mappings are explained to administrators, not ordinary visitors |

Screenshots are compared for hero balance, readable heading/copy, aligned rows, category recognition, focus/hover treatment and mobile overflow. The visual reference's unverified statistics/testimonials/contact details are intentionally absent. The homepage remains a three-column six-solution grid from the existing foundation rather than adopting the reference's very narrow six-column desktop cards.

## Backend content verification — confirmed local evidence

Read-only requests to **`http://127.0.0.1:8000/api`** and read-only ORM counts were sampled initially and again during final screenshot review. Local content was populated between those samples; the agent performed no writes. Latest results:

| Area | API result | Configured local database | Interpretation |
|---|---|---|---|
| Company | HTTP 200, profile id 1 | 1 CompanyProfile record | Contact fields are now present; confirm their factual correctness before launch |
| Services | HTTP 200, `[]` | 0 total, 0 active | No local service records; not merely unpublished services |
| Projects | HTTP 200, one project | 1 total, 1 active, 1 featured-active | A published/featured local record exists; content is not launch-ready |
| Homepage | HTTP 200; configured hero and one featured project | 1 HomepageSettings record | Settings are now available; approved static tagline/structure remain intact |

Initial evidence (`phase25-content-verification.json`) showed company 404 and zero records in all four areas. Latest API evidence is `phase25-content-verification-final.json`. Both sampled API/database results agree at their respective times. No inactive/unpublished service or project records were found; the empty service API reflects zero records, not connectivity failure. This does not establish production content. No backend data was created, edited, published or deleted by the agent.

The current project is **“Zakhele Church of The Nazare”**, slug `zakhele-church-of-the-nazare`, category **CCTV**, with summary **“Description”**, body **“Long Description”** and a main image named **`SurePlace_Booking_Flow__Host_Dashboard.png`**. Visual review confirms the image is a booking-dashboard interface, not evidence of the described CCTV project. The project remains rendered exactly from the API; no replacement photograph, renamed customer or fabricated result was supplied. Confirm the title spelling, replace placeholder copy with approved scope, and supply the actual approved project image before launch. `CCTV` is not in the existing solution-related-project category aliases, so the service detail honestly shows no related match; review taxonomy/mapping after the record content is approved.

**QA fixtures are separate:** `tests/browser-checks.cjs` uses synthetic data on API port 18181 with app port 18182. Its intentionally empty homepage and visibly labeled synthetic portfolio exercise both empty/populated/error scenarios. Those responses are not the local database and not evidence of missing production records. Main refinement captures use the development build against the real configured local API on port 8000, with a temporary read-only SSR preview on 18183.

### Corrections required before launch — administrator actions, not executed

1. Review the now-present CompanyProfile: current fields include phone/email, Ngwane Park/Manzini address and `0600-1800hrs` hours. Confirm business accuracy and normalize approved display copy in the CMS if desired. Do not infer correctness merely from API presence or copy mockup/SMTP defaults. The footer now renders the actual local profile fields.
2. Publish approved service content and verify unique title mappings. All six mappings are currently absent because the local service list is empty; there are no existing local records whose ids/titles can be called invalid. No backend ids or slug endpoint are invented.
3. Correct the existing featured project’s placeholder descriptions and unrelated image, verify its title/date/location, and review its `CCTV` taxonomy association. Publish only approved project imagery/copy; do not substitute generated concepts as customer evidence. Existing active/featured status is retained.
4. Review the newly present homepage settings and CTA wording/URLs for the service-led positioning. The homepage intentionally keeps the approved static tagline/structure, so the configured generic hero heading does not replace the brand tagline.
5. Approve distinct service editorial/photo direction and FAQ answers before expanding claims. Current FAQs remain absent. Planning topics are not assertions of guaranteed equipment inventory, certifications, compliance or delivery times.

The existing title mapping rules remain case/whitespace normalization plus `&` → `and`, with **exactly one** eligible active record. Zero or multiple matches are unavailable mappings. Current required titles:

| Frontend slug | Eligible backend title |
|---|---|
| `surveillance-alarm-systems` | Surveillance & Alarm Systems |
| `pos-supplies-solutions` | POS Supplies & Solutions |
| `it-support-maintenance` | IT Support & Maintenance |
| `network-infrastructure` | Network Infrastructure |
| `web-app-development` | Web & App Development |
| `smart-security-solutions` | Smart Security Solutions |

No mapping correction was applied to backend data. If actual production titles differ, review the intended association and explicitly amend the frontend title configuration or authorized CMS content. A reachable API with an empty array is distinguished from 404 missing profile and request/connectivity failures; the existing retry/error handling remains intact.

## Media provenance and performance

The built-in image generation skill created review concepts. Exact prompts are in `docs/PHASE2_5_MEDIA_PROMPTS.json`; original generated PNGs remain in the chat's Codex generated-image directory. Local WebP encoding/resizing is the requested media optimization; no image content or branding was altered during encoding. Source homepage PNG is retained unchanged.

| Image | 560px WebP | 1120px WebP |
|---|---:|---:|
| Security/access concept | 15,642 bytes | 47,058 bytes |
| Workplace/POS concept | 18,786 bytes | 43,520 bytes |
| Network/digital concept | 24,526 bytes | 66,702 bytes |
| Existing homepage concept | 20,024 bytes | 51,238 bytes |

The old homepage PNG is 1,785,118 bytes; its 1120px WebP is approximately **97% smaller**. This is an encoded asset comparison, not measured Core Web Vitals. The original PNG remains copied as an unused source asset, so total distribution disk size was not reduced by deleting it. Shared photographs allow browser reuse across categories. Below-fold media is lazy; hero media has appropriate priority and declared dimensions.

No responsive derivatives are invented for backend project URLs. Published images remain subject to the sizes uploaded to the backend. Server-side thumbnails/responsive variants require separately approved future work. No production performance score, deployed CDN behavior or real-device performance is claimed.

## Modified and created files

Within `front-v2/`:

- `src/styles/_tokens.scss`, `src/styles.scss`; new `src/styles/_refinement.scss`.
- New `src/app/shared/solution-editorial.ts` and `.spec.ts`.
- `src/app/shared/ui/cards.ts`, `headings.ts`, `published-image.ts`, `hero-section.ts`; `shared/layout/site-footer.ts`.
- `src/app/features/solutions/solutions.ts`, `solutions.html`, `solution-detail.ts`, `solution-detail.html`.
- `src/app/features/projects/projects.html`, `project-detail.html`.
- `src/server.ts`: added the `image/webp` static MIME mapping; SSR host/referrer/cache/quotation behavior unchanged.
- `public/assets/images/`: eight new WebP variants; original source assets preserved.
- `tests/browser-checks.cjs`: visitor-facing missing-mapping assertion, refined-surface contrast checks and explicit asynchronous filter render wait; new `tests/capture-refinement.cjs` for actual-local-content captures.
- Ignored `test-results/`: media sizes, content verification, protected-source baseline, build/test logs and screenshots.

Documentation: this report and `PHASE2_5_MEDIA_PROMPTS.json`. No routes, backend contracts, theme service, private quotation workflow or dependencies changed.

## Verification results

| Check | Result/evidence |
|---|---|
| Unit regressions | **48 passed**, including all 46 Phase 1/2 tests; `phase25-unit-tests.log` |
| QA build | Passed; `phase25-build-qa.log` |
| Browser regressions | **25 passed**, exit 0; `phase25-browser-checks.log` |
| Development build / local captures | Development build passed; 16 actual-local captures and 48 layout/theme checks passed, GET-only local requests, no runtime errors. `phase25-build-development.log`, `phase25-local-capture.json`, `phase25-local-capture.log` |
| Production build | Passed, exit 0; 362.52 KB initial browser bundle / 100.10 KB estimated transfer, within budget. `phase25-build-production.log` |
| Protected sources | 321 baseline files checked: 320 unchanged; only the expected v2 server WebP MIME mapping changed. No unexpected changes. `phase25-source-preservation.json` |

Existing scenarios cover private quotation token/referrer/cache/analytics behavior, routing, service mapping, empty/error/retry, project filtering, gallery state, SSR/404/503, reduced motion, keyboard navigation, theme persistence and all six widths. Contrast checks include the new raised/quiet surfaces. The first raised-dark candidate produced 4.48:1 accent contrast; `#122941` corrected it. The filter test now waits for asynchronous rendering before counting cards; no filtering business logic was changed. Earlier failures are not counted as passes.

Main requested captures: `phase25-{homepage,solutions,solution-detail,projects}-{light,dark}.png` and corresponding `-mobile.png`, in `front-v2/test-results/`. Desktop is 1440px; representative mobile is 390px. All four page types are also checked at 320/375/390/768/1024/1440px in both themes. Populated case-study fixtures are additionally exercised by the existing QA suite, with conspicuous synthetic labels.

| Page | Desktop light/dark | Mobile light/dark |
|---|---|---|
| Homepage | [Light](../front-v2/test-results/phase25-homepage-light.png) · [Dark](../front-v2/test-results/phase25-homepage-dark.png) | [Light](../front-v2/test-results/phase25-homepage-light-mobile.png) · [Dark](../front-v2/test-results/phase25-homepage-dark-mobile.png) |
| Solutions | [Light](../front-v2/test-results/phase25-solutions-light.png) · [Dark](../front-v2/test-results/phase25-solutions-dark.png) | [Light](../front-v2/test-results/phase25-solutions-light-mobile.png) · [Dark](../front-v2/test-results/phase25-solutions-dark-mobile.png) |
| Solution detail | [Light](../front-v2/test-results/phase25-solution-detail-light.png) · [Dark](../front-v2/test-results/phase25-solution-detail-dark.png) | [Light](../front-v2/test-results/phase25-solution-detail-light-mobile.png) · [Dark](../front-v2/test-results/phase25-solution-detail-dark-mobile.png) |
| Projects | [Light](../front-v2/test-results/phase25-projects-light.png) · [Dark](../front-v2/test-results/phase25-projects-dark.png) | [Light](../front-v2/test-results/phase25-projects-light-mobile.png) · [Dark](../front-v2/test-results/phase25-projects-dark-mobile.png) |

Captures use actual local API responses, including the newly published profile/project. Below-fold images are explicitly loaded for full-page photography review; application lazy-loading remains unchanged. The final on-disk build is development so local SSR preview uses port 8000 rather than production. Production build verification is separately recorded in its log.

Unit/fixture tests and local development captures are not production verification. Existing development-tooling advisories remain as documented in Phase 1/2; no dependency update or new audit is claimed. Contact/Request Quote forms and other previews remain unimplemented by design. Deployment, live content approval, CSP/proxy/CDN review, complete screen-reader/real-device testing and backend image renditions remain future work.

Phase 2.5 stops for review. Nothing is deployed and Phase 3 is not started.
