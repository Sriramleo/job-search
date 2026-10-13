# Phase 044 — Recruiter & Hiring Manager Outreach Agent (Backlog)

**Status:** Backlog proposal — not approved for implementation or sending  
**Target repository:** `Sriramleo/job-search`  
**Purpose:** Add a separate outreach agent to identify relevant recruiters/hiring managers for Germany-based DevOps and Platform Engineering roles, gather professional contact evidence, prepare tailored cold-outreach messages, and eventually support a controlled daily outreach workflow.

## 1. Objective

Create a separate agent/workflow for professional networking and recruiter outreach. Keep it separate from job discovery, qualification, Gmail inbox synchronization, and ATS application submission so its permissions, audit trail, quotas, and safety controls can be managed independently.

Desired future capacity: **10–20 outreach emails per day**, but this is a configurable upper target, not permission to send unsolicited emails automatically. The system must first validate applicable legal requirements, provider policies, contact-source permissions, and the user's approval model. If compliant sending cannot be established, the agent must stop at research and draft preparation.

## 2. Required Architecture

Inspect the existing architecture before designing new services. Reuse established components where appropriate:

- Oracle/k0s FastAPI backend and MongoDB Atlas for durable records, deduplication, audit events, and review queues.
- Existing React/Vite frontend for contact research, draft review, approvals, delivery status, and opt-out/suppression management.
- Existing GCP Cloud Run Google ADK agent and Cloud Scheduler only if suitable after architecture review.
- Dedicated agent identity and least-privilege tools; do not grant access to ATS submission tools.
- Gmail integration must remain read-only by default. Email sending must use a separately authorized send capability and separate credentials/scopes, not expand the current read-only Gmail connection silently.
- No Redis or unrelated infrastructure expansion.

Do not create cloud resources, enable send scopes, or configure production delivery as part of backlog documentation.

## 3. Contact Discovery and Evidence

For each target role/company, research potential recruiters or hiring managers using legitimate, permitted sources, prioritizing:

1. Official company team, leadership, or recruiting pages.
2. Public professional profiles and public business contact information where access and reuse are permitted.
3. Employer career pages and job postings that identify a recruiter or hiring contact.
4. Other sources only after their terms and data-use permissions have been reviewed.

Store only relevant professional information needed for outreach:

- Company and role being targeted.
- Contact name and professional title, if reliably established.
- Business email only when supported by reliable evidence and permitted to use.
- Public profile URL or official source URL.
- Evidence timestamp and source type.
- Confidence level and reason.
- Contact status: `RESEARCHED`, `NEEDS_REVIEW`, `DRAFT_READY`, `APPROVED`, `SENT`, `REPLIED`, `OPTED_OUT`, or `SUPPRESSED`.

Do not guess email addresses, generate likely email patterns and treat them as verified, scrape behind login walls, bypass CAPTCHAs or anti-bot controls, or collect unnecessary personal data. Unknown contact details must remain unknown.

## 4. Role and Contact Relevance

Prioritize contacts directly related to relevant Germany-based opportunities, including:

- Senior DevOps Engineer
- Platform Engineer
- Site Reliability Engineer
- Cloud Infrastructure Engineer
- Kubernetes / Infrastructure Platform Engineer

Match contacts to a specific role, employer, or recruiting function using source evidence. Avoid sending generic outreach to unrelated employees or contacting multiple people at the same company for the same role without a documented reason.

Use verified candidate facts only. Outreach must not claim skills, experience, German proficiency, work authorization, visa status, or application history unless supported by the candidate profile and the specific claim is appropriate.

## 5. Tailored Draft Generation

Generate concise, natural, professional emails tailored to the contact, company, and relevant role.

Each draft should include:
- A truthful subject line.
- A brief introduction.
- The specific role or reason for contacting the person.
- One or two relevant candidate strengths grounded in verified evidence.
- A clear, low-pressure call to action.
- A professional signature.
- An appropriate, respectful way to decline further contact where required.

Do not fabricate a relationship, referral, prior conversation, job opening, or personal detail. Avoid manipulative personalization and mass-identical content.

Save drafts for review by default. Do not send automatically merely because a draft was generated.

## 6. Legal, Privacy, and Provider-Policy Gate

Before enabling any outbound delivery, conduct and document a jurisdiction-specific compliance review, especially for Germany/EU recipients.

Review applicable requirements including German UWG rules for unsolicited commercial email, GDPR lawful basis and transparency obligations where relevant, data-source restrictions, data retention, provider terms, and applicable opt-out/suppression obligations.

Do not assume that a business email address, public profile, legitimate interest, or B2B context automatically authorizes cold email. If prior consent or another legally valid condition is required and absent, do not send.

Acceptance criteria for this gate:
- Documented review by an appropriate qualified person.
- Defined recipient eligibility rules and permitted contact sources.
- Required privacy information and retention/deletion policy.
- A suppression list that is checked before every send.
- Immediate suppression after an opt-out or do-not-contact request.
- No sending to uncertain or disallowed recipients.
- No sending until the gate is explicitly approved by the user after review.

This backlog item is not legal advice and must not be treated as legal clearance.

