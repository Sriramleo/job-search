You are responsible for Phase 1 of my Germany Job Hunt application.

IMPORTANT:

This phase is FRONTEND ONLY.

Do NOT build or modify:
- FastAPI
- MongoDB
- Jev
- Gemini
- Apify
- Gmail
- Playwright
- Kubernetes
- k0s
- Traefik
- Cloudflare configuration
- backend CI/CD
- authentication backend
- APIs

Do not connect to any external service yet.

Build the complete frontend using high-quality mock data and clearly defined TypeScript interfaces.

The frontend must be designed so that Phase 2 can connect a real FastAPI backend without requiring a redesign.

==================================================
1. PRODUCT
==================================================

Application name:

Germany Job Hunt

Purpose:

A personal recruitment operating system for finding and applying to Senior/Lead DevOps, Cloud, Platform, Kubernetes and SRE jobs in Germany.

Candidate:

Sriram Sugavanam

Current role:

Senior DevOps Engineer

Target roles:

- Senior DevOps Engineer
- Lead DevOps Engineer
- Senior Cloud Engineer
- Lead Cloud Engineer
- Platform Engineer
- Lead Platform Engineer
- Kubernetes Engineer
- Senior SRE
- Lead SRE
- Cloud / Infrastructure / Platform leadership roles

Target:

Germany
€80K+
Hybrid or office
Relocation from India
German A1

==================================================
2. TECHNOLOGY
==================================================

Use:

React
TypeScript
Vite

Use a clean modern component architecture.

Use:
- React Router
- TanStack Query architecture, but use mock/local data for Phase 1
- Zod for validation where appropriate
- reusable components
- typed models
- clean state management

Do not introduce a backend.

Create a clean API abstraction layer such as:

src/api/

with mock implementations.

Example:

jobsApi.getJobs()
jobsApi.getJob()
companiesApi.getCompanies()
applicationsApi.getApplications()

For now these functions return mock data.

Later Phase 2 will replace the implementation with real API calls.

==================================================
3. DESIGN DIRECTION
==================================================

Do NOT copy the previous Stitch design.

The product should feel like:

- premium SaaS
- professional recruitment workspace
- modern CRM
- technical but approachable
- calm
- focused
- information-dense without clutter

It should NOT feel like:

- crypto dashboard
- financial trading dashboard
- generic AI dashboard
- immigration control panel
- overloaded enterprise admin panel

Primary UX principle:

"What should I do next?"

Secondary:

"Why is this job worth pursuing?"

Third:

"What evidence supports this?"

==================================================
4. VISUAL SYSTEM
==================================================

Use this color system.

Background:
#F8FAFC

Surface:
#FFFFFF

Primary text:
#0F172A

Secondary text:
#475569

Muted:
#64748B

Border:
#E2E8F0

Primary action:
#2563EB

Primary hover:
#1D4ED8

AI:
#7C3AED

Success:
#16A34A

Warning:
#D97706

Danger:
#DC2626

Unknown:
#94A3B8

Semantic meaning:

Blue:
user actions

Purple:
AI-generated / AI processing

Green:
verified / successful

Amber:
needs review

Red:
blocked / failed

Gray:
unknown

Do not use many competing colors.

Typography:
Inter or equivalent.

Body:
14px minimum.

Secondary metadata:
12–13px.

Page title:
28–32px.

Section:
18–20px.

Major number:
28–36px.

Do not use tiny text.

==================================================
5. APP SHELL
==================================================

Create:

Left sidebar
Top header
Main content
Optional contextual right drawer

Sidebar:

CORE
Dashboard
Jobs
Companies
Contacts

EXECUTION
Applications
Application Workspace
Documents
Interviews
Tasks

INTELLIGENCE
Research & Evidence
Analytics

COMMUNICATION
Inbox

SYSTEM
Settings
Automation

Do not place:
Job Detail
Company Detail

in the sidebar.

Those are contextual routes.

Top header:

Current page title
Global search
Tasks
Notifications
User profile

Profile:

Sriram Sugavanam
Senior DevOps Engineer

Do NOT display:
Lead Platform Engineer

as the current job title.

==================================================
6. ROUTES
==================================================

