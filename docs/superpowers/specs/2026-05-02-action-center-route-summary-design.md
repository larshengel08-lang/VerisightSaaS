# Action Center Route-Brede Voortgang en Samenvatting

## Status
Proposed

## Intent
This document defines Wave 1 of the Action Center commercial roadmap: making the route itself readable again as the main bestuurlijke object above actions, reviews, closeout, and lineage.

This is deliberately a **readability and meaning** wave, not a new workflow wave.

---

## 1. Why This Wave Exists

Action Center now carries materially richer route truth than before:

- HR can open a route by assigning a manager
- routes can close explicitly
- routes can reopen or continue through a follow-up route
- lineage is readable one step back and one step forward
- route action cards and action-bound reviews have strong direction and partial runtime presence

But that truth is still too fragmented in the product read.

Today the route detail can show:

- manager response
- action cards
- review log
- closeout
- lineage

without yet giving HR or a manager a sufficiently calm answer to:

- what is happening in this route right now
- what kind of route is this
- what needs attention next
- whether this is still active, ready for review, historically closed, or only contextually relevant

This wave exists to make that reading fast and bounded.

---

## 2. Product Boundary

This wave is about **route-level reading**, not route-level workflow expansion.

### In scope

- a compact route summary layer above detailed route content
- clearer route-level progress reading for HR and manager
- calm route-level summary for open, reviewable, closed, reopened, and followed-up routes
- stronger projection rules for what the route header and summary area should say
- consistent route reading between overview and detail

### Out of scope

- new task management structures
- new route statuses beyond already chosen semantics
- reopening or follow-up redesign
- broad reporting dashboards
- heavy manager action workflow redesign
- new audit or permission models beyond what this wave needs to read safely

This wave must not pretend that manager action semantics are fully settled. It should read the current truth honestly and calmly, without overcommitting to a more mature action model than runtime can yet support.

---

## 3. Starting Foundation, Split by Reality

### 3.1 Canonically decided

The following are treated as semantically chosen:

- route is the governing container
- HR assignment opens the route
- closeout is route-bound and explicit
- reopen is a dedicated route event
- follow-up is a distinct continuation route
- lineage is intentionally compact and one-step
- overview and detail should share one route reading rather than invent separate interpretations

### 3.2 Product/runtime present enough to build on

The following are already present enough in runtime to use in this wave:

- route status and route identity are readable from the live projector
- closeout summaries are rendered in detail
- lineage labels are rendered in overview/detail
- manager response context is rendered
- route action cards are renderable on detail

### 3.3 Directional but not yet hardened enough to let the route summary overfit to them

The following should still be treated as hardening inputs rather than fixed pilot-grade assumptions:

- multiple action cards as the stable repeated-use operating model
- action-bound review as the final practical review shape
- manager action creation as the fully crystallized standard next step
- route-level summary expectations that depend on heavy action-detail fidelity

### 3.4 Design consequence

The route summary must therefore:

- build from route, closeout, lineage, and currently projected action/review signals
- stay calm even if action semantics simplify later
- help HR and manager read the route without requiring the action model to be fully settled first

---

## 4. Desired Outcome

After this wave, a user landing on a route should be able to understand in a few seconds:

- what kind of route this is
- whether it is still active or already historical
- whether there is something immediate to discuss or review
- whether it is contextually linked to an earlier or later route

That reading should come from a compact route summary layer rather than from reconstructing meaning across multiple blocks.

---

## 5. Route Summary Model

The route summary is a small projection above the detailed route content.

It should answer four bounded questions:

1. what is the route state at a high level
2. what does this route currently ask for
3. what is the best short reading of progress in this route
4. does this route have immediate historical context

The summary must not attempt to become:

- a task dashboard
- a long narrative
- a second detail page

---

## 6. Summary Segments

### 6.1 Route state

The route summary should lead with one compact state reading:

- `Open verzoek`
- `In uitvoering`
- `Reviewbaar`
- `Afgerond`
- `Gestopt`

If a route is explicitly closed, closeout wins over open-route aggregation.

This wave does not introduce additional route states.

### 6.2 Route ask

The summary should then express the current route ask in one calm sentence.

Examples by semantics:

- open request route: the manager still needs to define the first meaningful local follow-through
- active route: there is active follow-through inside this route
- reviewable route: at least one action or review moment now needs explicit reflection
- closed route: the route is historically complete for now

This route ask should remain phrased at route level, not at task level.

### 6.3 Route progress reading

The summary should include a compact progress reading derived from existing route truth.

It may talk about:

- whether the route already carries concrete follow-through
- whether review is now due
- whether the route is historically closed
- whether a later follow-up exists

It should not depend on every action field being perfect.

### 6.4 Immediate lineage context

The summary may include one compact lineage label:

- `Heropend traject`
- `Vervolg op eerdere route`
- `Later opgevolgd`

Overview stays compact. Detail may show a slightly richer two-sided reading, but the summary remains a route-reading layer, not a lineage panel.

---

## 7. Overview vs Detail

### 7.1 Overview

Overview should remain compact.

It should show:

- route state
- a short route summary line
- at most one compact lineage label

If both backward and forward lineage context exist, overview shows only the backward reading because that best explains what the current route is.

### 7.2 Detail

Detail should show:

- the same route state
- the same route ask
- a slightly richer route progress summary
- lineage context in stable order when both sides exist

Detail may show both:

1. backward context
2. forward context

in that order.

This wave should not create a separate "lineage section" lower on the page. The route summary belongs near the route header because it is an orientation layer.

---

## 8. Open-Route Reading Contract

For routes without explicit closeout:

### `Open verzoek`

Use when the route exists but still lacks meaningful local follow-through.

### `In uitvoering`

Use when the route carries active local follow-through and nothing presently wins as review pressure.

### `Reviewbaar`

Use when review pressure is now the most important route-level reading.

In mixed situations, `Reviewbaar` wins over `In uitvoering`.

This wave does not change the underlying aggregation contract. It makes the read-model above that contract more legible.

---

## 9. Closed-Route Reading Contract

For routes with explicit closeout:

- the route reads as historical first
- the route summary should not keep talking as though action execution is still primary
- closeout remains the route-level meaning anchor

If a closed route later receives a follow-up route, the old route should read as:

- still closed
- but later followed up

This wave must not blur the distinction between:

- historical route
- active successor route

---

## 10. Relationship to Manager Action Semantics

This wave must be explicit about a boundary:

it is not assuming the final perfect manager action model is already settled.

Instead, this wave should:

- read the current manager-action truth as it exists today
- avoid route summary copy that depends on dense task-style action detail
- leave room for later Wave 2 hardening and simplification of manager action semantics

So the output here is:

- better route-level reading

not:

- proof that the manager action model is already commercially finished

---

## 11. Success Criteria

This wave is successful when:

- HR and manager can understand route meaning without scanning multiple lower-page blocks first
- open, reviewable, and historical routes read differently and correctly
- overview and detail do not drift into different route interpretations
- route summary remains stable even if manager action semantics continue to harden later
- the product feels more bestuurlijk and less like a pile of adjacent sub-panels

---

## 12. What This Wave Does Not Rebuild

This wave does **not** re-open:

- route open semantics
- closeout semantics
- reopen truth
- follow-up truth
- lineage truth

It only makes those truths easier to read together at route level.
