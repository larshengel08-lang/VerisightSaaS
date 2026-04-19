# Action Center Maturity And Suite Capability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mature the MTO-first Action Center into a clearer management cockpit with stronger creation quality, dossier-backed action flow, bounded department access, and explicit suite-capable seams without activating other scan routes.

**Architecture:** Keep MTO as the only live carrier while splitting the work into five bounded waves. Reframe the cockpit first, then deepen action quality and dossier flow, then tighten permissions, then isolate the loader and adapter seams, and only then polish and close out. Shared capability stays in scope as a contract and boundary concern, not as immediate multi-product rollout.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Supabase Postgres/RLS, Vitest, pytest

**Spec:** `docs/superpowers/specs/2026-04-19-action-center-design.md`
**Review Input:** `docs/superpowers/specs/2026-04-19-action-center-improvement-review.md`

---

## Bestandsoverzicht

| Bestand | Actie | Verantwoordelijkheid |
|---------|-------|----------------------|
| `docs/active/ACTION_CENTER_MATURITY_AND_SUITE_CAPABILITY_PLAN.md` | Create | Strategisch source-of-truth document voor de nieuwe fase |
| `docs/active/ACTION_CENTER_MATURITY_AND_SUITE_CAPABILITY_WAVE_STACK_PLAN.md` | Create | Toegestane wave-volgorde en gates |
| `docs/active/WAVE_01_ACTION_CENTER_COCKPIT_REFRAME.md` | Create | Wave 1 source of truth |
| `docs/active/WAVE_02_ACTION_CENTER_GUIDED_CREATION_AND_DOSSIERS.md` | Create | Wave 2 source of truth |
| `docs/active/WAVE_03_ACTION_CENTER_PERMISSION_ENVELOPE.md` | Create | Wave 3 source of truth |
| `docs/active/WAVE_04_ACTION_CENTER_LOADER_AND_ADAPTER_SEAMS.md` | Create | Wave 4 source of truth |
| `docs/active/WAVE_05_ACTION_CENTER_POLISH_AND_CLOSEOUT.md` | Create | Wave 5 source of truth |
| `docs/superpowers/plans/2026-04-19-action-center-maturity-and-suite-capability.md` | Create | Uitvoerbaar implementatieplan |
| `frontend/lib/action-center/mto-cockpit.ts` | Modify | Cockpitprioritering, action health en review pressure logic |
| `frontend/components/dashboard/action-center/*` | Modify | Reframed cockpit, guided create flow, dossier-backed details |
| `frontend/lib/management-actions.ts` | Modify | Permission envelope, shared dossier primitives, traceability seams |
| `frontend/app/(dashboard)/campaigns/[id]/page.tsx` | Modify | Alleen om Action Center loader-boundary te isoleren |
| `frontend/lib/action-center/*` | Create/Modify | Loader/builders en adapter seam helpers |
| `frontend/lib/**/*.test.ts` | Modify | Unit tests per wave |
| `tests/test_mto_department_intelligence_program.py` | Modify | Boundary tests en docs status |

---

## Task 1: Open the maturity phase docs

**Files:**
- Create: `docs/active/ACTION_CENTER_MATURITY_AND_SUITE_CAPABILITY_PLAN.md`
- Create: `docs/active/ACTION_CENTER_MATURITY_AND_SUITE_CAPABILITY_WAVE_STACK_PLAN.md`
- Create: `docs/active/WAVE_01_ACTION_CENTER_COCKPIT_REFRAME.md`
- Create: `docs/active/WAVE_02_ACTION_CENTER_GUIDED_CREATION_AND_DOSSIERS.md`
- Create: `docs/active/WAVE_03_ACTION_CENTER_PERMISSION_ENVELOPE.md`
- Create: `docs/active/WAVE_04_ACTION_CENTER_LOADER_AND_ADAPTER_SEAMS.md`
- Create: `docs/active/WAVE_05_ACTION_CENTER_POLISH_AND_CLOSEOUT.md`

- [ ] Confirm the previous Action Center phase is closed and this new phase opens with `wave_01_open`.
- [ ] Confirm the new phase states both constraints together: `MTO-only live carrier` and `suite-capable seams stay in scope`.
- [ ] Commit the docs opening once the source-of-truth files are green.

## Task 2: Wave 1 - Reframe the cockpit

