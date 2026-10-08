# Phase 031 — Production Hardening, Latest-First Ordering & Daily Autonomous Application Campaign

Status: NEXT IMPLEMENTATION
Branch policy: MAIN ONLY
Execution mode: One focused production mission

## Mission

Evolve the proven Phase 029/030 single-application flow into a safe daily Germany job-search campaign while fixing two confirmed UX/data-ordering requirements:

1. **Latest jobs must appear first.**
2. **Latest inbox messages must appear first.**

Phase 029/030 proved that one real autonomous Personio application can be safely submitted and positively verified. Phase 031 must harden the platform before increasing application volume.

Do NOT turn this into an unrestricted mass auto-apply system.

---

# 0. Git / Branch Policy

The canonical development branch is now `main`.

Before implementation:

- verify both repositories are on `main`
- pull/reconcile latest `origin/main`
- confirm Phase 029/030 commits are present on main
- do not create `feature/*` branches
- push future changes directly to `main`
- never force-push
- if branch protection prevents direct push, stop and report the exact blocker

Repositories:

- `job-search-api`
- `job-search`

Keep both repositories synchronized by phase intent.

---

# 1. CONFIRMED GAP — BUG-003 Latest Jobs First

## Current verified frontend behavior

The current `src/pages/Jobs.tsx` initializes:

```
sortField = 'salaryMin'
sortDirection = 'desc'
```

and the frontend sorting logic only explicitly sorts by salary or title.

Therefore the current Jobs page is **NOT guaranteed to show latest jobs first**.

Do not assume BUG-003 is complete merely because an older backlog item exists.

## Required behavior

All job/discovery lists must default to **newest-first**.

The authoritative ordering must use the most reliable available timestamp, with deterministic fallback.

Preferred ordering:

1. `discoveredAt`
2. `discovered_at`
3. `verifiedAt`
4. `postedDate` / `posted_date`
5. stable deterministic ID/provider ID fallback

Do not use salary as the default ordering.

## Backend

Inspect every relevant jobs/discovery endpoint and establish a consistent newest-first default.

Requirements:

- API default ordering is newest-first.
- MongoDB sorting should happen server-side where pagination is involved.
- Do not fetch a large unordered dataset and sort only in the frontend when server pagination exists.
- Mixed camelCase/snake_case timestamps must be handled deterministically.
- Null/missing timestamps must not jump ahead of valid recent jobs.
- Preserve explicit user-selected sorting when the UI requests another sort.
- Pagination must preserve global newest-first ordering.
- Discovery runs and job lists must not regress.

## Frontend

Update Jobs page:

- default sort = Latest
- default direction = descending
- display a clear `Latest` / `Newest` sort state
- do not silently default to salary
- frontend must preserve backend ordering unless the user explicitly selects another sort
- ensure pagination does not reorder records incorrectly

Add/update tests proving a mixed set such as:

- Job A discovered 2026-10-08
- Job B discovered 2026-10-07
- Job C discovered 2026-10-06

renders A → B → C.

Also test mixed timestamp fields and missing timestamps.

---

# 2. CONFIRMED GAP — BUG-005 Inbox Latest Mail First

## Current verified frontend behavior

The current `src/pages/Inbox.tsx` calls:

```
communicationsApi.getCommunications()
```

and directly assigns the returned array to state.

There is no frontend sort before rendering.

Therefore the current Inbox UI is **NOT guaranteed to show the latest mail first**.

## Required behavior

Newest received email must appear at the top.

Use the actual received timestamp where available.

Preferred timestamp precedence:

1. `receivedAt`
2. Gmail message internal/received timestamp if represented by the API
3. `date`
4. deterministic message ID fallback

Do not sort using display-formatted date strings.

## Backend

Inspect communications/Gmail API ordering.

Requirements:

- API returns newest-first by default.
- Use actual received timestamp.
- Gmail incremental sync must preserve ordering.
- Pagination must preserve global newest-first order.
- Do not modify Gmail read-only safety boundary.
- Do not send email.

## Frontend

Update Inbox:

- newest email at top by default
- preserve newest-first after folder filtering
- preserve ordering after refresh/sync
- pagination/infinite loading must preserve ordering
- do not reverse the backend order accidentally

