# Action Center Bounded Execution Enterprise Design

## Status
Proposed

## Intent
This document defines the next product design step for Action Center after the constitution and adoption-measurement-readiness wave.

The goal is **not** to invent a new manager interaction model.

The goal is to take the **existing route + action-card execution model** and harden it into an enterprise-grade, bounded operating layer.

This wave still produces **adoption and operating readiness**, not adoption proof.

Any later commercial claim of proven adoption, better retention, or intervention impact requires live-route evidence after this design has been implemented and used.

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
- broad project or action management
- advisory tooling
- an HR operating system
- HR case management
- an employee risk ledger
- a task board
- a broad collaboration system

It hardens the current product truth without broadening Action Center scope.

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

- the action-card contract
- the action quality rules
- the route-to-action growth policy
- the action lifecycle
- the action review grammar and evidence model
- the repeated-use manager execution flow
- HR oversight on action execution
- action execution metrics and buyer-proof packaging

This design exists to harden those gaps without broadening the product surface.

---

## 3. North Star

The enterprise-grade bounded execution end state is:

- a route opens a bounded follow-through question
- the assigned manager can add and review one or more concrete actions inside that route
- those actions remain small, explicit, evidence-bearing, and reviewable
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
- do we continue, adjust, complete, stop, or ask for HR review

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

## 5. Action Card Contract

Every valid action card must carry a bounded execution contract.

### 5.1 Required fields

A valid action card must define at least:

- `action_id`
- `route_id`
- `route_family`
- `action_title`
- `bounded_focus`
- `accountable_manager`
- `created_by`
- `created_at`
- `current_state`
- `expected_first_step`
- `intended_observation`
- `review_due_date` or `review_trigger`
- `latest_review_outcome`
- `evidence_note`
- `blocker_signal`, if any
- `HR_visibility_status`
- audit metadata

### 5.2 Contract meaning

The minimum contract exists so that each action card is:

- clearly tied to one route
- clearly tied to one accountable manager
- reviewable in one bounded cycle
- readable by HR without reconstructing hidden context

The contract also distinguishes between:

- a submitted but not yet valid `draft`
- a valid execution card that may become `active`
- an invalid or escalated draft that is not yet canonical execution truth

### 5.3 Prohibited action-card content

Action cards may not contain:

- subtasks
- dependencies
- percent complete
- arbitrary priority levels
- free project tags
- cross-route actions
- employee-specific dossier notes
- open comment threads
- broad project descriptions

If a proposed action needs those structures, it is outside the bounded execution model.

---

## 6. Action Quality Rules

Manager-created actions are allowed only if they remain bounded and execution-grade.

### 6.1 A valid action must be

- concrete
- route-bound
- tied to the scan-derived management question
- owned by one accountable manager
- reviewable within a bounded time window
- non-personnel-dossier-like
- small enough to be assessed in one review cycle
- written as an execution step, not as a vague ambition

### 6.2 Invalid examples

`Improve leadership`

- invalid because it is a broad aspiration, not a bounded execution step

`Fix culture`

- invalid because it is route-agnostic, too broad, and not reviewable in one cycle

`Communicate more`

- invalid because it does not describe a concrete bounded intervention

`Monitor employee X`

- invalid because it turns the product toward employee-level dossier behavior

`Create a full development program`

- invalid because it expands the route into a broader project/program management shape

`Solve workload everywhere`

- invalid because it is not bounded to one route-level management question

`Start a broad HR project`

- invalid because it leaves the follow-through layer and enters generic project management

### 6.3 Design consequence

The product should reject or escalate weak action quality rather than quietly persist it as acceptable truth.

### 6.4 Draft and approval behavior

Weak action quality must not silently become active execution truth.

The default behavior is:

- manager submissions enter `draft`
- a structurally valid, route-bound action may be promoted from `draft` to `active`
- an invalid submission stays `draft` and is marked `invalid`
- a borderline or governance-sensitive submission may stay `draft` and be marked `needs_hr_review`
- only a valid action may count toward active action limits, execution metrics, or route-to-action conversion

