# Action Center Constitution + Adoption Proof Remediation Memo

## Status
Drafted from review consolidation

## Intent
This memo translates the recent Action Center and suite-level product reviews into one bounded remediation program.

It is not yet a design spec and not an implementation plan.

Its purpose is to force the key product decisions that must be made before:

- writing a full Action Center constitution/adoption design spec
- decomposing that spec into implementation slices
- continuing feature expansion on top of an under-specified product core

---

## 1. Problem

Action Center is strategically well positioned as Verisight's embedded follow-through layer, but it is still vulnerable on two fronts:

- the constitutional product core is not yet explicit enough
- the adoption proof is not yet strong enough to prove this will not become "just another tool"

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
- Without adoption proof, enterprise buyers can still interpret Action Center as an interesting but operationally risky extra tool.

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

## 5. Core Product Question

How do we make Action Center product-wise sharp, bounded, and measurable enough that:

- HR can trust it as the operating layer for follow-through rhythm
- managers experience it as light contextual participation instead of dashboard burden
- enterprise buyers do not read it as immature workflow tooling
- the suite can reuse it without turning it into a generic operations shell

This is the decision-making question the follow-up spec must answer.

---

## 6. Desired Outcome

At the end of this remediation wave, Action Center should have:

- an explicit product constitution
- one clear canonical truth model for follow-through state
- explicit read/write boundaries between Action Center and its surrounding channels
- measurable adoption signals that show whether the product keeps rhythm alive
- a clearer enterprise story as a bounded follow-through assurance layer

The objective is not "more Action Center."

The objective is a stronger, calmer, more defensible Action Center.

---

## 7. Decisions This Memo Must Force

The next spec must make the following decisions explicit:

- what the canonical Action Center objects are
- which states exist and which do not
- when a route is `open`, `scheduled`, `overdue`, `stale`, `resolved`, `closed`, or `reopened`
- which actors may read, trigger, confirm, reschedule, close, reopen, or escalate
- what may happen outside Action Center and what must never happen outside it
- when Action Center semantically belongs to a route and when it does not
- which metrics count as valid proof that follow-through is alive

If any of these remain ambiguous, the design is not ready.

---

## 8. Required Artifacts

This remediation program should minimally produce:

- `Action Center Constitution`
- `Action Center State Model`
- `Roles and Permissions Matrix`
- `Off-Platform Write Policy`
- `Route Eligibility Matrix`
- `Manager Quick-Action Contract`
- `Adoption Metrics Framework`

These artifacts should become named sections or appendices in the follow-up design spec.

---

## 9. Success Criteria

Within one focused improvement wave, the following should become true:

- Action Center boundaries are explicit and internally consistent.
- There is no ambiguity about truth, ownership, and state transition semantics.
- Manager participation is intentionally lightweight and context-driven.
- HR can run follow-through without the product turning into a planning board.
- Adoption quality can be measured with live product metrics instead of intuition.
- The product feels simpler and stronger after the work, not broader and heavier.

This program succeeds only if it increases product confidence while reducing interpretive ambiguity.

---

## 10. Risks To Watch

- solving too many adjacent problems at once and recreating scope-creep
- confusing constitutional work with a UI expansion project
- claiming adoption proof without first defining what "healthy adoption" means
- widening route parity before the constitutional model is fully explicit
- introducing more channel behavior before write-policy is fully bounded

These are not edge risks; they are the most likely failure modes for this program.

---

## 11. Recommended Next Step

The immediate next step is to turn this memo into a bounded design spec:

- `2026-05-19-action-center-constitution-adoption-design.md`

That design spec should define:

- architecture
- product rules
- state model
- role model
- write boundaries
- adoption framework
- test strategy
- non-goals

Only after that spec is approved should an implementation plan be written.

---

## 12. Working Rule

Until the constitution/adoption design spec exists, Action Center should not be expanded by adding new product depth that assumes settled truth rules.

This memo therefore establishes a temporary working rule:

> no meaningful Action Center broadening without first hardening the constitutional and adoption model

That rule protects the suite from turning a strategically strong follow-through proposition into a loosely governed operations surface.
