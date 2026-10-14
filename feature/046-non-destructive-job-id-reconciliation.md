# Phase 046 — Non-Destructive Job-ID Reconciliation & Unique-Index Readiness

**Status:** Ready for implementation planning; production migration requires a separate explicit go/no-go  
**Project:** German Job Search Dashboard  
**Scope:** Audit duplicate custom job IDs, build a deterministic migration plan, safely reconcile records/references, and enforce uniqueness only when safe.

## 1. Context and objective

Phase 042 reported 141 job documents, 133 distinct custom `id` values, and 8 duplicate custom-ID pairs affecting 16 documents. The report attributed these pairs to historical Arbeitsagentur ingestion. This is a historical finding; re-query production and do not assume it remains unchanged.

The objective is to eliminate ambiguous custom-ID references without deleting historical jobs, losing provenance, corrupting applications, or creating a unique index prematurely.

## 2. Preflight: read-only first

Inspect current `main` in:
- `Sriramleo/job-search-api`
- `Sriramleo/job-search`
- `Sriramleo/homelab-gitops`

Inspect job repository query/write paths, API schemas, frontend references, discovered-job relationships, application/job references, analytics, tests, and all indexes. Confirm the actual production MongoDB database/collection and active secret reference without printing secret values.

Produce a read-only inventory:
- Total documents and distinct `_id` and custom `id` counts.
- Every duplicate custom ID, all matching MongoDB `_id` values, source/provider identifiers, canonical URLs, employer/title, created/updated timestamps, and relevant status/stage fields.
- References to each custom ID in applications, discovered jobs, audit/timeline records, and any other collection.
- Whether records are exact duplicates, complementary observations, or materially different jobs.
- Existing indexes and unique constraints.

Do not update production during the inventory step.

## 3. Deterministic reconciliation plan

For each duplicate cluster:
1. Use MongoDB `_id` as the immutable identity of the document.
2. Compare provider + provider job ID, canonical URL, direct ATS URL, discovered-job ID, normalized employer/title, location, description, timestamps, and freshness provenance.
3. Identify references to the custom ID and determine whether the reference schema can disambiguate by `_id` or another stable identifier.
4. Select one canonical custom ID only when evidence supports it.
5. Assign a deterministic, collision-checked replacement ID to a secondary distinct record when it is not the same real-world vacancy; do not blindly append a suffix without checking all consumers.
6. Preserve all source/provenance and qualification evidence. Do not combine fields in a way that fabricates a source of truth.
7. If two documents are the same vacancy, document a proposed non-destructive strategy first. No document deletion or merge is allowed by this phase's default authorization.
8. Keep all application lifecycle stages and ATS confirmation records unchanged.

Any record or reference that cannot be resolved confidently must be quarantined for human review; do not guess.

## 4. Migration implementation requirements

Create an idempotent migration with:
- Explicit dry-run mode as the default.
- A generated before/after manifest listing each planned change and rationale.
- Exact targeting by MongoDB `_id`, never duplicate custom ID alone.
- Preconditions that verify expected duplicate cluster fingerprints and stop if production has drifted.
- A transaction where supported, or a carefully ordered, restartable sequence with checkpoints.
- A backup/export or verified recovery path before writes.
- Per-document audit records with migration version and timestamp, without secrets.
- Rollback instructions and a rollback script where practical.
- No destructive delete/merge operations.
- A hard maximum number of affected records matching the reviewed manifest.
- Abort on unexpected document counts, changed references, or newly detected collisions.

Do not execute production writes in the same step that first discovers the duplicates. First generate and review the dry-run manifest and tests. If the migration requires changing references beyond the reviewed manifest, stop for authorization.

## 5. Index readiness and rollout

Only after reconciliation is proven:
- Re-run duplicate detection and require zero duplicate custom IDs.
- Validate all reference lookups and application joins.
- Add a unique index on custom `id` only if all writers are compatible and the migration's safety checks pass.
- If unique indexing is not yet safe, retain existing constraints and document why; do not force index creation.
- Confirm index build result from the actual production database.
- Verify new ingestion continues to upsert correctly and concurrent writes cannot recreate duplicates. If a unique index cannot be added safely, implement an appropriate race-safe alternative and test it.

## 6. Required tests

Test:
- All known duplicate clusters represented by fixtures.
- Different real-world jobs sharing an identifier.
- Same vacancy from multiple providers.
- Existing application references and historical stages.
- Dry-run causes zero writes.
- Idempotent rerun.
- Changed precondition / database drift aborts safely.
- Collision with proposed replacement ID.
- Partial migration interruption and recovery.
- Unique-index failure handling.
- Ingestion concurrency and duplicate upsert behavior.
- No document deletion, no unintended merge, and stable historical counts.

Use isolated test databases/fixtures. Never test destructive operations against production.

## 7. Production execution gate

Separate this phase into:
A. Read-only audit + migration plan.
B. Implementation and tests.
C. Explicit human review of the manifest and backup/recovery plan.
D. Production migration only after a distinct explicit go/no-go authorization.
E. Post-migration verification and report.

Do not interpret approval to prepare this prompt or implement the migration tooling as approval to run production writes.

## 8. Acceptance criteria

- Every duplicate cluster is accounted for.
- Each proposed action is deterministic, auditable, and reversible where possible.
- Production write scope exactly matches the approved manifest.
- All application/job references remain valid.
- No historical application records are deleted or changed.
- No job documents are deleted or merged under default scope.
- Duplicate custom-ID count is zero before creating a unique index, or the report explicitly records why enforcement remains blocked.
- Existing discovery/upsert paths pass regression tests.
- Campaign remains `STAGE_0_DRY_RUN`, `is_enabled: false`, with zero unintended submissions or outbound messages.
- Write `feature/046_completion_report.md` with before/after counts, manifest hash, migration result, index status, tests, and rollback evidence.

## 9. Stop conditions

Stop on any unanticipated duplicate, missing reference, database drift, missing backup/recovery proof, ambiguous vacancy identity, unexpected document-count change, or application-stage mutation. Preserve evidence and request review; never improvise a production data repair.
