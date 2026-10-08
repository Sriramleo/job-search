# Phase 028 — Controlled Real Auto-Apply Pilot

Status: NEXT IMPLEMENTATION — execute only after Phase 027A is fully production-validated.

Primary repos:
- Sriramleo/job-search — React frontend
- Sriramleo/job-search-api — FastAPI backend

Goal:
Prove the complete production auto-apply path with exactly ONE fresh, verified, duplicate-free application on ONE supported ATS. This phase is a controlled pilot, not a broad campaign.

---

## 0. Mandatory preconditions

Before changing or writing production application data:

1. Verify Phase 027A is complete.
2. Verify the production MongoDB cluster/database used by the backend is the intended source of truth.
3. Verify the historical successful 1KOMMA5° Personio application is present in that same production database.
4. Verify the historical 1KOMMA5° Personio posting is recognized as already applied using real-world identity, even if internal MongoDB IDs differ.
5. Verify no historical application records or audit records are modified.
6. Verify the current application count and the selected pilot job identity before execution.
7. Do not use the 1KOMMA5° Personio posting as the pilot.
8. Prefer the previously identified N26 Greenhouse Site Reliability Engineer - Data Platform posting only after fresh production verification proves it is still active and has no prior application.
9. If N26 is unavailable, stale, already applied, unsupported, ambiguous, or otherwise unsafe, STOP and report the blocker. Do not silently choose another job.
10. Do not run a broad Auto-Apply campaign.
11. Never bypass CAPTCHA, MFA, authentication, anti-bot controls, rate limits, or employer restrictions.
12. Never fabricate candidate information.
13. Never send LinkedIn messages or outbound Gmail.
14. Preserve immutable candidate evidence and historical applications.

If any mandatory precondition fails, implement/test safely but DO NOT perform the real submission.

---

# 1. Pilot objective

Prove this exact path:

Qualified Job
→ Fit Score
→ Application Readiness
→ Policy Decision
→ Duplicate Identity Check
→ Freshness Verification
→ Apply Kit Validation
→ Supported ATS
→ Playwright Execution
→ SUBMISSION_INITIATED persisted BEFORE click
→ Submit
→ CONFIRMATION_VERIFICATION
→ Positive ATS confirmation
→ Submitted/Applied

The pilot must prove that the system can distinguish:

- execution accepted
- submission started
- submission succeeded
- submission failed
- outcome unknown
- human action required

HTTP 200 from an execution-start endpoint must NEVER mean "application submitted".

---

# 2. Pilot job selection

Use a deterministic selection procedure.

Preferred pilot:

N26 — Site Reliability Engineer - Data Platform — Greenhouse.

Before execution, freshly verify:

- company is N26
- exact role is Site Reliability Engineer - Data Platform
- official job URL is active
- official application URL is active
- Greenhouse is the real ATS
- provider job ID is present where available
- application form is reachable
- no previous application exists
- no equivalent historical application exists under another internal job ID
- required CV upload is available
- required candidate fields are known
- no authentication/login requirement
- no CAPTCHA
- no MFA
- no unsupported sensitive/legal question
- application can be completed using verified candidate data
- job freshness state is VERIFIED

If any check fails, do not submit.

Do not pick a different job merely to make the pilot pass.

---

# 3. Real-world duplicate identity

Before creating or submitting the pilot application, calculate a canonical real-world identity using:

1. ATS/provider job ID
2. canonical application URL
3. canonical job URL
4. company + normalized role + provider/ATS
5. source appearances

Check against ALL existing applications, including historical records.

The historical 1KOMMA5° Personio application must be a regression test proving that different internal MongoDB IDs cannot bypass duplicate protection.

Also test:
- same provider ID, different internal job ID
- same canonical application URL, different internal job ID
- same canonical job URL from different sources
- XING/BA/company-careers observations resolving to one canonical posting

---

# 4. Fit Score gate

The pilot must use the implemented Fit Score, not the old Strong/Moderate label.

Show:

- overall FIT %
- component scores
- requirements matrix
- strongest matches
- gaps
- NOT_VERIFIED evidence
- concise "why this fits"
- concise "why not apply"

The score must remain explainable and evidence-grounded.

Do not use German language or any other missing evidence as proof that the candidate possesses or lacks a capability.

For explicit job requirements such as German C1:
- if no verified candidate evidence exists, represent it as GAP or NOT_VERIFIED
- apply the configured scoring penalty
- do not fabricate a German level

Missing salary must be represented as "Not specified"/"Not disclosed", never €0K–€0K unless the source explicitly states zero.

---

# 5. Application Readiness gate

The pilot must produce:

AUTO_APPLY_READY

only if ALL required conditions pass:

