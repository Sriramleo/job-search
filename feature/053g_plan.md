# Phase 053G — Controlled Promotion Execution Plan & Pre-Write Audit

**Date:** 2026-10-21  
**Target Environment:** MongoDB Atlas ReplicaSet (`job_search_db`, MongoDB v8.0.34)  
**Status:** **PLANNING & VALIDATION COMPLETE — AWAITING OPERATOR APPROVAL**  
**Authorization Scope:** Preparation and validation only. **Zero production writes performed.**

---

## 1. Executive Summary

Phase 053G evaluates the controlled promotion of the two records recommended by the Phase 053F report:
1. **Spread Group — Platform Engineer** (`job_disc_053e_5df81b3bfd63`), Score: 90/100, Remote Germany
2. **BWI GmbH — Senior Platform Engineer** (`job_disc_053e_cd8e211a4a56`), Score: 77/100, Requisition 13509-0000211104c002-S / Stellen-ID 69424

### Critical Revalidation Finding
- **Spread Group (`job_disc_053e_5df81b3bfd63`)** is **100% net-new**: Zero duplicate records exist in `jobs` or `discovered_jobs` by ID, discoveredJobId, canonical URL, or company + title.
- **BWI GmbH (`job_disc_053e_cd8e211a4a56`)**: While distinct from BWI Req 1 (`12336-...`), deep duplicate revalidation revealed that **Stellen-ID 69424 is already present in `jobs`** under ID `job-qual-job_disc_f625d2a4840e` (qualified on 2026-10-04 via its LinkedIn syndication `https://de.linkedin.com/jobs/view/4454306786`).
- Promoting BWI as a separate document `job-qual-job_disc_053e_cd8e211a4a56` would create an intentional duplicate opening in `jobs`. Promoting via production `JobQualificationService` merges into the existing record `job-qual-job_disc_f625d2a4840e`.

---

## 2. Step 1 — Revalidation Audit Results

Direct inspection of the live MongoDB Atlas database (`job_search_db`) and live HTTP checks yielded:

| Candidate | Source Record ID | Company | Title | Canonical URL | HTTP Status | Active | Duplicate Check in `jobs` | Jev Score | Language Requirement |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `job_disc_053e_5df81b3bfd63` | Spread Group | Platform Engineer | [arbeitnow.com/...-8213](https://arbeitnow.com/jobs/companies/spread-group/remote-platform-engineer-berlin-8213) | **200 OK** | Yes | **0 Matches (Net-New)** | **90/100** | Not Required (English) |
| 2 | `job_disc_053e_cd8e211a4a56` | BWI GmbH | Senior Platform Engineer | [arbeitsagentur.de/...-S](https://arbeitsagentur.de/jobsuche/jobdetail/13509-0000211104c002-S) | **200 OK** | Yes | **Match Found: `job-qual-job_disc_f625d2a4840e` (Stellen-ID 69424)** | **77/100** | Unknown |

### Revalidation Observations
1. **Spread Group Link & Content:** Fully active HTTP 200 GET, rich description (5,068 chars). Matches AWS, Kubernetes, Terraform, GitOps, CI/CD, and Observability with 8 verified evidence references (`ce-01`, `ce-02`, `ce-03`, `ce-04`).
2. **BWI GmbH Requisition Details:** Bundesagentur posting `13509-0000211104c002-S` specifies internal *Stellen-ID: 69424*. This exact Stellen-ID is already documented in the description of active qualified job `job-qual-job_disc_f625d2a4840e` from its LinkedIn appearance.

---

## 3. Step 2 — Promotion Side Effects & Downstream Trace

The promotion pipeline executes via `JobQualificationService.run_qualification` / `JobRepository.upsert_job`.

### Detailed Downstream Side Effect Analysis:

```
Discovered Job Record (`discovered_jobs`)
         │
         ▼
[Deterministic Gate & Jev Qualification]
         │
         ▼
[Deduplication Hierarchy Check in `jobs`]
 ├── Match Found (e.g. BWI Stellen-ID 69424) ──► Updates existing `jobs` doc + updates `discovered_jobs` status
 └── No Match Found (e.g. Spread Group)     ──► Inserts new `jobs` doc + updates `discovered_jobs` status
```

1. **Collections Touched:**
   - `jobs`: Upsert of qualified job document (1 new document if Spread Group is promoted; 0 new documents if BWI is merged into existing record).
   - `discovered_jobs`: Updating the source discovered job document with:
     - `qualified_status = "qualified"` / `qualifiedStatus = "qualified"`
     - `qualified_job_id = "<job_id>"` / `qualifiedJobId = "<job_id>"`
     - `qualification_timestamp = "<iso_timestamp>"`
2. **Collections NOT Touched (Zero Side Effects):**
   - `applications`: **0 writes**. Promotion does not create application entities.
   - `outreach_campaigns` / `communications`: **0 writes**. Outreach generation and sending are hard-disabled (`403 Forbidden`).
   - `companies`: **0 writes**.
   - `discovery_runs`: **0 writes**.
3. **Background Automation & Scheduling:**
   - `AUTOMATION_ENABLED = False` (confirmed).
   - `STAGE_0_DRY_RUN = True` (confirmed).
   - `FREEHIRE_ENABLED = False` (confirmed).
   - No background worker or webhook is triggered by this write.
4. **Index & Idempotency Compliance:**
   - Index `id_unique_idx` on `jobs.id` is respected via `upsert=True` on `id`.
   - Index `discoveredJobId` on `jobs` is populated.
   - Operation is strictly idempotent: re-running produces identical state.

---

## 4. Step 3 — Candidate-by-Candidate Execution Plan

### Candidate 1: Spread Group — Platform Engineer

- **Source Discovered Job ID:** `job_disc_053e_5df81b3bfd63`
- **Proposed Qualified Job ID:** `job-qual-job_disc_053e_5df81b3bfd63`
- **Company Name:** Spread Group
- **Title:** Platform Engineer
- **Location:** Remote job, Germany
- **Work Model:** Remote
- **Seniority:** Senior
- **Salary Fit:** Unknown (undisclosed)
- **Technical Fit:** Strong (Score: 90/100, Confidence: High)
- **Senior/Lead Fit:** Strong
- **German Requirement:** Not Required (English)
- **Application Route:** `EXTERNAL_JOB_BOARD` (Arbeitnow link: `https://arbeitnow.com/jobs/companies/spread-group/remote-platform-engineer-berlin-8213`)
- **Key Skills:** AWS, Kubernetes, Terraform, GitOps, CI/CD, Observability, Linux, Go, Python
- **Evidence References:** `ce-01`, `ce-02`, `ce-03`, `ce-04`
- **Status:** `Qualified`

#### Proposed Database Mutation for Spread Group:
1. **Insert into `job_search_db.jobs`:**
```json
{
  "id": "job-qual-job_disc_053e_5df81b3bfd63",
  "title": "Platform Engineer",
  "companyId": "comp-spread-group",
  "companyName": "Spread Group",
  "location": "Remote job, Germany",
  "workModel": "Remote",
  "seniority": "Senior",
  "salaryRaw": null,
  "salaryMin": null,
  "salaryMax": null,
  "salaryCurrency": "EUR",
  "technicalFit": "Strong",
  "seniorLeadFit": "Strong",
  "salaryFit": "unknown",
  "applicationReadiness": "Strong",
  "relocationStatus": "Unknown",
  "relocationSummary": "Relocation status: unknown",
  "germanRequirement": "Not Required",
  "applicationRoute": "external_job_board",
  "routeReason": "Discovered via Honeypot / Germany Tech.",
  "status": "Qualified",
  "postedDate": "2026-10-21",
  "source": "Honeypot / Germany Tech",
  "sourceUrl": "https://arbeitnow.com/jobs/companies/spread-group/remote-platform-engineer-berlin-8213",
  "applicationUrl": "https://arbeitnow.com/jobs/companies/spread-group/remote-platform-engineer-berlin-8213",
  "keySkills": ["AWS", "Kubernetes", "Terraform", "GitOps", "CI/CD", "Observability", "Linux", "Go", "Python"],
  "description": "<Enriched 5,068-character text from Arbeitnow>",
  "discoveredJobId": "job_disc_053e_5df81b3bfd63",
  "evidenceReferences": ["ce-01", "ce-02", "ce-03", "ce-04"],
  "qualificationResult": { ... },
  "qualificationTimestamp": "2026-10-21T...",
  "qualificationVersion": "v1.0.0"
}
```

2. **Update in `job_search_db.discovered_jobs` (`id: "job_disc_053e_5df81b3bfd63"`):**
```json
{
  "$set": {
    "qualifiedJobId": "job-qual-job_disc_053e_5df81b3bfd63",
    "qualified_job_id": "job-qual-job_disc_053e_5df81b3bfd63",
    "qualifiedStatus": "qualified",
    "qualified_status": "qualified",
    "qualificationTimestamp": "2026-10-21T..."
  }
}
```

---

### Candidate 2: BWI GmbH — Senior Platform Engineer

- **Source Discovered Job ID:** `job_disc_053e_cd8e211a4a56`
- **Requisition Reference:** `13509-0000211104c002-S` (Stellen-ID: 69424)
- **Existing Matched Qualified Job:** `job-qual-job_disc_f625d2a4840e` (Stellen-ID: 69424)
- **Tradeoff & Options:**
  - **Option A (Recommended):** Promote **Spread Group only** in Phase 053G. For BWI Stellen-ID 69424, link `job_disc_053e_cd8e211a4a56` to the existing qualified record `job-qual-job_disc_f625d2a4840e` as a multi-source appearance (Bundesagentur + LinkedIn) without inserting a duplicate document into `jobs`.
  - **Option B:** Re-qualify and enrich the existing record `job-qual-job_disc_f625d2a4840e` using the Bundesagentur data (updates salary band €71k–€91.6k and verified tech score to 77/100).
  - **Option C:** Force a separate document `job-qual-job_disc_053e_cd8e211a4a56` into `jobs`. (Not recommended: causes duplicate vacancy in active pipeline).

---

## 5. Rollback Strategy

If rollback is required after execution:
1. **Remove Qualified Record:**
   ```javascript
   db.jobs.deleteOne({ id: "job-qual-job_disc_053e_5df81b3bfd63" })
   ```
2. **Revert Discovered Job Status:**
   ```javascript
   db.discovered_jobs.updateOne(
     { id: "job_disc_053e_5df81b3bfd63" },
     {
       $unset: {
         qualifiedJobId: "",
         qualified_job_id: "",
         qualifiedStatus: "",
         qualified_status: "",
         qualificationTimestamp: ""
       }
     }
   )
   ```
3. Verification: Collection counts immediately return to: `jobs: 191`, `discovered_jobs: 1,145`.

---

## 6. Pre- and Post-Execution Collection Counts

### If Spread Group is promoted & BWI is linked to existing qualified record:
| Collection | Pre-Execution Count | Expected Post-Execution Count | Expected Delta | Notes |
|---|---|---|---|---|
| `jobs` (qualified active) | 191 | **192** | **+1** | Exactly 1 new record (Spread Group) |
| `discovered_jobs` | 1,145 | **1,145** | **0** | Status fields updated on source doc(s) |
| `applications` | 25 | **25** | **0** | Strictly unchanged |
| `companies` | 33 | **33** | **0** | Strictly unchanged |
| `discovery_runs` | 38 | **38** | **0** | Strictly unchanged |

---

## 7. Safety Constraints Verification

- **MongoDB Writes:** **0 writes executed** during Phase 053G preparation.
- **Auto-Apply:** Stays at `STAGE_0_DRY_RUN`.
- **Automation Engine:** `AUTOMATION_ENABLED=False`.
- **Recruiter Outreach:** Sending hard-disabled (`403 Forbidden`).
- **FreeHire Discovery:** `FREEHIRE_ENABLED=False`.
- **Applications:** Zero applications created or submitted.

---

## 8. Request for Operator Approval

To proceed with live database promotion writes, please confirm:
1. **Approve Promotion of Spread Group (`job_disc_053e_5df81b3bfd63`)** into `jobs` collection (+1 record).
2. **Approve BWI Stellen-ID 69424 Handling:**
   - *Option A (Recommended):* Link `job_disc_053e_cd8e211a4a56` to existing `job-qual-job_disc_f625d2a4840e` and enrich its salary (€71k-€91.6k) without creating a duplicate job.
   - *Option C:* Force a distinct second record `job-qual-job_disc_053e_cd8e211a4a56` into `jobs` (+1 record, resulting in 193 jobs).
