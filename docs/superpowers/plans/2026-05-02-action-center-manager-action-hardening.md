# Implementation Plan: Action Center Manageractie-Semantiek Harden en Ervaring Verfijnen

## Status
Proposed

## Objective
Harden the manager action model into a smaller, calmer, and more pilot-ready operating flow without pretending the current runtime is already final.

This plan focuses on reducing ambiguity between:

- route response
- first concrete action
- action cards
- review expectations

---

## 1. Scope

### In scope

- define the first standard manager move more clearly in product behavior
- simplify the manager response surface where it currently overmixes route response and concrete intervention
- make the handoff into explicit action cards calmer and more intentional
- align review reading with the actual follow-through shape
- add focused tests for the chosen manager-action contract

### Out of scope

- reporting additions
- governance redesign
- closeout, reopen, or follow-up redesign
- adding richer workflow branching

---

## 2. Deliverables

### 2.1 Manager-action contract refinement

Codify in the live semantics and preview layer:

- what the first manager move represents
- what counts as route-level response
- when explicit action-card truth becomes primary

### 2.2 UI simplification

Refine the manager-facing route detail so the response/action surface feels smaller and more sequential.

Likely touchpoint:

- `frontend/components/dashboard/action-center-preview.tsx`

### 2.3 Read-model alignment

Ensure route summary, manager response, and action-card rendering do not imply conflicting meanings.

Likely touchpoints:

- `frontend/lib/action-center-core-semantics.ts`
- `frontend/lib/action-center-live.ts`

### 2.4 Focused tests

Add or update tests for:

- open route -> first manager move
- route response without rich action expansion
- route with explicit action cards
- review reading for lighter versus richer routes

---

## 3. Execution Sequence

### Step 1: Audit the current runtime model

Inspect how the current runtime expresses:

- manager response
- primary action fields
- route action cards
- review planning and review rendering

Output:

- a concrete list of duplicated meanings or confusing overlaps

### Step 2: Settle the pilot-grade manager operating contract

Before implementation, choose the pilot-grade runtime story for:

- first bounded response
- optional first concrete action
- when action cards become primary

This should be a hardening decision, not an open-ended redesign.

### Step 3: Refine projection and naming

Adjust core semantics and preview shaping so the manager layers read consistently:

- route context
- response context
- action execution context
- review context

### Step 4: Simplify the UI surface

Refine the manager-facing route panel so:

- the first response feels lighter
- explicit action detail appears only when needed
- richer action-card routes feel intentional rather than bolted on

### Step 5: Harden with tests

Add focused assertions around the chosen operating contract and keep them separate from unrelated baseline shell drift.

### Step 6: Verify and prepare PR

Run targeted tests, lint, and build; then commit, push, and open a draft PR for the wave.

---

## 4. Design Constraints

### 4.1 Do not overfit to the richest route shape

Do not make multiple action cards feel mandatory in the first manager move.

### 4.2 Do not collapse route response and action truth into one vague concept

The wave should simplify the relationship, not erase the distinction.

### 4.3 Keep route governance where it already belongs

Manager hardening should not pull route-closeout, reopen, or follow-up semantics into the manager surface.

### 4.4 Preserve the post-scan product boundary

This remains a follow-through layer after scan truth, not a general action workspace.

---

## 5. Verification Strategy

Minimum verification before completion:

1. focused manager-response and route-semantics tests
2. route-shell tests for the chosen manager-action rendering path
3. `eslint` on touched semantics and preview files
4. `npm run build`

If the manager surface meaning changes materially, add an updated seeded browser flow before claiming pilot-grade improvement.

---

## 6. Risks and Guardrails

### Risk: adding more manager options instead of clarifying the core move

Guardrail:

- prefer narrowing and sequencing over adding adjacent affordances

### Risk: making the response flow too weak for real follow-through

Guardrail:

- preserve a route into explicit action truth when the route genuinely needs it

### Risk: creating hidden semantic mismatch between route summary and manager surface

Guardrail:

- adjust route summary copy only when necessary to stay consistent with the hardened manager contract

### Risk: treating current runtime as more stable than it is

Guardrail:

- test the exact pilot contract chosen in this wave, not assumptions from earlier specs

---

## 7. Completion Criteria

This wave is complete when:

- the first expected manager move is clearer than today
- the product more clearly distinguishes route response from action execution
- managers can use the main follow-through path without conceptual hesitation
- richer routes with explicit action cards still fit naturally inside the same route model
- the resulting behavior feels smaller and more supportable for pilots than the current mixed state