Add regression tests with different received timestamps.

Example:

- Email A: Oct 8 12:00
- Email B: Oct 8 10:00
- Email C: Oct 7 18:00

UI must render A → B → C.

---

# 3. Frontend Phase 029/030 Hardening

The Phase 029/030 readiness UI is implemented, but remove misleading fallback values.

Inspect `ApplicationReadinessCard`.

Do NOT display fabricated-looking defaults such as:

```
fitScore ?? 83
applicationType ?? 'Greenhouse'
```

Required behavior:

- loading → Loading
- unavailable → Not verified / Unavailable
- backend value → real value
- never invent an ATS provider
- never invent a Fit Score

Likewise, Apply Kit readiness must be driven by real backend state where available, not a static unconditional `CV & Cover Letter READY` badge.

Maintain the successful Phase 029/030 confirmation invariant:

> Never display Applied as verified unless the backend has a positive employer ATS confirmation.

---

# 4. Daily Autonomous Application Campaign

Now that one real application has succeeded, introduce controlled daily automation.

## Campaign safety limits

Implement configurable deterministic limits, for example:

- daily auto-apply maximum
- minimum Fit Score
- minimum Application Readiness score
- maximum applications per company per day
- maximum applications per ATS/provider per day
- optional cooldown between applications
- global campaign enable/disable
- emergency stop

Do not hardcode unsafe unlimited behavior.

Defaults should be conservative.

## Policy

Each job must independently pass:

```
Fresh
→ Qualified
→ Fit Score threshold
→ Requirements Matrix
→ Duplicate Check
→ Application Readiness
→ Policy Decision
→ Apply Kit
→ ATS Preflight
→ Execute
→ Positive Confirmation
```

Any failure means that job is skipped/manual/blocked according to policy.

One failed job must not automatically cause a blind retry or unsafe substitution.

---

# 5. Campaign Dashboard / Frontend

Add a clear Campaign/Automation control surface.

Show:

- Campaign status: Enabled / Disabled / Paused / Emergency Stop
- today's application limit
- applications submitted today
- remaining daily capacity
- minimum Fit Score
- readiness threshold
- company limit
- ATS/provider limit
- current run
- queued candidates
- submitted
- skipped
- blocked
- manual-review required
- outcome unknown
- CAPTCHA/MFA blocks
- stale jobs skipped

Provide a safe user-facing control to pause/disable the campaign.

Do not provide a control that bypasses safety gates.

## Daily campaign history

Show:

- campaign run ID
- start/end time
- candidates evaluated
- candidates eligible
- applications submitted
- successful confirmations
- blocked
- skipped
- failures
- unknown outcomes

---

# 6. Application Monitoring

Improve the application lifecycle UI to clearly distinguish:

- Ready
- Submitting
- Submitted
- Submission Failed
- Submission Requires Human Action
- Submission Unverified
- Rejected
- Interview
- Offer

Never collapse unknown submission outcomes into failure or success.

For `OUTCOME_UNKNOWN`:

- show prominent warning
- block automatic retry
- require human inspection/reconciliation

---

# 7. Post-Application / Response Monitoring

Prepare the frontend/backend for application outcome tracking:

- Submitted
- Employer response received
- Rejected
- Interview
- Offer
- Follow-up due

Use the existing read-only Gmail boundary.

For rejection intelligence:

- GENERIC_COMPETITIVE_REJECTION
- SPECIFIC_REQUIREMENT_REJECTION
- UNKNOWN_REJECTION_REASON

Never invent a rejection reason.

Add analytics:

- application-to-rejection time
- rejection rate
- interview rate
- offer rate
- fit-score band vs outcome
- ATS/source vs outcome
- language requirement vs outcome

Do not automatically change Fit Score weights from a small sample.

---

# 8. Job List UX

Improve Jobs page to expose useful ordering/filter state:

- Latest
- Fit %
- Salary
- Seniority
- Location

Default must remain **Latest**.

Show freshness/verification where available.

Stale jobs must not appear as active recommendations.

Preserve:

- Fit %
- Readiness
- Policy
- source
- ATS
- salary
- German requirement

---

# 9. Inbox UX

Inbox must remain read-only with respect to Gmail sending.

