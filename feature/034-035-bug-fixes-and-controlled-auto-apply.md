# Phase 034–035 — Critical Bug Fixes, Production Readiness & Controlled Auto-Apply Activation

Status: NEXT IMPLEMENTATION
Repositories: job-search-api and job-search
Branch policy: main ONLY
Mission type: One coordinated program with two independently gated stages

## Executive Goal
Make candidate/job data trustworthy, close the remaining known bugs, then safely activate the existing autonomous application campaign at a maximum of one application per day.

IMPORTANT: Phase 034 and Phase 035 may be planned and executed in one Antigravity session, but they MUST remain separate implementation/deployment gates. Do not activate Stage 1 until Phase 034 acceptance criteria pass in production and the user explicitly authorizes activation. Do not submit any real application during Phase 034.

## 0. Git and execution policy
- Use main directly in both repositories.
- Pull/reconcile origin/main before work; verify Phase 033 commits are present.
- Do not create feature branches. Never force-push.
- Commit and push completed work directly to origin/main.
- Keep backend and frontend changes coordinated.
- Prefer focused deterministic implementation and reuse existing services.
- Do not repeat features already completed in Phases 031–033.
- If a repository or production operation is blocked, report the exact blocker; do not silently skip it.

## STAGE A — Phase 034: Critical Bug Fixes and Production Readiness

### A1. Preflight and source-of-truth audit
- Verify production MongoDB source of truth and current application/job/discovery counts.
- Verify the 1KOMMA5° and Wandelbots applications, confirmation evidence, and audit history are intact.
- Verify campaign state, daily quota, Stage 0/Stage 1 status, emergency stop, and current remaining capacity.
- Capture a baseline and make no historical application mutations.
- Inspect current main code and tests before deciding which backlog items remain open.

### A2. BUG-001 — Manual submission recording for preview applications
- Trace displayed application ID through frontend, API, persistence, and MongoDB lookup.
- Ensure manual submission confirmation targets a persistent application record.
- If a preview/draft has not been persisted, disable confirmation or persist it safely before allowing confirmation.
- Return a clear recoverable error; never show false success.
- Add regression tests for preview and normal manual-submission flows.

### A3. BUG-002 — Unavailable/stale job cleanup
- Use semantic freshness verification, not HTTP 200 alone.
- Treat SPA shells with missing job/posting data as unavailable.
- Mark stale/unavailable jobs with an appropriate terminal/archived status and retain provenance.
- Exclude unavailable jobs from active/recommended lists and auto-apply queues.
- Do not delete application history, audit records, or candidate evidence.
- Reactivate only after fresh semantic verification.

### A4. BUG-006 — German language requirement and Fit Score
- Use the enriched full job description for requirement extraction.
- Detect German C1/C1+ and other explicit language requirements.
- Use only verified candidate-language evidence; unknown proficiency remains NOT_VERIFIED, below required level is GAP.
- Show technical fit separately from language fit.
- Do not automatically reject a job solely because the employer says candidates need not meet every requirement.
- Add regression fixtures for the dkbcodefactory DevOps Engineer listing and a genuinely English-only listing.
- Never fabricate German ability or any other candidate fact.

### A5. BUG-008 — Missing/invalid salary display
- Never show €0K–€0K as a real salary band when salary is absent/invalid.
- Show 'Not specified' or equivalent for missing salary.
- Parse disclosed salary only from grounded source data.
- Add parser and frontend regression tests.

### A6. BUG-009 — Source provenance consistency
- Verify canonical URL, provider job ID, source, ATS, company, role, and application URL refer to the same real-world posting.
- Flag conflicting provenance as ambiguous/needs review and block auto-apply.
- Preserve multiple source observations while deduplicating canonical jobs.
- Add tests for mismatched URLs, IDs, source labels, and ATS routes.

### A7. BUG-007 — Rejection intelligence audit (do not rebuild Phase 033)
- Verify Phase 033's rejection classification is used by the production outcome sync and analytics.
- Generic competitive rejection must remain GENERIC_COMPETITIVE_REJECTION.
- Specific reasons require explicit employer evidence; silence is never rejection.
- Add only missing regression coverage.

### A8. Preserve already-completed work
- BUG-003 latest jobs first and BUG-005 latest Inbox first were implemented in Phase 031. Verify regression tests; do not rewrite without a demonstrated defect.
- BUG-004 multi-source discovery was implemented earlier. Verify source health/provenance and restricted-source handling; do not bypass anti-bot controls.
- Phase 033 outcome intelligence already exists. Reuse it.

### A9. Phase 034 tests and deployment
- Run the full backend pytest suite.
- Run the full frontend Vitest suite and production build.
- Add targeted regression tests for every changed bug.
- Deploy only after tests pass.
- Verify production endpoints/UI and semantic freshness behavior.
- Recheck database counts and historical application/audit integrity.
- Confirm campaign remains disabled/Stage 0 unless it was already explicitly armed by the user; Phase 034 must not arm it.
- Confirm ZERO real submissions during Phase 034.

