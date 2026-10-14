# Phase 047 — Recruiter & Hiring Manager Outreach Agent

**Status:** Ready for implementation in research-and-draft mode only  
**Related backlog:** [Phase 044 — Recruiter Outreach Agent Backlog](044-recruiter-outreach-agent-backlog.md)  
**Project:** German Job Search Dashboard

## 1. Objective

Implement a separate agent workflow to research relevant recruiters/hiring managers for Germany-based DevOps, Platform, SRE, Cloud Infrastructure, and Kubernetes roles; capture contact-source evidence; and prepare tailored email drafts for human review.

Desired future capacity is 10–20 emails/day, but this is a future capacity target, not permission to send. This phase must not send any real emails or enable outbound delivery.

## 2. Inspect existing architecture first

Inspect:
- `Sriramleo/job-search-api`, `Sriramleo/job-search`, and `Sriramleo/homelab-gitops` current `main`.
- Existing FastAPI services, MongoDB schemas/indexes, audit events, frontend review queues, and API auth.
- GCP Cloud Run ADK agent, Cloud Scheduler, service identities, and existing tool permissions.
- Gmail integration and OAuth scopes. It must remain read-only.
- Existing job discovery, company records, candidate profile, and application lifecycle.

Reuse current infrastructure where appropriate. Do not add Redis, provision cloud resources, change scheduler cadence, or give the outreach agent access to ATS submission tools. The GCP agent must continue to use the read-only Oracle Agent API and must not access MongoDB directly.

## 3. Data model and evidence provenance

Design and implement durable, validated records for:
- Contact: employer, professional name/title if verified, public professional profile or official source URL, verified business email only if supported by reliable evidence and permitted, source type, evidence timestamp, confidence/reason, associated role/job ID, and status.
- Outreach draft: recipient reference, subject, body, candidate-fact references, role/company references, creation timestamp, review status, approval actor/time, and audit history.
- Suppression entry: normalized contact/address, reason/category, source, created timestamp, and suppression state, with minimal data retention.
- Campaign configuration: disabled by default, daily cap, timezone/business-hour rules, lease/lock state, emergency stop, and compliance gate state.

Inspect existing schemas before introducing collections or indexes. Use schema migrations/backward-compatible defaults. Avoid collecting sensitive or irrelevant personal information. Never log email bodies or secrets.

Do not guess email addresses or infer an address from a company pattern and call it verified. Do not scrape behind login walls or bypass CAPTCHAs, MFA, rate limits, or anti-bot controls. Respect site terms and data-use restrictions. If contact evidence is insufficient, record NEEDS_REVIEW.

## 4. Contact research workflow

Prioritize legitimate, permitted sources:
1. Official employer team/recruiting/career pages.
2. Public professional profiles accessible under permitted use.
3. Job listings that identify a recruiting contact.
4. Other sources only after source terms and data-use permissions are reviewed.

Match contacts to an actual role/company using evidence. Avoid unrelated employees and duplicate contact attempts for the same role. Record source URLs and timestamps so a reviewer can verify the claims. Do not imply that public availability automatically authorizes cold-email use.

## 5. Draft generation

Generate concise, natural, professional, role-specific drafts. Use only verified candidate facts and job evidence. Include a truthful subject, concise introduction, specific role/context, one or two relevant strengths, low-pressure call to action, and professional signature.

Never invent:
- A relationship, referral, prior conversation, or recruiter interest.
- Candidate skills, years of experience, German level, work authorization, visa status, salary expectations, or application history.
- Employer requirements or a contact's responsibilities without evidence.

Drafts must be saved for review. Provide source evidence adjacent to the draft. The user must be able to edit, reject, suppress, or approve drafts individually. A draft being ready must never count as consent to send.

## 6. Legal, privacy, and provider gate

The initial implementation must be research-and-draft only. Do not treat this specification as legal advice or compliance approval.

