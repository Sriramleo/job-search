# Feature 001 — Fit Score, Application Readiness & Policy-Driven Auto-Apply

Status: BACKLOG — DO NOT IMPLEMENT YET.
Execute only after the Gemini/Antigravity weekly quota resets AND production MongoDB database identity/reconciliation is complete.

Primary repos:
- Sriramleo/job-search — React frontend
- Sriramleo/job-search-api — FastAPI backend

This document is the exact implementation prompt for the future Antigravity coding session.

---

# EXACT IMPLEMENTATION PROMPT

You are implementing the next major feature set for the Germany Job Search Dashboard.

First read the existing codebase, architecture docs, execution-state docs, tests, and current production-safe behavior. Extend the existing architecture. Do not rewrite working subsystems.

## 0. Mandatory preconditions

Before implementation:

1. Verify production MongoDB points to the intended database.
2. Verify the backup/reconciliation work is complete.
3. Verify the historical successful Personio application is visible in the same production database.
4. Reconcile the real-world identity of the 1KOMMA5° Personio posting using:
   - exact ATS URL
   - provider job ID
   - company
   - role
   - ATS
   - historical application/confirmation
5. If it was already submitted, mark it as already applied/duplicate and NEVER submit it again.
6. Do not run a broad Auto-Apply campaign during implementation.
7. Never bypass CAPTCHA, MFA, authentication, anti-bot controls, or employer restrictions.
8. Never send LinkedIn messages or outbound Gmail.
9. Never modify immutable candidate engineering evidence.
10. Preserve historical applications and audit records exactly.

If MongoDB identity or historical application reconciliation is incomplete, stop at a documented blocker and do not perform production writes.

---

# 1. Product goal

Separate four concepts:

### Qualification
Existing deterministic safety/relevance gate. Keep it deterministic. Do not replace it with an AI percentage.

### Fit Score
A transparent 0–100 candidate-to-job match score based only on verified candidate evidence and job requirements.

### Application Readiness
A deterministic assessment of whether the system can safely apply to this exact posting right now.

### Policy Decision
The final decision about whether an application may actually be submitted.

A job may therefore be:

FIT 94% + MANUAL REQUIRED
FIT 82% + AUTO-APPLY READY
FIT 91% + BLOCKED
FIT 76% + HUMAN APPROVAL REQUIRED

Never collapse these concepts into one score.

---

# 2. Fit Score 0–100

Implement a centralized, configurable, explainable scoring model.

Initial weights:

- Role/responsibility alignment: 25%
- Technical skills/platform match: 25%
- Seniority/experience: 15%
- Cloud/infrastructure: 10%
- Location/work model: 10%
- Salary alignment: 5%
- Language/explicit eligibility: 5%
- Other important requirements: 5%

The weights must be configurable in one place.

The score must be calculated from structured match components. Do not create an opaque score from an LLM response.

Every component must contain:
- score
- weight
- normalized contribution
- matched requirements
- partial matches
- gaps
- candidate evidence references
- job requirement references
- concise explanation

Example:
FIT 91%
- Role alignment 94
- Technical skills 96
- Seniority 100
- Cloud/platform 95
- Location/work model 100
- Salary 86
- Language 70
- Other requirements 82

The UI must clearly say this is a match estimate, not a hiring/interview guarantee.

---

# 3. Explainable match breakdown

Expose:

Strong matches:
- Kubernetes
- AWS/EKS
- Terraform
- ArgoCD
- CI/CD
- Observability
- Production infrastructure
- Senior DevOps experience

Partial matches:
- Technologies where evidence is transferable but not directly proven.

Gaps:
- Missing verified language evidence
- Missing required certification
- Missing explicit experience

Use NOT VERIFIED where absence of evidence is not proof of absence.

Never invent experience, certifications, technologies, achievements, salary, language ability, or employment history.

---

# 4. Requirements Match Matrix

Add a first-class match representation:

Job Requirement | Candidate Evidence | Match | Confidence

Example:
Kubernetes | EKS production experience | STRONG | HIGH
AWS | AWS production infrastructure | STRONG | HIGH
Terraform | Terraform infrastructure work | STRONG | HIGH
German B1 | No verified evidence | GAP | HIGH
Azure | No verified production evidence | NOT_VERIFIED | HIGH

Supported states:
- STRONG
- PARTIAL
- GAP
- NOT_VERIFIED
- NOT_APPLICABLE

Do not expose chain-of-thought. Store concise evidence references and user-facing explanations only.

---

# 5. Why this job fits / Why not apply

Add:

