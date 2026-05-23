# Batch B Governance Measurement Readback

## Status
Proposed

## 1. Purpose

This document defines **Batch B** from the Action Center Enterprise Roadmap.

Batch B exists to make Action Center governable and measurable through **governance readback and measurement surfaces**.

This document is a **batch spec**, not an implementation plan.

Batch B produces:

- governance-readback readiness
- measurement-readback readiness
- bounded operating interpretation

Batch B does **not** produce:

- adoption proof
- causal retention impact proof
- causal exit impact proof
- intervention effectiveness proof

Commercial proof requires later **live-route evidence**.

## 2. Batch Role

Batch B starts only after Batch A has stabilized the execution model.

Batch B should not redefine action-card truth. It should build HR governance and measurement readback on top of stable route, action, and review events.

Its role is to turn bounded execution into a bounded operating layer:

- HR can see where follow-through is healthy, stalled, blocked, overdue, overgrown, or ready for closeout
- HR can intervene through bounded governance actions
- metrics can be read safely without turning into proof claims

Batch B may reopen Batch A truth only if a **blocking inconsistency** is found between:

- action-card contract
- action lifecycle
- transition matrix
- draft / invalid / HR-review behavior
- route defaults
- route / action / review semantics

## 3. Starting Point

Batch B depends on the following Batch A outputs being stable before work begins:

- action-card contract
- lifecycle and transition matrix
- draft / invalid / HR-review flow
- route-to-action policy
- manager execution UX
- ExitScan and RetentieScan route defaults

These are treated as input truth for Batch B, not open design territory.

## 4. Batch Constraints

The following constraints remain fixed throughout Batch B:

- no route expansion
- no causal impact claims
- no broad analytics platform
- no collaboration-suite behavior
- no off-platform canonical writes
- no buyer-facing proof claims
- no manager dashboard expansion as a standalone goal
- no HR operating system behavior
- no personnel dossier behavior
- no employee risk ledger behavior
- no standalone Action Center framing
- no generic workflow or action-management broadening

Action Center remains:

- embedded inside Loep
- route-bound
- limited to approved route families only: `exit` and `retention`
- HR-governed
- manager-light
- post-scan follow-through only
- canonical inside Action Center

## 5. Batch Outcome

By the end of Batch B:

- HR can see where execution is healthy, stalled, overgrown, overdue, blocked, or ready for closeout
- HR can intervene through bounded governance actions
- metrics are defined, calculated, and interpreted safely
- readback works across both ExitScan and RetentieScan scenarios
- buyer-safe reporting vocabulary exists without proof overclaims

Batch B should leave Batch C free to focus on buyer readiness, not on repairing governance or metric semantics.

## 6. Workstream B1 - HR Governance Queues

Batch B must define a bounded governance-queue taxonomy.

### 6.1 Queue Definitions