Managers may revise their own `draft` actions.

HR may:

- request adjustment
- approve a `needs_hr_review` draft into `active`
- reject a draft from becoming canonical execution truth

HR should not routinely rewrite manager actions line by line.

`action_quality_rejection_rate` must include drafts rejected or held back from active execution truth because of quality or governance violations.

---

## 7. Action Lifecycle

The action-card model must be explicit enough to become product truth rather than informal runtime behavior.

### 7.1 Semantic lifecycle

The bounded semantic action lifecycle distinguishes:

- `draft`
- `active`
- `review_due`
- `in_review`
- `blocked`
- `completed`
- `stopped`
- `superseded`

### 7.2 User-facing labels

The UI may map those states to simpler labels such as:

- `open`
- `review needed`
- `adjust / continue`
- `blocked`
- `completed`
- `stopped`

### 7.3 State meanings

`draft`

- action structure exists but is not yet a fully valid execution card

`active`

- concrete action is live and expected to be executed

`review_due`

- bounded review date or trigger has been reached and review is now expected

`in_review`

- action is under explicit review and may continue or adjust

`blocked`

- execution is impeded
- this is an execution signal, not an escalation by itself

`completed`

- the action itself is complete
- this never closes the route automatically

`stopped`

- the action should not continue
- this never closes the route automatically

`superseded`

- the action has been replaced by a newer route-bound action
- it is not deleted

### 7.4 Action transition matrix

Implementation planning must treat this as canonical transition truth.

| From state | To state | Allowed? | Actor | Trigger | Notes |
| --- | --- | --- | --- | --- | --- |
| `draft` | `active` | yes | manager or HR | action passes validation and is accepted as bounded execution truth | manager may promote only their own valid draft; HR may approve `needs_hr_review` drafts |
| `draft` | `stopped` | yes | manager or HR | draft is intentionally abandoned before activation | remains auditable; never counted as active execution |
| `draft` | `superseded` | yes | manager or HR | newer draft or active action replaces this draft before activation | old draft remains in history |
| `draft` | `completed` | no | none | prohibited | draft may not skip execution and review |
| `active` | `review_due` | yes | system | review due date or trigger reached | derived timing transition only |
| `active` | `blocked` | yes | manager or HR | blocker explicitly signaled | blocked is an execution signal, not route escalation by itself |
| `active` | `superseded` | yes | manager or HR | newer route-bound action formally replaces this action | older action remains in history |
| `active` | `completed` | no | none | prohibited | active action must go through review |
| `review_due` | `in_review` | yes | manager or HR | review opened | canonical review session starts |
| `review_due` | `blocked` | yes | manager or HR | blocker identified before or during review opening | review may still be required afterward |
| `review_due` | `completed` | no | none | prohibited | review_due may not skip review outcome |
| `in_review` | `active` | yes | manager or HR | review outcome `bijsturen-nodig` or `nog-te-vroeg` with consequence `continue` or `adjust` | action remains live |
| `in_review` | `blocked` | yes | manager or HR | review identifies explicit execution blocker | route may later surface governance signal |
| `in_review` | `completed` | yes | manager or HR | review outcome `effect-zichtbaar` with consequence `complete` | requires observed change and evidence source |
| `in_review` | `stopped` | yes | manager or HR | review outcome `stoppen` or consequence `stop` | action ends without closing route |
| `blocked` | `in_review` | yes | manager or HR | blocker is reviewed explicitly | preferred path back into active evaluation |
| `blocked` | `active` | no | none | prohibited | blocked may not silently recover without review |
| `blocked` | `completed` | no | none | prohibited | blocked action may not skip review to completion |
| `blocked` | `stopped` | yes | manager or HR | review or explicit governance decision stops the action | remains auditable |
| `completed` | `superseded` | no | none | prohibited | completed work is historical truth, not replaceable truth |
| `completed` | `active` | no | none | prohibited | new work requires a new route-bound action |
| `stopped` | `active` | no | none | prohibited | restarting requires a new or superseding action |
| `stopped` | `superseded` | yes | manager or HR | newer route-bound action replaces prior stopped attempt | keeps execution lineage explicit |
| `superseded` | any other state | no | none | prohibited | superseded actions are historical only |