WHY AM I A FIT?
Show the 3–7 strongest grounded reasons.

WHY NOT APPLY?
Show concrete blockers or risks:
- stale job
- unsupported ATS
- authentication required
- CAPTCHA required
- MFA required
- missing mandatory information
- salary below target
- major skill gap
- location conflict
- duplicate application
- application URL unavailable
- job no longer active

All reasons must be deterministic and traceable.

---

# 6. Application Readiness

Create separate readiness states:

- AUTO_APPLY_READY
- HUMAN_APPROVAL_REQUIRED
- MANUAL_REQUIRED
- BLOCKED
- ALREADY_APPLIED
- UNKNOWN

Evaluate:
1. Freshness verified
2. Official job URL verified
3. Application URL verified
4. ATS detected
5. ATS supported
6. Job active
7. Candidate profile complete
8. Required documents available
9. Required fields known
10. No authentication barrier
11. No CAPTCHA
12. No MFA
13. Duplicate check passed
14. Policy permits automatic submission
15. Browser execution environment healthy

Expose reasons, not just the state.

Optional readiness percentage is allowed, but it must never override a hard blocker.

Hard blockers always win:
- CAPTCHA
- MFA
- Authentication
- Unsupported ATS
- Stale/unavailable job
- Duplicate
- OUTCOME_UNKNOWN

---

# 7. Policy-driven Auto-Apply

Support policy modes:

- HUMAN_APPROVAL_ONLY
- AUTO_APPLY_SUPPORTED
- MANUAL_ONLY

Default must remain safe until explicitly configured.

Auto-Apply is allowed only when ALL are true:
1. Qualification passed.
2. Fit score meets configured minimum.
3. Readiness is AUTO_APPLY_READY.
4. Freshness is verified.
5. Official application URL is verified.
6. ATS is supported.
7. Candidate data is complete.
8. Required CV/document exists.
9. Cover letter/answers pass grounding validation.
10. Duplicate protection passes.
11. No CAPTCHA.
12. No MFA.
13. No authentication/login requirement.
14. No unsupported sensitive question.
15. Policy explicitly permits auto-submit.
16. Execution lease/heartbeat is healthy.
17. No previous OUTCOME_UNKNOWN exists for the same real-world posting.

If any condition fails, do not submit.

Create one auditable decision service returning:
- decision
- fitScore
- readinessState
- blockers
- warnings
- evidence
- policy
- evaluatedAt

Possible decisions:
- AUTO_APPLY
- HUMAN_APPROVAL_REQUIRED
- MANUAL_REQUIRED
- BLOCKED
- ALREADY_APPLIED

---

# 8. Real-world duplicate identity

Strengthen duplicate protection beyond internal MongoDB job IDs.

Canonical identity priority:
1. ATS/provider job ID
2. canonical application URL
3. canonical job URL
4. company + normalized role + provider
5. source appearances

The same posting may appear on company careers, XING, BA, Jobware, etc. Merge/recognize it as one opportunity.

A previous successful submission must block another submission even if the internal jobId differs.

Add regression tests for the historical 1KOMMA5°/Personio duplicate identity scenario.

---

# 9. Freshness verification

Preserve semantic freshness verification.

HTTP 200 is NOT proof a job exists.

For SPA ATS systems such as Ashby:
- inspect semantic application data
- verify company
- verify posting
- verify active state
- reject null/empty posting payloads
- distinguish HTTP success from actual job availability

States:
- VERIFIED
- JOB_UNAVAILABLE
- RESTRICTED
- FAILED
- UNKNOWN

Only VERIFIED jobs may become AUTO_APPLY_READY.

---

# 10. AI Apply Kit

For eligible jobs generate:
1. Tailored CV variant
2. Humanized cover letter
3. Application email draft
4. Application question suggestions
5. Interview talking points

Cover letter requirements:
- actual company
- actual role
- 1–3 real job aspects
- genuine candidate experience
- concise and natural
- natural variation
- no generic AI filler
- no copied job-description text
- no exaggerated claims
- no placeholders
- no Target Company
- no TODO/Lorem ipsum

Run a grounding/quality gate before application-ready state.

---

# 11. Application Question Assistant

For application questions:
- detect question type
- propose grounded answer
- identify supporting candidate evidence
- mark unknown answers
- allow editing
- never invent facts

Sensitive/high-risk questions must require human input when existing safety policy requires it.

Examples:
- work authorization
- sponsorship
- salary expectation
- notice period
- relocation
- German language level
- demographic questions
- legal declarations

Use verified candidate profile data where available.

---

