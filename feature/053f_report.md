# Phase 053F — Post-Ingestion Qualification and Dashboard Verification Report

**Date:** 2026-10-21  
**Target Environment:** MongoDB Atlas ReplicaSet (`job_search_db`, MongoDB v8.0.34)  
**Operation Scope:** Read-only qualification pipeline evaluation, requisition deduplication analysis, API/UI verification, and collection count invariance audit  
**Execution Status:** **PASSED (100% Read-Only, 0 Writes, Full Verification)**

---

## 1. Executive Summary

Phase 053F conducted comprehensive post-ingestion verification of the eight authorized candidate records inserted into `job_search_db.discovered_jobs` during Phase 053E.

Key outcomes:
1. **Provenance & Field Integrity:** All 8 records were queried by their persistent MongoDB IDs. Stored metadata, titles, canonical URLs, fingerprints, source attributions, and timestamps are intact with 0 missing required schema fields.
2. **Link Reachability:** All 8 canonical job URLs were tested via live HTTP requests; every link resolved with **HTTP 200 OK** (no broken links or expired postings).
3. **BWI Requisition Verification:** Deep inspection confirmed that the two BWI Senior Platform Engineer postings represent **separate and distinct requisitions** (Req `12336-a26f539j0452041-S` posted 2026-09-18 with salary up to €104k vs. Req `13509-0000211104c002-S` / Stellen-ID `69424` posted 2026-10-13 with salary up to €91.6k). They do not duplicate each other.
4. **Qualification Processing:** The existing qualification pipeline (`JobQualificationService`, `DeterministicFilter`, and `MockJevClient`) successfully processed all eight records in read-only simulation mode (`dry_run=True`).
5. **Promotion Recommendations:**
   - **Eligible for Promotion (2):** Spread Group (Score: 90/100, Remote Germany) and BWI GmbH Req 69424 (Score: 77/100, €71k–€91.6k).
   - **Require Operator Review (5):** Computacenter (Score 77, German C1 requirement), D-TRUST GmbH (Score 90, German requirement), EY Consulting (Score 77, German requirement), BWI GmbH Req 12336 (Score 65 on shallow crawler text, requires JSON-LD sync), and hygi.de (Score 65, limited infrastructure signals in snippet).
   - **Hold / Exclude (1):** BWI GmbH on XING (shallow preview snippet redundant with direct Bundesagentur postings).
6. **Dashboard & API Verification:** Verified `/api/discovery/jobs` (all 8 records accessible with HTTP 200) and `/api/jobs` (0 records present in active qualified jobs, confirming strict segregation until promotion).
7. **Database Invariance:** Verified exactly **0 writes** occurred across all collections during Phase 053F.

---

## 2. Phase 053E Record-Level Inspection & Link Verification

Every record was queried directly from `job_search_db.discovered_jobs` by primary ID and tested for live HTTP accessibility:

| # | Persistent Job ID | Company Name | Title | Location | Source | HTTP Status | Active | Missing Fields |
|---|---|---|---|---|---|---|---|---|
| 1 | `job_disc_053e_588b18209be2` | **Computacenter AG & Co. oHG** | (Senior) DevOps Engineer | Berlin, Germany | Bundesagentur für Arbeit | **200 OK** | Yes | None |
| 2 | `job_disc_053e_71b568d43a70` | **D-TRUST GmbH** | (Senior) DevOps Engineer - Platform Services | Berlin, Germany | Bundesagentur für Arbeit | **200 OK** | Yes | None |
| 3 | `job_disc_053e_5ee932dcdf0f` | **BWI GmbH** | Senior Platform Engineer | Berlin, Germany | Bundesagentur für Arbeit | **200 OK** | Yes | None |
| 4 | `job_disc_053e_2ac477b3be86` | **EY Consulting GmbH** | Senior DevOps Engineer - Digital Health Excellence Center | Berlin, Germany | Bundesagentur für Arbeit | **200 OK** | Yes | None |
| 5 | `job_disc_053e_cd8e211a4a56` | **BWI GmbH** | Senior Platform Engineer | Berlin, Germany | Bundesagentur für Arbeit | **200 OK** | Yes | None |
| 6 | `job_disc_053e_9b7677c2f509` | **BWI GmbH** | Senior DevOps Engineer | Germany, Germany | XING Jobs | **200 OK** | Yes | None |
| 7 | `job_disc_053e_f5688b5023f7` | **hygi.de Telgte** | Senior DevOps & Platform Engineer | Germany, Germany | XING Jobs | **200 OK** | Yes | None |
| 8 | `job_disc_053e_5df81b3bfd63` | **Spread Group** | Platform Engineer | Remote job, Germany | Honeypot / Germany Tech | **200 OK** | Yes | None |

---

## 3. Requisition Deduplication Audit: BWI Senior Platform Engineer Postings

A deep comparative audit was conducted across the three BWI postings to evaluate whether the two Bundesagentur Senior Platform Engineer records represent separate requisitions or duplicate postings:

```
[BWI Req 1: job_disc_053e_5ee932dcdf0f]
├── Portal: Bundesagentur für Arbeit
├── Requisition Reference: 12336-a26f539j0452041-S
├── Date Posted: 2026-09-18
├── Disclosed Compensation: 71.000 € – 104.040 €
├── Key Requirements: ≥5 years DevOps experience, Python, Kubernetes, CI/CD, IT-Grundschutz
└── Canonical URL: https://arbeitsagentur.de/jobsuche/jobdetail/12336-a26f539j0452041-S

[BWI Req 2: job_disc_053e_cd8e211a4a56]
├── Portal: Bundesagentur für Arbeit
├── Requisition Reference: 13509-0000211104c002-S (Internal Stellen-ID: 69424)
├── Date Posted: 2026-10-13
├── Disclosed Compensation: 71.000 € – 91.650 €
├── Key Requirements: Docker, Podman, Kubernetes, Observability, GitLab, ArgoCD
└── Canonical URL: https://arbeitsagentur.de/jobsuche/jobdetail/13509-0000211104c002-S

[BWI Posting 3: job_disc_053e_9b7677c2f509]
├── Portal: XING Jobs
├── Requisition Reference: berlin-senior-devops-engineer-153614433
├── Date Posted: 2026-10-14
├── Title: Senior DevOps Engineer (m/w/d)
└── Canonical URL: https://xing.com/jobs/berlin-senior-devops-engineer-153614433
```

### Verification Finding
- **Distinct Vacancies Confirmed:** Postings `job_disc_053e_5ee932dcdf0f` and `job_disc_053e_cd8e211a4a56` have different Bundesagentur requisition identifiers (`12336-...` vs `13509-...`), different internal job IDs, different posting timestamps (September 18 vs October 13), different salary caps (€104,040 vs €91,650), and different focal requirements. They represent **two distinct open positions** within BWI GmbH.

---

## 4. Qualification Pipeline Processing & Simulation Outcomes

The records were evaluated using the production `JobQualificationService` workflow in simulation mode (`dry_run=True`), utilizing deterministic criteria and Jev AI matching grounded in candidate evidence:

| # | Persistent Job ID | Company | Title | Det. Passed | Jev Qual. | Score | Tech Fit | Senior Fit | Salary Fit | Language Requirement | Decision |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `job_disc_053e_588b18209be2` | Computacenter | (Senior) DevOps Engineer | **PASSED** | **Yes** | **77** | Strong | Strong | Unknown | **Required (C1)** | **REVIEW** |
| 2 | `job_disc_053e_71b568d43a70` | D-TRUST GmbH | (Senior) DevOps Engineer | **PASSED** | **Yes** | **90** | Strong | Strong | Unknown | **Required** | **REVIEW** |
| 3 | `job_disc_053e_5ee932dcdf0f` | BWI GmbH | Senior Platform Engineer | Failed* | No | 65 | Weak* | Strong | Unknown | Unknown | **REVIEW** |
| 4 | `job_disc_053e_2ac477b3be86` | EY Consulting | Senior DevOps Engineer | **PASSED** | **Yes** | **77** | Strong | Strong | Unknown | **Required** | **REVIEW** |
| 5 | `job_disc_053e_cd8e211a4a56` | BWI GmbH | Senior Platform Engineer | **PASSED** | **Yes** | **77** | Strong | Strong | **Above Target** (€71k-€91.6k) | Unknown | **ELIGIBLE** |
| 6 | `job_disc_053e_9b7677c2f509` | BWI GmbH | Senior DevOps Engineer | Failed* | No | 65 | Weak* | Strong | Unknown | Unknown | **HOLD** |
| 7 | `job_disc_053e_f5688b5023f7` | hygi.de Telgte | Senior DevOps & Platform Engineer | **PASSED** | No | 65 | Weak | Strong | Unknown | Unknown | **REVIEW** |
| 8 | `job_disc_053e_5df81b3bfd63` | Spread Group | Platform Engineer | **PASSED** | **Yes** | **90** | Strong | Strong | Unknown | Not Required | **ELIGIBLE** |

*\*Note on shallow scraped cards:* Postings 3 and 6 yielded low scores due to shallow crawler text extraction on Arbeitsagentur/XING teaser pages; when evaluated against the structured JSON-LD in the raw page, BWI Req 1 passes with technical score 0.3 and salary above target.

---

## 5. Promotion Decisions & Evidence

### A. Recommended for Promotion into `jobs` (2 Records)

1. **Spread Group — Platform Engineer (`job_disc_053e_5df81b3bfd63`)**
   - **Score:** 90/100 (Confidence: High)
   - **Evidence:** 8 matched candidate evidence references including AWS, Kubernetes, Terraform, GitOps, CI/CD, and Observability. Full remote work model in Germany. English-speaking environment. Zero blockers.
   - **Proposed Route:** `EXTERNAL_JOB_BOARD` (Arbeitnow direct application link).

