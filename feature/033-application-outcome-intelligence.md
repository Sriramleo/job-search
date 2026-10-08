# Phase 033 — Application Outcome Intelligence

Status: NEXT IMPLEMENTATION
Branch: main ONLY
Scope: Outcome observation, Gmail read-only intelligence, application analytics
Do NOT increase the autonomous application limit.
Do NOT start Phase 034.

## Mission
Build the post-application intelligence layer on top of the proven application engine.
Observe what happens after a positively confirmed application using the existing read-only Gmail boundary and application records.
Answer: Did the employer respond? Was it rejection, interview, assessment, recruiter response, offer, or unknown? Which application did the message relate to? When did it arrive? What patterns are visible across Fit %, source, ATS, role, location, salary, and language requirements?

## Safety and Campaign Limits
- Maximum 1 application/day.
- Minimum Fit Score >= 85.
- Minimum Readiness Score >= 90.
- Maximum 1 application/company/day.
- Maximum 1 application/ATS/day during Stage 1.
- Do NOT increase these limits.
- Do NOT automatically submit a new application as part of Phase 033.
- Do NOT send Gmail or LinkedIn messages.
- Gmail remains strictly read-only.
- Do NOT automatically alter Fit Score weights from outcome data.

## Git Policy
Use main directly in job-search-api and job-search. Pull/reconcile origin/main, verify Phase 032A is present, use no feature branches, commit directly to main, push directly to origin/main, never force-push.

## Preserve Existing Lifecycle
Keep all existing submission and outcome states, including OUTCOME_UNKNOWN / Submission Unverified. Never infer rejection from silence.

## Outcome Data Model
Implement grounded outcome states:
- NO_RESPONSE
- RECRUITER_RESPONSE
- APPLICATION_RECEIVED
- ASSESSMENT
- INTERVIEW_INVITATION
- INTERVIEW_SCHEDULED
- REJECTION
- OFFER
- UNKNOWN
Keep submission status separate from employer outcome. Example: submissionStatus=SUBMITTED with outcome=NO_RESPONSE is valid.
Confirmed employer outcomes must not be overwritten by later generic syncs.

## Gmail Read-Only Integration
Reuse the existing Gmail/communications integration. Read only; no send, reply, delete, or Gmail mutation. Retrieve relevant recent communications and preserve newest-first Inbox behavior.

## Application ↔ Email Matching
Implement deterministic matching first using company email domain, company name, job title, application/ATS identifiers, known ATS confirmation patterns, sender, subject, and body references.
Do not attach a message on weak company-name matching when multiple applications exist. Ambiguous matches must be NEEDS_REVIEW.

## Employer Response Classification
Ground classifications as APPLICATION_RECEIVED, RECRUITER_RESPONSE, ASSESSMENT, INTERVIEW_INVITATION, INTERVIEW_SCHEDULED, REJECTION, OFFER, UNKNOWN, with NO_RESPONSE when no relevant response exists.
Never infer rejection from silence, interview from generic acknowledgement, or offer from positive wording alone. Store classification evidence.

## Evidence and Audit
Every classification retains source message ID, received timestamp, sender, subject, classification, confidence, evidence reference, matched application ID, classifier version, and timestamps. Minimize stored email content.

## Application Timeline
Add chronological application events for submission, confirmation, employer response, assessment, interview, rejection, and offer. Sort using actual event timestamps.

## Response-Time Metrics
Calculate submission-to-first-response, submission-to-rejection, submission-to-interview, submission-to-assessment, and submission-to-offer. Return unknown/null when timestamps are unavailable.

## Application Analytics
Add totals and conversion metrics for submitted, confirmed, no response, recruiter responses, assessments, interviews, rejections, offers, and unknown. Allow breakdown by Fit Score band, source, ATS, company, seniority, location, genuinely known salary, and German-language requirement state.
Do not automatically adjust Fit Score weights. Do not imply causation from small samples.

## Fit Score Outcome Analysis
Provide observational analytics for Fit bands such as 90–100 and 80–89, including application, interview, rejection counts and rates. Also show German requirement state, source, and ATS outcome comparisons with sample counts.

## Rejection Intelligence
Use GENERIC_COMPETITIVE_REJECTION, SPECIFIC_REQUIREMENT_REJECTION, and UNKNOWN_REJECTION_REASON. Require explicit employer evidence. Never invent reasons or infer from silence.

## Frontend
Add an Outcome section to Application Detail showing submission status, current outcome, latest employer response, response date, confidence, evidence/reference, timeline, and next attention/recommendation.
Add Application Dashboard filters: All, No Response, Recruiter Response, Assessment, Interview, Rejected, Offer, Unknown.
Add Outcome Analytics with outcome funnel, Fit bands, source comparison, ATS comparison, German requirement comparison, and response-time metrics. Show sample counts.
Extend daily campaign reporting with new employer responses, rejections, interviews, assessments, offers, unmatched messages, and responses needing review.
Maintain newest-first ordering.

## Incremental and Idempotent Sync
Do not reprocess the entire mailbox unnecessarily. Reuse incremental processing where supported. Repeated sync of the same message must not create duplicate outcome events or incorrectly downgrade a confirmed outcome. Classifier version changes must be auditable.

## Backend Tests
Run the full suite. Add tests for deterministic matching, ambiguous matching, multiple applications at one company, all outcome classes, silence=NO_RESPONSE, grounded rejection reasons, timeline ordering, duplicate message idempotency, response-time calculations, analytics sample sizes, Fit band analytics, German requirement analytics, no outbound Gmail, and application integrity.

## Frontend Tests
Run the full Vitest suite and production build. Add tests for outcome states, timeline, evidence, filters, analytics, unknown/unmatched state, rejection reason display, no-response state, and latest-first ordering.

## Production Validation
Deploy only after all tests pass. Verify MongoDB source of truth, application count, 1KOMMA5° integrity, Wandelbots integrity, campaign remains capped at 1/day, Gmail remains read-only, Inbox newest-first, outcome sync, idempotency, timeline, analytics, and zero outbound messages.

## Real Application Constraint
Phase 033 does NOT require another real application. Use existing real applications and controlled test fixtures. Do not submit an application merely to test outcome intelligence.

## Privacy
Minimize email content. Prefer message ID, sender, subject where appropriate, timestamps, minimal evidence, and classification.

## Required Final Report
Report backend/frontend commits, direct main pushes, full backend/frontend test results, production build/deployment, Gmail read-only verification, application/email matching, outcome classification, timeline, analytics, rejection intelligence, idempotency, historical application integrity, application count, 1/day campaign limit, zero new real applications, and remaining blockers/limitations.

## Definition of Done
- Employer responses can be grounded and classified.
- Application/email matching is deterministic and safe.
- Ambiguous matches go to review.
- No-response is not treated as rejection.
- Rejection reasons are not fabricated.
- Application timelines work.
- Response-time metrics work.
- Outcome analytics work.
- Fit outcome analytics are observational only.
- Gmail remains read-only.
- No outbound messages occur.
- Existing applications remain unchanged.
- Campaign remains capped at 1/day.
- Full backend and frontend tests pass.
- Production builds and deployment are verified.
- Zero new real applications are submitted during Phase 033.

Do not start Phase 034 automatically.