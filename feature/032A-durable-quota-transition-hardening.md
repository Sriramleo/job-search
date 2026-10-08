# Phase 032A — Durable Campaign Quota Transition & Stage-1 Activation Hardening

Status: NEXT IMPLEMENTATION
Branch: main ONLY
Scope: Focused safety hotfix + production validation
Do NOT start Phase 033.

## Mission

Phase 032 Stage 0 production validation exposed a quota-transition edge case:

- Stage 0 created today's durable quota with the default campaign cap of 5.
- Stage 1 is designed to enforce exactly 1 application/day.
- Arming Stage 1 changes CampaignConfig to daily_max_applications=1, but an already-created CampaignDailyQuota may retain daily_max_applications=5 and remaining_capacity=4.
- This creates a mismatch between the active campaign policy and durable quota state.

Fix this before Stage 1 is activated.

The goal is to make the daily quota authoritative, durable, atomic, concurrency-safe, and synchronized with the current campaign configuration.

This phase must NOT submit another real application.

---

# 1. Git Policy

Use `main` directly in both repositories:

- job-search-api
- job-search

Before implementation:
- pull/reconcile origin/main
- verify Phase 032 commits are present
- do not create feature branches
- commit directly to main
- push directly to origin/main
- never force-push

If branch protection prevents direct push, stop and report the exact blocker.

Prefer backend-only changes unless frontend changes are required for accurate quota/status presentation.

---

# 2. Reproduce the Discovered Issue First

Write a regression test reproducing this exact scenario:

1. Create today's quota under Stage 0/default cap 5.
2. Simulate one existing confirmed application today (Wandelbots).
3. Quota may show:
   - daily_max_applications=5
   - confirmed=1
   - remaining=4
4. Arm Stage 1.
5. Stage 1 must enforce:
   - daily_max_applications=1
   - confirmed=1
   - locked_slots=0
   - remaining_capacity=0
6. No submission may be allowed.

The test must fail against the old implementation and pass after the fix.

---

# 3. Fix Quota Synchronization

The durable quota must always respect the CURRENT campaign configuration.

When `get_or_create_daily_quota()` loads an existing quota:

- compare stored daily_max_applications with current CampaignConfig.daily_max_applications
- reconcile the quota atomically when they differ
- preserve:
  - applications_attempted
  - applications_submitted
  - applications_confirmed
  - failed_before_submission
  - outcome_unknown_count
  - locked_slots
  - companies_applied
  - ats_applied
- recalculate:
  `remaining_capacity = max(0, current_daily_limit - applications_confirmed - locked_slots)`
- persist the current daily limit

Do NOT reset today's counts.

Do NOT delete and recreate the quota document.

Do NOT lose existing application/lock accounting.

---

# 4. Stage-1 Arm Must Be Atomic With Quota Policy

Harden `arm_stage_1()`.

After Stage 1 is armed, the system must guarantee:

CampaignConfig:
- stage = STAGE_1_SINGLE_DAILY
- is_enabled = true
- emergency_stop = false
- daily_max_applications = 1
- max_per_company_daily = 1
- max_per_ats_daily = 1
- min_fit_score >= 85
- min_readiness_score >= 90

Today's durable quota must immediately be compatible with this policy.

If there is already one confirmed application today:
- remaining capacity = 0.

If there are zero confirmed/locked slots today:
- remaining capacity = 1.

Do not allow a transient state where Stage 1 is active but quota still permits the old cap.

Use an appropriate MongoDB transaction/atomic update mechanism if available in the existing database architecture. If transactions are not appropriate for the current deployment, implement the safest atomic conditional update available and document why.

---

# 5. Concurrency Safety

Test this explicitly.

Two simultaneous campaign invocations must NOT both acquire the final daily slot.

Scenario:

- Stage 1 daily limit = 1
- remaining capacity = 1
- two campaign workers start concurrently

Expected:

- one worker obtains the submission slot
- the other receives a deterministic quota/lease rejection
- total allowed slot consumption remains 1
- no negative remaining capacity
- no duplicate application
- no quota bypass

Do not rely solely on application-level read-then-write logic.

Use durable atomic slot reservation/locking.

---

# 6. Outcome Unknown Semantics

Preserve the Phase 032 invariant:

If submission may have occurred but positive confirmation is unavailable:

- mark OUTCOME_UNKNOWN / Submission Unverified
- increment locked_slots atomically
- consume/lock the daily slot
- remaining capacity becomes 0 for a 1-per-day campaign
- automatic retry is prohibited
- human reconciliation required

Do not release the slot merely because the browser/API worker failed.

---

# 7. Existing Application Accounting

Today's Wandelbots application must count correctly as an already-confirmed application.

After the fix, before any Stage 1 execution today:

Expected:

- confirmed applications today = 1
- daily limit = 1
- remaining = 0
- campaign must not submit another application today

This is a critical production safety check.

Do not modify the Wandelbots application record.

Do not modify the 1KOMMA5° historical application.

---

# 8. Daily Report Wording Fix

Phase 032's Stage 0 report currently showed:

- Applications Attempted: 1
- Applications Confirmed: 1

while zero submissions occurred during the dry-run.