Create these routes:

/dashboard
/jobs
/jobs/:id
/applications
/applications/:id
/companies
/companies/:id
/contacts
/documents
/interviews
/tasks
/research
/inbox
/analytics
/settings
/automation

==================================================
7. DASHBOARD
==================================================

Dashboard should answer:

"What should I work on today?"

Do NOT create an analytics wall.

Top KPI row ONLY:

Qualified Jobs
Application Ready
Applied
Interviews
Offers

Example:

Qualified Jobs
42

Application Ready
6

Applied
18

Interviews
3

Offers
0

Do not show:
Blue Card metrics
AI provider metrics
external benchmarks

MAIN CONTENT:

Two-column layout.

Left:
Top Opportunities

Right:
Action Queue

TOP OPPORTUNITIES:

Show 5–8 jobs.

Each row:

Job title
Company
Location
Salary
Fit
Application route
Next action

Example:

Lead Platform Engineer
Zalando
Berlin · Hybrid
€95K–€110K
Strong Fit
Referral + Official ATS
Review Application

Buttons should be contextual.

Examples:

Review Application
Prepare Draft
View Contact
Open Inbox
View Evidence

ACTION QUEUE:

Tasks such as:

Review application
Send recruiter email
Send LinkedIn message
Prepare interview
Review recruiter response

Each item shows:
priority
due date
action

Then:

APPLICATION PIPELINE

Discovered
Qualified
Preparing
Applied
Interview
Offer

Use counts.

Then:

RECENT ACTIVITY

Examples:
New job qualified
Cover letter generated
Recruiter response received
Application submitted
Company research completed

Then:

SEARCH SNAPSHOT

Use only real mock database counts.

Examples:

Berlin
18 qualified

Munich
12 qualified

Hamburg
5 qualified

Other Germany
7 qualified

Do not create fictional external statistics.

==================================================
8. JOBS PAGE
==================================================

Purpose:

Rapid job discovery and triage.

Header:

Jobs

Subtitle:

Discover and qualify opportunities

Search:
Search jobs, companies, technologies

Filter toolbar:

Role
Seniority
Location
Minimum Salary
German Requirement
Work Model
Relocation Evidence
Application Route
Source
Status

Saved Searches.

JOB TABLE:

Columns:

Job & Role
Company
Location & Mode
Salary
Technical Fit
Relocation
Route
Action

Example:

Senior Platform Engineer
Zalando
Berlin
€95K–€110K
Strong
Evidence Found
Referral + ATS
Prepare

Do not display dozens of skill badges.

Instead:

AWS · Kubernetes · Terraform
+4

Allow row click to open Job Detail.

Provide:
pagination
sorting
search
column alignment
hover state
selected row state
loading state
empty state

Selected job can open a right-side preview drawer.

==================================================
9. JOB PREVIEW DRAWER
==================================================

When a job is selected:

Show:

Job title
Company
Location
Salary

Technical Match

Why This Matches Your Profile

Relocation & Work Authorization Evidence

Company Snapshot

Application Route

Primary CTA:

Prepare in Workspace

Secondary:

Open Full Job

==================================================
10. JOB DETAIL PAGE
==================================================

Purpose:

Answer:

"Should I pursue this job, and why?"

Header:

Job title
Company
Location
Salary
Posted date
Source

Actions:

Prepare Application
Find Referrals
Open Original
Save

FIT SUMMARY:

Technical Fit
Senior/Lead Fit
Salary
Application Readiness

Use:

Strong
Good
Moderate
Weak

Do NOT use arbitrary precision percentages.

SECTION:

WHY THIS MATCHES YOUR PROFILE

Show evidence:

AWS / EKS
Kubernetes
Terraform
Production Reliability
Leadership

SECTION:

SKILL MATCH

Use a clean table:

Requirement
Candidate Evidence
Fit

SECTION:

POTENTIAL GAPS

Show:
Missing
Transferable
Unknown

SECTION:

COMPANY RESEARCH

Show:
Company overview
Relevant product
Engineering context
Technology signals

SECTION:

RELOCATION & WORK AUTHORIZATION EVIDENCE

Use status:

Confirmed by Source
Evidence Found
Unknown
Contradictory

Every evidence item:

Source
Date
Excerpt
URL

Never use:

Immigration Verdict
Visa Guaranteed
Blue Card Guaranteed
98% Immigration Confidence

SECTION:

POTENTIAL REFERRAL CONTACTS

Name
Role
Company
Source
Relationship
Linked Job

Use:

Potential Referral Contact

SECTION:

APPLICATION REQUIREMENTS

CV
Cover Letter
Portfolio
Salary Question
Notice Period
Work Authorization
German Requirement

Each:

Required
Optional
Not Requested
Unknown

SECTION:

RECOMMENDED APPLICATION ROUTE

Examples:

Referral
Official Application
Recruiter Outreach

Each route must show the reason.

Do not claim:
Guaranteed interview
Guaranteed response

SECTION:

ACTIVITY TIMELINE

Discovered
Parsed
Qualified
Researched
Prepared
Applied
Contacted
Interview

==================================================
11. APPLICATION WORKSPACE
==================================================

THIS IS THE MOST IMPORTANT FRONTEND SCREEN.

Create a focused workspace.

Three-column desktop layout.

LEFT:

JOB CONTEXT

Job
Company
Location
Salary
Requirements
Fit
Application Route
Application Requirements

CENTER:

APPLICATION MATERIALS

Tabs:

CV
Cover Letter
Application Answers
Referral Message
Recruiter Message

CV tab:
show selected CV variant

Cover Letter:
document editor

Application Answers:
question/answer pairs

Referral Message:
editable message

Recruiter Message:
editable message

RIGHT:

EVIDENCE + VALIDATION

Candidate Evidence
Company Evidence
Research Evidence

VALIDATION CHECKLIST:

Correct Job
Correct Company
Correct CV
Cover Letter Ready
Required Questions Answered
Work Authorization Answer Verified
Notice Period Verified
No Fabricated Information
No Missing Required Fields

AUTOMATION STATE:

AI Prepared
Human Review
Ready
Automation Running
Submitted
Needs Attention

BOTTOM ACTION BAR:

Save Draft
Review
Fill Application
Submit

Submit must have a separate visual treatment.

Do NOT automatically submit anything in Phase 1.

==================================================
12. APPLICATIONS PAGE
==================================================

Support:

Table View
Kanban View

KANBAN:

Qualified
Preparing
Ready
Applied
Recruiter Screen
Interview
Offer
Rejected
Withdrawn
Closed

Card:

Job
Company
Date
Next Action
Route

Keep visual styling restrained.

==================================================
13. COMPANIES PAGE
==================================================

Table:

Company
Industry
Germany Location
Matching Jobs
International Hiring Evidence
Relocation Evidence
Applications
Contacts

Filters:

Industry
Company Size
Location
Role
Hiring Evidence

==================================================
14. COMPANY DETAIL
==================================================

Sections:

Company Overview
Engineering Context
Technology Signals
Matching Jobs
International Hiring Evidence
Relocation Evidence
Work Authorization Evidence
Contacts
Applications
Research History

Actions:

Research Again
View Jobs
Find Contacts

==================================================
15. CONTACTS PAGE
==================================================

Views:

All Contacts
Recruiters
Hiring Managers
Potential Referrals

Table:

Name
Company
Role
Relationship
Source
Linked Job
Last Contact
Next Action

Drawer:

Profile
Company
Relevant Job
Source
LinkedIn
Email if available
Relationship
Messages
Notes
Next Action

Actions:

Draft Referral Message
Draft Recruiter Message
Open LinkedIn
Create Follow-up

Clearly label LinkedIn actions:

HUMAN ACTION

Do not imply LinkedIn automation.

==================================================
16. DOCUMENTS
==================================================

Tabs:

Master CV
CV Variants
Cover Letters
Application Answers

Table/card information:

Version
Job
Company
Created
Updated

Actions:

Open
Compare
Duplicate
Export
Archive

==================================================
17. INTERVIEWS
==================================================

Show:

Upcoming
All Interviews

Interview:

Company
Job
Round
Date
Interviewer
Status

Detail:

Interview Type
Technical Topics
System Design
Questions
Preparation Notes
Feedback
Next Step

==================================================
18. TASKS
==================================================

Views:

Today
Upcoming
Overdue
Completed

Task fields:

Task
Priority
Due Date
Job
Company
Status

Examples:

Review CV
Send Recruiter Email
Send LinkedIn Message
Submit Application
Prepare Interview
Follow Up

==================================================
19. RESEARCH & EVIDENCE
==================================================

Create tabs:

Job Evidence
Company Evidence
Relocation Evidence
Work Authorization Evidence
Candidate Evidence

Every evidence record:

Claim
Status
Source
URL
Captured Date
Confidence
Original Excerpt
Used In

Use statuses:

Confirmed by Source
Evidence Found
Unknown
Contradictory

This screen must look like a professional evidence/research workspace.

==================================================
20. INBOX
==================================================

Create a Gmail-style UI for future Gmail integration.

Phase 1 uses mock data.

Folders:

All
Recruiters
HR
Referrals
Applications
Interviews
Other

Message list:

Sender
Company
Subject
Linked Job
Date
Detected Type
Action Required

Message detail:

Email body
Linked Job
Linked Application
Detected Intent
Suggested Response

Actions:

Reply
Draft Response
Link Application
Create Task
Mark Relevant
Archive

==================================================
21. ANALYTICS
==================================================

Analytics page only.

Sections:

Application Funnel

Source Analysis

Role Analysis

Application Route

Time to Stage

Salary Distribution

AI Usage

Apify Usage

Jev Usage

Gemini Usage

Use mock values.

Do not put detailed cost analytics on Dashboard.

==================================================
22. SETTINGS
==================================================

Sections:

Candidate Profile
Job Preferences
Immigration
AI Providers
Automation
Gmail
Job Sources
Notifications
Security

Candidate Profile:

Name
Current Role
Experience
Skills
Leadership
Languages
Education
Target Roles

Job Preferences:

Minimum Salary
Locations
Role Families
Work Model
Company Size
Industries

Immigration:

Current Country
Target Country
German Level
EU Blue Card Objective

AI Providers:

Jev
Gemini
Apify

Gmail:

sriramsugavanams@gmail.com

Show mock:
OAuth Connected
Last Sync

==================================================
23. AUTOMATION PAGE
==================================================

Create a page showing future automation schedules.

Cards:

Job Discovery
Job Matching
Company Research
Application Preparation
Follow-up Checks

Each shows:

Enabled / Disabled
Next Run
Frequency
Last Run
Last Status

Phase 1:
UI only.
No actual scheduler.

==================================================
24. COMPONENT SYSTEM
==================================================

Create reusable components:

AppShell
Sidebar
Header
PageHeader
SearchBar
FilterBar
FilterDropdown
KPI
JobTable
JobRow
JobCard
JobPreviewDrawer
FitBadge
StatusBadge
EvidenceBadge
EvidenceCard
CompanyCard
ContactCard
ApplicationCard
ApplicationKanban
Timeline
TaskCard
TaskList
DocumentEditor
ValidationChecklist
AIStatus
AutomationStatus
EmptyState
LoadingSkeleton
ErrorState
ConfirmationModal
Drawer
Tabs
Pagination

Components must be reusable across screens.

==================================================
25. MOCK DATA
==================================================

Create realistic but clearly synthetic mock data.

Include:

20–30 jobs
8–10 companies
10–15 contacts
10 applications
5 interviews
15 tasks
10 research evidence records
5 candidate evidence records
10 emails

Do not use fake immigration/legal claims that could look real.

Clearly mark seeded/sample data in development mode.

==================================================
26. TYPES / DATA CONTRACTS
==================================================

Define TypeScript interfaces for:

Candidate
CandidateEvidence
Job
JobRequirement
JobMatch
Company
CompanyEvidence
Contact
Application
ApplicationAnswer
Document
Interview
Task
ResearchEvidence
Communication
AutomationRun
AIUsage

Keep these types clean and backend-ready.

These same contracts should be usable later when FastAPI APIs are introduced.

==================================================
27. API ABSTRACTION
==================================================

Even though this phase uses mock data, do NOT hard-code mock data directly into components.