### 7.5 Review-outcome transition defaults

The default review-outcome mapping is:

- `effect-zichtbaar` -> `in_review` to `completed`
- `bijsturen-nodig` -> `in_review` to `active`
- `nog-te-vroeg` -> `in_review` to `active`
- `stoppen` -> `in_review` to `stopped`

### 7.6 What the lifecycle must not do

The action lifecycle must not:

- silently imply route closure
- blur action completion into route resolution
- let review semantics float outside explicit state consequences
- let a blocked action auto-escalate without HR governance rules

HR decides route closeout or continuation.

---

## 8. Action Evidence Grammar

Action reviews must produce bounded execution evidence, not generic commentary.

### 8.1 Required review fields

Each action review must define:

- `review_outcome`: `effect-zichtbaar` / `bijsturen-nodig` / `nog-te-vroeg` / `stoppen`
- `observed_change`
- `evidence_source`: `manager observation` / `team conversation` / `follow-up survey` / `HR check` / `operational indicator` / `other bounded source`
- `confidence_level`: `low` / `medium` / `high`
- `next_consequence`: `complete` / `continue` / `adjust` / `stop` / `HR review needed`
- `bounded_note`

### 8.2 Evidence rules

- evidence does not prove causality
- evidence must not become employee-level dossier text
- evidence supports follow-through quality, not intervention claims
- `effect-zichtbaar` requires at least one `observed_change` and one `evidence_source`

### 8.3 Review consequence mapping

The default consequence mapping is:

- `effect-zichtbaar` -> action moves toward `completed`
- `stoppen` -> action moves toward `stopped`
- `bijsturen-nodig` -> action stays live and requires adjustment
- `nog-te-vroeg` -> action stays live and requires continued review

Action review does not decide route closure by itself.

### 8.4 Manager review UX simplification rules

The review grammar must stay enterprise-safe without becoming manager-heavy.

The default interaction should be:

- one primary review question
- one compact outcome selector
- one simple `evidence_source` dropdown
- one bounded note field with strict placeholder guidance

`confidence_level` should default to compact selection and may stay visually secondary.

Additional structure should expand only when needed:

- `effect-zichtbaar` requires `observed_change` and `evidence_source`
- `bijsturen-nodig` requires a bounded explanation of what needs adjustment
- `HR review needed` requires a concise reason

The design should prefer structured brevity over free-form review forms.

---

## 9. Route-To-Action Policy

This is the most important boundedness rule in the design.

### 9.1 Not every route needs action cards immediately

A route may remain at a lighter state where:

- manager response exists
- review rhythm exists
- no explicit action card is yet necessary

The product must not force every route into heavier execution structure.

### 9.2 When action cards are warranted

Action cards become the expected execution surface when:

- a concrete local intervention is known
- accountability benefits from named execution steps
- review should attach to an explicit intervention rather than only a route-level response
- the route has moved beyond acknowledgement into execution

### 9.3 Active action limits

The bounded execution default is:

- `1` active action is normal
- `2` active actions is acceptable where the route clearly spans two concrete interventions
- `3` active actions is the maximum healthy default
- more than `3` active actions should be treated as governance friction and surfaced to HR as action-sprawl risk

### 9.4 What the product must prevent

The product must prevent drift into:

- unbounded parallel actions
- action card inflation for weak reasons
- routes that become silent task lists

---

## 10. HR Intervention Rules

HR remains the governance owner, not the day-to-day action operator.