### Phase 034 acceptance gate
Do not continue to Stage B unless all of the following are true:
- All remaining in-scope bugs are fixed or clearly documented as blocked with evidence.
- Full backend and frontend suites pass.
- Production builds/deployment are verified.
- Job/source/language/salary data are not misleading.
- Historical applications remain unchanged.
- Campaign is still safely disabled unless a pre-existing explicit user action says otherwise.
- Zero real applications were submitted during Stage A.

Produce a Phase 034 report with commits, tests, deployment, per-bug evidence, counts, historical integrity, campaign state, and unresolved issues.

## STAGE B — Phase 035: Controlled Daily Auto-Apply Activation

Do NOT start Stage B automatically merely because code was committed. First review Phase 034 acceptance evidence. If any gate fails, stop and report. If gates pass, continue implementation/validation but keep the campaign disabled until the user explicitly authorizes production activation.

### B1. Revalidate production before activation
- Re-read the actual production campaign configuration and durable quota from MongoDB.
- Verify daily limit, confirmed applications, attempted applications, locked/unknown slots, remaining capacity, company/ATS counts, and current date in the platform timezone.
- Verify 1KOMMA5° and Wandelbots remain intact and already-applied identity detection still works across provider/internal IDs.
- Run production dry-run and inspect the complete candidate decision list.
- Only fresh, semantically verified jobs with consistent provenance, no duplicate, supported ATS, grounded Apply Kit, complete required answers, Fit >=85, Readiness >=90, and policy AUTO_APPLY may be eligible.
- If no candidate qualifies, submit zero. Do not lower thresholds or silently substitute an unsafe candidate.

### B2. Stage 1 policy
- daily_max_applications = 1
- min_fit_score >= 85
- min_readiness_score >= 90
- max_per_company_daily = 1
- max_per_ats_daily = 1
- emergency stop available and persistent
- durable atomic quota reservation and execution lease required
- campaign execution must be idempotent under duplicate scheduler invocations
- no scale-up beyond one per day in this mission.

### B3. Activation consent
Before the first real production submission, present the live dry-run candidate and evidence to the user and ask for explicit authorization to arm Stage 1 and submit at most one application per day. Do not interpret approval to implement this prompt as blanket authorization to submit an application. If explicit authorization is not obtained in the current run, leave Stage 0 disabled.

### B4. Submission safety
- Never bypass CAPTCHA, MFA, authentication, Cloudflare/DataDome, or other anti-bot controls.
- Never fabricate candidate information.
- Persist SUBMISSION_INITIATED before clicking final submit.
- Submit at most once per reserved slot.
- Require positive employer ATS confirmation before marking Applied/Submitted.
- If outcome is ambiguous after submit may have occurred, mark OUTCOME_UNKNOWN, lock the slot, block retry, and require human reconciliation.
- Keep Gmail read-only and do not send LinkedIn/Gmail messages.
- Stop immediately on unexpected behavior and preserve audit evidence.

### B5. Campaign report
Report candidate counts, freshness, Fit, readiness, policy, duplicate check, source/ATS, quota before/after, run ID, submission attempts, verified confirmations, blocked/manual cases, CAPTCHA/MFA blocks, unknown outcomes, and application count delta.

### B6. Phase 035 validation
- Run the full backend suite and full frontend suite/build.
- Verify production campaign state, durable quota, lease, emergency stop, and audit logs.
- Verify at most one submission can occur in the local campaign day.
- If no candidate is safe or user authorization is absent, zero submissions is the correct outcome.
- Verify historical applications and audit records unchanged.

## Hard stops for both stages
- MongoDB source-of-truth uncertainty.
- Historical application mismatch or unexpected mutation.
- Stale/ambiguous job identity or conflicting source provenance.
- Duplicate state uncertain.
- Unsupported ATS or missing required application data.
- CAPTCHA/MFA/authentication/anti-bot challenge.
- OUTCOME_UNKNOWN or stale execution lease where submission may have started.
- Failed tests, unhealthy production, quota mismatch, or emergency stop.
- Do not bypass a hard stop by choosing an arbitrary candidate.

## Final report
Provide separate Phase 034 and Phase 035 reports, with backend/frontend commits pushed directly to main, full test/build/deployment evidence, per-bug results, production counts, campaign config and quota, candidate evidence, explicit authorization status, whether a real submission occurred, ATS confirmation proof if applicable, historical integrity, and unresolved blockers.

## Definition of Done
Phase 034 is done when the remaining critical bugs are fixed and production-verified with zero new submissions.
Phase 035 is done when Stage 1 is safely configured and either (a) explicitly authorized and at most one application is positively verified, or (b) left disabled because authorization is absent or no safe candidate exists.
Do not start Phase 036 automatically.