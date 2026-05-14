# Action Center Strong Hybrid Upsell Design

## Status
Approved in conversation

## Intent
This document defines how Action Center should evolve from a strong bounded follow-through layer into a **suite-wide, standard upsell** that is commercially sellable to external customers and adoption-proof for HR and managers.

This is not a standalone-product design.

Action Center remains:

- a follow-through proposition
- an add-on on top of existing scan routes
- bounded to post-scan ownership, follow-through, review rhythm, closure, and continuation

This document defines:

- what `10/10` means for Action Center in this next maturity phase
- which gaps block that state today
- which product principles must stay fixed
- which capability waves and initiatives should land first
- how to improve adoption without turning Action Center into "just another tool"

This document is a **north-star program spec**, not a directly buildable single implementation spec.
Execution must be decomposed into narrower child specs before implementation planning starts.

---

## 1. North Star

Action Center becomes the **default follow-through upsell** in the Verisight suite.

The commercial promise is not:

- "here is another place to log in"
- "here is a separate workflow product"
- "here is a broad management cockpit"

The promise is:

> We make post-scan follow-through easier to keep alive by bringing the right reminder, review moment, and next step to HR and managers at the right time, while keeping the real status, ownership, and decisions explicit in one bounded place.

In the target state:

- HR uses Action Center to keep follow-through moving across routes
- managers actively participate, but do not need to self-monitor another dashboard
- Outlook and email carry the rhythm
- Action Center remains the source of truth for route context, ownership, review, closeout, and continuation

---

## 2. Explicit Decisions

The following decisions were intentionally chosen in conversation and are binding for this design.

### 2.1 Commercial role

Action Center should become:

- suite-wide
- a standard upsell
- sellable to external customers

It should not become:

- a separate first-buy product
- a third product line next to dashboard and report
- an always-included base entitlement

### 2.2 Primary success criterion

The primary `10/10` criterion is **adoption-proof follow-through**.

This means the strongest test is not "can sales explain it?" but:

- do HR and managers actually keep using it in a real operating rhythm
- does follow-through stay alive without heavy manual chasing
- does it feel lighter than ad hoc mail and meeting coordination

### 2.3 Primary user model

Action Center is designed for **HR + managers together**.

That means:

- HR remains the operating and governance driver
- managers participate actively in follow-through
- the product should not collapse back to HR-only usage
- the product should also not become a manager-autonomous operating system

### 2.4 Channel strategy

The target is **multichannel-capable**, but the first execution path is **Outlook-first**.

That means:

- email and Outlook calendar are the first serious adoption channels
- later channels such as Teams or Slack may follow
- the product should not hard-code itself into Microsoft forever
- but the product should also not dilute focus by trying to be channel-complete too early

### 2.5 Product architecture choice

The recommended architecture is **Strong Hybrid**.

That means:

- Action Center stays the truth layer
- email and calendar carry the rhythm
- users land in Action Center when they need context, update, review, closeout, or follow-up

It explicitly rejects two weaker alternatives:

- `dashboard homebase`: too dependent on self-initiated checking
- `inbox-first`: too likely to fragment truth, workflow, and governance across channels

### 2.6 Dependency rule

Contextual entry and deeplinking are a prerequisite foundation for the first serious channel work.

That means:

- Outlook invites may not ship without route-aware contextual landing
- triggered follow-through mail may not ship without route-aware contextual landing
- sending users to a generic Action Center entry and asking them to self-orient is explicitly out of scope for the first strong-hybrid release

---

## 3. Product Boundary

Action Center remains a bounded follow-through layer.

### 3.1 What it is

Action Center is the place where scan outcomes become:

- explicit owner assignment
- bounded route follow-through
- scheduled review moments
- visible follow-up pressure
- formal closure or continuation

### 3.2 What it is not

Action Center must still reject:

- generic project planning
- broad task administration
- general change management tooling
- advisory case management
- replacing dashboard interpretation
- replacing report readback
- becoming a second broad collaboration suite

### 3.3 Boundary rule for the next maturity phase

Even while Action Center becomes more commercially prominent, its boundary must stay:

- semantically serious
- operationally useful
- UX-light
- bounded to follow-through

Prominence must not create scope drift.

### 3.4 Off-platform write policy

To keep the strong-hybrid boundary stable, phase 1 off-platform behavior is explicitly limited.

