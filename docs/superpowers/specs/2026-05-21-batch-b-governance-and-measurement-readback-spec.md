# Batch B Governance and Measurement Readback

## Status
Proposed

## 1. Purpose

This document defines **Batch B** from the Action Center Enterprise Roadmap.

Batch B exists to turn Action Center from a bounded execution product into an **enterprise-worthy operating and readback module inside Loep**.

It does this without changing the product's core boundaries:

- Action Center stays embedded
- Action Center stays route-bound
- Action Center stays limited to approved route families only: `exit` and `retention`
- HR stays governance owner
- managers stay light execution participants
- the product remains post-scan follow-through only

This document is a **batch spec**. It is not a design spec for one screen and it is not an implementation plan.

## 2. Batch Role

Batch B follows Batch A.

Batch A made bounded execution stable enough for repeated use. Batch B must make that execution layer:

- governable in daily HR operation
- readable as a single operating queue
- measurable without overclaiming proof
- interpretable for management and buyers without turning into a generic analytics product

Batch B is therefore not "proof". It is **governance + measurement readback**.

Its job is to make later live evidence possible and explainable, not to pretend that roadmap or spec work has already proven adoption or intervention impact.

## 3. Starting Point

Batch B starts from the merged Batch A reality.

Current truth:

- route truth is canonical inside Action Center
- action cards are route-bound execution objects
- action lifecycle and transition truth are explicit
- draft / invalid / HR-review behavior is explicit
- manager create / update / review UX is compact and route-contextual
- `ExitScan` and `RetentieScan` route defaults are explicitly differentiated
- governance signals already exist for sprawl, repeated no-progress loops, stuck actions, and closeout-readiness
- measurement readiness primitives and bounded event semantics already exist

Current gaps that Batch B must close:

- HR still lacks a fully enterprise-worthy operating queue
- intervention logic still needs a first-class operator contract
- "why is this in my queue?" still needs to become a hard product behavior
- direct bounded HR governance actions still need to be finalized
- readback still needs to become an explicit layer above operations
- metrics still need to be stabilized as operating interpretation, not implied proof

## 4. Batch Constraints

The following constraints remain fixed throughout Batch B:

- Action Center remains embedded inside Loep
- Action Center remains route-bound
- Action Center remains limited to approved route families only
- no new route families are introduced
- no Teams, Slack, multichannel expansion, or Graph dependency is introduced
- no off-platform canonical writes are introduced
- no generic workflow, project management, task board, or case-management behavior is introduced
- no standalone Action Center framing is introduced
- managers do not become route owners, closeout actors, or governance owners
- reporting does not claim adoption proof, causal impact, retention lift, or preventability proof

## 5. Batch Outcome

By the end of Batch B, Action Center should behave like a bounded HR operating module with readback on top.

That means:

- HR begins from one unified queue
- the queue is route-first and urgency-first
- every route can explain why it is in the queue
- HR can take a small set of bounded governance actions directly from the queue
- management readback sits above the queue as a secondary layer
- metrics explain operating quality and flow health without pretending to prove intervention success

## 6. Primary Audience

Batch B is designed **first for HR operators**, with buyer-safe readback explicitly supported as a secondary layer.

This is a deliberate choice.

The product must first work as a daily operating module:

- what needs attention now?
- why is it here?
- what should HR do next?
- what happens if nothing happens?

Only then can the same model support credible management and buyer readback.

Batch B must not optimize for buyer-facing reporting at the expense of operator truth.

## 7. Operating Model

Batch B is a **unified governance + readback model**.

It is not:

- a dashboard-first analytics batch
- a buyer-reporting batch
- a generic admin tooling batch

It is:

- one unified HR queue
- one bounded set of governance recommendations
- one bounded set of direct governance actions
- one readback layer above that queue

### 7.1 Queue shape

The queue must be:

- unified, not split into separate products
- route-first, not manager-first
- urgency-first, not stage-first
- filterable by signal, manager, team, route family, and route state

### 7.2 Queue priority logic

The queue should prioritize at least:

- `escalation_sensitive`
- `stale`
- `repeated_review_without_progress`
- `action_sprawl_risk`
- `blocked_action`
- `missing review`
- `route_ready_for_closeout`

Route phase may remain visible, but it is not the primary sort order.

## 8. Unified Queue Contract