## 7. Daily Outreach Queue and Rate Limits

Desired future target: **10–20 emails/day**, configured by the user and constrained by the compliance gate.

Implement a durable daily quota and idempotency model before any sending capability is enabled:

- Configurable daily cap with conservative default.
- Hard upper limit of 20 sends/day unless explicitly reviewed and changed.
- Per-company and per-contact cooldowns.
- No duplicate send to the same contact/role/campaign.
- Persistent reservations/leases to prevent overlapping runs.
- Retry only when delivery status is known to be safe.
- Unknown delivery outcomes must be quarantined; do not blindly retry.
- Provider throttling, backoff, bounce handling, and delivery-failure tracking.
- Circuit breaker and emergency stop.
- Time-zone-aware business-hour scheduling appropriate to the recipient.
- Daily preview of proposed recipients and drafts.
- Metrics for researched contacts, drafts, approved messages, sent messages, bounces, replies, opt-outs, suppressed recipients, and failures.

The scheduler must not run any outbound send when the compliance gate is not approved, the campaign is disabled, credentials are unavailable, or the recipient is suppressed.

## 8. Human Approval and Permissions

Initial release must be **research-and-draft only**:
- Agent can discover contacts and prepare drafts.
- User reviews the source evidence, recipient, and full message.
- Sending is unavailable until the compliance gate and dedicated sending authorization are approved.
- After approval, the user can explicitly select whether each message or a narrowly defined batch may be sent.
- No approval may be inferred from a draft being marked ready.
- Do not enable unrestricted autonomous sending as a side effect of a deployment.

Any future autonomous-send mode requires a separate explicit decision after compliance, quota, opt-out, and audit controls are demonstrated.

## 9. Separate Agent Boundaries

The outreach agent must not:
- Submit job applications.
- Modify application stages or ATS confirmation records.
- Send, reply to, delete, or modify Gmail messages using the read-only inbox-sync credentials.
- Automate LinkedIn messages or bypass platform controls.
- Alter job-fit scores to prioritize a contact.
- Access unrelated mailboxes or contact data.
- Share candidate data with an external model or service beyond approved data-handling policy.

Inbound reply detection may be integrated later as a separate read-only capability, with deterministic contact/thread matching and human review for ambiguous replies.

## 10. Testing and Observability

Required tests before any production sending:
- Contact-source provenance and confidence.
- No fabricated or guessed email addresses.
- Candidate facts grounded in verified evidence.
- Duplicate contact and duplicate campaign suppression.
- Per-company cooldowns and daily quota enforcement.
- Concurrent scheduler invocations and durable leases.
- Opt-out and suppression checked immediately before send.
- Compliance gate blocks all sends by default.
- Unknown delivery outcome cannot trigger automatic resend.
- Emergency stop blocks outbound delivery.
- Audit events redact secrets and unnecessary personal data.
- Read-only Gmail permissions remain separate from outbound sending permissions.

Test research and draft generation with fixtures first. No live email may be sent during initial implementation or test runs.

## 11. Phased Delivery

### Phase 044A — Design and Compliance Gate
- Inspect architecture and provider capabilities.
- Document the legal/privacy review requirements and send-permission model.
- Define contact evidence schema, suppression model, quota/lease design, and UI workflow.
- No sending capability or external resource creation.

### Phase 044B — Contact Research and Draft Queue
- Implement permitted-source research, evidence capture, deduplication, and draft generation.
- Add frontend review queue and tests.
- Keep outbound sending disabled.

### Phase 044C — Approval, Suppression, and Quota Controls
- Implement explicit approvals, daily quota, per-company cooldowns, idempotency, opt-out/suppression, audit events, and emergency stop.
- Validate all controls with a fake mail transport.
- Keep live sending disabled until the compliance gate is separately approved.

### Phase 044D — Controlled Delivery (Separate Authorization Required)
- Only after explicit user authorization and completion of the compliance gate, configure the approved email provider and least-privilege send identity.
- Start with a small manually approved pilot before considering the 10–20/day target.
- Verify delivery, duplicate prevention, suppression, replies, bounces, audit events, and emergency stop.
- Do not enable broad autonomous sending without a separate review.

## 12. Acceptance Criteria

The backlog item is ready for implementation only when:
1. The separate agent boundary and permissions are documented.
2. Contact details are traceable to permitted sources.
3. No contact email is guessed or presented as verified without evidence.
4. Drafts use only verified candidate facts.
5. The daily target is configurable and capped at 20/day by default.
6. Quotas, leases, deduplication, suppression, opt-out, and emergency stop are designed and tested.
7. Outbound delivery remains disabled by default.
8. Applicable Germany/EU email and privacy requirements have been reviewed and approved.
9. No real emails are sent during research/draft implementation.
10. Existing job, application, Gmail-read-only, and auto-apply safety boundaries remain intact.

## 13. Backlog Status and Stop Conditions

This document records a proposed feature only. Do not implement or deploy it as part of the current dashboard phase.

Do not send emails, enable send scopes, provision external resources, or activate a scheduler from this backlog item without separate explicit authorization.

If legal eligibility, recipient permission, source terms, or delivery outcome is uncertain, stop and route the item for human review.
