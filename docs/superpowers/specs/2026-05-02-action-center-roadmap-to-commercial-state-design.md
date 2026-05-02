# Action Center Roadmap to Commercial State

## Status
Proposed

## Intent
This document defines the central capability roadmap for taking Action Center from its current strong product core to **pilot-ready commercial use**.

This is intentionally a **capability roadmap**, not a time-boxed delivery plan. It describes:

- what Action Center must become
- what already exists and should not be re-designed
- what gaps remain toward pilot-ready commercial use
- what order the remaining capabilities should land in

This roadmap is explicitly **not** about making Action Center a standalone primary proposition. Action Center remains the **post-scan follow-through layer** inside Verisight.

---

## 1. North Star

Action Center becomes the place where Verisight turns scan outcomes into explicit, bounded, reviewable local follow-through.

In the pilot-ready commercial state, Action Center is:

- semantically stable
- operationally reliable
- commercially explainable
- usable by HR and managers without constant product-team rescue

It is **not**:

- a generic task management tool
- a separate collaboration suite
- the first product customers buy before they experience a scan route

Its commercial role is:

> A scan reveals where attention is needed.  
> Action Center makes the ownership, follow-through, review, closure, and continuation explicit.

---

## 2. Product Boundary

Action Center sits **after** the scan route.

That means:

- a route originates from a campaign outcome, scan signal, or bounded follow-through handoff
- the route is the governing container
- actions are concrete manager interventions inside the route
- reviews are primarily action-bound
- closeout, reopen, and follow-up are route-bound governance moves

The product boundary must continue to reject:

- generalized project planning
- subtask graphs
- broad workflow administration
- "task board" drift
- using Action Center as a standalone management system without a scan-origin truth

---

## 3. Current Foundation

The roadmap starts from a foundation that is already materially stronger than a concept phase.

### 3.1 What already exists

The following capabilities already exist in product truth and should be treated as foundation, not greenfield:

- HR can open a route by assigning a manager
- a manager can see an open request immediately after assignment
- manager response writes are server-side hardened
- one route can carry multiple action cards
- each action can carry its own review moment
- routes can be explicitly closed out
- a closed route can be reopened
- a closed route can spawn a follow-up route
- lineage truth exists for reopen and follow-up
- compact lineage labels now exist for direct predecessor/successor reading

### 3.2 What this means for the roadmap

The roadmap must not behave as though Action Center is still missing:

- route-open semantics
- assignment-open visibility
- closeout
- reopen
- follow-up lineage basics

Instead, every track below must answer:

1. what is already good enough
2. what remains weak for pilot use
3. what should be hardened or clarified next
4. what must explicitly **not** be rebuilt

---

## 4. Pilot-Ready Commercial Use: End State

Pilot-ready commercial use does **not** mean enterprise breadth or self-serve scale.

It means a real pilot customer can use Action Center in a credible, safe, and supportable way after a scan route.

### 4.1 Product and platform end state

At the pilot-ready state:

- route lifecycle is stable from open -> action -> review -> closeout -> continuation
- route-level meaning is quickly readable by HR and manager
- manager interaction is light, concrete, and hard to misuse
- follow-up and lineage stay understandable over time
- permissions and writes are trustworthy enough for customer data
- browser-backed critical flows are stable enough to trust in demos and pilots
- basic bestuurlijke teruglezing exists without building a heavy analytics product

### 4.2 Pilot operationalization end state

At the pilot-ready state:

- HR can be onboarded into the route logic without bespoke product-team tutoring each time
- managers understand what a route asks of them
- internal teams know how to demo, support, and troubleshoot the critical path
- Action Center can be positioned clearly as "what happens after the scan"
- the product is operationally supportable during a paid or design-partner pilot

---

## 5. Capability Waves

The work should land in waves defined by dependency and leverage, not by calendar.

### Wave 1: Route-Brede Voortgang en Samenvatting

Goal:
make the route legible as the main bestuurlijke object above actions and reviews.

Why first:
the semantics already exist, but route meaning is not yet pilot-grade readable.

### Wave 2: Manageractie-Ervaring Verfijnen

Goal:
make manager action creation and review light, clear, and strong enough for repeated use.

Why here:
once the route reads well, the manager execution layer becomes the next adoption bottleneck.

### Wave 3: Rapportage en Bestuurlijke Teruglezing

Goal:
let HR and sponsors read what happened over time without turning Action Center into an analytics suite.