| Queue | Trigger condition | Object anchor | HR allowed action | Manager involvement | Severity | Audit behavior | Suppression / false-positive handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `needs_owner_or_assignment_issue` | Route has missing, invalid, or unresolved accountable owner state | `route` | mark HR review required, request owner correction, suppress false signal | manager may be asked to confirm ownership context | medium | queue entry, HR action, and resolution reason are auditable | HR may suppress when ownership is already valid in canonical truth but derivation lagged |
| `missing_action_where_execution_expected` | Route policy expects execution action but no valid active action exists inside allowed window | `route` | request manager update, require action review, mark HR review required | manager is primary execution participant | medium | signal creation, request, and later resolution are auditable | suppress when route is intentionally observation-only under approved policy |
| `action_review_due` | Valid action passed review due date or review trigger without completed review | `action` | request manager update, send/remind via bounded channel, require action review | manager completes review | medium | due-state, reminder, and review resolution are auditable | suppress if review already completed but read model lagged |
| `stuck_action` | Active action exceeds route-family stuck threshold without meaningful update | `action` | request manager update, mark HR review required, route to continuation check | manager explains status or updates action | high | stuck signal, intervention, and dismissal reason are auditable | suppress if action was updated through canonical path but signal lagged |
| `blocked_action` | Action has active blocker signal | `action` | observe only, request manager update, mark HR review required | manager clarifies blocker or removes blocker through allowed flow | high | blocker signal and HR follow-up are auditable | suppress if blocker was entered in error and corrected canonically |
| `action_sprawl_risk` | Route exceeds healthy active-action limit or threshold pattern | `route` | request action correction, mark HR review required, route to continuation check | manager may be asked to consolidate or stop actions | high | sprawl signal, correction request, and resolution are auditable | suppress when temporary overlap is approved and documented |
| `repeated_review_without_progress` | Repeated allowed review outcomes (`nog_te_vroeg` / `bijsturen_nodig`) exceed threshold | `route` | mark HR review required, request manager update, require action review | manager may need to adjust or stop action | high | repeated-no-progress signal and HR decision are auditable | suppress if threshold was met by duplicated review event that is later invalidated |
| `route_ready_for_closeout` | Route satisfies closeout policy and no blocking governance signal remains | `route` | close route, continue route, remove closeout-ready status | manager may provide final context but does not close route | medium | readiness, confirmation, closeout, and reversal are auditable | suppress if later signal invalidates readiness before closeout |
| `route_stale_despite_actions` | Route enters stale state despite actions being present | `route` | mark HR review required, route to continuation check, request action correction | manager may need to explain execution drift | high | stale signal and HR action are auditable | suppress if stale derivation was premature or route state already advanced |
| `HR_review_required` | Policy, invalid content, repeated drift, or direct HR flag requires governance review | `route` or `action` | observe only, request correction, continue route, reopen route where policy allows | manager may be asked for bounded clarification | high | reason code and HR disposition are auditable | suppress only with explicit reason code and reviewer identity |

### 6.2 Queue Rules

- Queue logic must stay route-bound and Action Center-canonical.
- Queue derivation must not depend on off-platform truth.
- Queue suppression must never delete history; it must record auditable dismissal reason.
- Queue semantics must remain shared across `exit` and `retention`, even when thresholds or wording differ.

## 7. Workstream B2 - Intervention Logic

Batch B must define bounded HR intervention logic.

### 7.1 Allowed HR Interventions

- observe only
- request manager update
- send/remind via existing bounded channel model
- require action review
- mark HR review required
- request action correction
- suppress false signal
- close route
- continue route
- reopen route where policy allows

### 7.2 Intervention Rules

- HR remains governance owner, not day-to-day execution operator.
- HR may close, continue, or reopen only where route policy allows.
- HR interventions must attach to canonical route or action objects and be auditable.
- Reminder behavior may use existing bounded channels, but channels must not mutate canonical truth directly.

### 7.3 Prohibited Interventions

- HR becoming day-to-day action operator by default
- HR rewriting manager execution history without audit
- HR creating broad project plans
- HR using Action Center as personnel dossier
- direct off-platform canonical changes

## 8. Workstream B3 - Measurement Readback

Batch B must define bounded readback layers.

### 8.1 Readback Layers

| Layer | Purpose | Core fields | Supported questions | What it must not imply |
| --- | --- | --- | --- | --- |
| Route-level readback | Show route flow health and governance status | `route_id`, `route_family`, route state, governance signals, closeout-readiness, continuation status | Which routes are moving, stalled, stale, or closeout-ready? | route success, intervention impact, problem solved |
| Action-level readback | Show execution volume and action quality at route depth | `action_id`, state, created_at, due/review state, blocker presence, stop/complete flags | Are actions being created, maintained, reviewed, stopped, or completed? | manager effectiveness, project progress, percentage completion |
| Review-level readback | Show cadence and quality of action reviews | review outcome, review date, evidence source, consequence, confidence level | Are reviews happening on time and with bounded evidence? | causal validation, verified outcome impact |
| Governance-signal readback | Show queue pressure and governance burden | signal type, severity, time in queue, suppression state, HR disposition | Where is HR attention being pulled and why? | broad organizational diagnosis |
| Route-family readback | Show differentiated operating patterns across `ExitScan` and `RetentieScan` | route family, default windows, continuation framing, confidence framing, closeout framing | How do exit and retention differ operationally without different workflow engines? | route-family superiority, causal proof, broad EX diagnosis |

