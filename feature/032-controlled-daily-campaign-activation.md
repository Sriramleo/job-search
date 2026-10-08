# Phase 032 — Controlled Daily Campaign Activation

Status: NEXT IMPLEMENTATION
Branch: main ONLY
Goal: Activate the proven autonomous job-application campaign gradually and safely in production.

## Mission

Phase 029/030 proved one real autonomous application end-to-end with Wandelbots Personio confirmation.

Phase 031 delivered:
- newest-first jobs
- newest-first inbox
- hardened Fit/Readiness UI
- campaign controls
- dry-run queue evaluation
- daily/company/ATS limits
- emergency stop
- OUTCOME_UNKNOWN retry protection

Phase 032 must now prove that the campaign engine can operate as a real daily production workflow.

This is a CONTROLLED ACTIVATION phase, not a mass-application phase.

## 0. Git Policy

Use `main` directly in both repositories:

- job-search-api
- job-search

Before implementation:
- pull/reconcile origin/main
- verify Phase 031 commits are present
- do not create feature branches
- commit directly to main
- push directly to origin/main
- never force-push

If branch protection prevents direct push, stop and report the exact blocker.

## 1. Safety Principle

The campaign must remain OFF until all production activation checks pass.

Never bypass:
- CAPTCHA
- MFA
- authentication
- anti-bot controls
- Cloudflare/DataDome
- employer security controls

Never fabricate:
- candidate experience
- language ability
- salary
- work authorization
- notice period
- application answers
- employer/job facts

Never automatically retry an OUTCOME_UNKNOWN submission.

Never submit an already-applied real-world job.

Never silently substitute a candidate after a safety failure without re-running the complete selection policy.

## 2. Activation Strategy

Do NOT activate the existing daily_max_applications=5 immediately.

Use staged rollout:

### Stage 0 — Production dry-run

Campaign:
- enabled=false
- evaluate_queue=true

Run the production queue evaluation against fresh candidates.

Verify every candidate gets:
- freshness result
- real-world identity
- duplicate result
- Fit %
- readiness
- policy decision
- company limit
- ATS limit
- remaining daily quota
- final eligibility

No submissions.

### Stage 1 — One application per day

Only after Stage 0 passes:

- daily_max_applications = 1
- minimum Fit Score >= 85
- minimum Readiness Score >= 90
- max_per_company_daily = 1
- max_per_ats_daily = 1
- conservative cooldown
- emergency_stop available

The campaign must submit at most ONE application in a calendar day.

The system must count only positively verified submissions toward successful application quota.

An attempted submission that becomes OUTCOME_UNKNOWN must:
- block automatic retry
- surface human reconciliation
- prevent another submission if policy requires the daily slot to remain locked

### Stage 2 — Observation

Do NOT automatically increase to 2/day merely because Stage 1 succeeds.

Collect enough production evidence to verify:
- correct candidate selection
- duplicate prevention
- ATS behavior
- confirmation verification
- failure handling
- campaign accounting
- daily limits
- audit integrity

The implementation should expose readiness for Stage 2, but Stage 2 activation requires explicit user authorization.

## 3. Campaign Scheduler / Daily Run

Integrate the existing daily campaign service with the production daily workflow.

Preferred flow:

Discovery
→ enrichment
→ qualification
→ freshness
→ deduplication
→ Fit Score
→ Application Readiness
→ Policy Decision
→ campaign queue
→ execution
→ confirmation
→ audit/report

Do not duplicate existing discovery/qualification logic.

Reuse the existing Oracle/k0s source-of-truth architecture.

Do not move MongoDB access into GCP.

## 4. Candidate Queue

The queue must be deterministic and newest-first aware.

Candidate priority should consider:
1. fresh verified job
2. eligible AUTO_APPLY policy
3. Fit Score
4. readiness
5. job freshness/recency
6. deterministic tie-breaker