Why here:
only after routes and actions are understandable does retrospective reading create real value.

### Wave 4: Governance en Rechten

Goal:
make authority, role boundaries, and trust sharp enough for external pilots.

Why here:
parts already exist, but the whole governance layer must be coherent before real customer use.

### Wave 5: Betrouwbare Operatie

Goal:
make Action Center stable enough to run without constant manual rescue.

Why here:
stability must harden before pilots scale beyond internal confidence.

### Wave 6: UX-Volwassenheid

Goal:
make the product feel calm, intentional, and commercially credible.

Why here:
polish has the highest value once the semantic and operational core is stable.

### Wave 7: Inbedding in Scan -> Route Flow

Goal:
fully anchor Action Center as the follow-through layer after a scan.

Why here:
this is commercially essential and becomes strongest when the route product itself is already stable.

### Wave 8: Pilot Operationalisering

Goal:
make the whole system actually deliverable in a pilot motion.

Why last:
it should be built around a product that is already coherent, not around a moving target.

---

## 6. Recommended Capability Order

The recommended order is:

1. Routebrede voortgang en samenvatting
2. Manageractie-ervaring verfijnen
3. Rapportage en bestuurlijke teruglezing
4. Governance en rechten
5. Betrouwbare operatie
6. UX-volwassenheid
7. Inbedding in scan -> route flow
8. Pilot operationalisering

This is not a hard sequential waterfall. Some infrastructure and governance work can advance in parallel.  
But this is the best **primary ordering** for product leverage and pilot-readiness.

---

## 7. Subtrack Definitions

Each subtrack below is defined from the current state forward.

### 7.1 Routebrede Voortgang en Samenvatting

**Goal**

Make the route the clear bestuurlijke summary object again.

**Current basis**

- route truth exists
- route closeout exists
- route reopen and follow-up truth exist
- lineage labels exist
- action cards exist inside routes

**Open gaps toward pilot-ready**

- route-level state still needs a stronger top-layer summary
- HR and manager need faster understanding of "what is going on here now"
- route-overview must summarize multiple action/review realities without becoming noisy

**Do not re-do**

- do not redesign route-open semantics
- do not redesign closeout or follow-up truth from scratch
- do not collapse action truth back into route-only truth

**Next capability step**

- a compact route summary layer in overview and detail
- stronger route-level progression language
- clearer "what is current / what is historical / what needs attention now"

### 7.2 Manageractie-Ervaring Verfijnen

**Goal**

Make manager action work small, strong, and repeatable.

**Current basis**

- action cards exist
- review per action exists
- routes can carry multiple actions

**Open gaps toward pilot-ready**

- manager action creation still needs lighter UX and stronger defaults
- review entry needs to feel clearer and less form-heavy
- action cards should feel operationally useful without becoming task management

**Do not re-do**

- do not re-open the "single primary action only" debate
- do not expand into subtasks or project workflow
- do not move action ownership back to HR

**Next capability step**

- lighter action create flow
- more readable action cards
- sharper review prompts and defaults

### 7.3 Rapportage en Bestuurlijke Teruglezing

**Goal**

Make opvolging readable over time.

**Current basis**

- decisions, result loop, lineage, closeout, and continuation truth already exist

**Open gaps toward pilot-ready**

- no compact management-grade follow-through summary yet
- no strong route-over-time read for HR sponsors
- limited read-back of repeated themes and repeated continuation

**Do not re-do**

- do not build a heavy BI product
- do not add full historical chain explorers in V1

**Next capability step**

- small route-level reporting surfaces
- simple read-back of open/closed/followed-up routes
- minimal bestuurlijke summary views

### 7.4 Governance en Rechten

**Goal**

Make trust explicit.

**Current basis**

- major write paths have already been server-hardened
- scope checks exist on key Action Center surfaces

**Open gaps toward pilot-ready**

- role boundaries need to be more comprehensively expressed
- important bestuurlijke writes need clearer auditability
- some authority models need a cleaner shared explanation

**Do not re-do**

- do not weaken server-derived identity
- do not move critical writes back toward client-truth

**Next capability step**

- fuller role matrix
- action/review/closeout/follow-up audit expectations
- clearer governance model around who may do what and why

### 7.5 Betrouwbare Operatie

**Goal**

Make Action Center safe to run repeatedly.

**Current basis**