- qualification passed
- configured fit threshold passed
- freshness VERIFIED
- official job URL VERIFIED
- application URL VERIFIED
- supported ATS
- active job
- duplicate check passed
- candidate profile complete
- required documents available
- required fields known
- grounded Apply Kit available
- no authentication
- no CAPTCHA
- no MFA
- no unsupported sensitive question
- execution environment healthy
- no previous OUTCOME_UNKNOWN for the real-world posting
- explicit AUTO_APPLY_SUPPORTED policy enabled for this controlled pilot

Any hard blocker must prevent submission.

---

# 6. Policy decision

Create/reuse one auditable policy decision service.

Return:

- decision
- fitScore
- readinessState
- blockers
- warnings
- evidence references
- policy mode
- evaluatedAt
- realWorldJobIdentity

For the selected pilot the decision must be:

AUTO_APPLY

Only if all gates pass.

Otherwise:

- HUMAN_APPROVAL_REQUIRED
- MANUAL_REQUIRED
- BLOCKED
- ALREADY_APPLIED

Do not allow an LLM to override deterministic safety rules.

---

# 7. Apply Kit validation

Before browser execution verify:

1. correct CV variant
2. correct company
3. correct role
4. humanized cover letter
5. no placeholders
6. no "Target Company"
7. no TODO/Lorem ipsum
8. no copied job-description paragraphs
9. no unsupported candidate claims
10. application answers are grounded in verified candidate evidence

For questions that cannot be answered truthfully from stored candidate data, stop and route to HUMAN_APPROVAL_REQUIRED rather than inventing an answer.

---

# 8. Playwright execution

Use the existing Playwright/browser automation architecture.

Do not create a second automation framework.

Execution requirements:

1. create automationRunId
2. create execution lease/heartbeat
3. persist STARTED
4. persist BROWSER_STARTED
5. persist ATS_NAVIGATION_STARTED
6. verify ATS reached
7. persist ATS_REACHED
8. fill form
9. persist FORM_FILLED
10. persist SUBMISSION_INITIATED BEFORE the actual submit click
11. perform submit click
12. persist CONFIRMATION_VERIFICATION
13. inspect positive employer confirmation
14. only positive confirmation may transition to Submitted/Applied
15. persist SUBMITTED
16. persist SUBMISSION_VERIFIED
17. release execution lease

Use the existing audit schema and lifecycle where possible.

Do not duplicate existing execution infrastructure.

---

# 9. Confirmation verification

A successful pilot requires genuine ATS confirmation.

Do NOT infer success from:

- HTTP 200 alone
- navigation completing
- button disappearing
- form disappearing
- no browser exception
- network request existing
- local application state

Require positive confirmation from the employer ATS, such as a genuine thank-you/confirmation state.

Persist the confirmation evidence in the existing audit/provenance model.

If confirmation cannot be proven:

automationState = Submission Unverified
stage must NOT become Applied/Submitted

If the browser crashes or network fails after SUBMISSION_INITIATED:

automationState = Submission Unverified / OUTCOME_UNKNOWN

Do not automatically retry.

---

# 10. CAPTCHA / MFA / authentication

If any of these appears:

- stop execution
- persist the appropriate audit event
- classify MANUAL_REQUIRED / Submission Requires Human Action
- do not bypass
- do not retry automatically
- do not mark Applied

---

# 11. Retry rules

SAFE_TO_RETRY is allowed only when evidence proves the external ATS could not have received a submission.

Examples:
- browser failed before ATS navigation
- navigation failed before form interaction
- deterministic pre-submit validation failure

DO_NOT_AUTO_RETRY:
- CAPTCHA
- MFA
- authentication
- unsupported ATS
- submission initiated
- submit click occurred
- network timeout after submit
- browser crash after submit
- OUTCOME_UNKNOWN

The real-world posting must remain protected from duplicate retry.

---

# 12. Frontend

Update the Application Workspace and job detail UI to show:

FIT 91%
AUTO-APPLY READY

Application readiness:
- Freshness: VERIFIED
- ATS: Greenhouse
- Application URL: VERIFIED
- Duplicate: CLEAR
- CV: READY
- Cover Letter: READY
- Required Answers: READY

Before execution show the complete policy decision.

During execution show:

- run ID
- browser state
- current execution phase
- last heartbeat
- audit timeline

After execution show exactly one terminal state:

- Submitted
- Submission Failed
- Submission Requires Human Action
- Submission Unverified

Never display "Submitted" merely because the start endpoint returned HTTP 200.

---

# 13. Dashboard / telemetry

Add or verify metrics for:

- auto-apply-ready count
- auto-apply attempted
- auto-apply submitted
- submission failed
- submission unverified
- human action required
- duplicate blocked
- stale blocked
- unsupported ATS blocked

Do not count an execution attempt as a successful application.

---

# 14. Mandatory tests

Backend tests:

- one real-world duplicate identity across different internal job IDs
- historical 1KOMMA5° duplicate blocked
- N26 pilot identity resolution
- freshness gate
- fit threshold gate
- readiness hard blockers
- missing salary
- German C1 requirement as GAP/NOT_VERIFIED
- Apply Kit grounding
- CAPTCHA block
- MFA block
- authentication block
- unsupported ATS block
- OUTCOME_UNKNOWN
- SAFE_TO_RETRY
- no automatic retry after submission initiation
- SUBMISSION_INITIATED persisted before submit click
- positive confirmation required
- failed confirmation cannot become Submitted
- audit sequence
- execution lease/heartbeat
- old application compatibility

Frontend tests:

- Fit %
- readiness state
- blockers
- policy decision
- execution polling
- accepted-vs-submitted state
- submission-unverified state
- human-action state
- duplicate warning
- audit timeline

Run:

- full backend pytest
- full frontend Vitest
- TypeScript/type checks
- production frontend build
- configured lint checks

---

# 15. Production validation BEFORE real submission

First deploy the code with the pilot submission disabled.

Verify:

1. backend health
2. frontend health
3. MongoDB connectivity
4. correct database identity
5. historical Personio application intact
6. historical audit records intact
7. duplicate identity blocks 1KOMMA5°
8. N26 job identity resolves correctly
9. N26 freshness is VERIFIED
10. N26 readiness is calculated correctly
11. Fit Score and requirements matrix are present
12. Apply Kit is grounded
13. auto-apply policy decision is correct
14. no unintended application records were created

Only after all of these pass should the controlled real submission be enabled.

---

# 16. Controlled production submission

This phase authorizes ONE controlled real application submission only.

Before clicking the final submit button, output/log:

- company
- role
- canonical job URL
- canonical application URL
- ATS
- provider job ID
- Fit %
- readiness
- policy decision
- duplicate result
- freshness result
- CV
- cover letter
- required answers
- automationRunId

Then execute exactly ONE submission.

After submission:

1. verify genuine ATS confirmation
2. persist confirmation evidence
3. mark Submitted/Applied only after positive confirmation
4. create the normal follow-up task
5. stop the pilot
6. do not process another application automatically

If any ambiguity occurs, stop and preserve OUTCOME_UNKNOWN rather than retrying.

---

# 17. Production integrity checks after pilot

Verify:

- application count increased by exactly one ONLY if submission was genuinely confirmed
- selected job has exactly one new application
- no other job received an application
- no historical application changed
- 1KOMMA5° remains blocked as duplicate
- audit trail is complete
- automationRunId is linked correctly
- confirmation evidence is stored
- frontend reflects terminal state
- no duplicate submission occurred

If the ATS confirms submission but the backend failed to persist the final state, reconcile from audit/confirmation evidence rather than submitting again.

---

# 18. Documentation

Update the relevant docs with:

- controlled auto-apply pilot
- supported ATS
- policy decision
- readiness requirements
- duplicate identity
- freshness verification
- submission audit sequence
- confirmation verification
- OUTCOME_UNKNOWN
- retry rules
- CAPTCHA/MFA behavior
- operational rollback/stop procedure

Do not claim multi-ATS auto-apply is production-ready after this phase.

This phase proves ONE supported ATS only.

---

# 19. Git workflow

Use a focused branch:

feature/phase-028-controlled-auto-apply-pilot

Suggested commits:

1. feat: add controlled auto-apply pilot policy
2. test: harden single-submission safety gates
3. feat: integrate pilot execution state and UI
4. test: add production auto-apply regression coverage
5. docs: document controlled auto-apply pilot

Push the branch and use the repository's normal PR workflow.

Never force-push or rewrite history.

---

# 20. Definition of Done

Phase 028 is complete only when:

- Phase 027A database reconciliation is verified.
- Historical Personio application remains untouched.
- Historical Personio identity is duplicate-protected.
- Exactly one fresh pilot job is selected.
- Pilot job is freshly verified.
- Fit Score is explainable.
- Requirements matrix is grounded.
- Application Readiness is deterministic.
- Policy Decision is auditable.
- Apply Kit is grounded.
- ATS is supported.
- No CAPTCHA/MFA/authentication barrier exists.
- Duplicate check passes.
- Freshness check passes.
- SUBMISSION_INITIATED is persisted before submit.
- Positive ATS confirmation is required.
- OUTCOME_UNKNOWN blocks retry.
- Exactly one real pilot submission is executed.
- Successful submission is recorded only after genuine confirmation.
- If confirmation fails, the system does not claim success.
- No second application is attempted.
- Historical applications are unchanged.
- Backend tests pass.
- Frontend tests pass.
- Production build passes.
- Production health checks pass.
- Audit trail is complete.
- Documentation matches actual behavior.

---

## Final principle

This is a proof-of-capability phase, not a mass application phase.

Prove:

ONE JOB
→ ONE ATS
→ ONE SUBMISSION
→ ONE VERIFIED CONFIRMATION

Only after this succeeds should Phase 029 generalize the execution layer to additional supported ATS providers.

Never trade duplicate protection, candidate truthfulness, submission verification, or safe failure handling for automation speed.
