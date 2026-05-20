# Action Center Bounded Execution Enterprise Design

## Status
Proposed

## Intent
This document defines the next product design step for Action Center after the constitution and adoption-measurement-readiness wave.

The goal is **not** to invent a new manager interaction model.

The goal is to take the **existing route + action-card execution model** and harden it into an enterprise-grade, bounded operating layer.

This design assumes:

- Action Center remains an embedded follow-through layer inside Verisight
- Action Center remains bounded to approved route families only
- the route remains the canonical container
- HR remains rhythm owner, governance owner, and final closeout actor
- managers may already create and review route-bound actions in runtime

This design does **not** reposition Action Center as:

- a standalone product
- a third first-buy route
- generic workflow software
- project management tooling
- advisory tooling
- an HR operating system

---

## 1. Product Role

Action Center at this stage becomes a **bounded execution system**.

That means:

- the **route** remains the governing object
- **action cards** become the manager execution surface where concrete follow-through is needed
- **reviews** become the learning and decision checkpoints on those actions
- **HR** governs rhythm, oversight, closeout, continuation, and boundedness
- **email / ICS / Outlook / optional Graph** continue to activate and mirror, not define product truth

The product promise is:

> after a scan route opens a management question, Action Center makes the follow-through concrete, reviewable, and governable without turning into generic workflow software

---

## 2. Starting Reality

This design intentionally starts from the actual runtime direction, not from a blank-sheet model.

### 2.1 Already present in code

The current product/runtime already supports:

- manager-created route actions inside a bounded route
- route action cards with a compact action contract
- action-specific review writes
- route-bound manager write access enforced from server-side truth
- route-level cadence, oversight, closeout, reopen, reminders, and review scheduling

### 2.2 Already canonically decided

The following should be treated as settled starting truth:

- the route remains the canonical container
- managers do not own route closeout, route reopen, owner reassignment, or canonical review reschedule
- HR remains the final governance actor
- actions live **inside** routes, not beside them
- route and action layers must remain bounded and non-task-board-like

### 2.3 Open product gaps

What is still not enterprise-hard enough:

- the action lifecycle contract
- the route-to-action growth policy
- the action review grammar and consequences
- the repeated-use manager execution flow
- HR oversight on action execution
- action execution metrics and buyer-proof packaging

This design exists to harden those gaps without broadening the product surface.

---

## 3. North Star

The enterprise-grade bounded execution end state is:

- a route opens a bounded follow-through question
- the assigned manager can add and review one or more concrete actions inside that route
- those actions remain small, explicit, and reviewable
- HR can see where action execution is healthy, stalled, overgrown, overdue, or ready for closeout
- the system stays measurably useful without becoming a project board

The product should feel:

- stronger than a passive reporting layer
- calmer than generic action-planning suites
- safer and more governable than an open workflow system

---

## 4. Core Model

### 4.1 Route stays canonical

The route continues to own:

- route identity
- route family
- ownership
- cadence
- route state
- closeout / continuation
- route history

Action cards never replace route truth.

### 4.2 Action cards become the bounded execution layer

Action cards become the primary execution surface **once a route needs concrete local follow-through**.

They are:

- route-bound
- concrete
- reviewable
- limited in count
- manager-writable within bounded permissions

They are not:

- free tasks
- broad work packages
- subtasks
- open collaboration threads
- separate projects

### 4.3 Reviews become action checkpoints

Reviews on action cards exist to answer:

- what did we try
- what did we observe
- what does that mean
- do we continue, adjust, complete, or stop

Review does not exist as generic commentary.

### 4.4 HR remains the governing layer

HR remains responsible for:

- cadence health
- route oversight
- review discipline
- boundedness enforcement
- route closeout
- route reopen
- continuation decisions

Managers execute.

HR governs.

---

## 5. Action Lifecycle

The action-card model must be explicit enough to become product truth rather than informal runtime behavior.

### 5.1 Canonical action states

The bounded action lifecycle distinguishes:

- `open`
- `in_review`
- `afgerond`
- `gestopt`

The product may use friendlier labels on screen, but the semantic model must stay explicit.

### 5.2 State meanings

`open`