Improve:

- Latest-first default
- received timestamp
- unread state
- linked application
- rejection/interview classification
- newest response visible immediately
- refresh without losing ordering

Do not introduce automatic outbound email.

---

# 10. Backend Tests

Mandatory regression coverage:

### Jobs
- newest-first default
- mixed camelCase/snake_case timestamps
- missing timestamp fallback
- pagination ordering
- explicit alternative sort still works

### Inbox
- newest-first default
- receivedAt precedence
- fallback to date
- pagination/incremental sync ordering
- folder filtering preserves newest-first

### Phase 029/030
- duplicate identity
- AUTO_APPLY_READY
- AUTO_APPLY policy
- positive confirmation
- CAPTCHA stop
- MFA/auth stop
- outcome unknown
- no automatic retry
- historical application immutability

### Campaign
- daily limit
- company limit
- ATS limit
- Fit threshold
- readiness threshold
- emergency stop
- one candidate cannot bypass another candidate's safety checks
- no broad submission when campaign is disabled

Run the **full backend test suite**, not only new tests.

---

# 11. Frontend Tests

Mandatory:

- Jobs latest-first rendering
- Jobs pagination ordering
- Inbox latest-first rendering
- Inbox folder filtering
- readiness card no fabricated Fit Score
- readiness card no fabricated ATS provider
- Apply Kit real readiness state
- campaign enabled/disabled
- daily capacity display
- emergency stop
- blocked/manual/unknown states
- application confirmation invariant

Run the **full Vitest suite**.

Run production build.

---

# 12. Production Validation

After tests:

1. Deploy backend.
2. Deploy frontend.
3. Verify production health.
4. Verify Jobs API newest-first.
5. Verify production Jobs UI newest-first.
6. Verify Inbox API newest-first.
7. Verify production Inbox UI newest-first.
8. Verify Phase 029/030 historical application integrity.
9. Verify Wandelbots application remains Applied/Submitted with positive confirmation.
10. Verify 1KOMMA5° historical application remains unchanged.
11. Verify campaign is disabled by default after deployment unless explicitly enabled.
12. Do NOT automatically launch a multi-application campaign during this phase unless all safety controls are production-verified and the user explicitly authorizes activation.

---

# 13. No New Real Application Requirement

Phase 031 does NOT need to submit another real application merely to prove the UI.

The real-world auto-apply proof already exists:

- 1KOMMA5° historical Personio application
- Wandelbots Personio application
- SumUp CAPTCHA hard stop

Focus Phase 031 on production hardening and campaign controls.

If a real application is considered necessary, stop and ask for explicit authorization before submitting another consequential employment application.

---

# 14. Gemini / AI Cost Discipline

The user currently has approximately 11% weekly Gemini quota remaining.

During implementation:

- favor deterministic code
- reuse existing evidence
- avoid repeated large AI analyses
- do not regenerate already-valid application materials
- do not run unnecessary broad research
- use tests and local logic wherever possible
- keep the phase tightly scoped

If quota becomes a meaningful blocker, stop cleanly and report it.

---

# 15. Required Final Report

Report:

1. backend commit
2. frontend commit
3. both pushed directly to main
4. full backend test result
5. full frontend test result
6. production build result
7. production deployment result
8. Jobs newest-first verification
9. Inbox newest-first verification
10. pagination verification
11. readiness fallback hardening
12. campaign controls implemented
13. campaign default state
14. historical application integrity
15. Wandelbots integrity
16. any blockers
17. exact remaining limitations

## Definition of Done

Phase 031 is complete only when:

- Jobs default to latest-first end-to-end.
- Inbox defaults to latest-first end-to-end.
- Pagination preserves ordering.
- Frontend does not fabricate Fit Score/ATS/readiness values.
- Campaign controls exist with conservative deterministic limits.
- Campaign is disabled by default after deployment.
- Emergency stop exists.
- Application outcome states are correctly represented.
- Full backend tests pass.
- Full frontend tests pass.
- Production builds pass.
- Production deployment is verified.
- Historical applications remain unchanged.
- No unsafe real application campaign is launched automatically.
- All changes are committed and pushed directly to `main`.

Do not start Phase 032 until the Phase 031 final report is reviewed.