Make the report distinguish historical/existing application accounting from campaign activity.

Use clear fields/labels such as:

- Existing confirmed applications today
- Campaign submissions attempted
- Campaign submissions positively confirmed
- Outcome unknown / locked slots
- Daily quota used
- Daily quota remaining

For the Stage 0 validation date where Wandelbots was already submitted:

Expected:

- Existing confirmed applications today = 1
- Campaign submissions attempted = 0
- Campaign submissions positively confirmed = 0
- Locked slots = 0
- Daily quota used = 1
- Daily quota remaining under Stage 1 = 0

Do not misrepresent an existing application as a Stage 0 dry-run submission.

---

# 9. Campaign Status API / Frontend

Ensure the frontend receives the reconciled authoritative values.

When Stage 1 is active today after one existing confirmed application, UI must show:

- Stage 1: 1-per-day
- Today's cap: 1
- Submitted/confirmed today: 1
- Remaining capacity: 0
- No available autonomous slot

Do not display stale "remaining 4" values.

If campaign is still Stage 0, clearly show Stage 0 disabled/dry-run.

Do not add an activation bypass.

---

# 10. Stage-1 Activation Safety

This phase may implement and validate the Stage-1 activation mechanism, but:

## DO NOT submit a real application during Phase 032A.

After the fix is deployed and verified, the campaign may remain:

- Stage 0 / disabled

unless the user explicitly activates Stage 1 separately.

For the current date, because Wandelbots is already confirmed today, even if Stage 1 is armed:

- remaining capacity MUST be 0
- zero new applications are permitted today.

The first possible autonomous application should be on the next eligible day with a fresh slot.

---

# 11. Tests — Backend

Run the full backend suite.

Add dedicated Phase 032A tests for:

1. Existing quota cap 5 → current config cap 1 reconciliation.
2. Existing confirmed application consumes the Stage-1 slot.
3. Existing OUTCOME_UNKNOWN locks the Stage-1 slot.
4. Existing counts are preserved during reconciliation.
5. Stage-1 arm updates today's quota safely.
6. Concurrent Stage-1 slot acquisition.
7. No negative remaining capacity.
8. No double reservation.
9. No quota bypass after API restart.
10. Stage-0 dry-run never creates a campaign submission.
11. Daily report distinguishes existing applications from campaign submissions.
12. Wandelbots integrity remains unchanged.
13. 1KOMMA5° integrity remains unchanged.

Run:

```
uv run pytest
```

Do not rely only on Phase 032A tests.

---

# 12. Tests — Frontend

Run the full Vitest suite.

Add/update tests for:

- Stage-1 cap = 1
- confirmed today = 1
- remaining = 0
- no stale remaining quota
- daily report labels
- Stage-0 dry-run labels
- emergency stop
- OUTCOME_UNKNOWN warning

Run:

```
npm test -- --run
npm run build
```

---

# 13. Production Validation

Deploy only after all tests pass.

Against production:

1. Verify MongoDB source of truth.
2. Read current campaign config.
3. Read today's durable quota.
4. Confirm Wandelbots application remains unchanged.
5. Confirm 1KOMMA5° remains unchanged.
6. Verify quota reconciliation.
7. Verify Stage-1 policy would produce remaining=0 today.
8. Run dry-run.
9. Confirm zero new applications.
10. Confirm application count unchanged.
11. Confirm daily report wording/accounting.
12. Confirm frontend displays authoritative quota.
13. Verify emergency stop still works.
14. Verify concurrent slot protection.

Production application count must remain exactly 17.

---

# 14. No Real Application

Hard invariant:

```
Phase 032A real submissions = 0
```

Do not click/submit any ATS application.

The existing Wandelbots submission is the real-world proof for the application execution layer.

---

# 15. Required Final Report

Report:

1. backend commit
2. frontend commit, if changed
3. both pushed directly to main
4. Phase 032A regression tests
5. full backend test result
6. full frontend test result
7. production build
8. quota reconciliation proof
9. Stage-1 arm proof
10. concurrency proof
11. OUTCOME_UNKNOWN proof
12. daily report accounting proof
13. production application count before/after
14. Wandelbots integrity
15. 1KOMMA5° integrity
16. confirmation that ZERO real submissions occurred
17. exact current Stage 0/Stage 1 status
18. any remaining blockers

# Definition of Done

Phase 032A is complete only when:

- Existing daily quota reconciles to current campaign limits.
- Stage 1 cannot inherit an obsolete daily cap.
- One-per-day limit is durable and atomic.
- Existing confirmed applications consume today's slot correctly.
- OUTCOME_UNKNOWN locks today's slot.
- Concurrent workers cannot consume the same slot.
- No negative or stale remaining capacity is exposed.
- Daily reports distinguish existing applications from campaign submissions.
- Frontend displays authoritative quota.
- Full backend tests pass.
- Full frontend tests pass.
- Production deployment is verified.
- Application count remains exactly 17.
- Wandelbots and 1KOMMA5° remain unchanged.
- ZERO real applications are submitted during Phase 032A.
- All changes are pushed directly to main.

Do not start Phase 033.
Do not increase campaign volume.
Do not submit a real application in this phase.
