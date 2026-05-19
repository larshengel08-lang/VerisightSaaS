# Action Center Constitution + Adoption Measurement Readiness Design

## Status
Drafted from approved remediation memo

## Intent
This document defines the bounded P0 design for **Action Center Constitution + Adoption Measurement Readiness**.

It is a design spec.

It is not an implementation plan.

Its purpose is to make Action Center product rules explicit enough that:

- follow-through truth does not remain implicit
- later UX, reminder, Outlook, and reporting behavior derive from a stable model
- future implementation slices can be planned against one disciplined product core

This wave does **not** claim adoption proof.

It produces adoption measurement readiness only.

Adoption proof must be gathered later through live usage on bounded routes.

---

## 1. Product Role

Action Center remains:

- an embedded follow-through layer
- an add-on to existing scan routes
- bounded to post-scan ownership, review rhythm, follow-up status, closeout, continuation, route history, and adoption measurement

Action Center does **not** become:

- a standalone first-buy product
- a third first-buy route
- generic workflow software
- project management tooling
- advisory tooling
- an HR operating system
- a generic task manager
- a broad buyer-facing module

This design exists to harden that boundary, not to widen it.

---

## 2. Binding Defaults

The following defaults are binding for this design.

- Action Center is the only canonical write surface for follow-through state.
- Email, ICS, Outlook, and optional Microsoft Graph may notify, invite, remind, mirror, or hint attendance, but do not canonically close, reopen, reassign, reschedule, or change route status unless a later approved policy explicitly changes that rule.
- HR is the rhythm owner and final closeout actor.
- Managers participate through contextual quick actions, not dashboard ownership.
- Manager participation must stay lighter than HR participation.
- Route eligibility is limited to explicitly approved route families. In this design, `exit` and `retention` are the only approved families.
- Configuration stays bounded. No free-form workflow rules, generic automation chains, or broad cross-channel orchestration are allowed.
- The product should be simpler and more defensible after this wave, not broader and heavier.

---

## 3. Architecture

This design follows one architectural rule:

> channels reflect and activate follow-through; Action Center defines and stores follow-through

The architectural stack is:

1. canonical objects inside Action Center
2. canonical state model inside Action Center
3. role-based mutation rules
4. derived oversight and adoption events
5. non-canonical channel surfaces

That means:

- review invites derive from canonical review state
- reminders derive from canonical ownership, schedule, and route state
- Outlook/Graph synchronization mirrors canonical truth
- reporting on adoption derives from product events tied back to canonical objects

No downstream surface may invent its own truth semantics.

---

## 4. Canonical Object Model

The design recognizes the following canonical Action Center objects.

### 4.1 Follow-through route

The route-level follow-through record anchors:

- route identity
- route family
- route context
- active ownership
- current follow-through state
- closure / continuation outcome

It is the top-level object for Action Center truth.

### 4.2 Owner assignment

The owner assignment object anchors:

- current accountable owner
- assignment history
- reassignment reason where applicable
- active/inactive ownership semantics

It expresses accountability, not generic collaboration membership.

### 4.3 Review moment

The review moment object anchors:

- planned review date/time
- review revision history
- attendance-related hints
- review completion status

It exists to structure rhythm, not to model an entire meeting system.

### 4.4 Follow-up state

The follow-up state object anchors:

- whether action is still open
- whether review rhythm is healthy or broken
- whether route pressure is overdue, stale, or escalation-sensitive
- whether the route requires continuation or can close

This object is derived partly from route truth and partly from rhythm/review truth, but remains canonical inside Action Center.

### 4.5 Closeout / continuation record

The closeout / continuation record anchors:

- whether follow-through ended
- why it ended
- whether continuation is planned
- who closed it
- when it was closed
- whether and why it was reopened

This keeps route closure from collapsing into a single vague status.

### 4.6 Adoption event

The adoption event object anchors the measurement layer.

It should capture:

- who received a trigger
- who opened contextual entry
- who completed a quick action
- who attended/reviewed/rescheduled/closed through canonical flows

This object exists to make later adoption proof possible.

It does not, by itself, prove adoption.

---

## 5. Canonical State Model

