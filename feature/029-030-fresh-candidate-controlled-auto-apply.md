# Phase 029/030 — Fresh Candidate Replenishment + Controlled Real Auto-Apply

Status: NEXT IMPLEMENTATION — execute only after the weekly Gemini quota refresh is healthy enough for a focused production mission.

## Mission

Combine the next two logical milestones into ONE controlled end-to-end phase:

1. Replenish and validate a fresh pool of qualified Germany jobs.
2. Select one genuinely fresh, high-fit, supported-ATS candidate.
3. Execute exactly ONE real production auto-apply if and only if every deterministic safety gate passes.
4. Verify the employer's positive ATS confirmation.
5. Leave all historical applications and candidate evidence unchanged.

This is NOT a broad application campaign.

## Critical Gemini Quota Rule

The user currently has only 14% weekly Gemini quota remaining. Do not consume substantial Gemini/Antigravity work until the weekly quota refresh unless a tiny verification is required.

When execution begins after refresh:
- Prefer deterministic/local logic wherever possible.
- Reuse cached research/evidence.
- Do not perform unnecessary large AI audits.
- Avoid repeated scans or speculative implementation.
- Keep this mission focused on the end-to-end proof.

## Git / Branch Policy — IMPORTANT

### Phase 028 handoff

The current Phase 028 implementation exists on feature branches:

- job-search-api: feature/phase-028-controlled-auto-apply-pilot
- job-search: feature/phase-028-controlled-auto-apply-pilot

Before beginning this phase:

1. Verify Phase 028 commits are pushed.
2. Verify tests/builds and the final Phase 028 report.
3. Ask the user to merge the Phase 028 feature branches into `main` if they have not already been merged.
4. Do NOT silently merge the Phase 028 branches yourself unless explicitly authorized.
5. Do NOT begin Phase 029/030 implementation until the Phase 028 code is available on `main`.

### Going forward

After Phase 028 is merged:

- `main` is the canonical development branch for this project.
- For all future phases, work from `main`.
- Pull/rebase from `main` before starting.
- Push implementation commits directly to `main`.
- Do NOT create `feature/*` branches for subsequent phases unless the user explicitly requests a feature branch.
- Keep backend and frontend repositories synchronized with the same phase/commit intent.
- Never force-push `main`.
- If repository protection prevents a direct push, stop and report the exact blocker instead of inventing a workaround.

## Phase 029 — Fresh Candidate Replenishment

### 1. Verify production source of truth

Confirm the production MongoDB database is still the same source of truth.

Verify at minimum:
- application count
- canonical job count
- discovered job count
- historical 1KOMMA5° Personio application
- immutable audit history
- candidate evidence

Do not mutate historical records.

### 2. Freshness reconciliation

Inspect currently qualified jobs and semantically verify freshness.

Use:
- canonical job URL
- provider/ATS job ID
- official company/ATS page
- semantic job availability, not HTTP 200 alone

Handle modern SPA shells correctly.

A 200 shell with missing job/posting data is NOT an active job.

Mark stale/unavailable jobs appropriately and prevent them from becoming application candidates.

### 3. Candidate replenishment

If the current qualified pool is insufficient, use the existing production discovery sources and supported enrichment pipeline.

Prefer already-supported sources and ATS integrations.

Do not add a new scraping provider merely to find one candidate.

Do not bypass:
- 403/429 protections
- CAPTCHA
- anti-bot controls
- authentication

### 4. Candidate ranking

Build a fresh ranked candidate set.

For each candidate calculate:

- Fit Score: 0–100
- Requirements Matrix
- Application Readiness
- Policy Decision
- real-world duplicate identity
- freshness status
- ATS/provider
- salary if genuinely disclosed
- location/remote status
- German-language requirement

Use evidence only.

Never fabricate candidate experience, German level, authorization, salary, or other facts.

German requirements must remain GAP/NOT_VERIFIED when evidence is absent.

### 5. Candidate selection

Produce a ranked Top 3 internally.

Exclude:
- historical applications
- 1KOMMA5°
- stale jobs
- ambiguous jobs
- unsupported ATS
- auth/MFA/CAPTCHA-required flows
- missing required application data
- unsafe/unknown execution states

Select ONE candidate only if it reaches a deterministic `AUTO_APPLY` policy decision.

Do not silently substitute an arbitrary candidate if the designated candidate becomes unsafe. Re-run the deterministic selection/ranking logic and document why the selected candidate won.

## Phase 030 — Controlled Real Auto-Apply

### Mandatory gates

Before browser execution, require:

- active official job verified
- exact company/role verified
- provider/ATS identity verified
- no duplicate across historical applications and ID variations
- Fit Score acceptable
- Requirements Matrix grounded
- Application Readiness = `AUTO_APPLY_READY`
- Policy Decision = `AUTO_APPLY`
- grounded CV selected
- grounded cover letter generated
- all required application answers available
- no fabricated information
- supported ATS
- execution environment healthy
- no authentication requirement
- no CAPTCHA/MFA
- no anti-bot bypass requirement

### Browser execution

Use the existing hardened Playwright automation.

Before clicking the final submit button:

1. Persist `SUBMISSION_INITIATED`.
2. Persist the automation run/application linkage.
3. Submit exactly once.
4. Persist `CONFIRMATION_VERIFICATION`.
5. Require a genuine positive ATS confirmation.
6. Only then transition the application to Submitted/Applied.

A timeout/crash/network failure after submission initiation must become `OUTCOME_UNKNOWN` / `Submission Unverified`.

Never automatically retry an outcome-unknown submission.

### CAPTCHA / MFA / authentication

If encountered:

- stop immediately
- do not bypass
- do not attempt workarounds
- record the exact blocker
- leave the application in the appropriate human-action/manual state

### Submission scope

Exactly ONE real application.

Must remain:
- 1 submission maximum
- 0 broad campaigns
- 0 LinkedIn outbound messages
- 0 Gmail outbound messages
- 0 referral messages

## Frontend

Ensure the Job Detail / Application Readiness UI clearly shows:

- Fit %
- Fit breakdown
- Requirements Matrix
- freshness
- ATS/provider
- duplicate status
- Application Readiness
- Policy Decision
- blockers
- execution status
- automation run ID
- submission confirmation

The UI must never imply Submitted until backend confirmation is verified.

## Backend / API

Reuse Phase 028 services wherever possible.

Do not duplicate logic.

Maintain clear separation:

Qualification
→ Fit Score
→ Application Readiness
→ Policy Decision
→ Execution
→ Confirmation Verification

Preserve existing duplicate identity normalization and cross-ID detection.

## Tests

Mandatory:

### Backend
- full existing regression suite
- Phase 028 tests
- fresh candidate selection tests
- semantic freshness tests
- duplicate identity tests
- policy/readiness tests
- outcome-unknown tests
- CAPTCHA/MFA stop tests
- positive confirmation tests
- no-duplicate-submit tests

### Frontend
- existing Vitest suite
- readiness card states
- AUTO_APPLY state
- blocked/manual state
- outcome-unknown state
- submitted-after-confirmation-only behavior

### Build
- production frontend build
- backend production image/build
- deployment manifests validation

Do not report success based only on unit tests.

## Production Validation

Deploy safely after tests.

Verify:
- health endpoints
- MongoDB source-of-truth identity
- current application count
- historical 1KOMMA5° record unchanged
- candidate count and freshness
- readiness/policy APIs
- frontend rendering
- execution telemetry
- audit trail

Then perform the ONE controlled real submission.

Afterward verify:

- exactly one new application, OR zero if the deterministic safety gate stopped execution
- positive ATS confirmation if submitted
- no duplicate applications
- no historical mutations
- complete audit trajectory
- correct final lifecycle state
- automation run linked to application
- no unexplained side effects

## Required Final Report

Report:

1. Git commits on both repositories
2. branch used (must be `main` for this phase)
3. tests and build results
4. production deployment result
5. candidate ranking and selected candidate
6. Fit Score and key evidence
7. readiness/policy decision
8. duplicate identity proof
9. ATS/provider and freshness proof
10. whether real submission occurred
11. ATS confirmation text/status if submitted
12. final application count
13. historical 1KOMMA5° integrity check
14. audit/run IDs
15. blockers, if any
16. exact reason if submission was intentionally stopped

## Hard Stop Conditions

STOP and report if:

- Phase 028 is not merged into `main`
- production MongoDB identity is uncertain
- historical application cannot be reconciled
- no fresh safe candidate exists
- candidate identity is ambiguous
- duplicate status is uncertain
- ATS is unsupported
- job freshness is uncertain
- authentication/MFA/CAPTCHA is required
- candidate evidence is insufficient
- application outcome becomes unknown
- repository protection prevents the required `main` workflow
- any safety invariant would be violated

Never hide a blocker by choosing an arbitrary fallback.

## Definition of Done

The phase is complete only when:

- Phase 028 is merged into `main`
- Phase 029/030 changes are committed directly to `main`
- fresh candidate discovery/verification works
- Fit %, Requirements Matrix, Readiness, and Policy Decision are production-visible
- duplicate protection works across real-world identity variations
- exactly ONE controlled real application is submitted and positively verified, OR the system correctly stops because no safe candidate exists
- no duplicate/historical application is modified
- all mandatory tests pass
- production deployment is verified
- audit trail is complete
- final report is produced

Do not start another major phase after this until the user reviews the final report.
