# Action Center P0: Constitution + Adoption Measurement Readiness Remediation Memo

## Status
Drafted from review consolidation

## Intent
This memo translates the recent Action Center and suite-level product reviews into one bounded remediation program.

It is not yet a design spec and not an implementation plan.

Its purpose is to force the key product decisions that must be made before:

- writing a full Action Center constitution/adoption design spec
- decomposing that spec into implementation slices
- continuing feature expansion on top of an under-specified product core

This remediation wave produces **adoption measurement readiness**, not adoption proof.

That means:

- this wave defines how Action Center adoption will be measured
- this wave makes the product measurable and governance-safe enough for live evaluation
- adoption proof must be gathered later through live routes and real operating use

No commercial claim of proven Action Center adoption should be made based only on this remediation or its follow-up spec work.

---

## 1. Problem

Action Center is strategically well positioned as Verisight's embedded follow-through layer, but it is still vulnerable on two fronts:

- the constitutional product core is not yet explicit enough
- the adoption model is not yet explicit enough to make the product safely measurable

The result is a product that already has meaningful capability depth, but can still be read as:

- a strong capability-set rather than a fully disciplined product
- a promising follow-through layer whose truth model is stronger in intent than in explicit policy
- a workflow surface that could drift into complexity faster than it accumulates buyer trust

This is a strategic risk because Action Center carries the credibility of Verisight's report-to-action promise.

---

## 2. Why This Is P0

This program is `P0` for four reasons:

- Action Center is the suite's most visible proof that Verisight can carry management follow-through beyond reporting.
- A large part of the functional foundation is already live, so this is the right moment to harden the product core instead of adding more breadth.
- Without an explicit constitutional layer, future additions increase the risk of scope-creep, route confusion, and channel fragmentation.
- Without adoption measurement readiness, enterprise buyers can still interpret Action Center as an interesting but operationally risky extra tool.

This program should therefore stabilize the product before more ambition is layered onto it.

---

## 3. Review Findings This Memo Addresses

This memo is designed to address the following recurring findings from the recent suite and Action Center reviews:

- Action Center still risks feeling like a capability-set instead of a fully crystallized product.
- The product needs harder truth rules and fewer implicit assumptions.
- Follow-through value should be proven by operating rhythm and outcome discipline, not by feature breadth.
- Boundedness is strategically correct, but needs stronger explicit safeguards.
- Enterprise readiness is blocked less by missing features than by missing constitutional clarity and adoption evidence.

These findings are treated here as product-input, not as optional commentary.

---

## 4. Program Scope

### In scope

- Action Center core object model
- Action Center canonical state model and state transitions
- roles and permissions matrix
- closeout, reopen, and resolved semantics
- off-platform write policy across app, email, Outlook, and Graph
- route eligibility rules for when Action Center semantically applies
- manager quick-action contract
- adoption metrics framework for follow-through quality

### Explicitly out of scope

- new route-family expansion
- generic task or workflow engine behavior
- broader multichannel expansion beyond current bounded channels
- buyer-facing repositioning of Action Center as a standalone product
- major visual redesign work that does not serve the constitutional or adoption problem directly
- packaging-first work that bypasses product hardening

This keeps the remediation program narrow enough to produce real product certainty.

---

## 5. Non-Negotiable Defaults

- Action Center remains the only canonical write surface for follow-through state.
- Email, ICS, Outlook, and optional Graph may notify, invite, remind, mirror, or hint attendance, but may not canonically close, reopen, reassign, reschedule, or change route status unless a later approved policy explicitly allows it.
- HR is the rhythm owner and final closeout actor.
- Managers participate through contextual quick actions, not dashboard ownership.
- Manager participation must stay lighter than HR participation.
- Route eligibility is limited to explicitly approved routes. ExitScan and RetentieScan are the bounded priority routes; no broader route expansion is allowed inside this remediation wave.
- `Resolved` is not safe as a generic end-state for people signals. The model must distinguish action completed, review completed, route closed, continuation planned, and signal still monitored.
- Configuration must stay bounded. No free-form workflow rules, generic automation chains, or broad cross-channel orchestration are allowed.
- The product should become simpler and more defensible after this work, not broader and heavier.

---

## 6. Core Product Question

How do we make Action Center product-wise sharp, bounded, and measurable enough that:

- HR can trust it as the operating layer for follow-through rhythm
- managers experience it as light contextual participation instead of dashboard burden
- enterprise buyers do not read it as immature workflow tooling
- the suite can reuse it without turning it into a generic operations shell

This is the decision-making question the follow-up spec must answer.

---

## 7. Decision Order

The follow-up design spec must resolve decisions in this order:

1. Canonical object model
2. Canonical state model
3. State transition rules
4. Roles and permissions
5. Off-platform write policy
6. Route eligibility
7. Manager quick-action contract
8. Adoption metrics framework
9. Governance, audit and data boundaries
10. Test strategy

This order is mandatory because UX, triggered mail, Outlook/Graph behavior, and reporting must derive from the canonical object and state model, not define it ad hoc.

