# Batch A Productization of Execution

## Status
Proposed

## 1. Purpose

This document defines **Batch A** from the Action Center Enterprise Roadmap.

Batch A exists to turn the current Action Center runtime into an **enterprise-worthy bounded execution layer inside Loep**.

This batch does not invent a new product model. It hardens and completes the existing one:

- route stays canonical
- action cards remain route-bound execution objects
- managers remain light execution participants
- HR remains rhythm owner, governance owner, and final closeout actor

This document is a **batch spec**. It is not an implementation plan.

## 2. Batch Role

Batch A is the first major execution batch after the bounded execution foundation.

Its purpose is to ensure that Action Center no longer feels like a capable but partially unfinished follow-through layer. By the end of Batch A, the product should feel stable enough that later work can safely focus on governance readback, measurement surfaces, and buyer readiness instead of still debating core product truth.

Batch A is complete only when all three internal sub-batches are complete:

- `A1 - Action Contract & Lifecycle`
- `A2 - Manager Execution UX`
- `A3 - Route Differentiation Alignment`

## 3. Starting Point

Batch A starts from the current product reality already present in the merged codebase.

Current truth:

- route truth is canonical inside Action Center
- action cards already exist inside routes
- managers can create and review route-bound actions
- HR already governs rhythm, oversight, closeout, and continuation
- governance signals already exist for execution gaps, sprawl, stuck actions, and repeated no-progress loops
- approved route families remain bounded to `exit` and `retention`

Current gaps that Batch A must close:

- action-card contract is not yet complete enough for repeated enterprise use
- action lifecycle and transition truth need a final stable product contract
- manager execution UX still needs repeated-use hardening
- route-to-action growth policy still needs a stronger bounded rule set
- `ExitScan` and `RetentieScan` still need stronger route differentiation for Action Center follow-through

## 4. Batch Constraints

The following constraints remain fixed throughout Batch A:

- Action Center remains embedded inside Loep
- Action Center remains route-bound
- Action Center remains limited to approved route families only
- HR remains governance owner and final closeout actor
- managers do not gain route closeout, route reopen, canonical reschedule, or owner-reassignment power
- no off-platform canonical writes are introduced
- no Teams, Slack, multichannel expansion, or Graph dependency is introduced
- no generic workflow, project management, task board, or case-management behavior is introduced
- no standalone Action Center framing is introduced
- no route-family expansion outside `exit` and `retention` is introduced

## 5. Batch Outcome

By the end of Batch A, Action Center should behave like a calm, bounded execution product:

- managers can create, review, adjust, block, stop, and complete route-bound actions without ambiguity
- HR can trust the underlying action and review semantics
- route-to-action growth remains bounded and governable
- `ExitScan` and `RetentieScan` are distinct enough that Action Center follow-through does not flatten them into the same product
- later measurement-readback work can build on stable product truth instead of filling semantic gaps

## 6. Sub-Batch Structure

### A1 - Action Contract & Lifecycle

**Purpose**

Finalize the product truth for action cards and action reviews.

**Scope**

- action-card contract
- action quality rules
- action lifecycle
- action transition matrix
- draft / invalid / HR-review behavior
- route-to-action policy
- action-sprawl guardrails
- route/action/review semantic boundaries

**Must define**

- required and prohibited action-card fields
- valid and invalid action rules
- draft versus active truth
- HR review required states
- allowed and prohibited state transitions
- review-outcome to next-state mapping
- route-level limits and action growth rules

**Must not do**

- introduce subtasks
- introduce generic task hierarchy
- introduce broad priority systems
- introduce free-form project structures
- let action truth replace route truth

### A2 - Manager Execution UX

**Purpose**

Make manager execution calm, low-friction, and repeatable.

**Scope**

- manager create flow
- manager update flow
- manager review flow
- bounded evidence UX
- compact status and review consequences
- route-level entry into action execution

**Must define**

- the primary manager create path
- the primary manager review path
- low-friction invalid-action correction behavior
- compact evidence entry behavior
- no-dashboard-heavy ownership rules
- minimal field load per repeated-use action review

**Must not do**

- make managers dashboard owners
- optimize for broad manager admin behavior
- create a second parallel manager model next to action cards
- make the UX depend on broad reporting or analytics surfaces

