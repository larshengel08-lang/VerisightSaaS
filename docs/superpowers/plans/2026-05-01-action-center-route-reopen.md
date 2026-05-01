# Action Center Route Reopen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add explicit Action Center route reopen and follow-up behavior so a previously closed route can either be reactivated through a canonical reopen event or be succeeded by a new follow-up route, with deterministic read-path precedence and compact lineage projection in overview/detail.

**Architecture:** Use two distinct truth models. Reopen is a dedicated route event on the same route id. Follow-up is a route relation between a closed source route and a newly created target route. Read-path precedence for a single route id is determined strictly by event ordering between the latest closeout and the latest reopen event. Follow-up routes never reuse the old route id.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Playwright, Supabase Postgres schema/RLS, existing Action Center route/closeout/action semantics, admin/HR dashboard surfaces.

---

### Task 1: Lock reopen-vs-follow-up semantics in tests

**Files:**
- Create: `frontend/lib/action-center-route-reopen.test.ts`
- Modify: `frontend/lib/action-center-route-closeout.test.ts`
- Modify: `frontend/lib/action-center-route-contract.test.ts`
- Modify: `frontend/lib/action-center-live.test.ts`
- Modify: `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`

- [ ] **Step 1: Add failing reopen truth tests**

Test that:
- reopen is accepted only as a dedicated event record
- follow-up remains a separate relation type
- reopen does not reuse relation semantics like `reopened-from`

- [ ] **Step 2: Add failing precedence tests for closed -> reopened -> closed again**

Test deterministic ordering:
- closeout without later reopen = closed
- reopen later than closeout = active again
- second closeout later than reopen = closed again

- [ ] **Step 3: Add failing follow-up projection tests**

Test that:
- source route remains closed
- target route is active with its own route id
- detail/overview can show compact `Vervolg op eerdere route` lineage

- [ ] **Step 4: Add failing shell tests for compact lineage labels**

Test that:
- reopened route can show `Heropend traject`
- follow-up route can show `Vervolg op eerdere route`
- old route can show that vervolg later ontstond

---

### Task 2: Add canonical reopen truth + follow-up relation helpers

**Files:**
- Create: `frontend/lib/action-center-route-reopen.ts`
- Modify: `frontend/lib/action-center-route-closeout.ts`
- Modify: `frontend/lib/action-center-core-semantics.ts`
- Modify: `frontend/lib/action-center-live-context.ts`

- [ ] **Step 1: Implement reopen truth projector**

Add:
- `ActionCenterRouteReopenRecord`
- `projectActionCenterRouteReopen(...)`
- canonical validation for:
  - `routeId`
  - `reopenedAt`
  - `reopenedByRole`
  - `reopenReason`

- [ ] **Step 2: Implement follow-up relation projector**

Keep this intentionally small:
- `routeRelationType = 'follow-up-from'`
- `sourceRouteId`
- `targetRouteId`
- `recordedAt`
- `recordedByRole`

- [ ] **Step 3: Add shared derivation helpers**

Introduce helpers for:
- latest closeout timestamp
- latest reopen timestamp
- current route activity derived from event ordering
- compact lineage badges/text for read surfaces

---

### Task 3: Extend route contract and live semantics

**Files:**
- Modify: `frontend/lib/action-center-route-contract.ts`
- Modify: `frontend/lib/action-center-live.ts`
- Modify: `frontend/lib/action-center-live-context.ts`

- [ ] **Step 1: Add deterministic route precedence**

Implement one status derivation contract:
- no closeout -> live status from action aggregation
- closeout with no later reopen -> closed
- later reopen -> active again
- later closeout again -> closed again

- [ ] **Step 2: Add compact lineage projection**

Project to route semantics:
- `reopened`
- `followUpFromRouteId`
- `hasFollowUpTarget`
- lightweight labels for overview/detail

- [ ] **Step 3: Ensure closeout history stays visible**

Do not remove prior closeout context when a route reopens.
Instead:
- route becomes active again
- old closeout remains historical
- reopen explains why it is active again

