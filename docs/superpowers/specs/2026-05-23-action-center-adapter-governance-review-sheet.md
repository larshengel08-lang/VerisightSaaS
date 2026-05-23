# Action Center Adapter Governance Review Sheet

## Purpose

Review a route adapter proposal without changing Action Center's bounded operating truth inside Loep.

This sheet is governance-only. It does not authorize route expansion, launch, pricing, GTM, or workflow broadening.

## Fixed Boundary

Action Center remains:

- embedded in Loep
- post-scan follow-through only
- limited today to approved route families only: `exit` and `retention`
- HR-governed
- manager-light

Route adapters may tune defaults inside that boundary, but they may not fork shared Action Center truth.

## What Adapters May Vary

- default cadence
- route-specific closeout questions
- evidence expectations
- action focus
- route labels
- readback interpretation

## What Adapters May Not Vary

- canonical route truth
- action-card contract core
- HR final closeout authority
- off-platform canonical write rules
- privacy and dossier boundaries
- workflow broadening rules
- manager-light principle

## Non-Negotiable Interpretation

- Adapter variance is allowed only at the default layer.
- Shared route, action, review, and closeout semantics stay canonical across adapters.
- Route labels or readback wording may clarify route context, but may not redefine what a route, action, review, stale state, continuation, or closeout means.
- Evidence expectations may tighten by route context, but may not require records that turn Action Center into a dossier, monitoring system, or generic work tracker.
- Route-specific closeout questions may help HR assess readiness, but they may not displace HR final closeout authority.
- Off-platform notifications or coordination may exist, but off-platform canonical write rules still prevent any second source of truth for route state.
- No adapter may widen participation or operating logic in ways that break the manager-light principle.

## Approval And Regression Review

Complete every field before approving an adapter proposal.

| Field | Required record |
| --- | --- |
| review owner | name and role of the reviewer accountable for the record |
| decision date | decision date in `YYYY-MM-DD` format |
| candidate route family | `exit` or `retention` only; any other family is out of scope for this sheet and requires a separate governance artifact |
| required approval threshold | product owner approval plus governance / trust review, both explicitly recorded |
| referenced route-fit rubric / must-pass dimensions | artifact ID or link to the governing route-fit rubric plus the must-pass dimensions reviewed |
| route-fit score | record total score, every must-pass score, and any must-pass dimension weakness |
| product owner approval | `yes` / `no` with approver name and date |
| governance / trust review | `yes` / `no` with reviewer name and date |
| regression tests referenced | artifact IDs or links for every spec, check, or artifact reviewed |
| live evidence available | `yes` / `no` plus artifact IDs or links for the evidence reviewed |
| minimum evidence required to approve | artifact IDs or links showing route-fit review, regression review, and live evidence sufficient for this decision |
| blocking risks | list unresolved risks or write `none` |
| decision | `approved` / `conditional` / `parked` / `rejected` |

If the decision is `conditional` or `parked`, record all of the following before the review can close:

| Field | Required record |
| --- | --- |
| conditions to clear | concrete conditions that must be satisfied before re-review |
| condition owner | named owner accountable for clearing the conditions |
| deadline | calendar date by which the conditions must be cleared |
| re-review trigger | exact event or evidence that reopens the sheet for review |

## Control Tests

Reviewer must confirm all of the following:

- no new states are introduced
- no new actor classes are introduced
- no new write locations are introduced
- no new routing logic is introduced
- no new closeout authority is introduced
- canonical route mapping stays verbatim
- adapter variance changes only default cadence, route-specific closeout questions, evidence expectations, action focus, route labels, or readback interpretation

## Automatic Rejection Conditions

Reject the adapter immediately if any of the following is true:

- any must-pass route-fit dimension is scored `0`
- the adapter depends on a workflow-fork exception
- the adapter creates an incompatible privacy boundary
- the route cannot be explained without generic project-management language
- a new actor class is required
- a new canonical system of record is introduced
- a new route state is added
- manager approval is required
- cross-case tracking is required
- evidence is retained beyond defined privacy limits

## Reviewer Check

Before recording `approved` or `conditional`, confirm:

- the adapter changes only defaults, not Action Center truth
- route-family fit remains inside the existing `exit` or `retention` frame; anything else is out of scope for this sheet and requires a separate governance artifact
- no workflow exception creates a second operating model
- no privacy or dossier pressure is introduced
- live evidence and regression references are attached with artifact IDs or links
- required approval threshold is fully met
- referenced route-fit rubric and must-pass dimensions are explicitly recorded

## Decision Note

Use one short paragraph to explain why the adapter is safe, blocked, or rejected. Keep the explanation in Action Center governance language, not workflow-software language.
