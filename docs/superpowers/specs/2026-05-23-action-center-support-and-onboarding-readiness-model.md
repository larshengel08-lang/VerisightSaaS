# Action Center Support And Onboarding Readiness Model

## Status
Proposed

## Purpose

Define the minimum support and onboarding operating model required for Action Center to be reviewable against an internal operating-readiness standard while it remains embedded in Loep.

This artifact is intentionally operational. It specifies how a customer is onboarded, how the first route is activated, how support issues are classified, and how early-cycle reviews are run without stretching product scope.

It does not authorize:

- launch
- standalone packaging
- route expansion beyond `exit` and `retention`
- new pricing
- GTM broadening
- generic workflow behavior

## Fixed Product Boundary

This model assumes the current approved product truth remains unchanged:

- Action Center remains embedded in Loep today
- approved route families remain `exit` and `retention`
- HR remains the customer-side governance owner
- Loep remains canonical for route truth
- Action Center remains authoritative for follow-through status, review, continuation, and closeout
- the operating model must not drift into project management, case management, employee monitoring, or a broad workflow system

## Internal Operating-Readiness Standard

For this batch, `near-standalone readiness` means one internal review standard only: a customer can be onboarded, activated, supported, reviewed, and corrected using durable materials, named operating steps, and repeatable evidence rather than founder improvisation. The phrase is not a product state and should not be reused elsewhere in this document as customer-facing positioning.

The standard passes only if all of the following are true:

- HR operator onboarding can be completed in 30-45 minutes.
- manager participation onboarding can be completed in 5 minutes or one one-pager.
- first route activation uses an explicit checklist and produces a checklist completion record in the customer rollout log.
- no critical explanation depends on founder-only live narration.

The standard fails if any one of those conditions is missing or if the observable checks below are not met.

### Observable pass / fail checks

Required pass evidence:

- a dated checklist completion record exists for the first route activation
- the HR operator answers at least 4 of 5 verification prompts correctly without live correction
- at least 80% of sampled manager participants, with a minimum sample of 3 when 3 or more managers are involved, can answer the manager comprehension check correctly after the 5 minutes briefing or one one-pager
- the required onboarding materials are present in the named storage location with a visible version/date field

HR operator verification prompts:

- What is Action Center for, and what is it not for?
- Which route families are approved today?
- Who owns continuation and closeout authority?
- What should be escalated as a product issue, governance incident, or route semantics issue?
- What record must exist before the first route activation is treated as complete?

Manager comprehension check:

- the manager can state why they are involved
- the manager can state what action participation is expected
- the manager can state when uncertainty goes back to HR
- the manager does not describe themselves as workflow owner, dashboard owner, or case owner

If the HR operator threshold or manager threshold is missed, the rollout remains incomplete and should move into the failed rollout handling path.

## Roles

### Verisight product owner

Owns the bounded product explanation, approves exceptions to operating materials, and is accountable for whether support signals indicate a product-truth gap.

### Verisight customer success owner

Owns onboarding delivery, first-cycle operating check-ins, issue triage coordination, and readiness evidence collection.

### Verisight support operator

Handles bounded customer questions, reproduces product issues, coordinates internal escalation, and maintains the support log and issue taxonomy.

### Customer HR operator

Owns day-to-day Action Center operation in the tenant, coordinates manager participation, executes review rhythm, and is the primary customer contact for support and rollout questions.

### Customer manager participant

Participates only in bounded route-linked follow-through and review steps. This role does not become a workflow owner.

### Customer executive or sponsor

Reviews first-cycle evidence, governance comfort, and commercial fit. This role is not the day-to-day operator.

## Customer Onboarding Flow

The onboarding flow must be usable by a customer success owner and HR operator without requiring ad hoc founder-led teaching.

### Phase 1 - Readiness intake

Before onboarding starts, Verisight confirms:

- the customer is using an approved route family only
- the named HR operator is identified
- the manager-participation audience is identified
- the first route to be activated is known
- the customer has the current governance one-pager, manager one-pager, privacy boundary note, and route operating explanation

### Phase 2 - HR operator onboarding

Target: HR operator onboarding can be completed in 30-45 minutes.

This session covers:

- what Action Center is and is not
- route-bound scope and approved route families
- HR governance role
- route -> action -> review -> continuation / closeout flow
- what evidence belongs in the record and what does not
- the support path and escalation categories
- the first route activation checklist

Required completion outcome:

- the HR operator can explain the operating model back in plain language
- the HR operator can identify where to escalate a product issue or governance incident
- the HR operator can activate the first route by following the checklist instead of relying on memory

### Phase 3 - Manager participation onboarding

Target: manager participation onboarding can be completed in 5 minutes or one one-pager.

The manager onboarding artifact or briefing must cover only:

- why the manager is involved
- what action participation is expected
- when review happens
- what the manager should not do
- where ambiguity is escalated back to HR

Required completion outcome:

- the manager can participate without assuming dashboard ownership, workflow ownership, or free-form case responsibility

### Phase 4 - First route activation

The first route activation is not considered complete until the explicit activation checklist is executed and recorded.

### Phase 5 - First-cycle review

After the first route is live, Verisight and the customer run the first-cycle evidence review, governance review, and commercial positioning review defined later in this document.

## First Route Activation Checklist

The first route activation checklist must be executed explicitly for the first customer route instance or first customer route launch window.

Required checklist items:

- confirm route family is `exit` or `retention`
- confirm named HR operator
- confirm manager participation artifact has been distributed
- confirm the customer has the governance one-pager
- confirm the customer has the privacy / dossier boundary note
- confirm review rhythm and checkpoint owner
- confirm continuation and closeout authority sits with HR
- confirm support contact path and response expectation
- confirm no unsupported local process is being described as canonical product behavior
- confirm the activation record is saved in the customer rollout log

If any item is incomplete, the route should be delayed until the gap is closed or explicitly accepted by the Verisight product owner and customer HR operator together.

## Materials Required Before Customer Use

The minimum operating material set is:

- HR operator rollout note
- manager participation one-pager
- governance one-pager
- privacy / dossier boundary note
- route -> action -> review -> closeout explanation
- first route activation checklist
- support contact and escalation summary

No customer should depend on founder-only explanation as the primary source of truth. Live help is allowed, but no critical explanation depends on founder-only live narration.

### Material Control Table

| Artifact | Owner | Storage location | Review cadence | Version/date field |
| --- | --- | --- | --- | --- |
| `HR operator rollout note` | Verisight customer success owner | customer rollout folder / shared onboarding pack | before each new customer activation and at least monthly during active rollout | document header with `version` and `last reviewed date` |
| `manager participation one-pager` | Verisight customer success owner | customer rollout folder / shared onboarding pack | before each new manager briefing and at least monthly during active rollout | document header with `version` and `last reviewed date` |
| `governance one-pager` | Verisight product owner | canonical rollout materials folder | monthly and after any governance clarification | document header with `version` and `last reviewed date` |
| `privacy / dossier boundary note` | Verisight product owner | canonical rollout materials folder | monthly and after any privacy boundary clarification | document header with `version` and `last reviewed date` |
| `route -> action -> review -> closeout explanation` | Verisight product owner | canonical rollout materials folder | monthly and after any route semantics clarification | document header with `version` and `last reviewed date` |
| `first route activation checklist` | Verisight customer success owner | customer rollout folder and canonical rollout materials folder | before every first customer route activation and after any rollout failure | checklist header with `version` and per-use `completed on` date |
| `support contact and escalation summary` | Verisight support operator | customer rollout folder and support playbook | monthly and after any escalation path change | document header with `version` and `last reviewed date` |

## Support Escalation Model

All incoming issues must be tagged into one primary category at intake. The required categories are:

- product issue
- governance incident
- privacy or dossier question
- route semantics issue
- failed rollout or adoption friction

### product issue

Use this category when the product does not behave as documented, evidence cannot be trusted, status transitions appear broken, or the customer cannot complete a bounded operating step because the product surface fails.

Primary owner:

- Verisight support operator for intake
- Verisight product owner for resolution decision when reproduction is confirmed

### governance incident

Use this category when authority, review rights, closeout rights, approval handling, or support access behavior appears to violate the intended governance model.

Primary owner:

- Verisight customer success owner for immediate containment
- Verisight product owner for governance interpretation and corrective action

### privacy or dossier question

Use this category when a customer asks whether a record type belongs in Action Center, whether something creates dossier risk, or whether a usage pattern drifts into monitoring or personnel-file behavior.

Primary owner:

- Verisight customer success owner for first response
- privacy or governance reviewer if one is assigned
- Verisight product owner if interpretation affects product boundary

### route semantics issue

Use this category when the customer cannot understand what a route means, what belongs in a route-specific action or review, or how continuation / closeout should be interpreted within approved route scope.

Primary owner:

- Verisight customer success owner for explanation and artifact correction
- Verisight product owner if the issue reveals ambiguity in canonical route truth

### failed rollout or adoption friction

Use this category when onboarding was completed but the route does not take hold in practice, managers do not participate as expected, HR cannot maintain rhythm, or the rollout repeatedly stalls without a software defect.

Primary owner:

- Verisight customer success owner
- escalate to Verisight product owner if repeated friction suggests the product or materials are mis-specified

## Intake And Escalation Rules

Every support request must capture:

- customer name
- route family
- named HR operator
- issue category
- short factual description
- first observed date
- current customer impact
- whether the issue blocks route activation, active usage, review rhythm, or closeout
- current owner
- next update time

Escalation timing:

- same business day for anything blocking first activation
- same business day for any governance incident
- same business day for any privacy or dossier question tied to active usage
- next business day for route semantics issue unless activation is blocked
- within two business days for failed rollout or adoption friction unless the customer requests an urgent operating reset

## Failed Rollout Handling

Failed rollout handling exists so a weak first cycle does not quietly turn into customer confusion or founder heroics.

A rollout should be treated as failed or at-risk when one or more of the following is true:

- the first route activation checklist could not be completed cleanly
- managers do not understand their role after the 5-minute briefing or one-pager
- HR cannot run the operating rhythm after the 30-45 minutes onboarding session
- review checkpoints are repeatedly missed
- the customer keeps asking for off-model workflow behavior
- support traffic clusters around route confusion rather than isolated questions

Status declaration authority:

- the Verisight customer success owner may declare a rollout `at-risk`
- the Verisight product owner or Verisight customer success owner together with the customer HR operator may declare a rollout `failed`
- a rollout must be declared `failed` rather than repeatedly retried when the same blocking condition appears in two consecutive review checkpoints without a verified correction

When a failed rollout or adoption friction case is opened, the handling sequence is:

1. Freeze any non-essential expansion of the rollout.
2. Reconstruct what failed across onboarding, materials, route semantics, and product behavior.
3. Re-run the first route activation checklist and mark which items were actually true versus assumed.
4. Decide whether the primary problem is training, operating design, route explanation, or product defect.
5. Issue a bounded recovery plan with owner, deadline, and next review date within 2 business days of case open.
6. Re-run manager and HR refresh onboarding only for the missing parts.
7. Review whether the incident changes the first-cycle evidence readout or commercial positioning.

Recovery should prefer correction of materials and operating discipline before adding custom behavior. If recovery depends on charismatic founder intervention that cannot be repeated by customer success or support, readiness should be marked incomplete.

Rollout pause and escalation rules:

- pause the rollout immediately if no checklist completion record exists for first activation
- pause the rollout immediately if the HR operator scores below 4 of 5 verification prompts after refresh onboarding
- pause the rollout immediately if the manager comprehension threshold remains below 80% after one refresh cycle
- escalate to the Verisight product owner on the same business day if the root cause appears to be product issue, governance incident, or unresolved route semantics issue
- do not run more than one refresh cycle without a written recovery plan and named decision owner

Operational closure criteria:

- `stable again` means a current checklist completion record exists, the HR operator passes 4 of 5 verification prompts, the manager comprehension threshold is met, no blocking support category remains open, and the next scheduled review checkpoint completes on time
- a rollout may return from `failed` or `at-risk` to `stable again` only after the Verisight customer success owner and customer HR operator both sign the recovery note
- if `stable again` criteria are not met by the recovery-plan review date, keep the rollout paused and escalate for product-owner review rather than repeating the same retry pattern

## Customer Success Rhythm

The customer success rhythm for the first customer cycle is minimum required operating discipline, not optional account management polish.

### Week 0 - Activation week

- deliver HR operator onboarding
- deliver manager briefing or one-pager
- execute first route activation checklist
- confirm support path

### Week 1 - Early usage check

- verify the HR operator can run the route without live narration
- check whether managers understood their participation role
- classify any open support issues by the required taxonomy

### Week 2 - First-cycle evidence review

- review route activity, review completion, continuation / closeout handling, and friction patterns
- identify whether operating gaps are caused by materials, semantics, or product behavior

### Week 3 or 4 - Governance review

- review authority boundaries, escalation quality, support access questions, and any privacy boundary tension
- confirm the customer still understands the bounded model

### End of first cycle - Commercial positioning review

- assess whether the customer can describe value in the approved bounded language
- confirm no one is selling, buying, or describing the product as a generic workflow or standalone system

