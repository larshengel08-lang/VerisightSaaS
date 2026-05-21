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

## 7. Sub-Batch Exit Criteria

### A1 Exit Criteria

A1 may exit only when all of the following are true:

- action-card contract is finalized
- required and prohibited fields are finalized
- valid and invalid action rules are finalized
- invalid examples are translated into explicit validation behavior
- canonical action lifecycle is finalized
- action transition matrix is finalized
- draft / invalid / HR-review flow is finalized
- route-to-action limits are finalized
- tests are specified for validation, transitions, permissions, and route/action boundaries

### A2 Exit Criteria

A2 may exit only when all of the following are true:

- manager create path is specified
- manager update path is specified
- manager review path is specified
- invalid-action correction flow is specified
- compact evidence entry behavior is specified
- field load is bounded for repeated-use review
- no-dashboard-heavy entry is preserved
- scenario walkthroughs are complete for valid action creation, invalid action correction, action review, and blocked action

### A3 Exit Criteria

A3 may exit only when all of the following are true:

- ExitScan and RetentieScan route defaults matrix is finalized
- action focus differs by route
- review window differs by route where appropriate
- closeout questions differ by route
- evidence and confidence expectations differ by route
- shared Action Center truth remains intact
- no route-specific workflow exception is introduced
- RetentieScan does not remain MTO-light in Action Center follow-through

## 8. Minimum Route Differentiation Matrix

| Dimension | ExitScan | RetentieScan |
| --- | --- | --- |
| route intent | retrospective departure and work-friction follow-through | active retention-pressure follow-through |
| action focus | verify and act on selected departure pattern or work-friction route | verify and act on selected retention pressure or work-factor route |
| default review window | 60-90 days | 45-90 days |
| evidence expectation | management-visible evidence that a selected departure-related follow-through step was attempted and reviewed | management-visible evidence that a selected retention-related follow-through step was attempted, reviewed, and interpreted with explicit caution |
| closeout question | what was chosen, what was executed, and what returns in the next exit batch or management conversations? | what was verified, what first intervention or follow-up started, and what should be watched in retention signal, stay-intent, or departure intention? |
| continuation logic | continue if the departure pattern remains active, the action evidence remains weak, or the route still needs monitoring in later exit batches or management conversations | continue if retention pressure persists, review evidence remains weak, or follow-up measurement is still planned |
| confidence / uncertainty framing | do not claim causality or proof of preventability | do not claim individual risk prediction or broad MTO diagnosis |
| what not to claim | no causal explanation, no preventability proof, no broad organizational diagnosis from one route | no individual risk prediction, no causal retention proof, no broad MTO-light diagnosis |

## 9. Product Decisions Required In Batch A

Batch A must settle the following product decisions:

1. What exactly makes an action card valid, invalid, or HR-review-worthy?
2. Which action lifecycle states are canonical, and which are only UI labels?
3. Which state transitions are allowed, prohibited, or derived?
4. How do action reviews change action state without changing route truth?
5. When does a route require zero, one, two, or three actions?
6. How does the manager create/update/review flow stay lighter than generic action-planning tools?
7. How do `ExitScan` and `RetentieScan` differ enough that follow-through still respects route intent?

No implementation plan should be written until these product decisions are explicit in the Batch A output documents.

## 10. Required Deliverables

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

## 11. Decision Order

Batch A should settle decisions in this order:

1. action-card contract
2. action quality rules
3. action lifecycle and transition truth
4. draft / invalid / HR-review behavior
5. route-to-action policy
6. manager create/update/review UX
7. route differentiation defaults for `ExitScan` and `RetentieScan`

This order is mandatory because manager UX and route differentiation should build on stable action truth, not redefine it indirectly.

## 12. Implementation Slice Guidance

Batch A should not be implemented as one large coding slice.

Recommended implementation slices:

1. Action Card Contract & Validation
2. Action Lifecycle & Transition Matrix
3. Draft / Invalid / HR Review Flow
4. Manager Create / Update / Review UX
5. ExitScan and RetentieScan Route Defaults
6. Test and Regression Hardening

Implementation plans may decompose and sequence the work, but they may not invent or reinterpret:

- action-card fields
- lifecycle states
- validation rules
- route defaults
- manager permissions
- route / action / review semantics

## 13. Required Scenario Walkthroughs

The Batch A output must define or document walkthroughs for at least:

- manager creates a valid route-bound action
- manager creates a vague action and corrects it
- manager attempts an employee-dossier-like action and is blocked or escalated
- action reaches `review_due`
- manager completes a review with `effect-zichtbaar`
- manager reviews twice with `nog-te-vroeg` or `bijsturen-nodig`
- HR sees `action_sprawl_risk`
- HR sees `repeated_review_without_progress`
- HR sees `route_ready_for_closeout`
- ExitScan and RetentieScan show differentiated route defaults

## 14. Test Expectations

Batch A must define tests for:

- valid and invalid action creation
- prohibited action-card content
- lifecycle transitions
- prohibited transitions
- manager permission boundaries
- HR-only closeout boundaries
- draft / invalid / HR-review flow
- route-to-action limits
- action-sprawl signal
- repeated-review-without-progress signal
- route differentiation defaults
- no off-platform canonical writes
- no route-family expansion

## 15. Approval / Sign-Off

Batch A output may not move to implementation unless approved by:

- product or founder owner
- engineering implementer or technical owner
- governance or trust reviewer
- route owner for ExitScan / RetentieScan differentiation, if separate

If any of these roles are not formally assigned, the founder or product owner must explicitly assume that sign-off responsibility.

## 16. Non-Goals

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

## 17. Exit Criteria

Batch A may exit only when all of the following are true:

- all A1, A2, and A3 sub-batch exit criteria are met
- required scenario walkthroughs are complete
- test expectations are defined
- route differentiation matrix is complete
- implementation slice plan is approved
- no unresolved product truth remains around route, action, review, permissions, validation, or route defaults

Batch A is not complete if any of A1, A2, or A3 still contains unresolved product truth.

## 18. Stop Conditions

Batch A must stop and simplify if any of the following happen:

- manager execution becomes dashboard-heavy
- action cards drift toward broad task or project management
- route-to-action policy becomes too permissive to govern cleanly
- RetentieScan semantics remain too close to MTO-light and create false alignment with Action Center execution
- route-specific needs begin to create separate workflow rules instead of shared bounded truth

## 19. Implementation Preconditions

Coding must not start from this batch spec directly.

Before implementation begins, Batch A requires:

- approved Batch A spec
- approved Batch A implementation plan
- test strategy
- no unresolved canonical product truth
- explicit non-goals
- no off-platform canonical write behavior
- no route expansion outside approved scope

## 20. Success Definition

Batch A is successful when:

- Action Center execution no longer feels semantically unfinished
- manager action behavior is calm, bounded, and repeatable
- HR can trust the route/action/review model without relying on informal interpretation
- `ExitScan` and `RetentieScan` remain clearly distinct within shared Action Center truth
- later governance and measurement-readback work can proceed without reopening core execution semantics