### 10.1 Default interpretation

- `1` active action: normal
- `2` active actions: acceptable if both are concrete and route-bound
- `3` active actions: maximum healthy default; visible as expanded execution
- more than `3` active actions: `action_sprawl_risk` and HR intervention required

### 10.2 Invalid or escalated conditions

- action without review due date: invalid
- action with employee-specific dossier language: blocked or HR review required
- action outside route scope: blocked
- action with broad project language: HR review required
- repeated action review outcome `bijsturen-nodig` or `nog-te-vroeg` more than twice: HR review required
- action stuck open beyond threshold: HR oversight signal

### 10.3 Route-family default thresholds

These defaults must be treated as product defaults, not implementation guesses.

| Situation | ExitScan default | RetentieScan default | Meaning |
| --- | --- | --- | --- |
| action review due | `60-90 days` | `45-90 days` | default bounded review window |
| stuck active warning | `30 days` without meaningful update or review after activation | `21-30 days` without meaningful update or review after activation | route remains active but HR sees `stuck_action` risk |
| review_due grace period | `7 days` | `7 days` | small grace period before stronger overdue signaling |
| repeated review warning | more than `2` consecutive `bijsturen-nodig` or `nog-te-vroeg` outcomes | more than `2` consecutive `bijsturen-nodig` or `nog-te-vroeg` outcomes | HR review required |
| sprawl risk | more than `3` active actions | more than `3` active actions | `action_sprawl_risk` and HR intervention required |

These defaults may later be refined by approved route-default policy, but implementation planning may not invent looser starting thresholds.

### 10.4 Intervention philosophy

HR should:

- flag
- review
- guide
- govern

HR should not take over the route as the day-to-day action operator by default.

---

## 11. Manager Execution UX

This design deliberately prefers **contextual execution** over dashboard ownership.

### 11.1 Interaction principle

Managers should feel:

- I know what route this is
- I know what action exists or is needed
- I can take one bounded next step
- I do not need to manage a large system

### 11.2 Default action flow

The standard repeated-use flow is:

1. manager lands in route context from a bounded entry point
2. manager sees whether the route is still in response mode or already in action mode
3. manager adds or updates a bounded action if concrete execution is needed
4. manager later completes a bounded action review

### 11.3 Manager-visible actions in this wave

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

### 11.4 UX simplification goals

The manager execution surface should become:

- calmer
- smaller
- more guided
- less form-heavy
- less interpretive

This wave should simplify the current action create and review experience rather than add more execution modes.

---

## 12. Route-Specific Execution Defaults

### 12.1 ExitScan

- default review window: `60-90 days`
- action focus: verify and act on the selected departure pattern / work-friction route
- closeout question: what was chosen, what was executed, and what returns in the next exit batch or management conversations?
- continuation logic: continue if departure pattern remains active, action evidence is weak, or route signal needs further monitoring

### 12.2 RetentieScan

- default review window: `45-90 days`
- action focus: verify and act on selected retention pressure / work-factor route
- closeout question: what was verified, what first intervention or follow-up was started, and what should be watched in retention signal / stay-intent / departure intention?
- continuation logic: continue if retention pressure persists, review evidence is weak, or follow-up measurement is planned

### 12.3 Shared defaults

For both route families:

- HR is rhythm owner
- managers are contextual execution participants
- no generic project board
- no broad task engine
- no people case management
- no action becomes canonical execution truth before it passes bounded validation

---

## 13. HR Governance On Action Execution

Enterprise maturity requires HR control on the action layer, not just the route layer.

### 13.1 HR must be able to see

HR needs bounded visibility into:

- routes with no actions
- routes with one action
- routes with two or three active actions
- routes with action-sprawl risk
- actions without timely review
- actions stuck in `active` or `review_due`
- actions lingering in `in_review`
- routes whose actions are done but whose route is not yet closed

### 13.2 HR must not become the action operator