# 12. Salary intelligence

Show:
- job salary range
- candidate target/range
- normalized currency
- alignment score
- salary confidence
- missing salary state

Never infer salary when absent.

---

# 13. Source intelligence

For every job show:
- source
- source URL
- official job URL
- application URL
- ATS
- provider job ID
- first discovered
- last verified
- freshness
- source appearances

Prefer official ATS/application routes.

Show when the same real posting was found on multiple sources.

---

# 14. Application tracker

Support existing lifecycle plus:
- Discovered
- Qualified
- Fit Scored
- Research Ready
- Apply Kit Ready
- Auto-Apply Ready
- Awaiting Human Approval
- Submitting
- Submitted
- Submission Unverified
- Submission Requires Human Action
- Rejected
- Interview
- Offer
- Withdrawn

Preserve compatibility with existing records.

Never silently change historical Submitted/Applied records.

---

# 15. Automation safety

Preserve existing application automation hardening.

Before external submit click:
persist SUBMISSION_INITIATED.

After click:
persist CONFIRMATION_VERIFICATION.

Only a positive employer confirmation may transition to SUBMITTED/APPLIED.

If the process fails after submission initiation:
OUTCOME_UNKNOWN.
Do not automatically retry.

If CAPTCHA/MFA/authentication appears:
MANUAL_REQUIRED.
Never bypass.

A pre-submit browser failure may be SAFE_TO_RETRY only when evidence proves no external submission could have occurred.

Keep executionRunId, audit events, structured logs, and execution lease/heartbeat.

---

# 16. Frontend UI

Update job cards to show:

Senior Platform Engineer
Deutsche Bank
Frankfurt / Hybrid

FIT 91%

AUTO-APPLY READY

Technical 94%
Experience 96%
Seniority 100%
Salary 88%
Location 100%

✓ Kubernetes
✓ AWS
✓ Terraform
✓ ArgoCD

Gaps:
- Azure preferred
- German B1 preferred

Source: Company Careers
ATS: Greenhouse
Verified: 2h ago

Actions:
[View Job] [View Match] [Generate Apply Kit] [Auto Apply]

Add a detailed match view containing:
- fit score
- score breakdown
- requirements matrix
- strong matches
- partial matches
- gaps
- why this fits
- why not apply
- application readiness
- blockers
- source/freshness
- application route
- duplicate status

Keep the existing calm technical UI style and responsive behavior.

---

# 17. Dashboard

Add:
- jobs discovered today
- qualified jobs
- average fit score
- jobs >=85% fit
- auto-apply ready
- human approval required
- manual required
- blocked
- already applied
- applications submitted
- submission-unverified

Add filters for:
- fit score
- readiness
- ATS
- source
- location
- remote/hybrid
- salary
- seniority
- company
- freshness

---

# 18. Daily campaign architecture

The existing daily workflow should conceptually become:

discover
→ normalize
→ dedupe
→ enrich
→ qualify
→ calculate fit
→ verify freshness
→ research
→ generate apply kit
→ evaluate readiness
→ auto-apply where policy permits
→ route exceptions to human action queue
→ track outcome

Do not add more job sources unless a concrete gap is demonstrated.

Do not make Gemini responsible for deterministic qualification or safety gates.

---

# 19. AI boundaries

Deterministic code owns:
- qualification
- scoring arithmetic
- duplicate identity
- freshness state
- readiness hard blockers
- safety policy

Gemini/LLM may assist with:
- grounded explanations
- research
- cover-letter drafting
- application-question suggestions

Candidate evidence remains authoritative.

Never use an LLM response as proof that the candidate possesses a skill.

Use the configured production Vertex AI/Gemini model. Do not hardcode a new model unless the existing configuration requires it.

---

# 20. Backend implementation

In Sriramleo/job-search-api:

1. Inspect existing schemas/repositories/services first.
2. Add minimal compatible models for:
   - fit score
   - match breakdown
   - requirements matrix
   - application readiness
   - auto-apply policy/decision
3. Add repositories/indexes only where justified.
4. Add service-layer scoring and policy evaluation.
5. Add/extend APIs following existing routing conventions.
6. Preserve camelCase API contracts.
7. Preserve backward compatibility.
8. Add safe defaults/migration behavior for old records.
9. Add immutable audit events for decisions and auto-apply execution.
10. Add observability without secrets.

Do not create duplicate endpoints if an existing endpoint can safely be extended.

---

# 21. Frontend implementation

In Sriramleo/job-search:

1. Extend typed API contracts.
2. Add fit/readiness to job cards.
3. Add match breakdown.
4. Add requirements matrix.
5. Add readiness/blockers.
6. Add source/freshness.
7. Add execution-state polling.
8. Treat HTTP 200 from an auto-apply start endpoint as execution accepted, NOT successful submission.
9. Poll terminal state.
10. Clearly render:
   - Submitted
   - Submission Failed
   - Submission Requires Human Action
   - Submission Unverified
11. Preserve existing safety messaging.

---

# 22. Mandatory tests

Backend:
- fit score calculation
- weight normalization
- match states
- evidence grounding
- requirements matrix
- salary alignment
- location alignment
- seniority alignment
- missing salary
- missing language evidence
- readiness blockers
- stale job blocking
- unsupported ATS blocking
- CAPTCHA blocking
- MFA blocking
- authentication blocking
- duplicate provider ID
- duplicate canonical URL
- cross-source duplicate
- historical 1KOMMA5° duplicate
- OUTCOME_UNKNOWN retry prevention
- SAFE_TO_RETRY classification
- auto-apply policy
- audit events
- old-record compatibility

Frontend:
- fit score rendering
- score breakdown
- requirements matrix
- readiness states
- blocker rendering
- duplicate warning
- execution polling
- accepted-vs-completed state
- submission-unverified UI
- manual-required UI

Run:
- full backend pytest
- full frontend Vitest
- frontend production build
- configured lint/type checks

---

# 23. Production validation

After tests pass:

1. Build backend.
2. Build frontend.
3. Deploy only through the existing safe workflow.
4. Verify health endpoints.
5. Verify frontend health.
6. Verify API contracts.
7. Verify MongoDB indexes/collections.
8. Verify no historical applications changed.
9. Verify the successful Personio application remains intact.
10. Verify the historical duplicate identity is blocked.
11. Verify at least one current qualified job has:
    - fit score
    - match breakdown
    - readiness
    - freshness
    - source
    - ATS
12. Do NOT submit a real application unless a separate explicit production-test instruction authorizes it.
13. Do NOT run a broad auto-apply campaign.

---

# 24. Documentation

After implementation is verified, update relevant README/API/architecture docs with:
- Qualification vs Fit Score
- Fit Score calculation
- Application Readiness
- Auto-Apply policy
- hard blockers
- duplicate identity
- freshness verification
- application lifecycle
- OUTCOME_UNKNOWN
- CAPTCHA/MFA behavior
- auditability
- minimum fit threshold configuration
- enabling/disabling AUTO_APPLY_SUPPORTED

Never claim a feature is production-ready unless it was actually verified.

---

# 25. Git workflow

Use a focused branch:

feature/fit-score-application-readiness-auto-apply

Suggested commits:
1. feat: add explainable job fit scoring
2. feat: add application readiness policy
3. feat: add policy-driven auto-apply decisions
4. feat: add fit and readiness UI
5. test: cover fit readiness and auto-apply safety
6. docs: document fit scoring and auto-apply policy

Push the branch and create a PR if that is the repository's normal workflow. Never force-push or rewrite history.

---

# 26. Definition of Done

- Qualification remains deterministic.
- Every qualified job has an explainable 0–100 fit score.
- Fit is grounded in candidate evidence.
- Requirements matrix is available.
- Gaps are visible.
- Why-this-fits is visible.
- Why-not-apply is visible.
- Application Readiness is separate from Fit Score.
- Hard blockers override readiness percentage.
- Freshness is semantic, not HTTP-200-only.
- Real-world duplicate identity is enforced.
- Historical 1KOMMA5° Personio submission cannot be duplicated.
- Auto-Apply is policy controlled.
- CAPTCHA/MFA/authentication are never bypassed.
- OUTCOME_UNKNOWN cannot auto-retry.
- SAFE_TO_RETRY is narrowly defined.
- Apply Kit is grounded and humanized.
- Application questions cannot invent candidate facts.
- Frontend clearly displays fit/readiness.
- Backend tests pass.
- Frontend tests pass.
- Frontend build passes.
- Production health checks pass if deployed.
- Historical records remain unchanged.
- Documentation matches actual behavior.
- Changes are committed and pushed.

## Final principle

Build a Recruitment Decision Engine, not merely an AI score.

The system must answer:

1. Is this a real/relevant job? → Qualification
2. How well does it match me? → Fit %
3. Can the system safely apply? → Application Readiness
4. Should it actually submit now? → Policy Decision

Only when all four permit it may Auto-Apply execute.

Never trade safety, factual candidate evidence, duplicate protection, or submission verification for automation speed.
