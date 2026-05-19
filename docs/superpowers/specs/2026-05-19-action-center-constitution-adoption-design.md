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

It captures:

- who received a trigger
- who opened contextual entry
- who completed a quick action
- who attended, reviewed, rescheduled, or closed through canonical flows

This object exists to make later adoption proof possible.

It does not, by itself, prove adoption.

---

## 5. Canonical State Model

The state model must be explicit and bounded.

### 5.1 Route-level states

The route-level model distinguishes at least:

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

The design distinguishes at least:

- action completed
- review completed
- route closed
- no further follow-up needed
- continuation planned
- signal still monitored
- reopened

These may map to shared route truth, but may not be blurred into one generic `resolved` bucket.

### 5.3 Review-level states

The review object distinguishes at least:

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

The design supports:

- owner assignment and reassignment
- review scheduling and rescheduling
- review completion
- route closeout
- route reopen
- escalation-sensitive derived signaling

### 6.2 Prohibited transition pattern

The design rejects:

- transitions with no accountable actor
- transitions caused only by passive channel events
- silent transitions from reminder or invite behavior
- status changes inferred purely from RSVP behavior
- generic catch-all transitions such as `resolved somehow`

### 6.3 Transition logging rule

Every canonical transition is auditable with:

- actor
- timestamp
- previous state
- new state
- affected object
- reason where required
- channel/source

---

## 7. State Transition Matrix

| Object | From state | To state | Actor allowed | Trigger | Audit required | Off-platform allowed? | Notes / constraints |
| --- | --- | --- | --- | --- | --- | --- | --- |
| follow-through route | `open` | `scheduled` | HR rhythm owner | canonical review scheduled for active route | yes | no | Action Center remains canonical truth; invites may mirror later |
| follow-through route | `open` | `closed` | HR rhythm owner | explicit closeout with closeout reason | yes | no | HR is the only closeout actor |
| follow-through route | `scheduled` | `overdue` | system derivation | review window passes without canonical completion or canonical reschedule | yes | no | derived from canonical schedule only |
| follow-through route | `scheduled` | `stale` | system derivation | stale trigger crossed or required review date missing or invalid | yes | no | no passive channel event may cause this transition |
| follow-through route | `overdue` | `closed` | HR rhythm owner | explicit closeout after overdue follow-through decision | yes | no | overdue does not prevent closeout |
| follow-through route | `stale` | `escalation_sensitive` | system derivation | escalation threshold crossed while route remains unresolved | yes | no | system may derive only; it may not close or reopen |
| follow-through route | `closed` | `reopened` | HR rhythm owner | explicit reopen with reason and continuation decision | yes | no | reopen must never be inferred from channel behavior |
| review moment | `scheduled` | `rescheduled` | HR rhythm owner | canonical review date/time changed in Action Center | yes | no | managers do not reschedule canonical reviews in this wave |
| review moment | `scheduled` | `completed` | HR rhythm owner, manager participant through explicitly allowed quick action | canonical review completion recorded in Action Center | yes | no | manager may complete only the one bounded quick action defined for that trigger |
| review moment | `scheduled` | `missed` | system derivation, HR rhythm owner | review window expires without canonical completion | yes | no | RSVP decline or no-response does not directly set canonical missed |
| review moment | `scheduled` | `cancelled` | HR rhythm owner | canonical cancellation recorded in Action Center | yes | no | ICS/Graph may mirror cancellation but not define it |
| owner assignment | `unassigned` | `assigned` | HR rhythm owner | initial accountable owner set | yes | no | assignment is canonical follow-through truth |
| owner assignment | `assigned` | `reassigned` | HR rhythm owner | explicit owner change with reason | yes | no | managers may not reassign owners |

Binding rules:

- HR is the only actor allowed to close or reopen a route.
- The system may derive `overdue`, `stale`, and `escalation_sensitive`, but may not close or reopen routes.
- Managers may complete only explicitly allowed bounded quick actions.
- RSVP, email open, ICS behavior, Outlook behavior, and Graph behavior may not directly cause canonical route state changes.
- Every canonical state transition must be auditable.

---