### A3 - Route Differentiation Alignment

**Purpose**

Ensure Action Center execution remains aligned to the product differences between `ExitScan` and `RetentieScan`.

**Scope**

- ExitScan route defaults and management grammar
- RetentieScan route defaults, evidence grammar, and confidence expectations
- bounded route-specific closeout and continuation framing
- route-safe follow-through distinction

**Must define**

- how `ExitScan` follow-through differs from `RetentieScan` follow-through
- how route defaults differ
- how action focus differs
- how review and closeout questions differ
- how route-specific semantics remain aligned without introducing separate workflow systems

**Must not do**

- open new route families
- create route-specific workflow exceptions that break shared Action Center truth
- use Action Center to hide unresolved `RetentieScan` MTO-light ambiguity

## 7. Product Decisions Required In Batch A

Batch A must settle the following product decisions:

1. What exactly makes an action card valid, invalid, or HR-review-worthy?
2. Which action lifecycle states are canonical, and which are only UI labels?
3. Which state transitions are allowed, prohibited, or derived?
4. How do action reviews change action state without changing route truth?
5. When does a route require zero, one, two, or three actions?
6. How does the manager create/update/review flow stay lighter than generic action-planning tools?
7. How do `ExitScan` and `RetentieScan` differ enough that follow-through still respects route intent?

No implementation plan should be written until these product decisions are explicit in the Batch A output documents.

## 8. Required Deliverables

Batch A must produce at least:

- `Action Center Manager Execution Productization` spec
- `ExitScan Differentiation Hardening` spec
- `RetentieScan Evidence + Confidence Hardening` spec
- one integrated implementation plan for Batch A execution, or tightly coordinated implementation plans that still preserve Batch A as one governed batch
- finalized action-card contract
- finalized action transition matrix
- finalized draft / invalid / HR-review behavior
- finalized route-to-action policy
- finalized manager execution UX contract
- finalized route differentiation defaults for `ExitScan` and `RetentieScan`

## 9. Decision Order

Batch A should settle decisions in this order:

1. action-card contract
2. action quality rules
3. action lifecycle and transition truth
4. draft / invalid / HR-review behavior
5. route-to-action policy
6. manager create/update/review UX
7. route differentiation defaults for `ExitScan` and `RetentieScan`

This order is mandatory because manager UX and route differentiation should build on stable action truth, not redefine it indirectly.

## 10. Non-Goals

Batch A explicitly does not do the following:

- no route-family expansion
- no Teams, Slack, or multichannel expansion
- no Graph dependency
- no off-platform canonical write behavior
- no generic workflow broadening
- no broad analytics platform
- no buyer packaging as the main workstream
- no standalone Action Center framing
- no intervention impact claims
- no adoption proof claims

## 11. Exit Criteria

Batch A may exit only when all of the following are true:

- action-card contract is finalized
- action transition matrix is finalized
- draft / invalid / HR-review flow is defined
- manager create / update / review UX is specified and scenario-tested
- ExitScan and RetentieScan route defaults are explicitly differentiated
- no unresolved product truth remains around route, action, or review semantics

Batch A is not complete if any of A1, A2, or A3 still contains unresolved product truth.

## 12. Stop Conditions

Batch A must stop and simplify if any of the following happen:

- manager execution becomes dashboard-heavy
- action cards drift toward broad task or project management
- route-to-action policy becomes too permissive to govern cleanly
- RetentieScan semantics remain too close to MTO-light and create false alignment with Action Center execution
- route-specific needs begin to create separate workflow rules instead of shared bounded truth

## 13. Implementation Preconditions

Coding must not start from this batch spec directly.

Before implementation begins, Batch A requires:

- approved Batch A spec
- approved Batch A implementation plan
- test strategy
- no unresolved canonical product truth
- explicit non-goals
- no off-platform canonical write behavior
- no route expansion outside approved scope

## 14. Success Definition

Batch A is successful when:

- Action Center execution no longer feels semantically unfinished
- manager action behavior is calm, bounded, and repeatable
- HR can trust the route/action/review model without relying on informal interpretation
- `ExitScan` and `RetentieScan` remain clearly distinct within shared Action Center truth
- later governance and measurement-readback work can proceed without reopening core execution semantics