Never allow an older job to unexpectedly outrank a fresh job solely because of array/database ordering.

Exclude:
- stale/unavailable
- already applied
- duplicate identity uncertain
- unsupported ATS
- CAPTCHA/MFA/auth required
- missing required candidate data
- blocked policy
- OUTCOME_UNKNOWN
- manual-only policy

## 5. Real Application Execution

Reuse the hardened Playwright runner.

Before final submit:
1. persist SUBMISSION_INITIATED
2. bind automationRunId to application
3. submit exactly once
4. persist CONFIRMATION_VERIFICATION
5. verify genuine positive ATS confirmation
6. only then set Applied/Submitted

If positive confirmation is absent:
- do not mark Applied
- classify according to existing outcome state
- if submission may have happened, use OUTCOME_UNKNOWN
- block automatic retry

If CAPTCHA/MFA/authentication is detected:
- stop immediately
- record exact blocker
- do not bypass
- do not retry automatically

## 6. Daily Quota Semantics

Implement/verify exact semantics for:
- applications attempted
- applications submitted
- applications positively confirmed
- failed before submission
- outcome unknown
- manually required
- skipped

The system must never accidentally allow more than the configured daily maximum.

Use a durable database-backed quota/lock, not only in-memory counters.

Protect against:
- duplicate scheduler invocation
- concurrent workers
- API restart
- retry race
- two campaign runs selecting the same job
- two jobs for the same company exceeding company limit
- two jobs on the same ATS exceeding ATS limit

## 7. Campaign Concurrency / Lease

Ensure only one active campaign execution owns a candidate/application at a time.

Use a durable execution lease or equivalent mechanism.

A stale worker must not silently release an application into an unsafe retry state.

If execution state indicates submission may have started:
- classify OUTCOME_UNKNOWN
- require reconciliation
- do not automatically retry

## 8. Emergency Stop

Verify emergency stop works in production.

When engaged:
- no new autonomous submission may start
- queued candidates become blocked/paused
- active submission behavior must follow existing safe execution semantics
- audit the stop event
- expose the reason/time/run ID

Emergency stop must survive API restart.

## 9. Frontend Activation Controls

The Campaign Dashboard must clearly display:

- Disabled / Dry Run / Armed / Active / Emergency Stop
- daily limit
- applications used today
- remaining capacity
- Fit threshold
- readiness threshold
- company limit
- ATS limit
- cooldown
- queue size
- eligible candidates
- skipped
- blocked
- manual review
- outcome unknown

### Activation UX

Do not create a single ambiguous "Start Automation" button.

Use explicit states:
- Run Dry Run
- Arm 1-per-day Campaign
- Pause Campaign
- Emergency Stop

Show a clear confirmation before changing campaign from disabled to armed/active.

Never expose a control that bypasses safety gates.

## 10. Daily Campaign Report

Create a production-readable daily campaign summary:

- campaign run ID
- date
- discovery count
- qualified count
- fresh verified count
- eligible AUTO_APPLY count
- skipped count
- blocked count
- manual-review count
- applications attempted
- applications positively confirmed
- outcome unknown
- CAPTCHA/MFA/auth blocks
- daily quota used/remaining

Show top eligible candidates with:
- role
- company
- Fit %
- readiness
- policy
- ATS
- freshness
- duplicate result

## 11. No Automatic Scale-Up

Do not change Stage 1 from one application/day to two or more automatically.

Add a documented transition gate.

Stage 2 requires explicit user authorization after reviewing production evidence.

Do not make the campaign self-increasing.

## 12. Production Data Integrity

Before activation:
- record application count
- verify 1KOMMA5° historical application unchanged
- verify Wandelbots application unchanged
- verify audit records
- verify candidate evidence
- verify source-of-truth MongoDB

After each campaign run:
- verify application count delta
- verify only expected applications were created
- verify no historical records mutated
- verify automationRunId/audit linkage
- verify confirmation ID where submitted