## 8. Roles And Permissions

The design assumes two primary product actors and one system layer.

### 8.1 HR rhythm owner

HR may:

- configure bounded review rhythm
- assign and reassign owners within approved rules
- schedule and reschedule canonical review moments
- close routes
- reopen routes where policy allows
- govern continuation semantics
- inspect oversight and adoption metrics

HR is the final closeout actor.

### 8.2 Manager participant

Managers participate through contextual quick actions.

Managers may:

- open the relevant route/review context
- confirm attendance or contextual participation where allowed
- complete one bounded canonical quick action where the trigger expects it
- add bounded notes or updates only if the follow-up design explicitly allows it

Managers do not own the system.

Managers do not become free-form workflow operators.

### 8.3 System / channel layer

The system layer may:

- generate invites
- send reminders
- mirror calendar artifacts
- reflect attendance hints
- record non-canonical notification events
- derive oversight states from canonical truth

The system layer may not silently mutate canonical route truth.

### 8.4 Permissions matrix

| Actor | May read | May create | May update | May close | May reopen | May reschedule | May add notes | May view adoption metrics | Explicitly prohibited |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| HR rhythm owner | route state, review history, oversight, bounded notes, adoption metrics | owner assignments, review moments, closeout/continuation records | route truth, review truth, assignments, bounded notes | yes | yes | yes | yes, bounded to route/review context | yes | generic workflow automation, broad employee narrative, off-platform canonical write delegation |
| manager participant | contextual route/review surface relevant to their participation | no standalone canonical objects | one explicitly allowed quick action, bounded contextual note if policy allows | no | no | no | yes, bounded to route/review context and non-dossier-like | no | route closeout, owner reassignment, canonical reschedule, broad dashboard ownership, free-form case management |
| executive viewer | out of scope for this wave unless separately approved | out of scope | out of scope | out of scope | out of scope | out of scope | out of scope | out of scope | implicit broad read layer or executive workflow surface |
| system / channel layer | canonical objects needed for notification, mirroring, and derivation | non-canonical notification events, mirrored calendar artifacts | derived oversight signals, delivery state, attendance hints | no | no | no | no | yes, only for system-generated measurement events | silent canonical mutation, route closeout, reopen, owner reassignment |
| Verisight support / operator | out of scope by default; if enabled, operational troubleshooting only | no canonical business objects | operational annotations only where separately approved | no | no | no | no business notes | no by default | tenant-unsafe access, product-side state mutation, dossier-like inspection |

---

## 9. Off-Platform Write Policy

The off-platform write policy is mandatory.

### 9.1 Allowed off-platform behavior

Allowed off-platform behavior includes:

- receiving email reminders
- receiving ICS invites
- responding to Outlook invites as attendance hints
- using deeplinks into Action Center

### 9.2 Non-canonical signal behavior

The following may be recorded as non-canonical signals:

- invite opened
- deeplink opened
- RSVP hint
- mail delivery / suppression / failure

These signals inform measurement and operations.

They do not change canonical state by themselves.

### 9.3 Prohibited off-platform canonical writes

The following remain prohibited in this design:

- closeout outside Action Center
- reopen outside Action Center
- owner reassignment outside Action Center
- review reschedule outside Action Center
- route status changes outside Action Center
- generic mail-based or calendar-based state mutation

Any exception to these rules requires a later approved policy and is out of scope for this wave.

---

## 10. Route Eligibility

Route eligibility is explicit and fail-closed.

### 10.1 Approved route families

This design covers only:

- `exit`
- `retention`

### 10.2 Excluded route families

The following remain excluded in this wave:

- `pulse`
- `onboarding`
- `leadership`
- `team`
- any future route family not explicitly approved

### 10.3 Eligibility rule

Action Center belongs to a route only where bounded follow-through semantics are clear enough to support:

- accountable ownership
- review rhythm
- follow-up status
- closeout or continuation
- bounded adoption measurement

If a route cannot satisfy those semantics, it is not eligible.

---

## 11. Approved Route Defaults

