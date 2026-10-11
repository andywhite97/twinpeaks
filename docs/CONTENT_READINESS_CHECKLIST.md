# Content readiness — approval checklist

Date: 11 October 2026. No backend records edited or draft copy published. Sources: approved local brand board/assets, existing frontend solution configuration and Phase 4 public GET/guarded local ORM evidence. Local data is **not** production-content proof; production API probes failed. Owners below are proposed responsibilities, not invented staff identities.

## Inventory

| Content | Confirmed local state | Launch action / suggested owner | Priority |
|---|---|---|---|
| Official identity | TwinPeaks logo, palette, Poppins and “Built on Vision, Driven by Progress.” used | Brand owner approves final screenshots; retain official source assets and font license | Medium |
| Company profile | One local profile; name “Twinpeaks Investment”; overview “Coming soon” | Company owner supplies approved overview and confirms public spelling/capitalization; production profile must be verified | High |
| Mission / vision | “Coming soon” / “Coming Soon”; omitted from public About content | Approve replacement copy before release; do not present placeholders or invented history | High |
| Values | Reliability, Progress, Partnership, Solutions, Excellence from brand board | Confirm presentation; no new certifications or guarantees implied | Low |
| Six solution categories | Frontend structure implemented; local service API empty | Technical/business owner confirms category scope, exclusions and titles, publishes approved service records, resolves mappings | High |
| Service availability | No service IDs guessed; custom quotation requirements work under verified serializer | Approve scope/availability wording and internal processing of custom request items; no guaranteed inventory/support SLAs | High |
| Category mappings | Exact normalized title matching only, with explicit aliases in `solution-config.ts` | Confirm unique active records; document duplicates/unmatched titles rather than fabricating IDs | High |
| Featured work | One local active/featured project | Verify actual customer permission, title, category and featured status; otherwise unpublish through a separately authorized admin action | High |
| Project description | Title “Zakhele Church of The Nazare”; short “Description”; long “Long Description” | Project owner confirms name and supplies approved factual scope; no invented results, quotations or client statistics | High |
| Project imagery | Main image is a booking-dashboard screenshot for a CCTV record; no gallery images | Replace with approved relevant project media or remove/unpublish through authorized content work | High |
| Project category | `CCTV`; surveillance related-project aliases currently do not match it | Confirm business classification and deliberately add a mapping if appropriate; matching does not prove specific capabilities | Medium |
| Completion date | Local record has 2026-10-10 | Confirm date with project owner; no automatic milestone history | Medium |
| Company contact | API publishes telephone `+26879700129`, WhatsApp `26879700129`, email `support@twinpeaksinvestment.com`, “Ngwane Park, Manzini”, hours “0600-1800hrs” | Business owner validates operational channels/location/hours and supplies readable hours format | High |
| FAQs | Configuration exists; no approved entries | Approve factual answers about scope/process; do not invent response-time, nationwide coverage or 24/7 guarantees | Medium |
| Leadership | Empty public local leadership list; no verified/approved personnel/portrait set | Omit until names, roles, bios, permissions and portraits are approved; mockup identities are illustrative | Low |
| Technology concepts | Existing labeled WebP illustrations; never customer-project substitutes | Brand owner approves all concepts for launch; replace with verified photographs where useful | Medium |
| Privacy Policy | Explicit noindex unapproved preview | Legal/business owner supplies actual controller/contact, purposes, processors, retention, rights and relevant jurisdiction details | High / release blocker |
| Terms | Explicit noindex unapproved preview | Legal/business owner approves professional-services and existing retail boundaries, quotation validity/acceptance and commercial terms | High / release blocker |
| Notification copy | Existing backend promises follow-up but delivery/response times unverified | Approve acknowledgement wording and operational response ownership; separately review provider templates | High |
| SEO descriptions | Static corporate descriptions; project metadata comes from published record | Remove placeholder project summaries at source; review production title/canonical/image and sitemap coverage | High |

Read-only ORM inventory distinguishes local empty data from unpublished data: company profile 1; services 0 total; projects 1 active of 1; leaders 0 total; homepage settings 1. Exact counts are recorded in `front-v2/test-results/phase4-local-content-counts.json`. These are content records, not claims about customers, completed installations or company achievements. QA portfolio/service fixtures live only in test code and are not fallback business data.

Production public backend probes returned timeouts/HTTP 500, so production records, CORS and delivery readiness are **unverified**. Static production frontend pages returning 200 do not establish healthy content APIs. Use separately authorized administration after API recovery; do not copy the local test project into production.

## Six solution approval worksheet

The slugs below are frontend information architecture, not Django service identifiers:

| Slug | Approved structure / required content decision |
|---|---|
| `surveillance-alarm-systems` | Surveillance & Alarm Systems: confirm actual equipment, installation/assessment scope and supported alarm integration |
| `pos-supplies-solutions` | POS Supplies & Solutions: confirm supported hardware/software/supplies and integration limitations |
| `it-support-maintenance` | IT Support & Maintenance: confirm support channels, coverage, scheduling and exclusions |
| `network-infrastructure` | Network Infrastructure: confirm assessment/design/installation/support scope |
| `web-app-development` | Web & App Development: approve discovery/build/maintenance offerings and project boundaries |
| `smart-security-solutions` | Smart Security Solutions: confirm supported access/integration options and feasibility qualifications |

Current capabilities/application copy describes consultation topics and assessment-dependent scope. It must not be read as an unconditional service guarantee. Approved FAQs, images and service descriptions can be supplied through the existing content workflow only after authorization.

## Optional editorial drafts — require approval

These are proposed wording, kept **only in this document**, based on supplied positioning. They are not company-approved mission/vision, legal text or evidence of actual outcomes.

**Overview draft:** TwinPeaks Investment is an Eswatini-based technology, security and digital solutions company. We help businesses and communities consider practical IT, security, point-of-sale and digital solutions around their needs, from consultation through installation and technical support.

**Mission draft:** Help businesses and communities in Eswatini make confident technology decisions through practical solutions, collaborative planning and clear support.

**Vision draft:** A more connected Eswatini, where technology supports secure spaces, effective businesses and continued progress.

The owner must confirm that each scope phrase is accurate. No dates, scale, customer counts, partnerships, awards, certifications or quantified outcomes are proposed. Legal drafts are deliberately not supplied: actual policies depend on verified processing, providers, retention, commercial workflows and jurisdiction review.

## Sign-off process

1. Restore/verify production API health and identify authoritative production content.
2. Approve identity, company statements, contacts and category scope.
3. Correct/publish service/project records and approve image/customer permissions through separately authorized content administration.
4. Approve privacy/terms and notification wording; agree operational enquiry/quote ownership.
5. Review desktop/mobile light/dark output, metadata and quotation processing using controlled staging records.
6. Record owner, approval date and artifact/version for every high-priority item. Keep noindex on legal previews until actual copy is approved and published.

No content administration or publication has been carried out in Phase 4.