Allowed off-platform in phase 1:

- receiving a review invite by email
- accepting, declining, or tentatively responding to a calendar invite
- opening a deeplink back into Action Center

Allowed off-platform in phase 1 as non-canonical signal only:

- RSVP state as an attendance hint

Not allowed off-platform in phase 1:

- recording review outcome
- marking a route reviewed
- changing owner
- changing canonical route status
- closing a route
- reopening a route
- postponing a review in a way that changes canonical schedule without going through Action Center

The phase 1 rule is simple:

- channels may carry awareness and attendance
- Action Center remains the place where canonical follow-through state changes

---

## 4. What `10/10` Means

Action Center reaches `10/10` in this design when it is:

- **commercially sellable** as a standard upsell for external customers
- **adoption-proof** in day-to-day HR and manager behavior
- **suite-coherent** next to dashboard and report
- **bounded** enough that it still feels simple
- **route-broad** enough that it is not only credible in one narrow use case

More concretely, `10/10` means:

- managers do not need to remember to check Action Center on their own
- review rhythm and follow-through are pulled into existing work habits through Outlook and email
- HR can see and steer stillness, pressure, and closure without heavy manual coordination
- the upsell story is ease, rhythm, and ownership discipline, not extra software
- Action Center works consistently enough across the relevant route family to be sold as a standard add-on

---

## 5. Current State Summary

The current Action Center state is materially stronger than concept stage.

It already has real product foundations such as:

- route context
- assignment and owner models
- review concepts
- closeout and reopen logic
- bounded route continuation
- permission and scope guardrails
- route-level readback and workbench structures

That means the main problem is **not** "Action Center is empty."

The main problem is that Action Center still depends too much on:

- active checking
- manager discipline
- product familiarity
- app-centric follow-through

The product can already do meaningful things.
The missing layer is what makes it **live reliably in the work rhythm of HR and managers**.

### 5.1 First serious external rollout scope

The "suite-wide standard upsell" label describes the destination state, not the first external rollout perimeter.

For the first serious external rollout, the eligible route family must be explicit:

- **In**: ExitScan
- **Conditional next candidate**: RetentieScan, but only after route defaults, review rhythm defaults, and strong-hybrid channel behavior are validated on ExitScan
- **Out for first serious rollout**: Onboarding 30-60-90, Pulse, Leadership Scan, TeamScan, Combinatie
- **Not part of external suite-wide follow-through rollout**: internal MTO design/input-only carriers

This means sales and product should not treat Action Center as a standard upsell for every route from phase 1 onward.

The maturity path is:

- first prove the strong-hybrid model on ExitScan
- then explicitly unlock RetentieScan
- then broaden route-family coverage with defaults and eligibility rules
- only then move toward a true suite-wide standard upsell motion

---

## 6. Maturity Model

### 6.1 Approximate current state: `6/10`

Action Center is already:

- a real follow-through layer
- commercially usable in bounded situations
- internally defensible as a product capability

But at this stage it is still too easy for customers to experience it as:

- another place to check
- an optional extra
- a tool that needs discipline to stay alive

### 6.2 Intermediate target: `8/10`

At `8/10`, Action Center becomes clearly sellable and operationally stronger because it removes friction from follow-through behavior.

At this level it must already have:

- Outlook review invites
- triggered email reminders
- precise deeplinks
- a simpler manager landing experience
- clearer HR rhythm control

At `8/10`, the product no longer feels like a good internal tool. It starts feeling like a strong external upsell.

### 6.3 End target: `10/10`

At `10/10`, Action Center becomes a suite-wide strong-hybrid follow-through upsell that:

- is easy to position in sales
- is easy to adopt in practice
- does not require constant product-team explanation
- works across the relevant route family without becoming messy

The key move from `8/10` to `10/10` is not just more notifications.
It is the combination of:

- rhythm maturity
- better role experience
- route parity
- stronger HR oversight
- measurable proof

### 6.4 Decision thresholds

The maturity labels are not only directional. They also define decision gates.

#### `6/10` -> `8/10` gate

Action Center may be treated as a strong bounded upsell when all of the following are true for the first eligible route family:

- review invites and reminder triggers work with contextual landing
- no tenant-specific native Microsoft integration is required for baseline operation
- at least 60% of assigned managers engage after a trigger within the expected follow-through window
- at least 70% of scheduled reviews are actually completed or explicitly rescheduled
- stale route share is below 25%
- HR can operate the rhythm without repeated product-team rescue