| Route family | Default review window | Default rhythm owner | Default manager participant role | Default closeout question | Default stale trigger | Default continuation logic | Excluded behavior |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `exit` | `60-90 days` | HR rhythm owner | contextual manager participant for the relevant review/follow-up moment | what was chosen, what was executed, and what returns in the next exit batch or management conversation? | route becomes `stale` when no valid review date exists or the scheduled review passes the bounded review window without canonical update | continuation stays bounded to the next relevant exit batch, management conversation, or explicit closeout | no generic project board, no broad task engine, no advisory case log |
| `retention` | `45-90 days` | HR rhythm owner | contextual manager participant for the relevant review/follow-up moment | what was verified, what first intervention or follow-up was started, and what should still be watched in retention signal, stay-intent, or departure intention? | route becomes `stale` when no valid review date exists or the scheduled review passes the bounded review window without canonical update | continuation stays bounded to follow-up on retention signal, stay-intent, departure intention, or explicit closeout | no generic project board, no broad task engine, no advisory case log |

Shared defaults:

- HR is rhythm owner.
- Managers are contextual participants.
- No route gains a generic project board or broad task engine in this wave.

---

## 12. Manager Quick-Action Contract

Manager participation must stay focused and light.

### 12.1 One-primary-action rule

Each manager-facing trigger should have one primary expected action.

Examples:

- review context opens to confirm or complete the expected review step
- follow-up context opens to provide the bounded next update
- continuation context opens to confirm the next bounded route decision

Managers should not have to interpret a broad dashboard surface to understand what is expected.

### 12.2 Quick-action limits

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

## 13. Adoption Measurement Framework

This wave defines measurement readiness only.

### 13.1 What this framework is for

The framework makes later adoption proof possible by defining:

- which events are captured
- which metrics exist
- how they are calculated
- how they should be interpreted

### 13.2 Core metrics

The design defines the following core metrics:

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

### 13.3 Metric contract

Each metric defines:

- event source
- canonical object anchor
- formula
- interpretation guidance
- what the metric does **not** prove

### 13.4 Metric definitions table

| Metric name | Formula | Event source | Canonical object anchor | Interpretation | What it does not prove |
| --- | --- | --- | --- | --- | --- |
| `manager_trigger_open_rate` | unique manager contextual-entry opens / unique manager trigger deliveries | trigger delivery ledger + contextual-entry events | adoption event linked to follow-through route and review moment | indicates whether manager-facing triggers cause first engagement | does not prove useful follow-through, review quality, or management action quality |
| `manager_quick_action_completion_rate` | completed manager quick actions / manager quick-action opportunities | quick-action events | adoption event linked to review moment or follow-through route | shows whether managers complete the bounded primary action asked of them | does not prove that the underlying decision or intervention was good |
| `review_completion_rate` | canonically completed reviews / scheduled reviews in measurement window | review moment transition events | review moment | shows whether planned reviews are actually completed | does not prove route closure quality or intervention success |
| `reschedule_rate` | canonically rescheduled reviews / scheduled reviews in measurement window | review reschedule events | review moment | indicates how often rhythm slips and requires replanning | does not prove bad governance by itself |
| `stale_route_rate` | routes in `stale` state / active eligible follow-through routes | route state derivation events | follow-through route | shows broken or missing review rhythm on eligible routes | does not prove neglect in every case |
| `overdue_route_rate` | routes in `overdue` state / active eligible follow-through routes | route state derivation events | follow-through route | shows follow-through pressure that has crossed the planned review date | does not prove failure of follow-through by itself |
| `escalation_sensitive_route_rate` | routes in `escalation_sensitive` state / active eligible follow-through routes | route state derivation events | follow-through route | shows routes that have crossed the bounded escalation threshold and need HR attention | does not prove poor product fit by itself |
| `closeout_discipline_rate` | canonically closed routes with required closeout fields completed / canonically closed routes | closeout events | closeout / continuation record | shows whether closure is disciplined rather than vague | does not prove the chosen action was correct |
| `reopen_rate` | reopened routes / canonically closed routes | reopen events | closeout / continuation record plus follow-through route | shows how often closure did not hold | does not prove reopen is always bad |
| `HR_chasing_reduction_proxy` | 1 - (HR manual chase events / (routes in `overdue` + routes in `stale` + routes in `escalation_sensitive`)) | HR chase events + derived oversight events | adoption event linked to follow-through route | estimates whether the system reduces manual HR chasing pressure over time | does not prove manager satisfaction or total operating efficiency |