**Files:**
- Modify: `frontend/lib/action-center/mto-cockpit.ts`
- Modify: `frontend/lib/action-center/mto-cockpit.test.ts`
- Modify: `frontend/components/dashboard/action-center/mto-manager-cockpit.tsx`
- Modify: `frontend/components/dashboard/action-center/mto-department-overview.tsx`
- Modify: `frontend/components/dashboard/action-center/mto-theme-panel.tsx`
- Modify: `tests/test_mto_department_intelligence_program.py`

- [ ] Add failing tests for theme prioritization, action health surfacing, and clearer department-first follow-through grouping.
- [ ] Update the view-model to sort themes by urgency and follow-through pressure rather than raw source order.
- [ ] Rework the cockpit layout so department state, urgent themes, action health, and review pressure read as one coherent management workspace.
- [ ] Run focused Vitest, pytest boundary tests, and `npx tsc --noEmit`.
- [ ] Commit Wave 1 when green.

## Task 3: Wave 2 - Guided creation and dossier-backed actions

**Files:**
- Modify: `frontend/components/dashboard/action-center/mto-action-composer.tsx`
- Modify: `frontend/components/dashboard/action-center/mto-action-list.tsx`
- Modify: `frontend/components/dashboard/action-center/mto-review-queue.tsx`
- Create or Modify: `frontend/components/dashboard/action-center/*` dossier detail components as needed
- Modify: `frontend/lib/management-actions.ts`
- Modify: `frontend/lib/management-actions.test.ts`

- [ ] Add failing tests for required creation quality on owner, review date, and expected outcome.
- [ ] Introduce a compact guided create flow that preserves low friction but requires a real first commitment.
- [ ] Move action updates, blockers, and review context toward one dossier-backed interaction model.
- [ ] Keep optional question linkage available but clearly secondary to theme-first management behavior.
- [ ] Run focused Vitest, typecheck, and any needed API/program tests.
- [ ] Commit Wave 2 when green.

## Task 4: Wave 3 - Permission envelope

**Files:**
- Modify: `frontend/lib/management-actions.ts`
- Modify: API routes under `frontend/app/api/management-actions*`
- Modify: `tests/test_mto_department_intelligence_program.py`
- Add/Modify: focused permission tests in TypeScript where useful

- [ ] Add failing tests for HR-wide access and manager-own-department-only access.
- [ ] Replace generic org-role assumptions with an Action Center permission envelope that can stay MTO-only now while remaining suite-capable later.
- [ ] Confirm no non-MTO route behavior changes.
- [ ] Run focused tests, boundary tests, and typecheck.
- [ ] Commit Wave 3 when green.

## Task 5: Wave 4 - Loader boundary and adapter seams

**Files:**
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- Create/Modify: `frontend/lib/action-center/*` loader and adapter seam modules
- Modify: `frontend/lib/management-actions.ts`
- Modify: `frontend/lib/action-center/mto-cockpit.test.ts`
- Modify: `tests/test_mto_department_intelligence_program.py`

- [ ] Add failing tests that protect Action Center orchestration from regressing back into page-level sprawl.
- [ ] Extract an MTO Action Center loader/builder boundary out of the campaign page.
- [ ] Make shared dossier primitives, neutral traceability payloads, and product adapter seams explicit without turning on another product.
- [ ] Re-run focused tests, boundary tests, and `npx tsc --noEmit`.
- [ ] Commit Wave 4 when green.

## Task 6: Wave 5 - Polish and closeout

**Files:**
- Modify: Action Center UI components touched in prior waves
- Modify: docs in `docs/active/*`
- Modify: `tests/test_mto_department_intelligence_program.py`

- [ ] Refine urgency language, health signaling, and calmer executive visual hierarchy without reopening scope.
- [ ] Update closeout notes across the active wave docs.
- [ ] Run the final focused verification set for Action Center.
- [ ] Commit Wave 5 and close the phase.

## Suggested Verification Set Per Wave

- `cmd /c npm test -- --run lib/action-center/mto-cockpit.test.ts lib/management-actions.test.ts`
- `C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_mto_department_intelligence_program.py -q`
- `cmd /c npx tsc --noEmit`

## Execution Notes

- Keep commits small and wave-bounded.
- Do not widen scope into live suite rollout.
- Do not touch non-MTO survey methods or dashboards except where boundary tests explicitly protect non-impact.
- If a later wave reveals that suite-capable seams require a separate architectural sub-track, pause only at that gate and open a new bounded plan rather than improvising a broad refactor.