- key browser flows and targeted test suites already exist
- Supabase migrations and schema discipline are in active use

**Open gaps toward pilot-ready**

- migration and policy rollout should become more repeatable
- health and issue visibility should improve
- recovery and support paths should become less ad hoc

**Do not re-do**

- do not rely on manual SQL pasting as a normal operating mode
- do not let demo/seed assumptions silently become production dependencies

**Next capability step**

- sharper ops playbooks
- better health evidence
- clearer deployment and schema rollout expectations

### 7.6 UX-Volwassenheid

**Goal**

Make Action Center feel intentional and commercially credible.

**Current basis**

- the UI already carries a coherent Action Center identity
- major semantic building blocks are present on the surface

**Open gaps toward pilot-ready**

- some route states need more graceful empty and transitional states
- cognitive load still needs reduction on some detail surfaces
- mobile/responsive and state-feedback quality need more deliberate polish

**Do not re-do**

- do not replace the whole interaction model with a generic dashboard redesign
- do not trade semantic strength for shallow visual neatness

**Next capability step**

- polish passes focused on calmness, clarity, and confidence

### 7.7 Inbedding in Scan -> Route Flow

**Goal**

Make Action Center feel inseparable from the scan journey.

**Current basis**

- Action Center already depends on scan-route context rather than standalone task truth

**Open gaps toward pilot-ready**

- reports, campaigns, and route surfaces still need a tighter shared story
- commercial demos need smoother handoff from scan insight to follow-through

**Do not re-do**

- do not reposition Action Center as a standalone top-level proposition
- do not add generic non-scan entry points as the default product story

**Next capability step**

- stronger deeplinks
- clearer language continuity
- better "from insight to route" product story

### 7.8 Pilot Operationalisering

**Goal**

Make the product deliverable in customer pilots.

**Current basis**

- the product already has enough shape to be explained and demonstrated meaningfully

**Open gaps toward pilot-ready**

- onboarding-light is not yet formalized
- support/runbook readiness is incomplete
- commercial explanation and internal enablement need sharper packaging

**Do not re-do**

- do not create a heavyweight CS program
- do not over-build packaging before the product core is stable

**Next capability step**

- minimal pilot onboarding
- support playbooks
- internal demo and issue-handling guidance

---

## 8. Exit Criteria for Pilot-Ready Commercial Use

The roadmap is complete when the following are all true:

### 8.1 Product understanding

A new user can quickly understand:

- why a route exists
- who is currently responsible
- what the next meaningful step is
- whether the route is active, closed, reopened, or followed up

### 8.2 HR usability

HR can reliably:

- open routes
- assign managers
- read route progress
- close routes
- start follow-up where appropriate

without hidden system knowledge.

### 8.3 Manager usability

A manager can:

- understand why a route is theirs
- create an action with low friction
- complete action-bound review moments
- avoid getting lost in workflow overhead

### 8.4 Bestuurlijke terugleesbaarheid

HR or sponsors can read:

- what is open
- what is closed
- what got follow-up
- what changed over time

without needing a separate analytics product.

### 8.5 Governance trust

Critical writes are:

- authority-safe
- server-validated
- hard to forge
- coherent in responsibility

### 8.6 Operational stability

The team can support Action Center without routine firefighting because:

- builds are reliable
- migrations are predictable
- key browser paths are regression-tested
- issues are visible
- recovery paths are known

### 8.7 UX confidence

The product feels:

- calm
- understandable
- non-experimental
- commercially credible

### 8.8 Commercial clarity

The product can be clearly positioned as:

> the follow-through layer that comes after the scan

### 8.9 Pilot operational readiness

Internal teams have enough:

- onboarding guidance
- runbooks
- demo structure
- support expectations

to run real customer pilots.

---

## 9. Explicit Non-Goals for This Roadmap

This roadmap does not try to make Action Center:

- a broad enterprise workflow suite
- a task board platform
- a generalized cross-product operational backbone
- a self-serve product independent from scan-led value

If those goals ever matter, they should be treated as a later strategic expansion, not quietly folded into this pilot-ready roadmap.

---

## 10. Roadmap Outcome

If this roadmap is executed successfully, Verisight reaches a state where:

- scans create insight
- Action Center turns that insight into explicit follow-through
- HR and managers can operate credibly inside that layer
- route meaning remains readable over time
- the product is safe and stable enough for real pilot customers

That is the intended commercial state for this roadmap.