#### `8/10` -> `standard upsell` gate

Action Center may be treated as a standard upsell when:

- the eligible route family is explicitly documented
- route defaults and eligibility rules exist for all in-scope routes
- review rhythm and reminders are operationally reliable
- stale route share is below 20%
- overdue review rate is below 20%
- closeout and reopen behavior are trusted enough for customer-facing use

#### `standard upsell` -> `10/10 suite-wide motion` gate

Action Center may be treated as a suite-wide standard upsell motion only when:

- at least the intended in-scope route family has parity in follow-through defaults and channel rhythm
- the attach story is consistent enough that sales is not improvising route fit every time
- HR oversight is strong enough to run multi-route follow-through without manual chasing becoming the norm
- adoption proof exists across multiple customer contexts, not only one favorable pilot

---

## 7. Core Gaps

### 7.1 Positioning gap

Action Center can already be explained as follow-through, but not yet strongly enough as a default upsell with a simple external promise.

The missing move is from:

- "another environment for follow-up"

to:

- "the layer that keeps follow-through alive without extra check-work"

### 7.2 Manager adoption gap

Managers still face too much pull-based behavior.

The missing move is from:

- self-initiated monitoring

to:

- trigger-led participation with clear "why now" context

### 7.3 HR control gap

HR needs better rhythm control without becoming a manual coordinator for every review and reminder.

The missing move is from:

- tool use

to:

- operating leverage

### 7.4 Channel gap

This is the biggest gap.

The current product is still too app-centric.
The missing move is to make Outlook and email carry enough of the operational rhythm that Action Center stops feeling like a dashboard habit.

### 7.5 Simplicity gap

Action Center already has meaningful product depth.
If new capability is added without discipline, the product risks becoming:

- heavy
- workflow-like
- manager-hostile

The design must increase strength without increasing cognitive weight.

### 7.6 Route parity gap

A standard suite-wide upsell cannot rely forever on a narrow set of favorable route contexts.

The missing move is consistent follow-through semantics and rhythm across the relevant route family.

### 7.7 Proof gap

To sell Action Center as a standard upsell, Verisight needs evidence that:

- review discipline improves
- manager participation improves
- follow-through stalls less often
- HR spends less manual coordination energy

---

## 8. Product Principles

Every improvement in this roadmap must respect the following principles.

### 8.1 Truth stays in Action Center

Email and calendar may carry the rhythm.
They may not become the canonical truth for:

- status
- ownership
- review outcome
- closeout
- continuation

### 8.2 Rhythm should come to the user

Managers should not need to self-orient in a broad workbench just to know what matters now.

### 8.3 HR gets leverage, not administrative drag

Every added rhythm feature should reduce manual chasing rather than create more setup work.

### 8.4 The experience stays bounded and calm

If the product begins to feel like generic work management, the design is drifting.

### 8.5 One next thing is stronger than broad visibility

For managers especially, the product should prioritize:

- clear trigger
- clear reason
- clear next move

over broad operational overview.

### 8.6 Outlook-first, not Outlook-only

The first serious implementation path should focus on Outlook and email.
But interfaces and event models should be designed so that later channels can be added without rewriting the product model.

### 8.7 Channel feasibility before channel ambition

The first serious rollout must not depend on heavy customer IT prerequisites.

That means phase 1 must assume:

- standards-based email delivery
- ICS-based calendar invitation support
- no mandatory tenant-wide Microsoft consent
- no mandatory native Microsoft Graph integration as the baseline

Native Microsoft integration may become a later optimization layer, but it is not the baseline viability requirement for the first external strong-hybrid release.

---

## 9. Workstreams

The recommended program should be split into four workstreams.

### 9.1 Workstream A: Rhythm Engine

Purpose:
move Action Center from passive workbench to active rhythm layer.

Scope:

- contextual entry and deeplink foundation
- Outlook review invites
- notification events
- reminder logic
- digest logic
- later multichannel expansion

### 9.2 Workstream B: Manager Experience

Purpose:
make manager participation light, clear, and non-dashboard-like.

Scope:

- manager-first landing
- precise deeplinks
- compact review and update flows
- lower cognitive load at entry

### 9.3 Workstream C: HR Control and Governance

Purpose:
give HR the ability to steer follow-through without becoming a coordination bottleneck.

