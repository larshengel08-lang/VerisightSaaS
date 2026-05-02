# Implementation Plan: Action Center Rapportage en Bestuurlijke Teruglezing

## Status
Proposed

## Objective
Implement Wave 3 of the Action Center commercial roadmap by adding a compact workspace readback summary derived from existing route, decision, closeout, reopen, and follow-up truth.

This plan assumes:

- route-level truth already exists
- route summary and lineage summary already exist
- this wave is a bounded reporting/readback slice, not a new analytics product

---

## 1. Scope

### In scope

- enrich the live Action Center aggregate summary with bestuurlijke readback fields
- render those fields in the overview surface
- keep the rendering compact and route-level
- add focused tests for summary projection and overview rendering

### Out of scope

- charts
- exports
- theme reporting
- separate reporting pages
- manager-action redesign
- governance or audit redesign

---

## 2. Deliverables

### 2.1 Live aggregate summary extension

Extend the live summary layer so it can answer:

- total visible routes
- active versus closed visible routes
- visible routes with explicit decision history
- visible routes with continuation visibility
- nearest review pressure

Likely touchpoint:

- `frontend/lib/action-center-live.ts`

### 2.2 Overview rendering

Render the new readback summary on the Action Center overview using existing card language and visual patterns.

Likely touchpoint:

- `frontend/components/dashboard/action-center-preview.tsx`

### 2.3 Focused test coverage

Add or extend tests covering:

- route-deduplicated summary counts
- decision-history count
- continuation count through reopen/follow-up signals
- overview rendering of the new readback block

Likely tests:

- `frontend/lib/action-center-live.test.ts`
- `frontend/lib/action-center-preview-route-fields-render.test.ts`
- `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`

---

## 3. Execution Sequence

### Step 1: Extend the aggregate summary shape

Add the missing readback fields to the live summary layer while preserving current fields that already feed the page and subtitle.

### Step 2: Derive new fields from route-level truth

Compute the new summary fields from deduplicated route items, using:

- route status
- decision history presence
- lineage/follow-up semantics
- review dates

Do not compute from UI-only strings.

### Step 3: Add overview rendering

Use the new summary in overview rendering to show a compact bestuurlijke readback block.

Keep it:

- readable for HR
- harmless for managers
- visually consistent with the current Action Center shell

### Step 4: Harden with tests

Add focused tests for summary counts and overview rendering.

### Step 5: Verify and prepare PR

Run focused verification, commit intentionally, push, and open a draft PR.

---

## 4. Design Constraints

### 4.1 Stay compact

If there is a choice between:

- more metrics
- or a calmer readback layer

choose the calmer readback layer.

### 4.2 Stay route-level

The readback layer may use action and review truth, but it should summarize at route level.

### 4.3 Do not overclaim action maturity

Counts or summaries must not assume:

- multiple action cards are already the final repeated-use model
- every route has equally rich action history

### 4.4 Reuse existing truth

Do not invent:

- new reporting tables
- new persisted summary state
- duplicated lineage models

---

## 5. Verification Strategy

Minimum verification before completion:

1. focused live summary tests
2. overview rendering tests
3. `npm run build`

If the overview copy changes materially, ensure the existing Action Center route shell tests still pass or only retain documented baseline failures already present on `main`.

---

## 6. Risks and Guardrails

### Risk: building a reporting module by accident

Guardrail:

- keep this wave inside the existing overview shell

### Risk: counting route history inconsistently

Guardrail:

- deduplicate by route identity inside the live summary layer

### Risk: reporting depends too much on still-hardening action semantics

Guardrail:

- count route-level presence of decisions and continuation
- avoid deep action-shape metrics

### Risk: overview becomes noisy

Guardrail:

- use a small number of bounded summary rows/cards
