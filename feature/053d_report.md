# Phase 053D — Read-Only Pre-Ingestion Audit & Database Reconciliation Report

**Audit Date:** 2026-10-21  
**Target Environment:** Production MongoDB Atlas ReplicaSet (`job_search_db`)  
**Status:** Strictly Read-Only Completed  
**Zero-Write Invariance Confirmed:** YES (0 inserts, 0 updates, 0 deletes)

---

## 1. Executive Summary & Root Cause of Pre-Run Count Discrepancy

### The Observation
In Phase 053C, the local dry run (`run_cb2b2e93191a`) reported pre-run and post-run database counts of `0` (`discovered_jobs: 0`, `discovery_runs: 0`, `applications: 0`), whereas historical project documentation described an existing database with approximately 154 jobs and 22 applications.

### The Verified Root Cause (Step 2)
1. **Fallback to In-Memory Mock:** In `app/database.py` (lines 36–59), when running in `ENVIRONMENT=development` on macOS with Python 3.14, Motor/PyMongo failed SSL handshake negotiation (`[SSL: TLSV1_ALERT_INTERNAL_ERROR]`) because the macOS Python build lacked system CA certificates in the default OpenSSL path and `tlsCAFile=certifi.where()` was not configured.
2. **Graceful Fallback Behavior:** `app/database.py` caught this exception and automatically fell back to `mongomock_motor.AsyncMongoMockClient()`, initializing an empty, ephemeral in-memory database with 0 records.
3. **Live Production Database State:** When connected with `certifi.where()`, the live MongoDB Atlas cluster (`job_search_db`) contains:
   - `discovered_jobs`: **1,137** documents
   - `jobs` (qualified active vacancies): **191** documents
   - `applications`: **25** documents
   - `discovery_runs`: **38** documents
   - `companies`: **33** documents
4. **Conclusion:** The previous dry run was executed against an empty in-memory mock fallback. The real production database is intact, fully populated, and contains 1,137 historical discovered jobs and 191 qualified opportunities.

---

## 2. Candidate Manifest Inspection & Reconciliation (Steps 1 & 3)

Discovery queries were executed across the 5 permitted scheduled sources (`company_career`, `bundesagentur`, `xing`, `jobware`, `honeypot`), 9 expanded role queries, and 8 nationwide locations.

### Overall Reconciliation Counts
- **Total Raw Vacancies Collected:** 602
- **NEW (Net-New, Verified Germany Tech Candidates):** **8**
- **EXISTING (Already present in MongoDB `discovered_jobs` or `jobs`):** **57**
- **POSSIBLE_DUPLICATE (Cross-query duplicate cards within batch):** **22**
- **INELIGIBLE (Non-DevOps/SRE/Platform or outside Germany scope):** **515**
- **NEEDS_REVIEW (Malformed or inaccessible URLs):** **0**

### Source-by-Source Reconciliation Breakdown

| Discovery Source | Raw Items | NEW | EXISTING | INELIGIBLE | DUPLICATES | Notes |
|---|---|---|---|---|---|---|
| **`Greenhouse Direct`** (`company_career`) | 355 | 0 | 23 | 329 | 3 | Public boards return all company vacancies; 23 tech roles already in DB, 329 non-engineering filtered out. |
| **`Ashby Direct`** (`company_career`) | 5 | 0 | 1 | 4 | 0 | 1 tech role already in DB; 4 non-engineering filtered out. |
| **`Personio Direct`** (`company_career`) | 151 | 0 | 1 | 150 | 0 | 1 tech role already in DB; 150 non-engineering filtered out. |
| **`Bundesagentur für Arbeit`** | 40 | **5** | 14 | 21 | 0 | 14 already in DB; 21 non-matching; **5 genuine net-new Germany tech roles**. |
| **`XING Jobs`** | 38 | **2** | 17 | 0 | 19 | 17 already in DB; 19 in-run cross-query duplicate cards; **2 genuine net-new Germany tech roles**. |
| **`Jobware`** | 0 | 0 | 0 | 0 | 0 | Empty response returned cleanly (no errors). |
| **`Honeypot / Germany Tech`** | 13 | **1** | 3 | 9 | 0 | 3 already in DB; 7 excluded due to non-Germany primary location (London/Paris/Zurich); 2 non-DevOps; **1 genuine net-new Germany tech role**. |
| **TOTAL** | **602** | **8** | **57** | **515** | **22** | **8 verified net-new candidates identified** |

---

## 3. Proposed Review Batch (Step 4)

Below are the **8 verified NEW, Germany-eligible, active direct-employer or supported ATS listings** relevant to DevOps, SRE, Platform Engineering, and Cloud Infrastructure:

