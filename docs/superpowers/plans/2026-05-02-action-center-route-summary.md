# Implementation Plan: Action Center Route-Brede Voortgang en Samenvatting

## Status
Proposed

## Objective
Implement Wave 1 of the Action Center commercial roadmap by adding a compact, stable route summary layer that makes route meaning readable above action, review, closeout, and lineage detail.

This plan assumes:

- route/open/closeout/follow-up truth already exists
- route summary is a read-model improvement, not a new workflow
- manager action semantics are still hardening and must not be overfit

---

## 1. Scope

### In scope

- add route-summary projection to the core semantics layer
- surface route summary consistently in overview and detail
- keep lineage and closeout reading aligned with the new route summary
- extend focused rendering and projector tests

### Out of scope

- redesigning manager action creation
- changing route aggregation semantics
- redesigning closeout or follow-up write flows
- broad reporting additions

---

## 2. Deliverables

### 2.1 Core semantics projection

Add a compact route summary projection that expresses:

- route state
- route ask
- route progress summary
- immediate historical context label

Likely home:

- `frontend/lib/action-center-core-semantics.ts`

### 2.2 Preview model integration

Ensure the live preview model carries enough route-summary fields for overview and detail without recomputing UI-only meaning in multiple places.

Likely touchpoints:

- `frontend/lib/action-center-live.ts`
- `frontend/lib/action-center-preview-model.ts`

### 2.3 UI rendering

Render the new route summary near the route header/detail entrypoint and keep overview compact.

Likely touchpoint:

- `frontend/components/dashboard/action-center-preview.tsx`

### 2.4 Focused verification

Extend route projector and shell tests to cover:

- open request summary
- active route summary
- reviewable route summary
- closed route summary
- backward and forward lineage summary precedence

Likely tests:

- `frontend/lib/action-center-live.test.ts`
- `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`
- route-summary rendering/unit tests if a small helper is extracted

---

## 3. Execution Sequence

### Step 1: Map current route-reading fields

Inspect the current projector and preview rendering to identify:

- where route state is already derived
- which existing blocks currently carry route meaning indirectly
- where summary duplication would appear if we do not centralize it

Output:

- a small field map for route summary inputs and outputs

### Step 2: Add route summary projection

Extend core semantics with a stable route summary structure, likely including:

- `headlineState`
- `routeAsk`
- `progressSummary`
- `lineageOverviewLabel`

Keep naming aligned with current semantics style rather than introducing a parallel model.

### Step 3: Thread summary through live preview shaping

Ensure the finalized preview item carries the route summary fields so overview/detail can render them from one source of truth.

### Step 4: Render the summary in overview and detail

Implement the UI so that:

- overview gets one compact summary line and at most one lineage label
- detail gets the same high-level reading plus slightly richer context
- closeout and lineage blocks still remain available as supporting detail

### Step 5: Harden with tests

Add targeted tests for:

- summary selection rules
- lineage precedence in overview vs detail
- closed-route summary behavior
- routes that have both backward and forward context

### Step 6: Verify and prepare PR

Run focused verification, commit intentionally, push the branch, and open a draft PR.

---

## 4. Design Constraints

### 4.1 Do not overstate action maturity

The summary copy must not assume:

- multiple action cards are already a perfectly quiet pilot model
- action-bound review is already the final practical manager loop

Prefer route-level language over task-style language when uncertain.

### 4.2 Do not create new workflow meaning

This wave may clarify:

- what the route asks now

but may not introduce:

- new statuses
- new authorities
- new action lifecycle expectations

### 4.3 Keep overview calmer than detail

If there is any ambiguity about how much to show:

- overview should get less
- detail may get slightly more

### 4.4 Respect existing foundation

Do not redesign:

- closeout truth
- reopen truth
- follow-up truth
- lineage truth

This is a reading layer on top of those foundations.

---

## 5. Verification Strategy

Minimum verification before completion:

1. focused route semantics and preview tests
2. route shell rendering tests for overview/detail summary presence
3. `npm run build`

If UI behavior changes materially, also run the relevant seeded browser flow if the route-summary branch stays aligned with the current Action Center shell.

---

## 6. Risks and Guardrails

### Risk: duplicating meaning across UI blocks

Guardrail:

- centralize route summary projection in semantics/live layers first

### Risk: summary overfits current action model

Guardrail:

- keep route ask and progress reading at route level

### Risk: overview/detail drift

Guardrail:

- test that both render from the same summary source with only bounded detail differences

### Risk: destabilizing baseline shell tests

Guardrail:

- account for the known current baseline drift in `page.route-shell.test.ts`
- separate pre-existing failures from new regressions

---

## 7. Completion Criteria

This wave is complete when:

- route summary exists as a single projected read model
- overview and detail use that read model consistently
- route reading feels clearer for open, active, reviewable, and closed routes
- lineage remains compact and correctly prioritized
- verification passes for the touched surfaces, aside from any confirmed pre-existing baseline issues
