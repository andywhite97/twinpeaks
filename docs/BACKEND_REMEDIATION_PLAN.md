# Backend remediation proposal — approval required

Date: 11 October 2026. **Proposal only. No backend code, migrations, data, workers, provider configuration or credentials changed.** Read with [release assessment](PHASE4_PRODUCTION_READINESS.md), [QA evidence](FINAL_QA_REPORT.md) and [migration plan](FRONTEND_MIGRATION_PLAN.md).

## Verified current behavior

| Area | Source evidence | Consequence |
|---|---|---|
| Contact creation | `contact/views.py:ContactMessageCreateView`, `contact/serializers.py:ContactMessageSerializer` | Allows anonymous POST with `name`, `email`, `message`; returns 201 containing id, original customer fields and timestamp. Save precedes synchronous notification. |
| Quote creation | `contact/views.py:QuotationRequestCreateView`, `QuotationRequestSerializer.create` | Anonymous POST; creation/items/recalculation are atomic. Returns reference, requested status and persistent UUID access token. Notifications run through `on_commit`, which is not a background queue. |
| No idempotency/reconciliation | Contact/quote serializers, views, models and URLs | No request-key receipt, replay contract or public submission-status endpoint. A timeout after commit followed by another POST can create another entity. |
| Provider timeouts | `contact/tasks.py` directly calls `Bird()`/`.email.send`; installed `bird/_constants.py` | SDK defaults: 60-second per-attempt timeout, 5-second connection timeout, two retries. Frontend timeout is eight seconds. These installed defaults do not establish deployed SDK/runtime configuration. |
| Notification exceptions | Contact/quotation task functions catch and log exceptions | Failures normally do not undo saved records. Delivery may fail while the API returns success; delay can cause the browser to time out before the response. Contact's preliminary ORM lookup is outside its notification try block. |
| Queue configuration | `twinpeaks/celery.py`, settings Celery section | Celery exists, with memory broker/result-backend defaults. These notification functions are plain synchronous functions. Durable broker, running worker, monitoring and retries are not verified. |
| Response privacy | `contact/middleware.py:QuotationPrivacyMiddleware` | All `/api/quotations/` responses get private/no-store/no-referrer/noindex headers. Contact responses lack equivalent middleware protections. |
| Logs | `contact/tasks.py` uses `logger.exception`; no application log-redaction configuration found | Explicit messages use record IDs, but exception text/provider responses and proxy/access logging can still disclose PII or quotation paths. Production log contents were not opened. |
| Throttling | Create views use `AnonRateThrottle`; settings default `20/hour` | Contact and quote share the anonymous scope. No durable distributed throttle-cache setup was found in source. This is not complete spam prevention. Production override/cache/proxy identity must be verified. |

The actual production public APIs failed the read-only Phase 4 probes (company/services timeout; projects/leaders/homepage/sitemap HTTP 500). Investigate service health separately before release. No root cause can be inferred from these response codes alone. Local GET responses and isolated tests passed; they do not prove production health.

## Priority 1: PDF rendering and state integrity

**Critical: escape PDF paragraph content.** `PublicQuotationPdfView` interpolates customer name/email/phone/message and terms directly into ReportLab `Paragraph` markup. Installed ReportLab supports embedded image tags and resource loading; its installed `trustedHosts` default is `None`. This is confirmed unsafe markup construction and a code-evidenced resource-loading risk, not a claim that an exploit succeeded in production. No exploit or real customer PDF was tested.

Escape user/model text before constructing paragraphs, explicitly convert newlines after escaping, keep markup limited to developer-owned templates and constrain PDF image/resource resolution. If approved rich terms are required, define an explicit restricted format rather than trusting arbitrary markup. Bound large titles/rows and test Unicode, angle brackets, ampersands, long text, and malicious image/link markup using mocked resource loaders in an isolated environment. Assert that customer content cannot cause any filesystem/network resource request. No migration should be needed for safe rendering; keep existing records/tokens unchanged. Roll back presentation changes only if an equally safe previous renderer exists; never restore unsafe parsing merely to recover layout.

**High: make view/expiry transitions conditional.** Public GET currently reads a quotation, then writes `viewed`/expiry without the row lock used by decisions. A concurrent stale GET can race an acceptance/decline and overwrite state. Use a short locked transaction or conditional update restricted to the expected previous status, then refresh the object. GET/PDF viewing can write `viewed` or `expired`; they are deliberately excluded from Phase 4 live probes.

**High: constrain issuing and pricing.** `Quotation.issue()` requires an item but has no explicit allowed-status or price-approval check. The admin bulk action applies it to selected records regardless of current state. It can reopen accepted/declined/converted quotations if used incorrectly. Custom/service items default to zero pricing; nonempty items alone do not establish reviewed pricing. Define approved transition rules and deliberate zero-price approval rather than banning legitimate free scope indiscriminately. Validate nonnegative prices/discounts/taxes, coherent totals and expiry rules. Keep a distinct resend action that does not reopen a quotation or change its decision history. Audit admin status editing and conversion totals. Current APIs hide pricing/items for requested/under-review/draft records; preserve that privacy behavior.

Required PostgreSQL tests: view-vs-accept, expiry-vs-accept, duplicate accept, accept-vs-decline, prohibited issue from final states, reviewed zero-price handling, expired decisions and exactly one order conversion. Existing SQLite tests are not evidence of row-lock concurrency. Do not regenerate access tokens or migrate existing customer URLs.

