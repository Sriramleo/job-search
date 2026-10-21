# Phase 053H — Controlled Spread Group Promotion & BWI Source Linking Plan

**Date:** 2026-10-21  
**Target Environment:** MongoDB Atlas ReplicaSet (`job_search_db`, MongoDB v8.0.34)  
**Execution Readiness Status:** **READ-ONLY AUDIT COMPLETE — ZERO WRITES PERFORMED — AWAITING EXPLICIT OPERATOR CONFIRMATION**

---

## 1. Repository & Runtime Code Inspection

The runtime code paths across `job-search-api` at commit `41520b4` were inspected:

1. **`JobQualificationService.run_qualification` ([`app/qualification/service.py:142`](file:///Users/sriram/Documents/AI-Project/job-search-api/app/qualification/service.py#L142)):**
   - Calls `DeterministicFilter.evaluate` and `JevQualificationClient.qualify`.
   - Executes deduplication matching hierarchy against `JobRepository`:
     - Level 1: `source_job_id`
     - Level 2: `canonical_url`
     - Level 3: `discovered_job_id`
     - Level 4: `source_url`
     - Level 5: `(company_name, title)`
   - On match, sets `job_id = existing_job["id"]` and performs `upsert_job`.
   - **Crucial finding:** If `run_qualification` were executed naively against BWI, it would mutate the existing qualified job document (overwriting source metadata and potentially salary fields). Therefore, generic batch qualification must NOT be used for BWI; a surgical source-link update must be used.
2. **`JobRepository.upsert_job` ([`app/repositories/job_repo.py:298`](file:///Users/sriram/Documents/AI-Project/job-search-api/app/repositories/job_repo.py#L298)):**
   - Executes `await self.collection.update_one({"id": job_id}, {"$set": doc}, upsert=True)`.
   - Atomic at document level in MongoDB.
   - Enforces unique index `id_unique_idx` on `jobs.id`.
3. **`DiscoveredJobRepository` ([`app/repositories/discovered_job_repo.py`](file:///Users/sriram/Documents/AI-Project/job-search-api/app/repositories/discovered_job_repo.py)):**
   - Supports `append_source_appearance` using atomic `$addToSet` on `sourceAppearances` and `source_appearances`.
   - Base `update` method updates status fields via atomic `$set`.
4. **Downstream Hooks & Automation:**
   - `AUTOMATION_ENABLED = False` (confirmed).
   - `STAGE_0_DRY_RUN = True` (confirmed).
   - `FREEHIRE_ENABLED = False` (confirmed).
   - Zero application creation hooks or outreach triggers exist in `job_repo` or `discovered_job_repo`.

---

## 2. Read-Only Preflight & Production Verification

Live inspection against MongoDB Atlas (`job_search_db`) at 12:46 UTC confirmed:

1. **Both Discovered-Job Records Exist & Intact:**
   - `job_disc_053e_5df81b3bfd63` (Spread Group): Present in `discovered_jobs`, unpromoted (`qualifiedStatus: null`).
   - `job_disc_053e_cd8e211a4a56` (BWI GmbH): Present in `discovered_jobs`, unpromoted (`qualifiedStatus: null`).
2. **Live URL Reachability:**
   - Spread Group canonical URL ([arbeitnow.com/...-8213](https://arbeitnow.com/jobs/companies/spread-group/remote-platform-engineer-berlin-8213)): **HTTP 200 OK** (Active, remote in Germany).
   - BWI Bundesagentur canonical URL ([arbeitsagentur.de/...-S](https://arbeitsagentur.de/jobsuche/jobdetail/13509-0000211104c002-S)): **HTTP 200 OK** (Active, Stellen-ID 69424).
   - Existing BWI LinkedIn job URL ([de.linkedin.com/jobs/view/...-4454306786](https://de.linkedin.com/jobs/view/senior-platform-engineer-m-w-d-at-bwi-gmbh-4454306786)): **HTTP 200 OK** (Active).
3. **Duplicate Check Results:**
   - **Spread Group:** **0 matches in `jobs`**. 100% net-new vacancy.
   - **BWI GmbH:** Exactly 1 matching record in `jobs`: `job-qual-job_disc_f625d2a4840e` representing internal Stellen-ID 69424.
4. **Current Collection Counts:**
   - `discovered_jobs`: **1,145**
   - `jobs`: **191**
   - `applications`: **25**
   - `companies`: **33**
   - `discovery_runs`: **38**

---

## 3. Exact Proposed Database Operations

### Operation A: Spread Group Promotion

**1. Target Document to Insert (`job_search_db.jobs`):**
- **Filter/Key:** `{"id": "job-qual-job_disc_053e_5df81b3bfd63"}`
- **Operation:** `update_one({"id": "job-qual-job_disc_053e_5df81b3bfd63"}, {"$set": <doc>}, upsert=True)`
- **Exact Inserted Fields:**
  - `id`: `"job-qual-job_disc_053e_5df81b3bfd63"`
  - `title`: `"Platform Engineer"`
  - `companyId`: `"comp-spread-group"`
  - `companyName`: `"Spread Group"`
  - `location`: `"Remote job, Germany"`
  - `workModel`: `"Remote"`
  - `seniority`: `"Senior"`
  - `salaryRaw`: `null`
  - `salaryMin`: `null`
  - `salaryMax`: `null`
  - `salaryCurrency`: `"EUR"`
  - `technicalFit`: `"Strong"`
  - `seniorLeadFit`: `"Strong"`
  - `salaryFit`: `"unknown"`
  - `applicationReadiness`: `"Strong"`
  - `relocationStatus`: `"Unknown"`
  - `relocationSummary`: `"Relocation status: unknown"`
  - `germanRequirement`: `"Not Required"`
  - `applicationRoute`: `"external_job_board"`
  - `routeReason`: `"Discovered via Honeypot / Germany Tech."`
  - `status`: `"Qualified"`
  - `postedDate`: `"2026-10-21"`
  - `source`: `"Honeypot / Germany Tech"`
  - `sourceUrl`: `"https://arbeitnow.com/jobs/companies/spread-group/remote-platform-engineer-berlin-8213"`
  - `applicationUrl`: `"https://arbeitnow.com/jobs/companies/spread-group/remote-platform-engineer-berlin-8213"`
  - `keySkills`: `["AWS", "Kubernetes", "Terraform", "GitOps", "CI/CD", "Observability", "Linux", "Go", "Python"]`
  - `description`: `<Enriched 5,068-character job posting text>`
  - `whyMatchesProfile`: `{"title": "Why this role matches your profile", "points": [...]}`
  - `requirements`: `[4 grounded JobRequirement items matching ce-01, ce-02, ce-03, ce-04]`
  - `gaps`: `[JobGap(skill="Position mentions KAFKA...", type="Adjacent Tooling", ...)]`
  - `applicationRequirements`: `{"germanRequirement": "Not Requested", ...}`
  - `timeline`: `[]`
  - `discoveredJobId`: `"job_disc_053e_5df81b3bfd63"`
  - `evidenceReferences`: `["ce-01", "ce-02", "ce-03", "ce-04"]`
  - `qualificationResult`: `<JevQualificationResult dict with score 90>`
  - `qualificationTimestamp`: `<current_iso_timestamp>`
  - `qualificationVersion`: `"v1.0.0"`
  - `atsType`: `"Unknown"`
  - `verificationStatus`: `"UNKNOWN"`
  - `applicationType`: `"External Job Board"`
  - `fitScore`: `90`
  - `germanyEligible`: `true`

**2. Target Document to Update (`job_search_db.discovered_jobs`):**
- **Filter:** `{"id": "job_disc_053e_5df81b3bfd63"}`
- **Operation:**
  ```json
  {
    "$set": {
      "qualifiedJobId": "job-qual-job_disc_053e_5df81b3bfd63",
      "qualified_job_id": "job-qual-job_disc_053e_5df81b3bfd63",
      "qualifiedStatus": "qualified",
      "qualified_status": "qualified",
      "qualificationTimestamp": "<iso_timestamp>",
      "qualificationReason": "Grounded Jev qualification passed (score 90/100, Remote Germany)"
    }
  }
  ```
- **Fields Remaining Unchanged on Discovered Record:** All other fields (`canonicalUrl`, `companyName`, `title`, `fingerprint`, `sourceAppearances`, `description`, metadata) remain 100% untouched.

---

### Operation B: BWI GmbH Source Linking

**1. Target Document in `job_search_db.jobs` (`job-qual-job_disc_f625d2a4840e`):**
- **MUTATIONS:** **ZERO FIELD CHANGES (Strictly 0 writes to `jobs`).**
- **Salary Fields:** `salaryRaw: null`, `salaryMin: null`, `salaryMax: null`, `salaryFit: "unknown"` remain **100% UNTOUCHED**.
- **All other fields:** `title`, `description`, `source`, `sourceUrl`, `requirements`, etc. remain **100% UNTOUCHED**.

**2. Target Document in `job_search_db.discovered_jobs` (`job_disc_053e_cd8e211a4a56`):**
- **Filter:** `{"id": "job_disc_053e_cd8e211a4a56"}`
- **Operation:**
  ```json
  {
    "$set": {
      "qualifiedJobId": "job-qual-job_disc_f625d2a4840e",
      "qualified_job_id": "job-qual-job_disc_f625d2a4840e",
      "qualifiedStatus": "qualified",
      "qualified_status": "qualified",
      "qualificationTimestamp": "<iso_timestamp>",
      "qualificationReason": "Linked to existing qualified vacancy for Stellen-ID 69424 (job-qual-job_disc_f625d2a4840e)"
    }
  }
  ```

**3. Target Document in `job_search_db.discovered_jobs` (`job_disc_f625d2a4840e`):**
- **Filter:** `{"id": "job_disc_f625d2a4840e"}`
- **Operation:** Append Bundesagentur appearance to `sourceAppearances` / `source_appearances`:
  ```json
  {
    "$addToSet": {
      "sourceAppearances": {
        "source": "Bundesagentur für Arbeit",
        "url": "https://arbeitsagentur.de/jobsuche/jobdetail/13509-0000211104c002-S",
        "discoveredAt": "2026-10-21T12:10:21.458447+00:00"
      },
      "source_appearances": {
        "source": "Bundesagentur für Arbeit",
        "url": "https://arbeitsagentur.de/jobsuche/jobdetail/13509-0000211104c002-S",
        "discoveredAt": "2026-10-21T12:10:21.458447+00:00"
      }
    }
  }
  ```

---

## 4. Concurrency, Idempotency & Rollback Analysis

1. **Duplicate Prevention Under Concurrency:**
   - Unique index `id_unique_idx` on `jobs.id` prevents concurrent insertion collisions.
   - For BWI, zero records are inserted into `jobs`, preventing vacancy inflation.
2. **Atomicity & Retry Safety:**
   - All update operations are atomic single-document updates.
   - Operations are safe to retry idempotently without side effects.
3. **Rollback Procedures:**
   - **Spread Group Rollback:**
     ```javascript
     await db.jobs.deleteOne({ id: "job-qual-job_disc_053e_5df81b3bfd63" });
     await db.discovered_jobs.updateOne(
       { id: "job_disc_053e_5df81b3bfd63" },
       { $unset: { qualifiedJobId: "", qualified_job_id: "", qualifiedStatus: "", qualified_status: "", qualificationTimestamp: "", qualificationReason: "" } }
     );
     ```
   - **BWI Linkage Rollback:**
     ```javascript
     await db.discovered_jobs.updateOne(
       { id: "job_disc_053e_cd8e211a4a56" },
       { $unset: { qualifiedJobId: "", qualified_job_id: "", qualifiedStatus: "", qualified_status: "", qualificationTimestamp: "", qualificationReason: "" } }
     );
     await db.discovered_jobs.updateOne(
       { id: "job_disc_f625d2a4840e" },
       { $pull: { sourceAppearances: { url: "https://arbeitsagentur.de/jobsuche/jobdetail/13509-0000211104c002-S" }, source_appearances: { url: "https://arbeitsagentur.de/jobsuche/jobdetail/13509-0000211104c002-S" } } }
     );
     ```
     *(The qualified record `job-qual-job_disc_f625d2a4840e` in `jobs` was never modified, requiring zero rollback).*

---

## 5. Expected Post-Execution State

| Collection | Current Count (Verified) | Expected After Approved Execution | Delta |
|---|---:|---:|---:|
| `jobs` (qualified active) | 191 | **192** | **+1** (Spread Group only) |
| `discovered_jobs` | 1,145 | **1,145** | **0** (Status & appearance updates) |
| `applications` | 25 | **25** | **0** (Unchanged) |
| `companies` | 33 | **33** | **0** (Unchanged) |
| `discovery_runs` | 38 | **38** | **0** (Unchanged) |

---

## 6. Safety Confirmation & Explicit Stop

- `STAGE_0_DRY_RUN` remains enabled.
- `AUTOMATION_ENABLED = False`.
- `FREEHIRE_ENABLED = False`.
- Recruiter outreach sending remains hard-disabled (`403 Forbidden`).
- Zero applications or messages created or submitted.
- Zero BWI salary fields modified.
- Zero production database writes executed during Phase 053H.