### 8.2 Readback Rules

- Readback is interpretive, not causal.
- Readback must remain grounded in canonical route, action, and review events.
- Readback may be buyer-safe, but it is not buyer proof by itself.

## 9. Workstream B4 - Metric Definitions

### 9.1 Metric Definitions Table

| Metric | Formula | Event source | Object anchor | Interpretation | What it does not prove | Visibility |
| --- | --- | --- | --- | --- | --- | --- |
| `route_to_action_conversion_rate` | routes with at least one valid action / routes where execution is expected | route created, action validated | `route` | How often expected execution becomes explicit action | quality of action, intervention success | internal, HR operating readback |
| `time_to_first_action` | median(action.created_at - route.execution_expected_at) | route expectation event, action created | `route` | How quickly execution starts after route requires it | urgency quality, outcome impact | internal, HR operating readback |
| `actions_per_route_distribution` | distribution of valid actions per route across active routes | action created, action stopped/completed | `route` | Whether execution is sparse, healthy, or sprawl-prone | appropriate action quality by itself | internal, HR operating readback, buyer-safe reporting |
| `action_review_completion_rate` | actions with review completed within due window / actions with review due | review due, review completed | `action` | How reliably review rhythm is happening | action value, intervention success | internal, HR operating readback, buyer-safe reporting |
| `action_completion_rate` | actions moved to completed / valid actions created | action state transitions | `action` | How often actions reach completed state | route resolution, impact achieved | internal, HR operating readback, buyer-safe reporting |
| `action_stop_rate` | actions moved to stopped / valid actions created | action state transitions | `action` | How often actions are intentionally stopped | failure, success, or bad management by itself | internal, HR operating readback |
| `time_from_action_creation_to_first_review` | median(first_review_at - action.created_at) | action created, review created | `action` | How quickly actions enter reflective review | execution quality, effect size | internal, HR operating readback |
| `route_stale_rate_with_actions_present` | stale routes with at least one action / routes with at least one action | route stale event, action presence snapshot | `route` | Whether action presence still leaves routes stalled | that actions caused staleness or failed intervention | internal, HR operating readback, buyer-safe reporting |
| `hr_chasing_reduction_proxy_on_action_routes` | 1 - (HR reminder or follow-up count / comparable action-route baseline) | HR reminder events, follow-up events | `route` | Whether repeated HR chasing burden is decreasing | true productivity gain or adoption proof | internal, HR operating readback |
| `action_sprawl_rate` | routes with sprawl signal / active routes with actions | sprawl signal events | `route` | How often execution broadens beyond healthy limits | route complexity, manager quality | internal, HR operating readback, buyer-safe reporting |
| `action_quality_rejection_rate` | invalid or HR-review-required action attempts / action creation attempts | draft invalid, needs_hr_review, validation events | `action_attempt` | Whether action quality guidance is working | manager ability, HR effectiveness | internal, HR operating readback |
| `repeated_review_without_progress_rate` | routes with repeated-no-progress signal / routes with reviewed actions | review outcome events, repeated-no-progress signal | `route` | How often review loops fail to progress execution | true lack of impact, route failure | internal, HR operating readback, buyer-safe reporting |
| `blocked_action_rate` | actions with blocker signal / active actions | blocker signal events | `action` | How common blocked execution is | root cause, organizational risk | internal, HR operating readback, buyer-safe reporting |
| `route_ready_for_closeout_rate` | routes marked closeout-ready / open routes | closeout-ready signal events | `route` | How often routes are nearing bounded closure | route success, solved problem, impact achieved | internal, HR operating readback, buyer-safe reporting |

### 9.2 Metric Rules

- All formulas must derive from canonical Action Center truth.
- Visibility must be explicit per metric.
- No metric may be surfaced without a paired "does not prove" explanation.

## 10. Workstream B5 - Buyer-Safe Reporting Vocabulary

Batch B must define bounded reporting language.

