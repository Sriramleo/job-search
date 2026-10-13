# Phase 036 — Candidate Readiness Recovery

**Status:** Implementation prompt  
**Target branch:** `main` in both `Sriramleo/job-search-api` and `Sriramleo/job-search`  
**Safety mode:** Stage 0 dry-run only. No real application submissions.

## Objective

Resolve the upstream blockers identified by the Phase 035 production dry-run. Improve the number of genuinely fresh, unapplied, directly actionable jobs without weakening qualification, duplicate prevention, provenance checks, or auto-apply safety.

## Baseline from Phase 035

- Production applications: 17.
- Canonical jobs: 78.
- Candidates passing every auto-apply gate: 0.
- Campaign stage: `STAGE_0_DRY_RUN`.
- Campaign `is_enabled: false`.
- Historical 1KOMMA5° and Wandelbots application records must remain intact.
- Phase 035 dry-run produced zero real submissions and no new application records.

Treat these as the reported baseline; re-read live production state before any operation and report any differences rather than overwriting them.

## Stage A — Preflight and audit

1. Pull/reconcile the latest `origin/main` in both repositories. Work directly on `main`; do not create branches or force-push.
2. Inspect the current implementations, tests, logs, and Phase 035 run evidence before changing code. Reuse existing services and avoid rebuilding features already implemented.
3. Capture production baseline counts, campaign configuration, quota, lease state, and relevant audit records.
4. Audit all 20 duplicate/pipeline-active exclusions reported by Phase 035, including VERBI, N26, MOTOR Ai, Wandelbots, 1KOMMA5°, SumUp, and Personio.
5. Trace each duplicate decision to canonical URL, provider job ID, company/role identity, and existing application state.
6. Classify decisions as confirmed duplicate, active pipeline application, or ambiguous/possible false positive. Correct only demonstrable false positives with evidence. Never clear, mutate, or resubmit an existing application merely to make a candidate eligible.
7. Audit the remaining unapplied jobs and provide counts for each blocker: freshness unknown, stale/unavailable, missing direct URL, unsupported ATS, provenance mismatch, duplicate/active application, or other gate failure.

## Stage B — Freshness verification and URL recovery

1. Improve semantic freshness verification for supported public job pages and APIs.
2. An HTTP 200 response or generic SPA shell is not proof that a job is live. Verify the actual posting identity and active job content.
3. If a source is blocked, ambiguous, stale, unavailable, or cannot be verified safely, preserve an unresolved/blocked state. Do not bypass CAPTCHA, authentication, MFA, access controls, or anti-bot protections.
4. Recover canonical direct application URLs only from reliable source evidence. Validate ATS host, provider job ID, canonical job identity, and application URL consistency.
5. Do not infer application endpoints from company names or fabricate provider IDs. Keep unsupported portals manual-only.
6. Ensure archived/unavailable jobs remain excluded from active recommendations and campaign queues while preserving their history. Allow reactivation only after fresh positive verification.
7. Keep salary and candidate qualification unknown when evidence is absent. Do not invent German proficiency, experience, salary, relocation details, or form answers.

## Stage C — Discovery improvements

1. Improve discovery/enrichment for current Germany-based roles relevant to Senior DevOps, Platform Engineering, SRE, Kubernetes, cloud infrastructure, and related platform reliability work.
2. Prioritize existing supported sources and supported direct ATS integrations such as Greenhouse, Lever, and Personio where available.
3. Persist source provenance, provider job IDs, canonical URLs, and meaningful discovery/verification timestamps.
4. Sort new/updated candidates deterministically by effective freshness so old unqualified jobs do not starve newer jobs.
5. Deduplicate across sources using provider IDs and canonical URLs, with conservative company/role matching when identifiers are absent.
6. Do not claim an integration is auto-apply-supported unless the current implementation genuinely supports and safely verifies its form flow.

## Stage D — Regression tests

Add focused regression coverage for:

- Confirmed duplicates versus false-positive duplicate decisions and provider-ID aliases.
- Existing Applied and active-pipeline records never being resubmitted.
- Unknown freshness remaining blocked.
- Stale pages and unhydrated SPA shells not being treated as active.
- Verified direct URL recovery and ATS/provider provenance mismatch blocking.
- Missing or invalid URLs and unsupported ATS portals remaining manual-only.
- Archived/unavailable jobs excluded from active queues.
- Discovery ordering, canonical deduplication, and preservation of historical application records.
- Campaign remaining disabled and no submission path being invoked during this phase.

Run the relevant focused tests first, then the full backend regression suite and frontend tests/build. Do not claim a suite passed without its actual final exit status and summary.

## Stage E — Production validation and dry-run

1. Deploy only after the required tests pass and the diff has been reviewed.
2. Verify the deployed version and health.
3. Run a new production Stage 0 dry-run against live canonical jobs.
4. Report before/after counts for discovered jobs, fresh verified jobs, actionable direct ATS jobs, archived/stale jobs, true duplicates, demonstrable false positives corrected, and candidates passing all gates.
5. Include a candidate decision queue with company, role, canonical URL, source/provider identity, freshness evidence, fit score, readiness state, supported ATS status, each gate result, and blockers.
6. If zero candidates pass, report zero honestly. Do not lower fit/readiness thresholds or bypass a gate to manufacture an eligible candidate.
7. Verify the 1KOMMA5° and Wandelbots records remain intact. Report before/after application counts and explain every difference. Do not create application records as part of a dry-run.

## Hard safety requirements

- Keep campaign `is_enabled: false` and `STAGE_0_DRY_RUN` throughout this phase.
- Submit zero real applications.
- Do not reserve a real-submission quota slot or arm Stage 1.
- Do not weaken duplicate, freshness, provenance, readiness, or ATS safety gates.
- Never treat `UNKNOWN` as `VERIFIED` without positive evidence.
- Preserve durable quota, execution lease, emergency-stop, idempotency, and `OUTCOME_UNKNOWN` protections.
- Never bypass CAPTCHA, MFA, authentication, or anti-bot controls.
- Never fabricate candidate details or job facts.
- Work directly on `main` in both repositories; no feature branches and no force-pushes.
- Commit and push only safe, tested changes. Document commits, tests, deployments, and production evidence.

## Acceptance criteria

Phase 036 is complete only when:

1. Duplicate exclusions and job blockers have been audited with evidence.
2. Safe fixes are implemented with regression tests.
3. Backend and frontend checks pass.
4. Production validation and a new dry-run are completed.
5. Production application invariants and historical records are verified.
6. Campaign remains disabled with zero real submissions.
7. A report lists actual counts, commit SHAs, test results, deployment details, candidate gate outcomes, and remaining blockers.

## Stop condition

Stop after the dry-run report. Present the evidence-based candidate queue and remaining blockers. Do not activate Stage 1 or submit any application without subsequent explicit user authorization.
