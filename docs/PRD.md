# Germany Job Hunt — Product Requirements Document (PRD)

## 1. Executive Summary
**Germany Job Hunt** is a dedicated recruitment operating system tailored for Sriram Sugavanam (Senior DevOps Engineer) targeting Senior/Lead DevOps, Cloud, Platform, Kubernetes, and SRE roles in Germany (€80k+, English-speaking/German A1, Relocation from India, EU Blue Card path).

## 2. Core Purpose & Principles
- **Primary UX Principle:** "What should I do next?" (Immediate actionable clarity)
- **Secondary UX Principle:** "Why is this job worth pursuing?" (Evidence-backed fit assessment)
- **Third UX Principle:** "What evidence supports this?" (Zero hallucinated immigration or visa claims)
- **Aesthetic:** High-craft, calm, information-dense SaaS CRM. Not a flashy crypto trading desk or generic AI demo.

## 3. Candidate Profile Baseline
- **Candidate:** Sriram Sugavanam
- **Current Title:** Senior DevOps Engineer (*Strict rule: never display "Lead Platform Engineer" as current title*)
- **Target Roles:** Senior/Lead DevOps, Senior/Lead Cloud, Platform/Lead Platform, Kubernetes Engineer, Senior/Lead SRE
- **Location Criteria:** Germany (Berlin, Munich, Hamburg, Frankfurt, Stuttgart, Cologne, Remote/Hybrid)
- **Target Compensation:** €80K+

## 4. Key Functional Modules
1. **Dashboard (`/dashboard`):** 5-metric KPI row, Top Opportunities with contextual actions, Action Queue, Pipeline breakdown, Search snapshot.
2. **Jobs Discovery (`/jobs` & `/jobs/:id`):** Dense triage table, multi-field filters, Preview Drawer, Deep Job Fit page with skill match matrix, relocation evidence citations, and referral contacts.
3. **Application Workspace (`/applications/:id`):** 3-column workstation: Job Context (Left), Application Materials & Editors (Center), Evidence & Validation Checklist (Right), Action Bar.
4. **Applications (`/applications`):** Dual-view (Table and 10-stage Kanban board).
5. **Companies (`/companies` & `/companies/:id`):** International hiring track record, relocation evidence, engineering context, matching jobs.
6. **Contacts (`/contacts`):** Recruiters, Hiring Managers, Potential Referrals with explicit "HUMAN ACTION" markers for LinkedIn outreach.
7. **Documents (`/documents`):** Master CV, tailored CV variants, cover letters, verified application Q&A.
8. **Interviews (`/interviews`):** Round-by-round prep notes, system design review, question bank, feedback.
9. **Tasks (`/tasks`):** Action-oriented task manager grouped by Today, Upcoming, Overdue, and Completed.
10. **Research & Evidence (`/research`):** Evidentiary ledger with status (Confirmed by Source, Evidence Found, Unknown, Contradictory) with direct citations and excerpts.
11. **Inbox (`/inbox`):** Clean recruitment email client with intent classification, suggested responses, and application links.
12. **Analytics (`/analytics`):** Funnel conversion, salary distributions, role distributions, AI provider usage.
13. **Settings (`/settings`):** Candidate profile, job filters, Blue Card requirements, AI provider toggles, mock Gmail OAuth.
14. **Automation (`/automation`):** Scheduled agent job cards (Discovery, Matching, Company Research, Prep, Follow-up).

## 5. Scope Boundaries (Phase 1)
- Frontend-only: Vite + React + TypeScript + React Router.
- Fully typed data contracts matching future FastAPI backend models.
- Mock API abstraction layer (`src/api/*`) with zero hardcoded UI strings.
- Complete responsive layout (Desktop-first with tablet and mobile responsiveness).
- Accessible semantics, keyboard navigation, and visible focus states.