## Priority 2: durable idempotent creation

Proposed additive `SubmissionReceipt` model:

| Field/constraint | Proposed purpose |
|---|---|
| Endpoint scope + hashed random request key; unique together | Anonymous idempotency identity; never deduplicate solely by email/name. |
| HMAC of normalized validated payload | Same key/different payload produces 409 without revealing the existing customer's content. Key/secret handling requires security review. |
| Contact or quotation reference, completion state/timestamps | Receipt and entity commit together; enforce exactly one entity reference. |
| Expiration/retention metadata | Business/legal owners approve duration; do not invent a binding retention policy. |

Validate requests before allocating receipts. Within a short transaction, reserve the unique scoped key, create the contact/quotation and items, enqueue an outbox event and mark the receipt completed. Concurrent retries use the unique constraint/receipt lock to replay the **same** successful reference/response. Do not hold row locks during provider calls. Same key with changed payload returns 409; transient processing returns a documented response with Retry-After; rolled-back creation must remain safely retryable. Reconstruct quotation responses from the referenced quotation so existing UUID tokens are not duplicated or rotated.

Roll out the header optionally first to preserve legacy clients. Only enforce it for a separately approved client/version after compatibility tests. Adding a frontend header before the backend understands it would not provide idempotency and was not done in Phase 4.

A proposed status endpoint must be protected by a separate high-entropy capability or an equally reviewed ownership mechanism. Return only processing/confirmed state and a reference; never expose PII, pricing or customer lists. Do not offer lookup by email, sequential id or quotation number. Rate-limit it, apply private/no-store headers, redact capability URLs and prevent cross-origin leakage. Define how a client retains the retry capability across reloads without storing customer form data; this needs a reviewed privacy/UX design, not an ad hoc persistent payload store.

Migration proposal: add receipt/outbox tables and indexes; leave current entities, UUIDs and order models intact. Initially nullable references support an additive rollout; tighten constraints only after data verification. No backfill of historical notifications or receipts without explicit approval. Load/concurrency tests must use a disposable PostgreSQL database with providers mocked, never production.

## Priority 3: reliable notifications

Propose a durable notification outbox with event kind, aggregate reference, version/deduplication key, state, attempt count, next attempt and lease timestamps. Store references instead of duplicating complete customer payloads. Insert the event in the same transaction as the entity/decision. `on_commit` can wake a worker, but durable storage must survive a failed wake-up or process crash.

Choose and verify either a persistent Celery broker/worker or an independently scheduled database-outbox dispatcher. Memory defaults are not a durable deployment. Worker claims use short locks/leases; provider calls run outside database locks. Use bounded timeouts, exponential retry, dead-letter/manual review and monitoring of oldest pending event. If the provider supports durable idempotency under its verified contract, use the outbox event's stable identity; otherwise document at-least-once delivery and possible duplicate emails after uncertain provider outcomes. Do not claim exactly-once email delivery.

Confirm recipient routing, authorized senders, both customer/team notifications and issued-link click tracking. Disable third-party link tracking for token-bearing quotation URLs where appropriate. Avoid recording request bodies/tokens in SDK debug logs or error traces. Generic acknowledgements currently use custom item titles rather than category descriptions; improve internal/category notification readability without exposing private links in analytics.

## Priority 4: privacy, throttling and operations

- Extend private/no-store/no-referrer response protection to contact success, validation, authentication, throttle and server-error responses. Consider a backward-compatible minimal receipt response rather than echoing all PII; v2 currently confirms id/timestamp, while legacy consumers must be inspected before changing fields.
- Apply access-log redaction for quotation/status capability paths and prohibit customer-body logging. Sanitize provider errors to bounded status/event identifiers. Define retention/access review separately with legal owners.
- Verify production HTTPS, explicit CORS origins and `Retry-After` exposure. The browser's fallback cooldown does not establish when the backend throttle resets. Confirm trusted proxy/IP behavior and use a shared throttle cache if required across workers.
- Establish production secret/config ownership, health monitoring, notification metrics and API timeout budgets. Do not copy local debug/SQLite/in-memory defaults to production. No credentials or infrastructure were changed here.

## Tests, rollout and rollback

Before any authorized backend release, test serializer compatibility, same-key concurrent replay, changed-body rejection, crash/commit boundaries, interrupted responses, expiration/cleanup, status capability authorization, rate limits, no-store on every response, PDF escaping, state races and worker/provider recovery. Test legacy clients without the new header and v2 against the additive contracts. Verify existing quotation numbers/UUIDs before and after migration using controlled records; do not open actual customer documents to generate smoke-test traffic.

Suggested sequence: repair production health and PDF/state defects; deploy additive schema and optional idempotency/receipt support; verify durable outbox in staging; activate workers with monitoring; release the separately approved v2 integration; only then consider stricter contract enforcement. Each stage requires approval and an operational owner.

Rollback: pause newly introduced workers, roll application traffic back to the prior compatible version, retain additive tables/receipts/outbox events and reconcile pending events before replay. Do not drop committed submissions, remove tokens or bulk resend historical events. A schema downgrade that deletes receipts can destroy retry protection; prefer leaving additive tables unused until an explicitly approved cleanup. Frontend rollback alone does not remove requests already created in the backend.