---

### Task 4: Add storage and write paths

**Files:**
- Modify: `supabase/schema.sql`
- Create: `frontend/app/api/action-center-route-reopens/route.ts`
- Create: `frontend/app/api/action-center-route-follow-ups/route.ts`
- Create: `frontend/app/api/action-center-route-reopens/route.test.ts`
- Create: `frontend/app/api/action-center-route-follow-ups/route.test.ts`

- [ ] **Step 1: Add reopen-event table**

Create canonical table for reopen events with:
- route id
- reopened at
- reopened by role
- reopen reason
- audit fields

RLS:
- HR/Verisight write
- route viewers read

- [ ] **Step 2: Add follow-up relation table**

Create canonical relation table for:
- `follow-up-from`
- source route id
- target route id
- recorded at
- recorded by role

RLS:
- HR/Verisight write
- route viewers read

- [ ] **Step 3: Add HR-driven API routes**

Route reopen API:
- validates HR/admin authority
- writes reopen event only
- never mutates old closeout away

Follow-up API:
- validates HR/admin authority
- creates a new route carrier
- writes `follow-up-from` relation

---

### Task 5: Wire overview/detail UI

**Files:**
- Modify: `frontend/components/dashboard/action-center-preview.tsx`
- Modify: `frontend/app/(dashboard)/action-center/page.tsx`
- Modify: any closeout/admin wiring helpers needed for route actions

- [ ] **Step 1: Add HR controls for reopen vs follow-up**

Keep it small:
- visible only to HR/Verisight
- available on closed routes
- explicit choice between:
  - `Heropen traject`
  - `Start vervolgroute`

- [ ] **Step 2: Add compact read projection**

Overview:
- small label only

Detail:
- small context block with:
  - prior closeout
  - reopened on date
  - or vervolg from route X

- [ ] **Step 3: Preserve current calm UI**

Do not introduce:
- route trees
- workflow wizards
- deep ancestry panels

Keep lineage compact and secondary to the active route story.

---

### Task 6: Seed and browser verification

**Files:**
- Modify: `frontend/scripts/seed-action-center-manager-pilot.mjs`
- Modify: `frontend/tests/e2e/action-center-manager-access.spec.ts`
- Create: `frontend/tests/e2e/action-center-route-reopen.spec.ts`

- [ ] **Step 1: Seed both scenarios**

Provide stable seeded routes for:
- a closed route that HR can reopen
- a closed route that can produce a new follow-up route

- [ ] **Step 2: Add browser tests**

Manager/browser flow should still stay coherent.
New HR flows should verify:
- HR can reopen a closed route and it becomes active again
- HR can create a vervolgroute and the old route stays closed
- lineage is visible after reload

- [ ] **Step 3: Validate permission boundaries**

Confirm:
- manager can read lineage context where appropriate
- manager cannot trigger reopen/follow-up write actions
- HR retains closeout/reopen/follow-up authority

---

### Task 7: Final verification and PR prep

**Files:**
- Update PR notes once implementation exists

- [ ] **Step 1: Run targeted tests**

Required:
- route reopen truth tests
- closeout/reopen/follow-up API tests
- route contract/live tests
- page shell tests

- [ ] **Step 2: Run static verification**

Required:
- `npx eslint` on touched Action Center files
- `npm run build`

- [ ] **Step 3: Run browser verification**

Required:
- seed script
- Playwright reopen/follow-up flows
- confirm reload persistence and route lineage projection

- [ ] **Step 4: Prepare clean PR**

PR summary should call out:
- reopen is event truth
- follow-up is relation truth
- deterministic precedence for reopened routes
- HR-only write path

---

## Implementation Notes

- Reopen is **not** a relation. Do not model it as `reopened-from`.
- Follow-up is **not** a reopen. It must create a new route id.
- Read-path precedence must always use the latest canonical route event ordering.
- When in doubt operationally, HR defaults to `start vervolgroute`.