- a concrete action exists
- it is active or expected to be active
- it has not yet been formally reviewed to a terminal outcome

`in_review`

- the action has reached a review checkpoint
- the outcome suggests the action remains active but requires continuation or adjustment

`afgerond`

- the action itself is complete
- this does **not** automatically close the route

`gestopt`

- the action should not continue
- this does **not** automatically close the route

### 5.3 What the lifecycle must not do

The action lifecycle must not:

- silently imply route closure
- blur action completion into route resolution
- let review semantics float outside explicit state consequences

---

## 6. Action Review Grammar

The review layer must drive action meaning more explicitly than it does today.

### 6.1 Required review outcome grammar

The bounded review model distinguishes at least:

- `effect-zichtbaar`
- `bijsturen-nodig`
- `nog-te-vroeg`
- `stoppen`

### 6.2 Outcome consequences

The product default consequences are:

- `effect-zichtbaar` -> action moves to `afgerond`
- `stoppen` -> action moves to `gestopt`
- `bijsturen-nodig` -> action moves to `in_review`
- `nog-te-vroeg` -> action moves to `in_review`

### 6.3 Review does not decide route closure by itself

Even if an action is `afgerond` or `gestopt`, the route remains open until HR decides:

- no further follow-through is needed
- continuation is needed
- closeout is appropriate

This separation is mandatory.

---

## 7. Route-To-Action Policy

This is the most important boundedness rule in the design.

### 7.1 Not every route needs action cards immediately

A route may remain at a lighter state where:

- manager response exists
- review rhythm exists
- no explicit action card is yet necessary

The product must not force every route into heavier execution structure.

### 7.2 When action cards are warranted

Action cards become the expected execution surface when:

- a concrete local intervention is known
- accountability benefits from named execution steps
- review should attach to an explicit intervention rather than only a route-level response
- the route has moved beyond acknowledgement into execution

### 7.3 Active action limits

The bounded execution default is:

- `1` active action is normal
- `2` active actions is acceptable where the route clearly spans two concrete interventions
- `3` active actions is the maximum healthy default
- more than `3` active actions should be treated as governance friction and surfaced to HR as action-sprawl risk

### 7.4 What the product must prevent

The product must prevent drift into:

- unbounded parallel actions
- action card inflation for weak reasons
- routes that become silent task lists

---

## 8. Manager Execution UX

This design deliberately prefers **contextual execution** over dashboard ownership.

### 8.1 Interaction principle

Managers should feel:

- I know what route this is
- I know what action exists or is needed
- I can take one bounded next step
- I do not need to manage a large system

### 8.2 Default action flow

The standard repeated-use flow is:

1. manager lands in route context from a bounded entry point
2. manager sees whether the route is still in response mode or already in action mode
3. manager adds or updates a bounded action if concrete execution is needed
4. manager later completes a bounded action review

### 8.3 Manager-visible actions in this wave

Managers may:

- add an action inside an existing route
- update a route-bound action
- review an action
- surface a bounded signal such as extra attention or blockage through the action/review path

Managers do not:

- close routes
- reopen routes
- reassign owners
- canonically reschedule review moments
- operate a general task dashboard

### 8.4 UX simplification goals

The manager execution surface should become:

- calmer
- smaller
- more guided
- less form-heavy
- less interpretive

This wave should simplify the current action create and review experience rather than add more execution modes.

---

## 9. HR Governance On Action Execution

Enterprise maturity requires HR control on the action layer, not just the route layer.

### 9.1 HR must be able to see

HR needs bounded visibility into:

- routes with no actions
- routes with one action
- routes with two or three active actions
- routes with action-sprawl risk
- actions without timely review
- actions stuck in `open`
- actions lingering in `in_review`
- routes whose actions are done but whose route is not yet closed

### 9.2 HR must not become the action operator

The oversight layer must not turn HR into the day-to-day execution owner.

HR governs:

- whether the route is healthy
- whether action growth is acceptable
- whether review rhythm is healthy
- whether closeout or continuation is due

### 9.3 Governance signals

The design should explicitly support these derived governance signals:

- `missing_action_where_execution_is_expected`
- `action_sprawl_risk`
- `missing_action_review`
- `stuck_action`
- `route_ready_for_closeout`

These are bounded operational signals, not generic workflow analytics.

---

## 10. Reporting And Measurement

This wave should make the existing action model measurable enough to later prove effectiveness.

### 10.1 Core action execution measures

The measurement layer should support at least:

- `route_to_action_conversion_rate`
- `time_to_first_action`
- `actions_per_route_distribution`
- `action_review_completion_rate`
- `action_completion_rate`
- `action_stop_rate`
- `time_from_action_creation_to_first_review`
- `route_stale_rate_with_actions_present`
- `hr_chasing_reduction_proxy_on_action_routes`

### 10.2 Metric meaning

These metrics help answer:

- are managers acting at all
- are they acting quickly enough
- are actions being reviewed
- are actions helping routes progress
- is HR still manually chasing too much

### 10.3 What the metrics do not prove

These metrics do not by themselves prove:

- intervention quality
- causal impact
- management quality
- retention outcomes

They are adoption and operating evidence, not causal proof.

---

## 11. Buyer-Proof Boundaries

The manager-created action model must be buyer-safe.

### 11.1 What must be explainable to buyers

Enterprise buyers must be able to understand:

- why managers may create actions
- why those actions are bounded
- how HR remains in control
- why this does not become task management
- how route truth stays canonical
- how notes and action reviews stay out of personnel-dossier behavior

### 11.2 What must stay explicitly true

Action Center still does **not** become:

- a company-wide action management platform
- a people case-management system
- an employee risk ledger
- an open work-management layer

Its legitimate scope remains:

- post-scan follow-through
- route-bound concrete execution
- review and oversight discipline

---

## 12. Workstreams

This design should be realized through four product workstreams.

### 12.1 Workstream A: Action contract

Define and harden:

- action lifecycle
- review-outcome consequences
- route-to-action growth rules
- active action limits
- explicit route-status versus action-status boundaries

### 12.2 Workstream B: Manager operating flow

Simplify and strengthen:

- action create flow
- action update flow
- action review flow
- default field structure
- route-to-action entry clarity

### 12.3 Workstream C: HR execution oversight

Add bounded HR visibility for:

- action growth
- missing reviews
- stuck actions
- closeout readiness

### 12.4 Workstream D: Measurement and buyer readiness

Add:

- action execution metrics
- governance packaging
- buyer-proof boundedness story

---

## 13. Phasing

### Phase 1: Action contract hardening

First settle:

- lifecycle
- route-to-action policy
- review consequences
- active action guardrails

### Phase 2: Manager repeated-use UX

Then improve:

- create/update/review calmness
- defaults
- repeated-use clarity

### Phase 3: HR execution oversight

Then add:

- action-layer governance visibility
- action-sprawl signaling
- closeout-readiness signaling

### Phase 4: Measurement and buyer packaging

Last add:

- execution evidence
- trust/story packaging
- enterprise-ready explanation

---

## 14. Non-Goals

This design does not:

- add new route families
- add Teams/Slack/multichannel broadening
- make Graph required
- allow off-platform canonical writes
- create subtasks or project boards
- replace route truth with action truth
- move route closeout to managers
- claim adoption proof

---

## 15. Success Criteria

This design is successful when:

- the existing action-card model is treated as product truth rather than a partial side-path
- managers can act inside routes without dashboard-heavy ownership
- HR can govern execution without becoming the action operator
- action cards remain bounded and non-tasky
- route closeout remains clearly separate from action completion
- the product is more enterprise-defensible without becoming broader

---

## 16. Approval Gate

This design is ready for implementation planning only when the follow-up plan can execute without inventing new product truth around:

- action lifecycle
- review-outcome consequences
- route-to-action policy
- action-count limits
- HR oversight semantics
- measurement contract
- buyer-proof boundaries

If those are not explicit, implementation planning should stop.

---

## 17. Next Step

After approval, the next document should be an implementation plan that decomposes this bounded execution upgrade into slices.

That plan should stay focused on:

- hardening what already exists
- simplifying the current manager action model
- strengthening governance and measurement

It must not invent a new Action Center execution model.