These metrics enable later proof.

They are not proof by themselves.

Commercial claims require later live-route evidence.

### 13.5 Commercial rule

No commercial claim of proven Action Center adoption may be made from this spec alone.

Proof requires later live-route evidence.

---

## 14. Governance, Audit And Data Boundaries Appendix

The follow-up implementation work must inherit the following governance rules.

### 14.1 Auditlog

Every canonical audit entry captures:

- actor
- timestamp
- previous state
- new state
- affected object
- reason where required
- channel/source

Audit coverage includes:

- owner changes
- review scheduling changes
- closeout
- reopen
- escalation-related transitions where applicable

### 14.2 Data retention assumptions

The default assumption is:

- follow-through history is retained as operational route history unless later retention policy says otherwise
- operational history and people-sensitive record remain distinct
- no retention behavior may silently turn Action Center into a personnel dossier
- any aging-out policy must preserve audit integrity for canonical transitions

### 14.3 Visibility boundaries

Default visibility is:

- HR can see route state and review history for eligible routes they govern
- managers see only the contextual route/review actions relevant to them
- broad executive visibility is out of scope unless separately approved
- manager notes remain bounded to route/review context and are not broad employee narratives
- note visibility must be intentionally set as route-visible, HR-only, or hidden from managers

### 14.4 Follow-through history versus personnel record

Action Center is follow-through software.

It is not a personnel dossier.

The design keeps `opvolghistorie` separate from employee file semantics.

### 14.5 Customer and tenant boundary

All canonical truth, audit, and metrics remain tenant-safe and route-safe.

### 14.6 Export and support boundary

Default export/support rules are:

- exports may include route history and audit where allowed
- exports must not imply personnel dossier export
- support access must be tenant-safe, auditable, and limited to operational troubleshooting
- support access must not become a shadow business-admin surface

### 14.7 Microsoft Graph governance

Default Graph governance is:

- Graph mirrors invite and calendar artifacts only
- Graph is never schedule truth or route truth
- Graph consent remains optional and route-bounded
- fallback behavior remains standards-based email + ICS
- Graph may never canonically change route status, owner truth, closeout truth, or reopen truth

### 14.8 Manager notes boundary

Manager notes are bounded to route/review context only.

They may not become:

- free-form employee narrative
- performance narrative
- individual risk note
- unbounded commentary thread

### 14.9 Prohibited storage

The following may not be stored in Action Center:

- broad HR case files
- performance narratives
- individual risk notes
- unbounded employee narrative records
- generic advisory logs
- unrelated workflow commentary

---

## 15. Test Strategy

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

## 16. Non-Goals

This design does not attempt to:

- broaden Action Center into a general workflow tool
- add new route families
- add new Graph-dependent product depth
- create broad manager dashboard ownership
- make Action Center a standalone commercial module
- replace later live adoption proof with a spec-level claim

---

## 17. Approval Gate

This design is only ready for implementation planning when it explicitly defines:

- every canonical object and its purpose
- every allowed state and prohibited state
- every allowed state transition
- actor permissions for each transition
- route defaults for approved route families
- the full off-platform write policy
- route eligibility rules and exclusion rules
- manager quick-action boundaries
- metric formulas
- governance, audit, and data boundaries
- adoption measurement semantics
- test coverage expectations

The spec is not implementation-planning ready if any core object, state, transition, permission, route default, off-platform rule, metric formula, or governance boundary remains described only as `should define later` or `must define later`.

The design defines the product defaults now.

Implementation plans may decompose work, but may not invent new product truth.

If any of these remain ambiguous, the implementation plan should not be written.

---

## 18. Next Step

After review and approval, the next document should be the implementation plan for this design.

That implementation plan should decompose the work into bounded slices and must not broaden Action Center scope beyond the rules established here.
