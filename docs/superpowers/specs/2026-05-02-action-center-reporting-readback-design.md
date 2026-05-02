# Action Center Rapportage en Bestuurlijke Teruglezing

## Status
Proposed

## Intent
This document defines Wave 3 of the Action Center commercial roadmap: adding a compact reporting and bestuurlijke readback layer on top of existing Action Center route truth.

This wave is intentionally **not** a broad analytics expansion. It is a bounded readback slice that helps HR and sponsors understand what has happened across visible routes without turning Action Center into a reporting suite.

---

## 1. Why This Wave Exists

After Waves 1 and 2, Action Center reads better at route level and is more honest about the manager-action model. What is still missing is a calm answer to a bestuurlijke question:

- what is happening across my visible routes
- how many routes are still active versus historically closed
- where have explicit decision moments already happened
- where is continuation over time already visible

Today much of this truth already exists in runtime:

- route status
- action and review aggregation
- closeout truth
- reopen truth
- follow-up truth
- one-step lineage reading
- decision and result history per route

But these truths are still mostly visible only route-by-route. That is enough for detail reading, but too thin for pilot-grade bestuurlijke readback.

---

## 2. Product Boundary

This wave adds a **compact workspace readback layer**, not a full reporting module.

### In scope

- a small workspace-level readback summary built from existing runtime truth
- compact route-over-time signals for HR and managers
- summary counts for route state, explicit decision presence, and continuation visibility
- calm rendering in the overview surface
- no new write flows

### Out of scope

- trend graphs
- exports
- theme analytics
- multi-period dashboards
- chain-level lineage exploration
- introducing a second product area next to the Action Center overview

This wave must keep Action Center positioned as a post-scan follow-through layer, not a standalone reporting product.

---

## 3. Starting Foundation, Split by Reality

### 3.1 Canonically decided

The following are already decided and should not be reopened in this wave:

- route is the bestuurlijke container
- closeout is explicit route truth
- reopen is a dedicated route-event truth
- follow-up is distinct continuation truth
- lineage reading stays compact and one-step
- readback should be derived from canonical route truth, not separate reporting state

### 3.2 Product/runtime present enough to build on

The following are already materially present in runtime and can support this wave directly:

- live Action Center items with route status and review dates
- route summary projection
- decision history and result progression per route
- closeout semantics
- lineage summary and follow-up semantics
- existing `getLiveActionCenterSummary(...)` as a thin aggregate layer

### 3.3 Directional but not yet hardened enough to overfit the reporting layer to them

The following remain directional and should be read carefully rather than over-modeled:

- multiple action cards as the final repeated-use operating model
- action-bound review as the final practical review loop
- manager action creation as the fully settled standard route move

### 3.4 Design consequence

The reporting/readback layer must therefore:

- aggregate from route-level truth first
- use action and review truth only where already stable enough to summarize safely
- avoid metrics that assume the action model is already perfectly quiet
- stay compact enough that later hardening of manager semantics does not force a redesign of the readback layer

---

## 4. Desired Outcome

After this wave, an HR lead, sponsor, or manager should be able to open the Action Center overview and quickly understand:

- how many visible routes are still open versus historically closed
- how many visible routes already carry explicit decision history
- where continuation over time is already visible through reopen or follow-up truth
- what the nearest review pressure still looks like

This should be possible without opening each route one by one.

---

## 5. Readback Model

This wave introduces a small **workspace readback summary** derived from visible route items.

It should answer four bounded questions:

1. how many visible routes are still active versus closed
2. how many visible routes already have explicit bestuurlijke decision history
3. how many visible routes show continuation over time through reopen or follow-up truth
4. what review pressure is nearest in the visible workspace

This is intentionally a bounded pilot-grade readback model, not a broad BI layer.

---

## 6. Summary Segments

### 6.1 Routebeeld

The readback layer should summarize the visible route estate in a compact way:

- active routes
- closed routes
- total visible routes

This should remain route-level, not action-level.

### 6.2 Besluitspoor

The readback layer should show how many visible routes already carry explicit bestuurlijke readback through decision history.

This does not mean “good outcome”.
It only means the route already has an explicit decision track that can be read back.

### 6.3 Vervolg over tijd

The readback layer should summarize continuation visibility over time:

- reopened route presence
- direct follow-up visibility

This is about whether the route story already spans more than one bestuurlijke round, not about showing the whole chain.

### 6.4 Reviewdruk

The readback layer should keep one compact review-pressure signal:

- how many visible routes have a next review in view
- what the earliest upcoming review date is

This keeps the summary operationally useful without turning it into a planning board.

---

## 7. Placement

### 7.1 Overview

Overview is the main surface for this wave.

It should show:

- a compact readback block or card
- summary signals for routebeeld, besluitspoor, vervolg over tijd, and reviewdruk

This readback should sit alongside the current overview, not in a separate reporting screen.

### 7.2 Detail

This wave does not require a new heavy detail surface.

Route detail already contains:

- result progression
- decision history
- closeout
- lineage context

That remains the route-level supporting detail behind the new overview readback.

---

## 8. Projection Rules

### 8.1 One summary source

Workspace readback must project from one aggregate layer built from visible route items.

Overview should not recompute ad hoc counts from different blocks of UI state.

### 8.2 Route deduplication

If a route is represented more than once in future surfaces, the readback layer must still count it once at route level.

### 8.3 Continuation counting

Reopen and direct follow-up should count from canonical route semantics already projected into the item, not from UI-only labels.

### 8.4 Defensive fallback

If a route has incomplete readback truth:

- do not invent historical meaning
- simply omit that route from the affected subcount
- keep the rest of the readback summary stable

---

## 9. Pilot Contribution

This wave matters for pilot readiness because it makes Action Center easier to explain and easier to trust.

Without it:

- HR must reconstruct history route by route
- sponsors do not get a bounded readback layer
- Action Center looks operational but not yet bestuurlijk mature

With it:

- the product can show that follow-through is not only being done, but also read back coherently
- without overgrowing into a reporting platform

---

## 10. Non-Goals

This wave must not:

- add charts just to look “reporting-like”
- create a separate reporting module
- depend on complete manager-action maturity
- expose chain-level lineage complexity
- redefine route status or continuation truth

This is a compact readback layer built from existing Action Center runtime truth.
