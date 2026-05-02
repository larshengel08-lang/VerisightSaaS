# Action Center Manageractie-Semantiek Harden en Ervaring Verfijnen

## Status
Proposed

## Intent
This document defines Wave 2 of the Action Center commercial roadmap: hardening and simplifying the manager action model so it becomes trustworthy and usable in repeated pilot use.

This wave is deliberately **not** framed as pure UX polish. It assumes the manager action layer has strong direction and real runtime pieces, but still needs semantic hardening before it counts as calm pilot-ready foundation.

---

## 1. Why This Wave Exists

After Wave 1, route meaning is more readable at route level.

That immediately exposes the next bottleneck:

- what exactly the manager is expected to do first
- how `manager response` relates to `first action`
- when a route should stay light versus when it should carry explicit action cards
- how review should feel when the route is still in an early, bounded state

Today the runtime already contains meaningful manager-follow-through building blocks:

- assignment-open route visibility
- manager response form
- optional primary action inside the response flow
- route action cards
- action-bound review direction

But those pieces still risk reading as more settled than they really are.

This wave exists to prevent three forms of drift:

- semantic drift between manager response and action-card truth
- UX drift where managers see too many overlapping ways to “do something”
- pilot drift where the runtime technically supports multiple action paths but the actual expected operating model stays fuzzy

---

## 2. Product Boundary

This wave is about **manager follow-through hardening**, not about broadening Action Center into a richer work-management system.

### In scope

- clarify the first standard manager move in an open route
- simplify the relationship between route-level response and concrete action creation
- reduce duplication between manager-response and action-card semantics
- make review expectations calmer and more predictable for managers
- tighten copy, defaults, and interaction sequence so managers do not need hidden product knowledge

### Out of scope

- new governance models
- new reporting surfaces
- route closeout redesign
- follow-up or reopen redesign
- generalized task-board capabilities
- introducing broad workflow branching for managers

This wave must keep Action Center as a bounded follow-through layer after a scan route.

---

## 3. Starting Foundation, Split by Reality

### 3.1 Canonically decided

The following are already semantically chosen:

- the route remains the governing container
- manager follow-through is the intended operational response inside a route
- concrete actions belong inside the route rather than replacing the route
- reviews are intended to bind primarily to concrete follow-through rather than float as generic route notes
- multiple action cards are allowed when the route truly needs them

### 3.2 Product/runtime present enough to build on

The following already exist in runtime and should be used as starting material rather than reimagined from zero:

- manager assignment opens a route
- manager response save path exists and is server-side hardened
- the manager response flow can already capture a response note, review date, and optional primary action fields
- route action cards render in detail
- route summary and route closeout now coexist in runtime

### 3.3 Directional but not yet hardened enough to treat as final pilot operating model

The following should still be treated as “strong direction under hardening,” not as fully settled:

- whether the first standard manager move is best read as a response with optional first action, or as a direct first action in most pilot cases
- how often routes should remain at bounded-response level without immediately becoming multi-action routes
- how much structure the first manager action needs before it becomes administratively heavy
- how the review loop should feel when the route is still early and lightly defined

### 3.4 Design consequence

This wave should not assume that the answer is “keep everything and polish the labels.”

Instead it should explicitly harden:

- what the default manager path is
- what is supporting structure versus primary operating structure
- how to keep the model small even when richer action truth exists underneath

---

## 4. Desired Outcome

After this wave, a manager should be able to understand and perform the expected first meaningful move without guessing:

- what kind of input is being asked for
- whether this is still just a route response or already a concrete local intervention
- what needs to be reviewed later
- when additional action cards are actually warranted

Pilot users should feel:

- this is specific enough to act on
- small enough to use
- and stable enough that the product is not changing conceptual rules under them

---

## 5. The Hardening Problem to Solve

The current model has four nearby concepts:

- route summary
- manager response
- first concrete action
- later action cards and reviews

The product direction is strong, but the practical operating story is still too easy to blur:

- a response can feel like an action
- a primary action inside the response can feel like a second model parallel to action cards
- reviews can feel route-level in copy while action-level in truth
- multiple actions can exist, while the first manager affordance still feels like a one-shot response form

Wave 2 should reduce that ambiguity.

---

## 6. Proposed Operating Model

### 6.1 First manager move stays intentionally small

The first manager move should remain small and bounded.

For pilot readiness, the product should not force every open route immediately into a rich action-card workflow.

The first move should let the manager say:

- this route is acknowledged
- here is the first bounded local response
- here is when we look again

### 6.2 Concrete action only becomes explicit when it really helps

If the manager already knows the first concrete intervention, the flow may capture it immediately.

But the product must make clear that:

- concrete action is a more specific layer than route response
- not every first response needs a fully articulated multi-action route

This keeps the system small in early route states.

### 6.3 Once action cards exist, they become the main execution surface

If a route carries explicit action cards, those cards become the primary operational truth for follow-through.

That means:

- route response is context
- action cards are execution
- route summary remains bestuurlijke reading

This avoids parallel primary surfaces.

### 6.4 Multiple actions remain possible, but not the default story

Multiple actions remain a valid route shape.

But the product should present them as:

- a route that has become operationally richer

not as:

- the assumption every manager sees or needs immediately

This is important for pilot calm.

### 6.5 Review must read consistently with the active action shape

If there is a concrete action, review should read as review of concrete follow-through.

If there is no concrete action yet, the product should not fake a rich action review loop. It should stay honest and light.

---

## 7. Simplification Goals

This wave should aim for simplification in four places.

### 7.1 Terminology

The difference between:

- `manager response`
- `eerste stap`
- `actie`
- `review`

must be easier to understand in product copy.

### 7.2 Interaction order

Managers should not have to decide between too many adjacent concepts at once.

The flow should feel progressive:

1. understand route
2. give first bounded response
3. add concrete action when helpful
4. return later for review

### 7.3 Field load

The current first manager surface should feel lighter and more purposeful.

It should ask only for what materially improves follow-through at that stage.

### 7.4 Route-to-action handoff

The product should make it clearer when a route has moved from:

- response phase

to:

- concrete action phase

without introducing extra workflow jargon.

---

## 8. Non-Goals

This wave does not need to prove the ultimate perfect manager workflow for every future case.

It only needs to create a pilot-grade operating model that is:

- small
- semantically honest
- supportable
- and hard to misuse

It is acceptable for later waves to deepen manager capability once this base is calm.

---

## 9. Success Criteria

This wave is successful when:

- a manager can tell what the first expected move is without hidden product knowledge
- the difference between route response and concrete action is clearer in product behavior
- managers do not feel forced into multi-action complexity too early
- routes with action cards clearly read as richer execution routes, not parallel workflow models
- review language and review expectations match the actual follow-through shape
- the manager action model feels more stable after this wave than before it

---

## 10. What This Wave Does Not Rebuild

This wave does **not** re-open:

- route summary semantics from Wave 1
- closeout truth
- reopen truth
- follow-up truth
- scan-origin route semantics

It only hardens how managers work inside the already established route model.