### Review action model

| Review | Owner | Required attendees | Required input artifact | Required output artifact |
| --- | --- | --- | --- | --- |
| `Week 1 early usage check` | Verisight customer success owner | customer HR operator, Verisight support operator if open support items exist | checklist completion record, HR verification prompt notes, manager briefing log, open support log | early-usage check note with pass/fail status and next actions |
| `first-cycle evidence review` | Verisight customer success owner | customer HR operator, Verisight product owner, Verisight support operator | route activity summary, review completion summary, support category log, recovery-plan status if applicable | first-cycle evidence review note with stability decision and risk list |
| `governance review` | Verisight product owner | customer HR operator, Verisight customer success owner, privacy or governance reviewer if assigned | governance one-pager, privacy / dossier boundary note, escalation log, support access questions log | governance review note with boundary decisions and artifact update actions |
| `commercial positioning review` | Verisight product owner | customer executive or sponsor, customer HR operator, Verisight customer success owner | first-cycle evidence review note, governance review note, approved positioning phrases draft | commercial positioning review note with approved phrases, prohibited phrases, and keep/tighten/pause decision |

## First-Cycle Evidence Review

The first-cycle evidence review must happen after enough real usage exists to inspect the operating loop, but before the account narrative hardens around assumptions.

Owner:

- Verisight customer success owner

Required attendees:

- customer HR operator
- Verisight product owner
- Verisight support operator

Required input artifact:

- route activity summary
- checklist completion record
- manager briefing log
- support category log
- recovery-plan status, if a failed rollout or adoption friction case exists

Minimum evidence set:

- whether the first activation completed on checklist
- whether HR could operate without founder-only guidance
- whether manager participation worked after the 5 minutes briefing or one one-pager
- what support categories were triggered
- whether review checkpoints were met
- whether continuation and closeout handling stayed clear
- whether repeated friction suggests product issue, route semantics issue, or failed rollout

Required outputs:

- first-cycle evidence review note
- one short operating summary
- one list of open risks
- one decision on whether the account is stable, at-risk, failed, or in recovery

## Governance Review

The governance review checks whether customer operation stayed inside the intended authority and privacy boundaries.

Owner:

- Verisight product owner

Required attendees:

- customer HR operator
- Verisight customer success owner
- privacy or governance reviewer if assigned

Required input artifact:

- governance one-pager
- privacy / dossier boundary note
- escalation log
- support access questions log

Review questions:

- Did HR remain the governance owner in practice?
- Were any governance incident cases opened?
- Did any privacy or dossier question reveal a material gap in the guidance?
- Did support access or escalation handling require clarification?
- Did any customer request imply drift toward case management, monitoring, or generic workflow behavior?

Required outputs:

- governance review note
- explicit follow-up owner for any boundary ambiguity
- update decision for the relevant artifact if the issue was documentation-driven
- pause / continue recommendation if a governance incident remains open

## Commercial Positioning Review

The commercial positioning review is required because a customer can be operationally active while the story around the product drifts out of bounds.

Owner:

- Verisight product owner

Required attendees:

- customer executive or sponsor
- customer HR operator
- Verisight customer success owner

Required input artifact:

- first-cycle evidence review note
- governance review note
- approved positioning phrases draft

Review questions:

- Can the customer explain Action Center as embedded in Loep and limited to approved route families?
- Can the customer explain the value without claiming workflow breadth or standalone status?
- Did any sales, sponsor, or operator conversation rely on unsupported promises?
- Does the operating evidence support readiness language only, rather than proof or expansion claims?

Required outputs:

- approved positioning phrases for this account
- prohibited phrases or overclaims observed
- decision to keep, tighten, or pause buyer-readiness use of the account story

## Operating Exit Criteria For This Model

This operating model is credible only if:

- onboarding materials exist and are current
- HR onboarding repeatedly fits inside 30-45 minutes
- manager onboarding repeatedly fits inside 5 minutes or one one-pager
- first activation is checklist-driven
- support requests are tagged using the required taxonomy
- failed rollout handling exists and has an owner
- first-cycle evidence review, governance review, and commercial positioning review are all defined and reusable
- no critical explanation depends on founder-only live narration

## Plain-Language Summary

Action Center support and onboarding is review-ready only when a customer can be onboarded through durable materials, activated through an explicit checklist, supported through a clear issue taxonomy, and reviewed through a first-cycle operating rhythm without leaning on founder memory or product-scope drift.