The oversight layer must not turn HR into the day-to-day execution owner.

HR governs:

- whether the route is healthy
- whether action growth is acceptable
- whether review rhythm is healthy
- whether closeout or continuation is due

### 13.3 Governance signals

The design should explicitly support these derived governance signals:

- `missing_action_where_execution_is_expected`
- `action_sprawl_risk`
- `missing_action_review`
- `stuck_action`
- `repeated_review_without_progress`
- `route_ready_for_closeout`

These are bounded operational signals, not generic workflow analytics.

---

## 14. Reporting And Measurement

This wave should make the existing action model measurable enough to later prove effectiveness.

### 14.1 Core metric definitions

| Metric | Formula | Event source | Object anchor | Interpretation | What it does not prove |
| --- | --- | --- | --- | --- | --- |
| `route_to_action_conversion_rate` | routes with at least one valid action / eligible active routes | route + action creation events | follow-through route | shows how often routes become concrete execution | does not prove action quality or intervention impact |
| `time_to_first_action` | median time between route-open and first valid action creation | route-open event + action create event | follow-through route | shows how quickly managers move from route awareness to execution | does not prove good prioritization |
| `actions_per_route_distribution` | count of routes by `0`, `1`, `2`, `3`, `>3` active actions | action state events | follow-through route | shows whether routes stay bounded or drift into action sprawl | does not prove execution quality |
| `action_review_completion_rate` | actions reviewed within bounded review window / actions with review due | action review events | action card | shows whether actions are actually being reviewed | does not prove review quality |
| `action_completion_rate` | actions entering `completed` / valid created actions | action state transitions | action card | shows how often actions reach bounded completion | does not prove route success |
| `action_stop_rate` | actions entering `stopped` / valid created actions | action state transitions | action card | shows how often actions are intentionally halted | does not prove poor management by itself |
| `time_from_action_creation_to_first_review` | median time between action create and first action review | action create + action review events | action card | shows review timeliness | does not prove intervention quality |
| `route_stale_rate_with_actions_present` | stale routes with at least one active action / routes with at least one active action | route state derivation + action state events | follow-through route | shows whether actions are still failing to keep routes healthy | does not prove action irrelevance by itself |
| `hr_chasing_reduction_proxy_on_action_routes` | 1 - (HR chase events / routes with overdue, stale, blocked, or repeated-review-without-progress signals) | HR chase events + derived governance events | follow-through route | estimates whether bounded execution lowers manual HR chasing burden | does not prove lower operating cost overall |
| `action_sprawl_rate` | routes with `>3` active actions / routes with at least one active action | action state events | follow-through route | shows whether bounded execution is drifting toward workflow sprawl | does not prove buyer-visible risk by itself |
| `action_quality_rejection_rate` | rejected or HR-escalated invalid actions / submitted action drafts | action validation and HR review events | action card draft | shows whether managers understand bounded action quality | does not prove route quality |
| `repeated_review_without_progress_rate` | actions with `bijsturen-nodig` or `nog-te-vroeg` more than twice / reviewed actions | action review events | action card | shows where follow-through loops are spinning without progress | does not prove no later success is possible |

### 14.2 Metric event schema minimum

Implementation planning must define an event schema that can support these formulas without reconstructing truth indirectly.

At minimum the metric layer must be able to emit or derive:

- route opened
- route became execution-expected
- action draft created
- action draft validated as active
- action draft rejected
- action draft sent to HR review
- action state changed
- action review opened
- action review completed
- HR chase event
- route stale / overdue / escalation-sensitive derived

Metric implementation may decompose storage and transport, but it may not invent different product semantics than this design.

### 14.3 Metric meaning

These metrics help answer:

- are managers acting at all
- are they acting quickly enough
- are actions being reviewed
- are actions helping routes progress
- is HR still manually chasing too much
- is the model staying bounded

### 14.4 What the metrics do not prove

These metrics are operating and adoption metrics.