---

## 8. Desired Outcome

At the end of this remediation wave, Action Center should have:

- an explicit product constitution
- one clear canonical truth model for follow-through state
- explicit read/write boundaries between Action Center and its surrounding channels
- measurable adoption signals that make later proof possible
- a clearer enterprise story as a bounded follow-through assurance layer

The objective is not "more Action Center."

The objective is a stronger, calmer, more defensible Action Center.

This wave should end with adoption measurement readiness.

Actual adoption proof must be gathered later from live routes, real follow-through usage, and bounded operating evidence.

---

## 9. Decisions This Memo Must Force

The next spec must make the following decisions explicit:

- what the canonical Action Center objects are
- which states exist and which do not
- when a route is `open`, `scheduled`, `overdue`, `stale`, `resolved`, `closed`, or `reopened`
- which actors may read, trigger, confirm, reschedule, close, reopen, or escalate
- what may happen outside Action Center and what must never happen outside it
- when Action Center semantically belongs to a route and when it does not
- which metrics make follow-through adoption later provable in live use

`Resolved` is not safe as a generic end-state for people signals.

The design spec must distinguish at least:

- action completed
- review completed
- route closed
- no further follow-up needed
- continuation planned
- signal still monitored
- reopened

If any of these remain ambiguous, the design is not ready.

---

## 10. Required Artifacts

This remediation program should minimally produce:

- `Action Center Constitution`
- `Action Center State Model`
- `Roles and Permissions Matrix`
- `Off-Platform Write Policy`
- `Route Eligibility Matrix`
- `Manager Quick-Action Contract`
- `Adoption Metrics Framework`
- `Governance, Audit and Data Boundaries Appendix`

These artifacts should become named sections or appendices in the follow-up design spec.

---

### Appendix coverage

The `Governance, Audit and Data Boundaries Appendix` must cover:

- auditlog requirements
- data retention assumptions
- visibility boundaries
- manager note/update visibility
- the distinction between `opvolghistorie` and `personeelsdossier`
- customer and tenant boundary
- export or support boundaries
- Microsoft Graph consent and fallback governance
- what may not be stored in Action Center

---

## 11. Success Criteria

Within one focused improvement wave, the following should become true:

- Action Center boundaries are explicit and internally consistent.
- There is no ambiguity about truth, ownership, and state transition semantics.
- Manager participation is intentionally lightweight and context-driven.
- HR can run follow-through without the product turning into a planning board.
- Adoption quality can be measured later with live product metrics instead of intuition.
- The product feels simpler and stronger after the work, not broader and heavier.

This program succeeds only if it increases product confidence while reducing interpretive ambiguity.

---

## 12. Definition of Done

This remediation wave is complete only when the follow-up design spec defines:

- every canonical Action Center object and its purpose
- every allowed state and prohibited state
- every allowed state transition
- actor permissions for each transition
- trigger behavior for email, ICS, Outlook, and Graph-related surfaces
- which interactions are canonical writes, non-canonical signals, or notification-only events
- route eligibility rules for ExitScan and RetentieScan
- explicit exclusion rules for non-eligible route families
- manager quick actions with one primary action per trigger
- HR rhythm ownership boundaries
- stale, overdue, escalation-sensitive, closed, resolved, and reopened definitions
- auditlog requirements for owner changes, review changes, closeout, reopen, and escalation
- adoption metrics with event source, formula, and interpretation
- test coverage requirements for permissions, state transitions, stale/overdue logic, reschedule behavior, closeout/reopen behavior, and off-platform boundary violations

If any of these are missing, the design spec is not approved for implementation planning.

---

## 13. Risks To Watch

- solving too many adjacent problems at once and recreating scope-creep
- confusing constitutional work with a UI expansion project
- claiming adoption proof without first defining what "healthy adoption" means
- widening route parity before the constitutional model is fully explicit
- introducing more channel behavior before write-policy is fully bounded

These are not edge risks; they are the most likely failure modes for this program.

---

## 14. Recommended Next Step

The immediate next step is to turn this memo into a bounded design spec:

- `2026-05-19-action-center-constitution-adoption-design.md`

That design spec should define:

- architecture
- canonical object model
- state model
- transition model
- role model
- write boundaries
- route eligibility
- manager quick-action contract
- adoption measurement framework
- governance/audit/data appendix
- test strategy
- non-goals

Only after that spec is approved should an implementation plan be written.

---

## 15. Working Rule

Until the constitution/adoption design spec exists, Action Center should not be expanded by adding new product depth that assumes settled truth rules.

This memo therefore establishes a temporary working rule:

> no meaningful Action Center broadening without first hardening the constitutional and adoption model

Until the design spec is approved:

- no new route-family expansion
- no new Graph-dependent behavior
- no new generic workflow behavior
- no new manager dashboard broadening
- no new packaging claim that treats Action Center as a standalone module or broad standard upsell
- no new off-platform canonical write behavior

That rule protects the suite from turning a strategically strong follow-through proposition into a loosely governed operations surface.