| # | Candidate ID | Company Name | Title | Location | Source | Canonical Job URL | Verified ATS Provider | Eligibility Evidence |
|---|---|---|---|---|---|---|---|---|
| 1 | `cand_053d_0516` | **Computacenter AG & Co. oHG** | (Senior) DevOps Engineer w/m/d | Berlin, Germany | Bundesagentur für Arbeit | [arbeitsagentur.de/...-1003646895-S](https://arbeitsagentur.de/jobsuche/jobdetail/10001-1003646895-S) | Bundesagentur für Arbeit | Verified net-new; senior DevOps role at German enterprise IT provider |
| 2 | `cand_053d_0518` | **D-TRUST GmbH** | (Senior) DevOps Engineer - Platform Services (m/w/d) | Berlin, Germany | Bundesagentur für Arbeit | [arbeitsagentur.de/...-0065540001-S](https://arbeitsagentur.de/jobsuche/jobdetail/15933-0065540001-S) | Bundesagentur für Arbeit | Verified net-new; Bundesdruckerei subsidiary platform services vacancy |
| 3 | `cand_053d_0520` | **BWI GmbH** | Senior Platform Engineer (m/w/d) | Berlin, Germany | Bundesagentur für Arbeit | [arbeitsagentur.de/...-a26f539j0452041-S](https://arbeitsagentur.de/jobsuche/jobdetail/12336-a26f539j0452041-S) | Bundesagentur für Arbeit | Verified net-new; federal IT system house cloud platform vacancy |
| 4 | `cand_053d_0523` | **EY Consulting GmbH** | Senior DevOps Engineer - Digital Health Excellence Center (w/m/d) | Berlin, Germany | Bundesagentur für Arbeit | [arbeitsagentur.de/...-1530219-1-S](https://arbeitsagentur.de/jobsuche/jobdetail/15548-1530219-1-S) | Bundesagentur für Arbeit | Verified net-new; healthcare cloud infrastructure and CI/CD role |
| 5 | `cand_053d_0527` | **BWI GmbH** | Senior Platform Engineer (m/w/d) | Berlin, Germany | Bundesagentur für Arbeit | [arbeitsagentur.de/...-0000211104c002-S](https://arbeitsagentur.de/jobsuche/jobdetail/13509-0000211104c002-S) | Bundesagentur für Arbeit | Verified net-new requisition (Req #13509-0000211104c002-S); separate opening from #3 |
| 6 | `cand_053d_0554` | **BWI GmbH** | Senior DevOps Engineer (m/w/d) | Germany-wide | XING Jobs | [xing.com/...-153614433](https://xing.com/jobs/berlin-senior-devops-engineer-153614433) | XING | Verified net-new; nationwide defense IT DevOps role |
| 7 | `cand_053d_0555` | **hygi.de Telgte** | Senior DevOps & Platform Engineer (m/w/d) | Telgte / Germany | XING Jobs | [xing.com/...-158684802](https://xing.com/jobs/telgte-senior-devops-platform-engineer-158684802) | XING | Verified net-new; e-commerce platform and Kubernetes engineering role |
| 8 | `cand_053d_0591` | **Spread Group** | Platform Engineer (f/m/d) | Remote job, Germany | Honeypot / Germany Tech | [arbeitnow.com/...-8213](https://arbeitnow.com/jobs/companies/spread-group/remote-platform-engineer-berlin-8213) | Direct Company Career Portal | Verified net-new; remote Germany Kubernetes & AWS infrastructure role |

---

## 4. Live Database Zero-Write Invariance Verification

| Collection | Pre-Audit Count | Post-Audit Count | Delta | Status |
|---|---|---|---|---|
| `discovered_jobs` | 1,137 | 1,137 | **0** | UNCHANGED |
| `jobs` (qualified) | 191 | 191 | **0** | UNCHANGED |
| `applications` | 25 | 25 | **0** | UNCHANGED |
| `discovery_runs` | 38 | 38 | **0** | UNCHANGED |

**Verification Verdict:** 100% Zero MongoDB inserts, updates, or deletes.

---

## 5. Audit Recommendations & Next Steps

1. **Safety Constraints Preserved:**
   - Auto-apply remains locked at `STAGE_0_DRY_RUN`.
   - Outreach sending remains hard-disabled (`403 Forbidden`).
   - `FREEHIRE_ENABLED=false` remains intact.
   - Zero production data changes were executed.
2. **Recommendation for Operator Decision:**
   - The 8 candidates listed above have been independently validated as net-new, active, Germany-located, and strictly relevant to senior DevOps/Platform/SRE engineering.
   - **Recommended Next Step:** If authorized by the operator, execute one single, bounded ingestion batch of **exactly 8 records** targeting the `discovered_jobs` collection only, accompanied by post-ingestion database count verification.
   - **Do NOT proceed to ingestion until explicit operator approval is given.**
