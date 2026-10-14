# Phase 048 — End-to-End Production Reliability & Safety Audit

**Status:** Planned final validation phase; execute after Phases 045–047 have completion evidence  
**Project:** German Job Search Dashboard  
**Execution:** Audit and verify, fix only confirmed defects within scope, test, deploy if needed, and produce a consolidated evidence-based report.

## 1. Objective

Validate that the job-search platform behaves consistently across discovery, qualification, freshness, application lifecycle, read-only Gmail outcome sync, frontend, GitOps, GCP Agent scheduling, and the recruiter research/draft workflow. This is a reliability audit, not authorization to activate auto-apply or outbound email.

## 2. Systems and repositories

Inspect current `main` and live versions of:
- `Sriramleo/job-search-api`
- `Sriramleo/job-search`
- `Sriramleo/homelab-gitops`
- GCP Cloud Run service `germany-job-hunt-agent` and its Cloud Scheduler integration, if access is available.
- Cloudflare Pages frontend deployment.

Do not claim a service or schedule is verified if access/logs are unavailable. Separate direct observations, test results, and user-provided historical reports.

## 3. Establish live baseline

Before running any mutation:
- API health/database connection.
- Backend image/commit and GitOps sync/health.
- Frontend deployment/build identifier.
- Jobs total, active Germany-eligible/unapplied, archive/ineligible, unavailable, freshness distribution, source distribution, duplicate custom IDs.
- Companies and application totals.
- Application stage/method distribution and unresolved/unknown outcomes.
- Gmail sync checkpoint and counts, without logging message bodies.
- Scheduler names, timezones, enabled state, last run and result.
- Campaign stage, enabled flag, emergency stop, daily quota, active leases, attempted/confirmed/unknown submissions.
- Outreach campaign state, send capability, OAuth scopes, draft/contact/suppression counts, and evidence that real delivery is disabled.

Never expose credentials, tokens, email bodies, or unnecessary personal data.

## 4. End-to-end scenarios

Use test fixtures, mocked external services, or explicitly read-only production checks. Do not create real applications or send emails.

### Discovery and qualification
- Official source → provider record → canonical job → qualification → API → UI.
- Duplicate observations preserve provider IDs, source evidence, direct ATS URL, and application stage.
- Germany location and remote eligibility are consistent across ingestion, API, active list, archive, and counts.
- Missing salary, fit score, language level, sponsorship, or freshness remain unknown rather than fabricated.

### Freshness
- Bounded runner uses a lock and rate limits.
- Verified-active and authoritative-unavailable results are classified correctly.
- 403/429/timeouts/anti-bot/generic redirects remain UNKNOWN.
- Last successful verification timestamps are preserved on transient failures.

### Application lifecycle
- Prepared/ready does not imply Applied.
- Only positive ATS confirmation can establish an automated submission.
- Unknown outcome blocks retry.
- Applied jobs leave active list and remain accessible in archive/history.
- Rejection sync is deterministic, idempotent, source-linked, and does not invent a rejection reason.
- Interview/offer evidence is not downgraded by an older rejection message.
- Manual/automatic/unknown submission method labels match provenance.

### Gmail
- Read-only access remains read-only.
- No send, reply, delete, or modify operations.
- Ambiguous messages go to review.
- Sync is idempotent and logs are privacy-safe.

### Recruiter outreach
- Research and drafts have traceable source evidence.
- Contact suppression and duplicate prevention work.
- No guessed contact email is marked verified.
- No real send capability or call is enabled in production.
- Candidate claims in drafts are grounded in verified profile facts.

### Scheduler and resilience
- Existing schedules run at intended timezone/cadence; do not create duplicates.
- Locks, leases, quotas, retries, and unknown outcomes behave safely.
- GCP Agent only accesses permitted read-only Oracle Agent API tools and has no direct MongoDB access.
- Emergency stop blocks campaign operations.
- Failed dependency does not trigger unsafe retries or incorrect success status.

## 5. Test and deployment policy

- Run focused tests for changed code, full backend suite, frontend suite, lint/type checks, and production build.
- Exercise failure modes with mocks/fixtures.
- Use current deployment workflow; avoid unreviewed direct production mutations.
- If a defect is found, isolate it, add a regression test, and implement only the smallest safe fix.
- Do not deploy when tests fail or when the intended image/commit cannot be identified.
- Verify the live deployment after rollout and distinguish rollout completion from functional correctness.

## 6. Required safety invariants

Before and after:
- `STAGE_0_DRY_RUN` remains the campaign stage.
- `is_enabled: false` remains unchanged.
- No real ATS submissions, retries, or outbound emails.
- Zero unexpected quota reservations/active leases after completion.
- Historical application records remain intact.
- No job records are deleted or merged without separately approved migration scope.
- Gmail remains read-only.
- No candidate facts, visa/work authorization, contact details, or rejection reasons are fabricated.

Any unexpected change is a stop condition and must be investigated before continuing.

## 7. Acceptance criteria

1. Each component has an observed live status or is explicitly marked unverified due to access limitations.
2. End-to-end scenarios pass or have clearly documented blockers.
3. API, UI, database, archive, and sidebar counts are consistent.
4. Schedules and timezone settings are evidenced; no duplicate schedule is created.
5. Campaign and outreach safety invariants are verified.
6. Test totals, commit hashes, image tags, GitOps revision, and frontend deployment identifiers are recorded.
7. Every remaining issue has severity, evidence, owner/next action, and whether it blocks safe operation.
8. Write `feature/048_completion_report.md` and update the roadmap with final statuses.

## 8. Final report format

Include:
- Verdict: PASS / PASS_WITH_FINDINGS / BLOCKED.
- Timestamp and environment.
- Exact repository commits and deployed versions.
- Pre/post metrics and count reconciliation.
- Tests executed and results.
- Scenario matrix with evidence.
- Scheduler configuration and last-run evidence.
- Safety invariant pre/post table.
- Findings and remediation priorities.
- Explicit statement that no real application submissions or outbound emails were performed.
- Items that still require explicit human authorization.

## 9. Stop conditions

Stop if campaign or outbound delivery becomes enabled, an unexpected external action occurs, historical records change unexpectedly, database/deployment identity is ambiguous, a safety check fails, or evidence is insufficient to establish the state. Do not mark PASS solely because unit tests pass.
