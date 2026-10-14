# German Job Search Dashboard — Remaining Phase Roadmap

**Updated:** 2026-10-14  
**Repository:** `Sriramleo/job-search`  
**Purpose:** One place to track the remaining planned work after Phase 043. Phase reports and live production must be checked before treating any historical numbers as current.

## Status summary

| Phase | Prompt | Status | Gate |
|---|---|---|---|
| 044 | [Recruiter Outreach Agent Backlog](044-recruiter-outreach-agent-backlog.md) | Backlog/design only | No implementation or sending authorization |
| 045 | [Job Discovery Quality & Freshness](045-job-discovery-quality-and-freshness.md) | Ready for implementation | Baseline and scheduler inspection first |
| 046 | [Non-Destructive Job-ID Reconciliation](046-non-destructive-job-id-reconciliation.md) | Audit/plan first | Production migration requires separate explicit go/no-go |
| 047 | [Recruiter Outreach Agent](047-recruiter-outreach-agent.md) | Ready for research-and-draft implementation | Real outbound sending disabled |
| 048 | [End-to-End Production Reliability Audit](048-end-to-end-production-reliability-audit.md) | Planned | Run after 045–047 completion evidence |

## Recommended execution order

1. **Phase 045:** Measure and improve official careers-page discovery and bounded freshness. This improves the job pool and confirms scheduler behavior before data migration.
2. **Phase 046:** Audit and plan duplicate custom-ID reconciliation. Run the dry-run manifest and tests before requesting approval for production writes.
3. **Phase 047:** Implement recruiter/contact research and draft review. No real email sending, no new send scopes, no changes to Gmail read-only permissions.
4. **Phase 048:** Run consolidated end-to-end production reliability and safety audit.

Phase 044 remains the source backlog for outreach requirements; Phase 047 is the implementation prompt. Do not delete or overwrite historical completion reports.

## Historical findings to re-verify

The Phase 042 report recorded 141 job documents, 133 distinct custom IDs, 8 duplicate ID pairs affecting 16 documents, and 118 stale/unverified jobs before/around bounded freshness recovery. Phase 043 reported 141 total job documents, 103 active Germany-eligible/unapplied jobs, 38 archived/ineligible jobs, and 22 application documents. These are report-derived historical snapshots and must be re-queried before each phase.

## Global non-negotiable safety rules

- Auto-apply remains `STAGE_0_DRY_RUN`, `is_enabled: false`; do not activate it.
- Do not submit real ATS applications or send real outreach emails during implementation/testing.
- Do not treat `AUTO_APPLY_READY` as proof of submission.
- Positive ATS confirmation is required for confirmed automated submission; unknown outcomes block retry.
- Preserve historical application and job records. No deletion/merge/re-keying outside a separately reviewed and authorized migration plan.
- Gmail remains read-only.
- GCP Agent must not access MongoDB directly; it uses the read-only Oracle Agent API.
- Never bypass CAPTCHA, MFA, authentication, or anti-bot controls.
- Never fabricate fit scores, salary, language proficiency, visa/work authorization, contact details, or rejection reasons.
- Do not infer Germany work authorization from EU Blue Card eligibility or willingness to relocate.
- Every phase requires tests, deployment evidence, live verification, and a completion report. Reports must distinguish direct observations from assumptions or unavailable access.

## Completion-report convention

Create `feature/0XX_completion_report.md` for each phase. Include verdict, commits, deployed versions, tests, before/after counts, safety invariant checks, production evidence, known limitations, and follow-up work. Never claim production verification based only on local tests.