The state model must be explicit and bounded.

### 5.1 Route-level states

The route-level model should distinguish at least:

- `open`
- `scheduled`
- `overdue`
- `stale`
- `escalation_sensitive`
- `closed`
- `reopened`

`Resolved` may exist only as a derived reporting label if needed.

It is **not** safe as the canonical end-state for people signals.

### 5.2 Completion semantics that must remain distinct

The design must distinguish at least:

- action completed
- review completed
- route closed
- no further follow-up needed
- continuation planned
- signal still monitored
- reopened

These may map to shared route truth, but may not be blurred into one generic `resolved` bucket.

### 5.3 Review-level states

The review object should distinguish at least:

- `scheduled`
- `completed`
- `missed`
- `cancelled`
- `rescheduled`

Review completion is not equal to route closure.

### 5.4 Derived oversight states

The oversight layer may still expose bounded derived labels such as:

- `upcoming`
- `overdue`
- `stale`
- `escalation_sensitive`
- `resolved`

But those labels must derive from canonical route and review truth, not replace it.

---

## 6. State Transition Rules

State transitions must be explicit and actor-bounded.

### 6.1 Allowed transition families

The design should support:

- owner assignment and reassignment
- review scheduling and rescheduling
- review completion
- route closeout
- route reopen
- escalation-sensitive derived signaling

### 6.2 Prohibited transition pattern

The design must reject:

- transitions with no accountable actor
- transitions caused only by passive channel events
- silent transitions from reminder or invite behavior
- status changes inferred purely from RSVP behavior
- generic catch-all transitions such as “resolved somehow”

### 6.3 Transition logging rule

Every canonical transition must be auditable with:

- actor
- timestamp
- previous state
- new state
- affected object
- reason where required

---

## 7. Roles And Permissions

The design assumes two primary product actors and one system layer.

### 7.1 HR

HR may:

- configure bounded review rhythm
- assign and reassign owners within approved rules
- schedule and reschedule canonical review moments
- close routes
- reopen routes where policy allows
- govern continuation semantics
- inspect oversight and adoption metrics

HR is the final closeout actor.

### 7.2 Manager

Managers may participate through contextual quick actions.

Managers may:

- open the relevant route/review context
- confirm attendance or contextual participation where allowed
- complete one bounded canonical quick action where the trigger expects it
- add bounded notes or updates only if the follow-up design explicitly allows it

Managers do not own the system.

Managers do not become free-form workflow operators.

### 7.3 System / channel layer

The system layer may:

- generate invites
- send reminders
- mirror calendar artifacts
- reflect attendance hints
- record non-canonical notification events

The system layer may not silently mutate canonical route truth.

---

## 8. Off-Platform Write Policy

The off-platform write policy is mandatory.

### 8.1 Allowed off-platform behavior

Allowed off-platform behavior includes:

- receiving email reminders
- receiving ICS invites
- responding to Outlook invites as attendance hints
- using deeplinks into Action Center

### 8.2 Non-canonical signal behavior

The following may be recorded as non-canonical signals:

- invite opened
- deeplink opened
- RSVP hint
- mail delivery / suppression / failure

These signals inform measurement and operations.

They do not change canonical state by themselves.

### 8.3 Prohibited off-platform canonical writes

The following remain prohibited in this design:

- closeout outside Action Center
- reopen outside Action Center
- owner reassignment outside Action Center
- review reschedule outside Action Center
- route status changes outside Action Center
- generic mail-based or calendar-based state mutation

Any exception to these rules requires a later approved policy and is out of scope for this wave.

---

## 9. Route Eligibility

Route eligibility is explicit and fail-closed.

### 9.1 Approved route families

This design covers only:

- `exit`
- `retention`

### 9.2 Excluded route families

The following remain excluded in this wave:

- `pulse`
- `onboarding`
- `leadership`
- `team`
- any future route family not explicitly approved

### 9.3 Eligibility rule

Action Center belongs to a route only where bounded follow-through semantics are clear enough to support:

- accountable ownership
- review rhythm
- follow-up status
- closeout or continuation
- bounded adoption measurement

If a route cannot satisfy those semantics, it is not eligible.