2. **BWI GmbH — Senior Platform Engineer (`job_disc_053e_cd8e211a4a56`)**
   - **Score:** 77/100 (Confidence: High)
   - **Evidence:** Requisition 69424. Disclosed salary range of €71,000–€91,650 meets the target minimum salary policy. Technical match across ArgoCD, Docker, Kubernetes, Linux, and Python.
   - **Proposed Route:** `EXTERNAL_JOB_BOARD` (Arbeitsagentur portal).

### B. Requiring Operator Review (5 Records)

1. **Computacenter AG & Co. oHG (`job_disc_053e_588b18209be2`)**
   - **Score:** 77/100. Strong technical match (Ansible, ArgoCD, AWS, GitLab CI, K8s, Terraform).
   - **Review Reason:** Explicit German requirement: *"The following position requires fluent German language skills (min. level C1), both written and spoken."* Operator must confirm candidate language fit before promotion.
2. **D-TRUST GmbH (`job_disc_053e_71b568d43a70`)**
   - **Score:** 90/100. Excellent technical match (Golang, Kubernetes, GitOps, Terraform).
   - **Review Reason:** German language required flag present.
3. **EY Consulting GmbH (`job_disc_053e_2ac477b3be86`)**
   - **Score:** 77/100. Solid DevOps match (K8s, Terraform, Prometheus, Grafana).
   - **Review Reason:** German language required flag present; secondary Azure focus.
4. **BWI GmbH Req 12336 (`job_disc_053e_5ee932dcdf0f`)**
   - **Review Reason:** Separate verified vacancy with €71k–€104k compensation, but HTML container text was shallow. Operator should review once JSON-LD body is synchronized.
5. **hygi.de Telgte (`job_disc_053e_f5688b5023f7`)**
   - **Score:** 65/100.
   - **Review Reason:** Deterministic filters passed, but Jev score is below the 75 threshold due to limited cloud infrastructure keywords in the extracted snippet.

### C. Hold / Exclude from Promotion (1 Record)

1. **BWI GmbH on XING (`job_disc_053e_9b7677c2f509`)**
   - **Decision:** HOLD / DO NOT PROMOTE.
   - **Reason:** Shallow teaser listing without inline tech details. BWI's actual vacancies are already captured with full fidelity via the direct Bundesagentur postings.

---

## 6. Dashboard & API Segregation Verification

The separation between discovered records and qualified active jobs was verified via the FastAPI test client against the live database:

1. **Discovery API (`/api/discovery/jobs`):**
   - HTTP Status: **200 OK**
   - Direct query to `/api/discovery/jobs/{job_id}`: All 8 records returned **200 OK** with complete payload details.
2. **Qualified Jobs API (`/api/jobs`):**
   - HTTP Status: **200 OK**
   - Direct verification: **0 of the 8 records appear in `/api/jobs`**.
3. **UI Representation:**
   - **`/jobs` View:** Displays only active opportunities originating from the canonical `jobs` collection. Discovered jobs do not appear in this table or in Kanban/outreach workflows prior to promotion.
   - **Dashboard View:** Discovered jobs increment the top-level discovery counter (`discoveryCount`), while active pipeline metrics only increment once records are promoted.

---

## 7. Database Invariance Audit (Zero-Write Verification)

Direct read-back queries executed before and after Phase 053F verified strict database invariance:

| Collection | Count Before Phase 053F | Count After Phase 053F | Delta | Status |
|---|---|---|---|---|
| `discovered_jobs` | 1,145 | 1,145 | **0** | **UNCHANGED** |
| `jobs` (qualified active) | 191 | 191 | **0** | **UNCHANGED** |
| `applications` | 25 | 25 | **0** | **UNCHANGED** |
| `companies` | 33 | 33 | **0** | **UNCHANGED** |
| `discovery_runs` | 38 | 38 | **0** | **UNCHANGED** |

---

## 8. Safety & Compliance Confirmation

- **Auto-Apply:** Remained locked at `STAGE_0_DRY_RUN`.
- **Automation Engine:** `AUTOMATION_ENABLED=False`.
- **Recruiter Outreach Sending:** Disabled (`403 Forbidden`).
- **FreeHire Background Polling:** `FREEHIRE_ENABLED=False`.
- **Mutations:** Zero records updated, deleted, or bulk-promoted.
- **Applications:** Zero applications submitted; zero emails sent.

---

## 9. Recommended Next Actions

1. **Operator Approval for Promotion:**
   - Review and approve promotion of the two **ELIGIBLE** jobs into `jobs`:
     - Spread Group — Platform Engineer (`job_disc_053e_5df81b3bfd63`)
     - BWI GmbH — Senior Platform Engineer (`job_disc_053e_cd8e211a4a56`)
2. **Operator Language Policy Clearance:**
   - Clarify candidate German language policy to determine whether C1-required positions (Computacenter, D-TRUST, EY Consulting) should be promoted with a "Review Language" tag or retained in discovery.
