# Phase 045 — Job Discovery Quality, Official Careers Coverage & Freshness

**Status:** Ready for implementation  
**Project:** German Job Search Dashboard  
**Scope:** Discovery, source provenance, Germany eligibility, freshness verification, scheduler inspection  
**Execution:** Inspect current production and all relevant repositories first; implement only verified gaps; test; deploy through existing GitOps/Cloudflare workflows; verify production and write a completion report.

## 1. Objective

Improve the quality and freshness of the active Germany job pool without duplicating existing functionality or destabilizing the production dataset. Earlier reports describe 141 job documents, 103 active Germany-eligible/unapplied jobs, and a significant stale/unverified backlog. Treat those values as historical baselines, not guaranteed current counts; capture a fresh baseline before any mutation.

## 2. Mandatory preflight

Inspect current `main` and live deployment for:
- `Sriramleo/job-search-api`
- `Sriramleo/job-search`
- `Sriramleo/homelab-gitops`

Inspect the discovery providers, `company_careers.py`, ingestion/qualification pipeline, direct ATS URL resolution, freshness runner, locks, scheduler definitions, job list/archive queries, and MongoDB indexes. Inspect the actual Oracle/k0s daily schedule (historically 06:00 IST) and GCP Agent schedule (historically 08:00 IST); do not create duplicate schedulers. Establish which functions already work and which are missing before coding.

Record a read-only baseline:
- Total jobs, active/ineligible/unavailable counts.
- Distinct MongoDB `_id`, custom IDs, provider IDs, canonical URLs.
- Freshness state distribution and age distribution.
- Germany eligibility distribution.
- Source/provider distribution and direct ATS URL coverage.
- Existing scheduler names, timezone, target, enabled state, last run, and logs where accessible.
- Applications and campaign safety state.

Never print secrets or database connection strings.

## 3. Official career-page discovery

Improve coverage of official employer career pages and ATS boards, prioritizing Germany-based DevOps, Platform, SRE, Cloud Infrastructure, Kubernetes, and Infrastructure Engineering roles.

Requirements:
- Reuse current providers and parsers where they already support a source.
- Prefer official employer career pages and direct ATS pages (e.g. Personio, Greenhouse, Lever, Ashby, Workday) when verifiably linked to the employer.
- Preserve provider, provider job ID, source URL, canonical job URL, direct application URL, first-seen time, last-seen time, and provenance.
- Do not label an aggregator URL as the official employer application URL.
- Do not add unsupported sources merely to increase job counts.
- Respect robots directives, terms, rate limits, and source access restrictions. No login-wall scraping, CAPTCHA/MFA bypass, or anti-bot circumvention.
- A 403, 429, timeout, or ambiguous redirect must yield UNKNOWN, not JOB_UNAVAILABLE.
- Avoid generic career-page redirects that do not prove a specific vacancy exists.
- If the existing scheduler already covers a source, improve its implementation rather than adding another schedule.

## 4. Germany eligibility and quality

Active jobs must be Germany-eligible under existing Phase 043 rules:
- German locations qualify.
- Remote roles qualify only if Germany is explicitly an allowed work location.
- Foreign-only roles and unresolved locations must not appear in the active Germany list.
- Do not infer eligibility from company headquarters or an office in Germany.
- Preserve source evidence and keep excluded jobs discoverable in archive/ineligible views.

Do not fabricate fit scores, salary ranges, German language requirements, visa sponsorship, work authorization, or freshness timestamps. Missing values remain Not evaluated/Not specified/Unknown.

## 5. Freshness policy

Inspect the current freshness worker and run only bounded, locked batches:
- Respect the existing per-run maximum (Phase 042 used at most 30 records); do not increase it without measured evidence and explicit rationale.
- Prioritize Germany-eligible, unapplied, high-relevance records with oldest/unknown verification first, while respecting per-domain rate limits.
- Use explicit timeouts and bounded concurrency.
- Only authoritative positive vacancy evidence may mark VERIFIED.
- Only authoritative vacancy closure (e.g. reliable 404/410 plus source semantics) may mark JOB_UNAVAILABLE.
- Transient errors, access restrictions, bot protection, generic redirects, and ambiguous responses remain UNKNOWN.
- Preserve `lastSuccessfulVerifiedAt` when a later check fails.
- Use MongoDB `_id` or another unique stable key for writes; do not mutate by duplicate custom `id` alone.
- A dry-run/report-only mode must be available and tested.

## 6. Duplicate safety

Use the existing Phase 042 deduplication hierarchy and preserve direct ATS URLs and application stages. Do not merge, delete, or re-key historical documents in this phase. Record duplicate candidates for Phase 046 rather than attempting data migration here.

## 7. Scheduler and observability

Inspect before modifying:
- Existing Oracle/k0s scheduled discovery/freshness jobs.
- GCP Cloud Scheduler → Cloud Run ADK agent schedule and tool permissions.
- Lease/lock behavior, retries, timeout handling, and failure reporting.

Do not add duplicate schedules or grant the GCP agent direct MongoDB access. Keep the GCP agent restricted to the read-only Oracle Agent API. Add or improve structured metrics for discovered, new, updated, duplicate, rejected-by-geography, verified, unavailable, unknown, skipped, and errored records. Redact personal data and secrets.

## 8. Required tests

Add regression tests for:
- Official career/ATS URL provenance and provider ID preservation.
- Duplicate discovery across two sources.
- Germany remote eligibility, foreign-only locations, and unknown locations.
- Salary missing/zero handling and missing fit score behavior where relevant.
- 200 with confirmed active vacancy, authoritative 404/410, 403, 429, timeout, generic redirect, and malformed response.
- Bounded batch size, lock contention, concurrent invocations, rate limiting, and idempotency.
- Stable historical records and preservation of application stages/direct ATS URLs.
- Scheduler configuration inspection without duplicate schedule creation.

Run relevant backend tests, full backend suite where practical, frontend tests/build if UI changes, and any repository-specific CI checks.

## 9. Production rollout and acceptance

Deploy using the existing pipeline only after tests pass. Verify live API/UI, current totals, provenance, and scheduler configuration. Report before/after counts and sampled records with identifiers redacted as needed.

Acceptance criteria:
1. Official careers-page discovery coverage is measured and any implemented gap is demonstrated.
2. Freshness run is bounded, locked, and produces auditable outcomes.
3. UNKNOWN is not misclassified as unavailable.
4. Germany eligibility and job counts are consistent across API, UI, and sidebar.
5. No historical documents are deleted/merged/re-keyed.
6. No real application submissions or outbound emails occur.
7. Campaign remains `STAGE_0_DRY_RUN`, `is_enabled: false`; report quota/lease counts.
8. Production deployment is verified, with commit/image/GitOps identifiers and test results in `feature/045_completion_report.md`.

## 10. Stop conditions

Stop and report rather than proceeding if:
- A current deployment or database cannot be confidently identified.
- A proposed change risks overwriting application history or ambiguous duplicate records.
- Source access would require bypassing anti-bot controls.
- The job totals change unexpectedly outside the intended writes.
- Any campaign becomes enabled or any submission/send action is attempted.