Create:

src/api/

Example:

jobsApi
companiesApi
contactsApi
applicationsApi
documentsApi
interviewsApi
tasksApi
researchApi
communicationsApi
analyticsApi

The UI calls the API layer.

The Phase 2 backend implementation will replace the mock API implementation.

==================================================
28. STATE MANAGEMENT
==================================================

Separate:

Server-like data
UI state
Filter state
Modal/drawer state

Filters should be URL-aware where practical.

Example:

/jobs?role=platform&city=berlin&salary=80000

==================================================
29. RESPONSIVENESS
==================================================

Primary:
Desktop

Secondary:
Tablet

Mobile:
Fully usable

Desktop:
sidebar + content + optional right panel

Tablet:
collapsible sidebar

Mobile:
stacked layouts
horizontal table scrolling
full-screen drawers
bottom navigation where appropriate

==================================================
30. ACCESSIBILITY
==================================================

Implement:

Keyboard navigation
Visible focus
ARIA labels
Semantic HTML
Accessible tables
Accessible dialogs
Accessible forms
Color-independent status indicators

Do not rely only on colors.

==================================================
31. LOADING / EMPTY / ERROR STATES
==================================================

Create states for every major page.

Examples:

Jobs:
Loading jobs
No jobs found
No results for filters
Source unavailable

Application Workspace:
Loading application
No CV
No cover letter
Missing evidence
Cannot prepare application

Inbox:
No emails
Loading messages
Sync unavailable

Analytics:
No historical data

==================================================
32. FRONTEND QUALITY
==================================================

Requirements:

Clean component boundaries
No duplicated UI
No giant page components
No hardcoded repeated text
No magic colors
No inline styling unless justified
Consistent spacing
Consistent typography
Consistent button hierarchy
Responsive
Accessible
Type-safe

Use a spacing system.

Use consistent border radius.

Avoid unnecessary shadows.

Avoid excessive gradients.

Avoid excessive cards.

Avoid excessive pills.

==================================================
33. DO NOT IMPLEMENT YET
==================================================

Do NOT implement:

Backend APIs
MongoDB
Jev calls
Gemini calls
Apify
Gmail API
Playwright
Google Cloud Scheduler
Google Cloud Agent Platform
Kubernetes
Traefik
Deployment
Authentication backend

Create interfaces/placeholders only.

==================================================
34. DEVELOPMENT PROCESS
==================================================

Before coding:

1. Inspect existing repository.
2. Identify existing frontend code.
3. Identify framework/version.
4. Identify existing component library.
5. Identify existing styling system.
6. Reuse the existing frontend structure where appropriate.

Do NOT replace existing working frontend infrastructure unnecessarily.

Then:

1. Create/update design system.
2. Create AppShell.
3. Create routing.
4. Create reusable components.
5. Build Dashboard.
6. Build Jobs.
7. Build Job Detail.
8. Build Application Workspace.
9. Build remaining pages.
10. Add responsive states.
11. Add accessibility.
12. Add loading/empty/error states.
13. Add mock data.
14. Add frontend tests.

==================================================
35. PHASE 1 ACCEPTANCE CRITERIA
==================================================

Phase 1 is complete only when:

- all required routes work
- navigation works
- Dashboard is functional with mock data
- Jobs table works
- filtering works on mock data
- Job Detail works
- Application Workspace works
- Companies work
- Contacts work
- Applications work
- Documents work
- Interviews work
- Tasks work
- Research/Evidence works
- Inbox works
- Analytics works
- Settings works
- Automation page works
- all important states exist
- responsive layout works
- no console errors
- TypeScript passes
- lint passes
- tests pass
- production build passes

==================================================
36. FINAL IMPORTANT RULE
==================================================

Do not try to finish everything in one giant generation.

Implement incrementally.

After each major screen:

1. Build
2. Run
3. Test
4. Inspect visually
5. Fix spacing/alignment/interaction issues
6. Continue

At the end provide:

- changed files
- routes created
- reusable components created
- design system summary
- test results
- build result
- remaining Phase 1 issues

DO NOT start Phase 2.

Stop after the complete frontend is finished and ready for backend integration.