Batch B must define one unified HR queue with filters, not separate queues per signal type.

### 8.1 Required queue fields

Each queue item must expose at least:

- `route_id`
- `route_family`
- `scope_label`
- `manager_owner`
- `current_route_state`
- `current_execution_state`
- `primary_governance_signal`
- `secondary_signals`, if any
- `system_recommendation`
- `why_in_queue`
- `expected_hr_action`
- `time_in_queue`
- `last_meaningful_route_event_at`
- `last_review_at`
- `action_count_summary`
- `review_status_summary`

### 8.2 Required queue filters

At minimum, the queue must support filters for:

- route family
- governance signal
- urgency band
- manager
- team / scope
- route state
- closeout-readiness

### 8.3 Required queue sorts

At minimum, the queue must support:

- default urgency-first sort
- oldest unresolved first
- newest surfaced first
- manager / team grouping as a secondary lens

## 9. Why In Queue Contract

Every queue item must answer:

- why is this route here now?
- since when?
- what signal put it here?
- what should HR do next?
- what if HR does nothing?

This explanation must be explicit and user-visible.

It must not require HR to infer queue meaning from raw metrics or iconography alone.

## 10. System Recommendation Contract

Batch B should include bounded system recommendations.

These recommendations are governance cues, not diagnostics and not AI authority.

### 10.1 Allowed recommendation types

At minimum, the product may recommend:

- `HR review needed`
- `Review overdue`
- `Repeated no progress`
- `Blocked action check`
- `Action sprawl risk`
- `Closeout likely`
- `Continuation likely`

### 10.2 Recommendations must not do

Recommendations must not:

- diagnose root cause
- claim causal explanation
- predict individual employee outcomes
- recommend broad workflow programs
- replace HR judgment

## 11. Direct HR Governance Actions

Batch B should allow a small, bounded set of direct governance actions from the queue.

### 11.1 Allowed direct actions

At minimum, the queue may support:

- mark for HR review
- acknowledge and hold for follow-up
- escalate for governance attention
- mark closeout-ready confirmed
- remove closeout-ready status
- open route for deeper review
- route to continuation check

### 11.2 Direct actions must not do

Direct queue actions must not:

- turn into free-form workflow management
- let HR take over manager execution work
- create subtasks or project trees
- broaden into case-management notes
- close routes automatically without closeout truth

## 12. Readback Layer

Batch B includes readback, but readback is secondary to the queue.

### 12.1 Readback purpose

The readback layer exists to summarize:

- what is flowing well
- what is stuck
- where HR is spending governance effort
- how queue health changes over time
- how `ExitScan` and `RetentieScan` differ in operating pressure

### 12.2 Readback must not become

The readback layer must not become:

- a broad analytics suite
- buyer proof by itself
- a management substitute for queue operation

## 13. Measurement Readback Principles

Metrics in Batch B are operating metrics and interpretation rails.

They are not proof claims.

### 13.1 Metrics must support

- route-to-action readback
- action review timeliness
- sprawl pressure
- no-progress loops
- HR chasing burden
- closeout-readiness flow
- route family comparison across `exit` and `retention`

### 13.2 Metrics must not claim

- retention improvement
- exit reduction
- intervention effectiveness
- manager quality as a personal judgment
- individual risk prediction

### 13.3 Interpretation must be explicit

Every surfaced metric must say:

- what it measures
- what it suggests operationally
- what it does **not** prove

## 14. Route-Family Readback Rules

Batch B must preserve route-family differentiation in operations and readback.

### 14.1 Required distinctions

The queue and readback layer must preserve:

- different default review windows
- different continuation logic
- different confidence and uncertainty framing
- different action focus
- different closeout framing

### 14.2 What must stay shared

The following must remain shared:

- queue contract
- governance signal model
- recommendation model
- direct HR action model
- bounded Action Center truth

Batch B must not introduce route-specific workflow forks.

## 15. Product Decisions Required In Batch B

Batch B must settle the following product decisions:

1. What exactly puts a route into the unified HR queue?
2. What is the exact urgency order between queue signals?
3. What "why is this in my queue?" explanation is required per route?
4. Which direct HR governance actions are allowed from the queue?
5. Which system recommendations are allowed and how are they framed?
6. What readback belongs in the queue layer versus the secondary readback layer?
7. Which metrics are operator-facing, which are management-facing, and which remain internal only?
8. How do `ExitScan` and `RetentieScan` stay distinct in queue logic and readback without creating workflow forks?