Scope:

- review rhythm control
- owner changes
- stalled route oversight
- escalation behavior
- route defaults
- boundedness rules

### 9.4 Workstream D: Commercialization and Proof

Purpose:
turn product strength into a repeatable standard upsell motion.

Scope:

- adoption instrumentation
- packaging and positioning
- proposal language
- evidence and proof assets

---

## 10. Recommended Phasing

### 10.1 Phase 1: Adoption Foundation

Primary goal:
make Action Center stop depending on active checking.

Priority outcomes:

- contextual deeplink foundation
- Outlook review invites
- triggered follow-through email
- precise route-aware landing
- manager-first entry improvements
- basic HR rhythm control

### 10.2 Phase 2: Strong Hybrid Hardening

Primary goal:
make the new rhythm reliable, understandable, and scalable.

Priority outcomes:

- notification intelligence
- reminder and digest quality
- compact manager quick-action flows
- review reschedule flows
- stalled-route oversight

### 10.3 Phase 3: Suite-Scale Readiness

Primary goal:
make Action Center consistent enough to upsell across the relevant route family.

Priority outcomes:

- route defaults
- route eligibility rules
- suite-level parity patterns
- adoption instrumentation
- commercial packaging refinement

### 10.4 Phase 4: 10/10 Expansion

Primary goal:
scale the mature strong-hybrid model without losing boundedness.

Priority outcomes:

- Outlook-first maturity
- multichannel-ready abstraction
- selective additional channels
- stronger commercial proof
- careful off-platform extensions where safe

---

## 11. Priority Model

### 11.1 P0

These are the must-have improvements that unlock adoption and make the upsell more sellable.

- contextual deeplink foundation
- Outlook review invites
- triggered email layer
- manager-first entry experience
- HR control over rhythm

### 11.2 P1

These strengthen the strong-hybrid model and make it operationally resilient.

- notification intelligence
- review reschedule flows
- stalled route and escalation oversight
- standard route defaults
- adoption instrumentation

### 11.3 P2

These matter for the `10/10` end state, but should not be the first unlock.

- suite-wide parity
- multichannel expansion
- limited off-platform actions
- commercial packaging maturity

---

## 12. Initiative Roadmap

The following initiatives are the recommended execution units.

### 12.1 Initiative 1: Contextual Entry and Deeplink Foundation

Purpose:
make every strong-hybrid trigger land in exact route context instead of a generic Action Center destination.

Must deliver:

- route-level deeplinks
- review-level deeplinks
- action-level deeplinks where relevant
- a manager-focused landing state that answers "what needs attention now?"

Dependency rule:

- no serious email or calendar trigger should ship before this foundation exists

### 12.2 Initiative 2: Outlook Review Loop

Purpose:
make review moments real calendar events in the manager and HR operating rhythm.

Must deliver:

- review invite creation
- review invite updates on reschedule
- review invite cancellation handling
- route-aware context and deeplink in the invite
- HR visibility that the review loop is actually scheduled

Phase 1 feasibility rule:

- the baseline mechanism is email plus ICS calendar support
- native Microsoft integration is optional and later
- phase 1 must work without mandatory customer tenant consent
- the organizer model must be supportable through a Verisight-controlled or HR-controlled sending identity without requiring per-manager delegated calendar write access
- customers who can consume standard calendar invites remain in the baseline rollout shape even without native Microsoft integration
- customers who cannot reliably consume calendar invites may still receive email-triggered follow-through, but they are not the target ideal for the first strong-hybrid rollout

### 12.3 Initiative 3: Triggered Follow-Through Mail Layer

Purpose:
make Action Center push the right follow-through prompts at the right time.

Must deliver:

- assignment email
- review-upcoming email
- missed-review email
- follow-up-open email
- clear distinction between informational and action-needed messages

### 12.4 Initiative 4: HR Rhythm Console

Purpose:
let HR manage review rhythm and follow-through pressure without manual coordination overload.

Must deliver:

- review timing setup
- owner adjustment
- reminder and escalation configuration
- simple oversight of upcoming and overdue follow-through

### 12.5 Initiative 5: Stalled Route and Escalation Model

Purpose:
make stillness visible before Action Center turns into passive history.

Must deliver:

- stalled-route signal
- missed-review signal
- open-follow-up pressure signal
- escalation paths to HR