### 10.1 Allowed Vocabulary

- follow-through reviewed
- action completed
- action stopped
- route still open
- route ready for closeout
- continuation needed
- review overdue
- operating rhythm stalled
- bounded execution active

### 10.2 Prohibited Vocabulary

- impact achieved
- retention improved
- problem solved
- manager effectiveness
- intervention success
- risk reduced
- causal improvement
- employee risk

### 10.3 Vocabulary Rule

Reporting language must describe:

- flow
- status
- review
- continuation
- bounded governance state

It must not describe:

- causal effect
- employee judgment
- organizational diagnosis beyond bounded follow-through

## 11. Workstream B6 - Scenario Readbacks

Batch B must define scenario readbacks for at least the following:

| Scenario | Required readback behavior |
| --- | --- |
| ExitScan route with one completed action | Shows route still open or closeout-ready as appropriate, action completed, and no causality claim |
| RetentieScan route with repeated no-progress reviews | Shows repeated no-progress signal, continuation pressure, and confidence/uncertainty framing without MTO-light drift |
| Route with action sprawl risk | Shows sprawl signal, action count pressure, and HR intervention option |
| Route with blocked action | Shows blocker signal, bounded recommendation, and no implied escalation causality |
| Route ready for closeout | Shows readiness reason, no blocking signal, and HR closeout authority |
| Route stale despite actions | Shows stale state with actions present, continuation check need, and no claim that actions failed causally |
| HR suppresses a false-positive signal | Shows suppression audit trail, reason code, and removal from active governance pressure |
| Metric readback shown without causal overclaim | Shows metric, operating interpretation, and explicit non-proof note |

## 12. Required Deliverables

Batch B must produce:

- Action Center HR Control & Readback spec
- Action Center Measurement & Readback spec
- governance queue definitions
- intervention logic contract
- metric definitions table
- internal KPI interpretation guide
- buyer-safe reporting vocabulary
- scenario readback coverage
- implementation plan for Batch B
- test strategy

## 13. Decision Order

Batch B must settle decisions in this order:

1. governance queue taxonomy
2. queue trigger conditions
3. intervention logic
4. readback layers
5. metric definitions and formulas
6. visibility levels
7. buyer-safe vocabulary
8. scenario readbacks
9. test strategy

This order is mandatory. Readback and metrics must derive from stable governance semantics, not define them.

## 14. Non-Goals

Batch B does not do the following:

- no route expansion
- no causal claims
- no proof claims
- no broad analytics
- no generic workflow
- no collaboration suite
- no HR operating system
- no personnel dossier
- no off-platform canonical writes

## 15. Exit Criteria

Batch B may exit only when:

- all governance queues are defined
- all intervention rules are defined
- metric formulas and visibility levels are defined
- internal KPI interpretation guide is complete
- no causal-impact claims appear in reporting vocabulary
- governance readback works across ExitScan and RetentieScan scenarios
- scenario readbacks are complete
- test strategy is complete
- no unresolved product truth remains around HR governance, readback, metrics, visibility, or reporting semantics

## 16. Stop Conditions

Batch B must stop and simplify if:

- HR readback becomes a broad analytics platform
- HR governance requires too much manual operation
- metrics invite causal overclaiming
- buyer-safe vocabulary cannot explain the product without calling it workflow or project management
- RetentieScan readback remains too MTO-light
- queue logic creates too many false positives
- route-specific readbacks create incompatible Action Center semantics

## 17. Implementation Preconditions

Coding must not start from this batch spec directly.

Before implementation begins:

- Batch B spec must be approved
- implementation plan must be approved
- test strategy must be defined
- Batch A outputs must be stable
- no route expansion
- no off-platform canonical write behavior
- no unresolved canonical product truth

## 18. Success Definition

Batch B is successful when:

- HR can govern the execution layer at operating depth
- measurement readback is interpretable and bounded
- metrics help steer follow-through without claiming impact
- ExitScan and RetentieScan scenarios both work
- buyer-safe reporting language is ready for Batch C
- Batch C can focus on buyer readiness instead of repairing governance or measurement semantics