## 13. Gmail Boundary

Keep Gmail read-only.

The campaign must not:
- send recruiter email
- send follow-up email
- send LinkedIn messages

Inbox remains observation/intelligence only.

## 14. GCP / Oracle Boundary

Preserve current architecture:
- Oracle/k0s owns MongoDB and job/application source of truth.
- GCP Agent may orchestrate/report through approved Oracle APIs.
- GCP does not directly access MongoDB.
- Do not introduce Redis.

## 15. Tests

### Backend

Run full existing suite.

Add/verify tests for:
- dry-run produces zero submissions
- 1/day limit
- company limit
- ATS limit
- Fit threshold
- readiness threshold
- duplicate prevention
- newest candidate priority
- concurrent campaign invocation
- durable quota accounting
- durable execution lease
- emergency stop
- emergency stop persistence
- OUTCOME_UNKNOWN blocks retry
- CAPTCHA/MFA/auth blocks
- positive confirmation required
- historical application immutability
- duplicate scheduler execution
- API restart/recovery
- no quota bypass through retries

### Frontend

Run full Vitest suite.

Add/verify:
- campaign state rendering
- dry-run mode
- 1/day armed state
- remaining quota
- activation confirmation
- pause
- emergency stop
- queue preview
- OUTCOME_UNKNOWN warning
- blocked/manual states
- daily report
- no unsafe activation controls

### Build

- backend production build
- frontend production build

## 16. Production Deployment

Deploy only after full tests pass.

Verify:
1. backend health
2. frontend health
3. MongoDB source-of-truth
4. campaign configuration
5. campaign disabled state
6. dry-run queue
7. daily ordering
8. duplicate protection
9. historical applications
10. audit logging
11. emergency stop
12. durable quota state

Then execute Stage 0 dry-run in production.

## 17. Stage 1 Activation

Only after Stage 0 is validated and no blockers remain:

- configure exactly 1 application/day
- keep all safety thresholds enabled
- activate controlled campaign
- observe the first production campaign execution
- allow at most ONE real application

If no candidate safely qualifies:
- submit zero
- report why
- do not lower thresholds merely to create an application

If candidate is blocked:
- report blocker
- do not bypass

If one application is successfully submitted:
- require positive ATS confirmation
- record confirmation ID
- verify final Applied state
- verify application count increased by exactly one

## 18. Rollback

If unexpected behavior occurs:
- emergency stop immediately
- disable campaign
- preserve all audit records
- do not delete applications
- do not retry unknown outcomes
- reconcile execution state before reactivation

## 19. Required Final Report

Report:

1. backend commit
2. frontend commit
3. both pushed directly to main
4. full backend tests
5. full frontend tests
6. production builds
7. production deployment
8. Stage 0 dry-run result
9. campaign configuration
10. daily quota behavior
11. concurrency/lease verification
12. emergency stop verification
13. candidate queue result
14. whether Stage 1 was activated
15. whether a real application occurred
16. if submitted, ATS confirmation ID and positive confirmation proof
17. application count before/after
18. historical 1KOMMA5° integrity
19. Wandelbots integrity
20. blockers and remaining limitations

## Definition of Done

Phase 032 is complete when:

- campaign workflow runs in production
- dry-run produces no submissions
- one-per-day safety limit is durable
- company/ATS limits work
- duplicate protection works
- concurrent runs cannot bypass limits
- execution lease/recovery is safe
- emergency stop works
- frontend activation controls are clear
- daily campaign reporting works
- full backend tests pass
- full frontend tests pass
- production builds pass
- production deployment is verified
- Stage 1 is activated only with explicit user authorization
- at most ONE real application is submitted in the first active campaign day
- positive employer confirmation is required
- no unsafe retry occurs
- historical applications remain unchanged

Do not automatically increase application volume after Phase 032.
Do not start Phase 033 until the Phase 032 final report has been reviewed.