No implementation plan should be written until these product decisions are explicit in the Batch B output documents.

## 16. Required Deliverables

Batch B must produce at least:

- `Action Center HR Control and Readback` spec
- `Action Center Measurement and Readback` spec or an integrated Batch B design if both remain one governed system
- finalized unified HR queue contract
- finalized direct HR governance action set
- finalized recommendation vocabulary
- finalized queue explanation contract
- finalized readback contract
- finalized metric formulas and interpretation guide
- finalized route-family readback alignment for `ExitScan` and `RetentieScan`

## 17. Decision Order

Batch B should settle decisions in this order:

1. queue operating model
2. urgency and signal priority
3. queue explanation contract
4. direct HR governance actions
5. recommendation vocabulary
6. readback layer contract
7. metric formulas and interpretation rules
8. route-family readback alignment

This order is mandatory because readback and metrics should derive from a stable operating model, not define it.

## 18. Required Scenario Walkthroughs

Batch B output must define or document walkthroughs for at least:

- HR opens the unified queue and understands why the top route is first
- HR handles a `stale` route
- HR handles `repeated_review_without_progress`
- HR handles `action_sprawl_risk`
- HR confirms or rejects `route_ready_for_closeout`
- HR uses a direct bounded governance action from the queue
- HR filters by manager
- HR filters by route family
- `ExitScan` and `RetentieScan` show different queue/readback behavior without different workflow engines
- management readback explains a metric without overclaiming impact

## 19. Test Expectations

Batch B must define tests for:

- unified queue item derivation
- urgency ordering
- queue filters
- `why is this in my queue?` explanations
- recommendation generation
- direct HR governance action boundaries
- route-family label and default alignment
- metric formulas
- metric interpretation labels
- no route-family expansion
- no off-platform canonical writes
- no project / workflow broadening through queue actions

## 20. Exit Criteria

Batch B may exit only when all of the following are true:

- unified HR queue contract is finalized
- queue priority logic is finalized
- queue explanation contract is finalized
- direct HR governance action set is finalized
- recommendation vocabulary is finalized
- readback layer contract is finalized
- metric formulas are finalized
- metric interpretation guide is complete
- no causal-impact claims appear in reporting language
- route-family readback works across both ExitScan and RetentieScan scenarios
- required scenario walkthroughs are complete
- test expectations are defined
- no unresolved product truth remains around queue semantics, governance actions, recommendations, readback, or route-family interpretation

## 21. Approval / Sign-Off

Batch B output may not move to implementation unless approved by:

- product or founder owner
- engineering implementer or technical owner
- governance / trust reviewer
- route owner for `ExitScan` / `RetentieScan` readback differentiation, if separate

If any of these roles are not formally assigned, the founder or product owner must explicitly assume that sign-off responsibility.

## 22. Non-Goals

Batch B explicitly does not do the following:

- no route-family expansion
- no buyer packaging as the main workstream
- no standalone Action Center commercial framing
- no generic analytics platform
- no project, task, or case-management behavior
- no manager-owned dashboard module
- no adoption proof claims
- no intervention impact claims

## 23. Stop Conditions

Batch B must stop and simplify if any of the following happen:

- HR queue design becomes dashboard-first instead of operating-first
- queue actions start to resemble workflow or case management
- HR governance requires too much manual operating effort
- metrics cannot be explained without overclaiming impact
- `RetentieScan` still reads too close to MTO-light in governance and readback
- route-family differentiation starts creating workflow forks instead of bounded shared truth
- buyer-facing framing starts to require describing Action Center as a workflow module

## 24. Implementation Preconditions

Coding must not start from this batch spec directly.

Before implementation begins, Batch B requires:

- approved Batch B spec
- approved Batch B implementation plan
- explicit test strategy
- no unresolved canonical product truth
- clear non-goals
- no off-platform canonical write behavior
- no route expansion outside approved scope

## 25. Next Step

After approval, the next document should be an implementation plan that decomposes Batch B into execution slices.

That plan should stay focused on:

- unified HR queue
- direct governance actions
- readback surfaces
- metric formulas and interpretation rails
- route-family readback alignment
- verification hardening