Before any future outbound sending, require documented qualified review of applicable German UWG rules, GDPR and transparency obligations where relevant, source terms, data retention/deletion, recipient eligibility, and email provider policies. Do not assume a business address, public profile, B2B context, or legitimate interest automatically permits cold email.

The sending capability must be absent or hard-disabled unless all of these independent conditions are true:
- Explicit user authorization for outbound sending.
- Compliance gate reviewed and approved.
- Dedicated least-privilege sending credentials/scopes authorized separately from Gmail read-only access.
- Campaign explicitly enabled by an authorized user.
- Recipient eligibility verified and suppression check passed immediately before send.
- Daily quota/lease reservation succeeds.
- Emergency stop is clear.

For this phase, force sending disabled regardless of configuration. Do not request/enable send scopes, create send credentials, provision provider resources, or send a test email.

## 7. Quotas and safety controls (prepare for future sending)

Implement/test the durable control model without enabling delivery:
- Configurable daily target, default future cap no higher than 20.
- Idempotency key per contact + role + campaign.
- Per-contact and per-company cooldown.
- Durable quota reservation/lease for concurrent invocations.
- Unknown delivery outcome quarantine; no blind retry.
- Provider rate-limit/backoff model for future use.
- Timezone-aware business-hour policy.
- Immediate suppression check before any future send.
- Circuit breaker and emergency stop.
- Auditable approval/rejection and state transitions.

Use a fake mail transport only in tests. Production code path must fail closed when sending is disabled. Add an explicit assertion/test proving zero send calls during this phase.

## 8. Frontend workflow

Add a focused Outreach section or page:
- Research queue with source evidence and confidence.
- Contact detail and linked job.
- Draft preview/editor.
- Approve/reject draft for preparation workflow (approval is not send authorization).
- Suppression management and duplicate warnings.
- Filters for research status and draft status.
- Clear “Sending disabled” status.

Do not add a Send button that can reach a real provider. If an existing shared UI component includes one, ensure it is not wired to a real sending endpoint.

## 9. Tests

Add tests for:
- Source provenance and verified vs unknown contact details.
- No guessed email addresses marked verified.
- Candidate facts grounded in approved profile evidence.
- Draft generation with no fabricated claims.
- Contact/job deduplication and cooldown calculations.
- Suppression matching and normalization.
- Concurrent quota reservation/lease behavior.
- Emergency-stop and compliance-gate fail-closed behavior.
- Outbound sending disabled even if stale config suggests otherwise.
- Fake transport receives zero messages in all production-mode tests.
- Read-only Gmail permissions remain unchanged.
- API authorization, frontend empty/error/loading states, and accessibility.
- Migration compatibility and audit redaction.

Run focused and full test suites, static checks, and frontend production build.

## 10. Deployment and acceptance

Deploy using existing pipelines only after tests pass. Verify the live UI/API and prove:
- Contact research and drafts work with traceable evidence.
- No guessed or fabricated contact details.
- All new records are deduplicated and auditable.
- Sending endpoint is unavailable/disabled and no provider send call occurred.
- Gmail remains read-only; no new OAuth send scope.
- No application stage, ATS submission, or job-fit score is changed by outreach.
- Job/application counts and campaign safety settings remain intact.
- Existing auto-apply remains `STAGE_0_DRY_RUN`, `is_enabled: false`; zero real submissions.
- Write `feature/047_completion_report.md` with commits, deployment identifiers, tests, live verification, counts, and remaining compliance gates.

## 11. Explicitly out of scope

- Real outbound email delivery.
- Automated LinkedIn messaging.
- Legal conclusion that cold email is permitted.
- Broad autonomous sending.
- Automatic changes to fit scores based on recruiter response.
- Changes to application submission, Gmail inbox sync permissions, or auto-apply activation.

## 12. Stop conditions

Stop if a source's permitted use is unclear, contact evidence cannot be verified, any code path can send a real email, Gmail permissions would broaden, candidate data would be shared with an unapproved external service, or the campaign safety state changes unexpectedly.
