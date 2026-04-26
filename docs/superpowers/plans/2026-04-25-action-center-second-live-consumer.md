# Action Center Second Live Consumer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect exactly one additional live current product stream, ExitScan, to the existing Action Center product layer without opening any broader adapter, dashboard, public, or commercial scope.

**Architecture:** Keep the existing shared Action Center core and current MTO carrier intact. Add one bounded ExitScan carrier contract in backend and frontend, then surface that contract on the existing `/beheer/klantlearnings` Action Center page as a second live consumer fed only by current ExitScan learning dossiers, checkpoints, leads, and campaigns.

**Tech Stack:** Python dataclasses and pytest for backend shared-core contracts; Next.js/TypeScript/Vitest for frontend carrier and surface checks; Supabase-backed learning dossier runtime already present in the page.

---

### Task 1: Lock the second-consumer contract in tests

**Files:**
- Modify: `tests/test_action_center_shared_core.py`
- Modify: `frontend/lib/action-center-shared-core.test.ts`
- Modify: `frontend/app/(dashboard)/beheer/klantlearnings/page.test.ts`

- [ ] Add backend expectations that ExitScan can become one additional active product consumer while non-selected future adapters stay inactive.
- [ ] Add frontend expectations for the mirrored ExitScan carrier contract and shared-core projection.
- [ ] Add a source-level Action Center surface test that requires both the existing MTO carrier and the new ExitScan section to coexist on the page.
- [ ] Run the targeted backend and frontend tests and confirm they fail for the missing ExitScan implementation or surface strings.

### Task 2: Implement the bounded ExitScan carrier

**Files:**
- Create: `backend/products/shared/action_center_exit.py`
- Modify: `backend/products/shared/action_center_adapters.py`
- Create: `frontend/lib/action-center-exit.ts`
- Modify: `frontend/lib/action-center-adapters.ts`

- [ ] Add the smallest shared-core projection for ExitScan with explicit owner binding, follow-up review discipline, and no cross-product adapter opening.
- [ ] Keep every non-Exit future adapter inactive and unchanged apart from removing ExitScan from the future-adapter list.
- [ ] Mirror the same bounded contract in TypeScript so frontend and backend stay truthy to the same shape.
- [ ] Re-run the targeted shared-core tests until both backend and frontend carrier tests pass.

### Task 3: Wire one real Action Center surface

**Files:**
- Modify: `frontend/app/(dashboard)/beheer/klantlearnings/page.tsx`

- [ ] Derive a live ExitScan slice from existing learning workbench inputs only: ExitScan campaigns, dossiers, leads, checkpoints, and related org access counts.
- [ ] Keep the current MTO Action Center section intact and add one clearly bounded ExitScan section to the same page.
- [ ] Reuse existing dashboard primitives and workbench components; do not open a new route, dashboard, or buyer-facing surface.
- [ ] Re-run the page source test until it passes.

### Task 4: Verify, ship, and publish

**Files:**
- No planned source changes unless verification reveals a focused defect.

- [ ] Run targeted backend tests: `C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_action_center_shared_core.py -q`
- [ ] Install frontend dependencies in the worktree with `npm ci` if needed, then run targeted frontend tests.
- [ ] Run a frontend build check with `npm run build`.
- [ ] Start a narrow runtime check for `/beheer/klantlearnings`, confirm the new ExitScan section renders on the existing Action Center surface, then stop the dev server.
- [ ] Commit with a focused message, push `codex/action-center-second-live-consumer`, and open a draft PR.
