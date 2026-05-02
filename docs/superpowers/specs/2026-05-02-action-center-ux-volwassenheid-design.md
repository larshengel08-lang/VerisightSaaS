# Action Center UX-Volwassenheid

## Status
Proposed

## Intent
This wave makes the existing Action Center runtime feel calmer, clearer, and more commercially credible without re-opening route semantics or introducing new workflow weight.

This is explicitly a **state-clarity and confidence pass**, not a redesign of route truth, manager action truth, or governance.

---

## 1. Goal

Wave 6 should make the current Action Center surface easier to trust in repeated pilot use.

The user should more quickly understand:

- what kind of route they are looking at
- whether it still needs a first step, active follow-through, review, or only historical reading
- why a section is empty
- what to do next without feeling pushed into a heavier workflow than necessary

---

## 2. Product Boundary

This wave may:

- improve state copy
- improve empty, quiet, and completed states
- strengthen visual hierarchy inside the preview/detail surface
- make route summary, lineage, manager-action phase, and follow-up affordances read more calmly
- tighten scanability for HR and manager

This wave must not:

- invent new route statuses
- re-open the manager action model
- add new governance moves
- add new reporting surfaces
- add new required fields or workflow steps

---

## 3. Current Runtime Basis

Already present in runtime and safe to build on:

- route summary cards
- lineage labels
- follow-up route affordance
- manager action phase distinction
- route closeout and review history visibility

Still rough in presentation:

- several empty states read as technical absence instead of intentional boundedness
- the same surface mixes active, quiet, historical, and blocked states with limited tonal separation
- some copy still sounds like internal product scaffolding rather than mature pilot UX
- some route sections tell the user that nothing is there, but not why that is acceptable

---

## 4. Desired UX Outcome

The surface should feel:

- calm rather than busy
- bounded rather than incomplete
- explicit rather than implicit
- historical when closed
- lightly operational when active

In practice this means:

- empty states explain the current route phase, not only the missing data
- summary language reinforces route meaning before section detail
- historical routes feel intentionally closed instead of abandoned
- follow-up and lineage remain secondary context, not the main headline

---

## 5. Scope of the Implementation Slice

This wave should stay inside the existing Action Center runtime surfaces:

- `frontend/components/dashboard/action-center-preview.tsx`
- existing route summary / preview render helpers
- Action Center route shell assertions and preview rendering tests

Preferred changes:

- strengthen empty-state copy for first-step, action-card, review, and historical sections
- make route-level summary lines more phase-aware
- distinguish bounded small routes from genuinely missing data
- make closed and followed-up routes feel intentionally finished
- preserve the current route/action/review semantics while making them easier to read

---

## 6. Success Criteria

This wave succeeds when:

- an HR or manager user can distinguish "waiting for first step", "actively moving", and "historical/closed" more quickly
- empty sections no longer feel like broken UI by default
- route summary text better matches the actual route phase
- no new truth or workflow concepts are introduced
- the current browser/runtime behavior remains intact

---

## 7. What Stays Unchanged

This wave does **not** change:

- route status derivation
- action truth
- review truth
- lineage truth
- governance rules
- scan-to-route bridge semantics

It is a maturity pass on how the existing system reads in runtime.