---

## 10. Manager Quick-Action Contract

Manager participation must stay focused and light.

### 10.1 One-primary-action rule

Each manager-facing trigger should have one primary expected action.

Examples:

- review context opens to confirm or complete the expected review step
- follow-up context opens to provide the bounded next update
- continuation context opens to confirm the next bounded route decision

Managers should not have to interpret a broad dashboard surface to understand what is expected.

### 10.2 Quick-action limits

Quick actions must remain:

- contextual
- bounded
- actor-specific
- tied to one route/review object

They must not become:

- generic task inbox behavior
- free-form status administration
- substitute HR governance

---

## 11. Adoption Measurement Framework

This wave defines measurement readiness only.

### 11.1 What this framework is for

The framework should make later adoption proof possible by defining:

- which events are captured
- which metrics exist
- how they are calculated
- how they should be interpreted

### 11.2 Core metrics

The design should define at least:

- manager trigger open rate
- manager quick-action completion rate
- review completion rate
- reschedule rate
- stale route rate
- overdue route rate
- escalation-sensitive route rate
- closeout discipline rate
- reopen rate
- HR chasing reduction proxy

### 11.3 Metric contract

Each metric must define:

- event source
- canonical object anchor
- formula
- interpretation guidance
- what the metric does **not** prove

### 11.4 Commercial rule

No commercial claim of proven Action Center adoption may be made from this spec alone.

Proof requires later live-route evidence.

---

## 12. Governance, Audit And Data Boundaries Appendix

The follow-up implementation work must inherit the following governance rules.

### 12.1 Auditlog

Audit requirements must cover:

- owner changes
- review scheduling changes
- closeout
- reopen
- escalation-related transitions where applicable

### 12.2 Data retention assumptions

The design must explicitly state:

- what follow-through history is retained
- what is operational history versus people-sensitive record
- what can age out, if anything

### 12.3 Visibility boundaries

The design must define:

- who can see route state
- who can see review history
- who can see manager notes or updates
- whether notes remain route-visible, HR-only, or hidden from managers

### 12.4 Follow-through history versus personnel record

Action Center is follow-through software.

It is not a personnel dossier.

The design must keep `opvolghistorie` separate from employee file semantics.

### 12.5 Customer and tenant boundary

All canonical truth, audit, and metrics must remain tenant-safe and route-safe.

### 12.6 Export and support boundary

The design must define:

- what may be exported
- what support staff may inspect
- what should remain internal-only

### 12.7 Microsoft Graph governance

The design must define:

- consent assumptions
- fallback behavior
- what Graph may mirror
- what Graph may never canonically change

### 12.8 Prohibited storage

The design must state what may not be stored in Action Center.

At minimum, that should block drifting into:

- broad HR case files
- unbounded employee narrative records
- generic advisory logs
- unrelated workflow commentary

---

## 13. Test Strategy

The eventual implementation plan must cover tests for:

- permissions and actor boundaries
- canonical state transitions
- prohibited state transitions
- stale / overdue / escalation-sensitive derivation
- reschedule behavior
- closeout and reopen behavior
- route eligibility fail-closed behavior
- off-platform boundary violations
- metric event generation and calculation contracts

The test strategy exists to protect the constitutional model, not just the UI.

---

## 14. Non-Goals

This design does not attempt to:

- broaden Action Center into a general workflow tool
- add new route families
- add new Graph-dependent product depth
- create broad manager dashboard ownership
- make Action Center a standalone commercial module
- replace later live adoption proof with a spec-level claim

---

## 15. Approval Gate

This design is only ready for implementation planning when it explicitly defines:

- every canonical object and its purpose
- every allowed state and prohibited state
- every allowed state transition
- actor permissions for each transition
- the full off-platform write policy
- route eligibility rules and exclusion rules
- manager quick-action boundaries
- governance/audit/data boundaries
- adoption measurement semantics
- test coverage expectations

If any of these remain ambiguous, the implementation plan should not be written.

---

## 16. Next Step

After review and approval, the next document should be the implementation plan for this design.

That implementation plan should decompose the work into bounded slices and must not broaden Action Center scope beyond the rules established here.