### 12.6 Initiative 6: Manager Quick-Action Flows

Purpose:
minimize the work needed after landing in Action Center.

Must deliver:

- lightweight update flows
- concise review confirmation flows
- minimal-field manager interactions
- strong "what now" and "what changed" clarity

### 12.7 Initiative 7: Route Defaults and Eligibility Rules

Purpose:
scale follow-through without route-by-route manual design.

Must deliver:

- default rhythms per route family
- owner and review defaults
- clear route eligibility rules
- boundedness enforcement for follow-through fit

This initiative does not create first-rollout eligibility from scratch.
It operationalizes and scales the explicit first-rollout route perimeter already defined in section 5.1.

### 12.8 Initiative 8: Adoption Instrumentation

Purpose:
measure whether the rhythm model actually works.

Must deliver:

- invite send and acceptance metrics
- manager response metrics
- review completion metrics
- stale route metrics
- closeout and reopen metrics

### 12.9 Initiative 9: Commercial Packaging Kit

Purpose:
make Action Center easier to sell consistently.

Must deliver:

- standard upsell language
- route-fit framing
- proposal building blocks
- anti-misframing guardrails for sales

### 12.10 Initiative 10: Multichannel Extension Layer

Purpose:
prepare expansion beyond Outlook without weakening the product core.

Must deliver:

- channel-agnostic event model
- readiness for Teams or Slack later
- careful policy for which actions may happen off-platform

---

## 13. Success Metrics

The product should not claim `10/10` maturity based on feature completion alone.

The maturity proof should come from adoption and rhythm behavior.

### 13.1 Adoption metrics

- percentage of assigned managers who engage after trigger
- percentage of scheduled reviews that actually happen
- percentage of routes that receive a follow-through update without HR chasing

### 13.2 Rhythm metrics

- overdue review rate
- time from assignment to first response
- time from review due to review completion
- stale route share

### 13.3 Governance metrics

- closeout discipline rate
- reopen rate where follow-through was prematurely closed
- escalation usage and resolution rate

### 13.4 Commercial proof metrics

- attach rate of Action Center upsell
- sales-cycle clarity feedback
- customer perception of reduced follow-through overhead

---

## 14. Required Child Specs Before Implementation Planning

This document must be decomposed into narrower executable specs before implementation planning begins.

Required child specs:

- Contextual Entry and Deeplink Foundation
- Outlook / Email / ICS Channel Contract
- HR Rhythm Console
- Triggered Follow-Through Mail Layer
- Manager Quick-Action Experience
- Route Defaults and Eligibility Rules
- Adoption Instrumentation and Readback
- Commercial Packaging Kit

Each child spec should define:

- the exact bounded scope
- product rules
- roles and permissions
- data truth and write rules
- success and failure states
- test strategy

This avoids treating a cross-functional roadmap as if it were already a single directly buildable implementation spec.

---

## 15. What Not to Build First

The following are explicitly lower priority or actively discouraged in the next phase:

- a large Action Center visual redesign without rhythm improvements
- an inbox-first operating model where truth leaks into email threads
- route parity across all scan types before the strong-hybrid pattern works well
- multichannel orchestration before Outlook-first is mature
- broad inline workflow actions from email before policy, truth, and safety are stable
- new generic project-management behaviors

---

## 16. Recommended Primary Execution Order

The recommended program order is:

1. Contextual Entry and Deeplink Foundation
2. Outlook Review Loop
3. Triggered Follow-Through Mail Layer
4. HR Rhythm Console
5. Stalled Route and Escalation Model
6. Manager Quick-Action Flows
7. Adoption Instrumentation
8. Route Defaults and Eligibility Rules
9. Commercial Packaging Kit
10. Multichannel Extension Layer

This order intentionally favors:

- rhythm before parity
- adoption before broad scale
- clear value before broader channel ambition

---

## 17. Relationship to Earlier Action Center Roadmaps

This document complements earlier Action Center roadmap documents focused on:

- pilot-ready commercial state
- core route semantics
- governance reliability
- product hardening

Its distinct contribution is the move from:

- a strong bounded follow-through product

to:

- a standard upsell that is adoption-proof because it works through existing HR and manager rhythms

It should therefore be used as the guiding design for the next maturity phase whenever the key question is:

> How do we make Action Center easier to sell and easier to keep alive without turning it into another heavy tool?