They do not by themselves prove:

- causal impact
- retention improvement
- management quality
- intervention effectiveness

Commercial proof requires later live-route evidence.

---

## 15. Buyer-Proof Boundaries

The manager-created action model must be buyer-safe.

### 15.1 What must be explainable to buyers

Enterprise buyers must be able to understand Action Center as:

- route-bound execution after a scan
- HR-governed follow-through
- bounded manager participation
- auditable review rhythm
- not employee monitoring
- not a personnel dossier
- not project management

### 15.2 Buyer-safe phrase

Action Center tracks whether agreed follow-through happened, was reviewed, and requires continuation. It does not judge individual employees or claim causal intervention impact.

### 15.3 What must stay explicitly true

Action Center still does **not** become:

- a company-wide action management platform
- a people case-management system
- an employee risk ledger
- an open work-management layer

Its legitimate scope remains:

- post-scan follow-through
- route-bound concrete execution
- review and oversight discipline

Implementation work should also preserve a later buyer-artifact path:

- route -> action -> review -> closeout lineage must stay legible
- labels must support a future governance one-pager and privacy-boundary note
- metrics must be explainable without implying personnel-dossier or employee-monitoring semantics

---

## 16. Workstreams

This design should be realized through four product workstreams.

### 16.1 Workstream A: Action contract

Define and harden:

- action-card contract
- action lifecycle
- review-outcome consequences
- route-to-action growth rules
- active action limits
- explicit route-status versus action-status boundaries

### 16.2 Workstream B: Manager operating flow

Simplify and strengthen:

- action create flow
- action update flow
- action review flow
- default field structure
- route-to-action entry clarity

### 16.3 Workstream C: HR execution oversight

Add bounded HR visibility for:

- action growth
- missing reviews
- stuck actions
- repeated review without progress
- closeout readiness

### 16.4 Workstream D: Measurement and buyer readiness

Add:

- action execution metrics
- governance packaging
- buyer-proof boundedness story

---

## 17. Phasing

### Phase 1: Action contract hardening

First settle:

- action-card contract
- action quality rules
- lifecycle
- route-to-action policy
- review evidence grammar
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
- repeated-review-without-progress signaling
- closeout-readiness signaling

### Phase 4: Measurement and buyer packaging

Last add:

- execution evidence
- trust/story packaging
- enterprise-ready explanation

---

## 18. Non-Goals

This design does not:

- add new route families
- add Teams/Slack/multichannel broadening
- make Graph required
- allow off-platform canonical writes
- create subtasks or project boards
- replace route truth with action truth
- let managers close routes
- move route closeout to managers
- claim adoption proof
- create advisory tooling
- create generic workflow software

---

## 19. Success Criteria

This design is successful when:

- the existing action-card model is treated as product truth rather than a partial side-path
- managers can act inside routes without dashboard-heavy ownership
- HR can govern execution without becoming the action operator
- action cards remain bounded and non-tasky
- route closeout remains clearly separate from action completion
- the product is more enterprise-defensible without becoming broader

---

## 20. Approval Gate

This design is ready for implementation planning only when the follow-up plan can execute without inventing new product truth around:

- action-card contract
- valid and invalid action rules
- draft, invalid, and HR-review draft behavior
- HR intervention rules
- concrete HR thresholds
- enriched lifecycle
- action transition matrix
- review evidence grammar
- route-specific defaults
- metric formulas
- metric event schema minimum
- buyer-proof boundaries
- non-goals
- tests required for action lifecycle, permissions, HR intervention, action-sprawl, invalid actions, review outcomes, and metric event generation

Implementation planning may not start if any of these remain only implied or deferred.

---

## 21. Next Step

After approval, the next document should be an implementation plan that decomposes this bounded execution upgrade into slices.

That plan should stay focused on:

- hardening what already exists
- simplifying the current manager action model
- strengthening governance and measurement

It must not invent a new Action Center execution model.
