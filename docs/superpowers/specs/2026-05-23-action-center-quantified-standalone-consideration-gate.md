# Action Center Quantified Standalone Consideration Gate

## Status
Proposed

## Purpose

Define the minimum quantified gate that Action Center must pass before anyone can seriously consider whether it is sufficiently stable for later standalone consideration review.

This gate is deliberately narrower than launch, pricing, GTM, or route-expansion readiness.

It exists to answer one question only:

> Has Action Center accumulated enough bounded live operating evidence that future standalone consideration review is responsible to conduct?

This artifact assumes the current approved product truth remains unchanged:

- Action Center remains embedded inside Loep today
- approved route families remain `exit` and `retention`
- current route families are the only approved live operating scope
- Loep remains canonical for route truth
- Action Center remains authoritative for follow-through status, review, continuation, and closeout within approved scope

This artifact does not authorize:

- standalone launch
- standalone pricing
- separate GTM
- route expansion
- broad category repositioning
- proof claims

## Review Group

The gate may be reviewed only by a named review group containing at least:

- product/founder owner
- governance or privacy reviewer
- customer success or onboarding owner
- buyer-readiness or commercial reviewer

One person may hold more than one role, but all four roles must be explicitly assigned in the review record.

## Gate Shape

The gate passes only if all threshold groups below are satisfied.

If one threshold group fails, the gate fails.

If one threshold group is not yet measurable, the gate remains open and cannot be treated as passed by judgment alone.

## Acceptable Evidence Forms

The review group may count evidence only from one or more of these forms:

- route-level exported metrics or screenshots tied to the current source of record
- dated customer rollout logs or activation records
- dated support logs
- dated governance or privacy incident logs
- dated interview notes or transcripts
- dated review notes signed by the named decision owner

Evidence may not be counted if it is:

- demo-only
- founder memory without a record
- reconstructed after the fact without a date and owner
- pulled from unapproved route scope

## Threshold Group 1 - Live Operating Breadth

Minimum proposed thresholds:

- at least `3` live customer contexts
- at least `30` live route instances in aggregate
- at least `2` approved route families live, or one approved route family explicitly excluded with written rationale if only one family is live at the time of review

Acceptance tests:

- each counted customer context has a named owner and evidence window
- each counted route instance shows real operating follow-through, not just route creation
- excluded route-family data is listed explicitly with rationale

Required interpretation:

- the customer contexts must be genuinely live, not demo-only or founder-simulated
- the route instances must include real operating follow-through, not just route creation
- if one approved route family is excluded, the rationale must explain why the exclusion does not hide a product-fit weakness

## Threshold Group 2 - Completion And Operating Signal Coverage

Minimum proposed thresholds:

- action completion and action review completion data exist for the live route set
- completion coverage is present in at least `80%` of the live route instances counted toward the gate
- stale, sprawl, and repeated-no-progress signals are defined and observed in the live route set
- the measured signal set is broad enough that reviewers can tell the difference between healthy progress, stalled follow-through, and low-discipline usage

Acceptance tests:

- metric definitions for completion, stale, sprawl, and repeated-no-progress are written in the review record
- the source-of-truth report or screenshot for each metric is linked in the review record
- at least `1` concrete route example exists for healthy progress, stale state, and repeated-no-progress state

Required interpretation:

- the gate is not satisfied by raw counts alone
- completion data must be inspectable at route level and aggregatable across customer contexts
- the operating signal set must show whether the product is governable in practice, not just opened in practice

## Threshold Group 3 - HR Chasing Proxy Acceptability

Minimum proposed thresholds:

- an HR chasing proxy is available for the live route set
- the proxy is judged acceptable by the review group as a bounded stand-in for follow-through friction
- the proxy has been observed in more than one customer context

Acceptable evidence forms:

- overdue-review follow-up counts
- repeated-reminder counts
- route-level re-open or repeat-review-without-progress counts
- dated operator notes showing manual chase effort tied to specific route instances

Acceptance tests:

- the proxy formula or counting rule is written down
- the proxy is evidenced in at least `2` customer contexts
- at least `5` route instances in aggregate contribute to the proxy evidence
- the review group records why the proxy is acceptable and what it does not capture

Required interpretation:

- the proxy does not need to be perfect
- the proxy must still be concrete enough that reviewers are not guessing whether HR has to chase managers repeatedly
- if the proxy is present in only one customer context, the gate does not pass

## Threshold Group 4 - Governance And Privacy Stability

Minimum proposed thresholds:

- no unresolved `P0` governance incident
- no unresolved `P1` governance incident
- no unresolved `P0` privacy incident
- no unresolved `P1` privacy incident

Acceptance tests:

- the evidence window for the incident check is written down
- the incident source of truth is linked
- any resolved incident in the evidence window is listed with status and closure date

Required interpretation:

- a historically resolved incident does not fail the gate by itself
- an unresolved critical incident fails the gate even if all usage thresholds are met
- the gate review must record the date range inspected and the incident source used

## Threshold Group 5 - Buyer And Operator Boundedness

Minimum proposed thresholds:

- boundedness is understood in buyer interviews
- boundedness is understood in operator interviews
- interview evidence shows reviewers do not need to widen the product story into a generic operations tool to make it make sense
- the product is explainable on its own terms without generic workflow language or project-tool metaphors

Minimum interview counts:

- at least `3` buyer interviews or buyer-review conversations
- at least `3` operator interviews or operator-review conversations

Acceptance tests:

- at least `2` of the buyer conversations and `2` of the operator conversations are tied to live customer contexts
- interview notes or transcripts are linked in the review record
- at least `80%` of interviewees can restate the bounded follow-through story without widening it into a generic task board or operating system
- fail if more than `20%` of interviewees require correction into a broader workflow story before the product makes sense

Required interpretation:

- interviews may be lightweight, but they must include direct evidence rather than inferred confidence
- if buyers or operators consistently ask for a broader task-board story to understand the product, the gate does not pass

## Threshold Group 6 - Support And Onboarding Repeatability

Minimum proposed thresholds:

- support and onboarding have been exercised in live use
- support can classify and route issues without founder-only explanation
- onboarding can be delivered without founder-only explanation
- first-route activation and first-cycle review can be completed through named materials and steps

Minimum evidence counts:

- at least `2` completed onboarding exercises across live customer contexts
- at least `3` support cases or dry-run cases classified by the named taxonomy

Acceptance tests:

- each onboarding exercise has a dated activation record and named owner
- each onboarding exercise has a first-cycle review record
- support cases show taxonomy category, owner, and next step
- fail if critical explanation still depends on founder memory, founder charisma, or one-off narration

Required interpretation:

- live help is allowed
- the gate fails if critical explanation still depends on founder memory, founder charisma, or one-off narration

## Threshold Group 7 - Standalone Story Discipline

Minimum proposed thresholds:

- the product can be described without leaning on Loep-internal shorthand that outsiders would not understand
- the product can be described without generic task-board, workflow-suite, or project-tool language
- reviewers can explain why standalone consideration would still preserve boundedness rather than widen the product

Minimum evidence counts:

- at least `3` reviewed standalone-consideration story examples
- at least `2` of those examples used in buyer or operator review, not internal drafting only

Acceptance tests:

- each story example includes approved phrasing and prohibited phrasing checks
- at least `80%` of reviewed story examples pass without requiring substantial rewrite
- fail if the story only works when tied to a broader platform narrative or generic workflow explanation

Required interpretation:

- this group is about explainability discipline, not launch readiness
- if the story only works when tied to a broader platform narrative, the gate does not pass

## Required Review Record

Any gate review must capture at least:

- review date
- named approver and named decision owner
- reviewer names, roles, and which required review-group role each person fills
- evidence window start date and end date
- customer contexts counted
- route instances counted
- approved route families represented
- any approved route family excluded and the written rationale
- source-of-truth links or file references for every counted metric, interview set, support record set, and incident check
- metric definitions for completion, stale, sprawl, repeated-no-progress, and HR chasing proxy
- completion coverage summary
- stale / sprawl / repeated-no-progress summary
- HR chasing proxy summary
- governance/privacy incident check result
- buyer/operator interview summary
- support/onboarding exercise summary
- excluded data and rationale
- open exceptions and expiration or next-review date for each exception
- gate result: `pass` / `fail` / `open`
- rationale

## Gate Result Meanings

- `pass`: enough bounded live operating evidence exists to allow future standalone consideration discussions
- `fail`: one or more threshold groups were evaluated and did not meet minimum requirements
- `open`: one or more threshold groups are still unmeasured or lack current evidence

## Explicit Non-Proof Interpretation Rule

Passing this gate proves only readiness for **standalone consideration** within the current approved scope.

It does **not** prove:

- `causal retention improvement`
- `causal exit reduction`
- `intervention effectiveness`
- `adoption proof`
- that explanation quality will automatically hold across broader markets, at launch, or after route expansion without further review for `workflow or project-management framing`

## Plain-Language Summary

This gate is passed only when Action Center has enough live customer breadth, route-instance volume, completion coverage, operating-signal coverage, HR chasing proxy evidence, governance/privacy stability, buyer/operator boundedness, support/onboarding repeatability, and story-discipline evidence to justify future standalone consideration without pretending that this is launch proof, impact proof, or route-expansion approval.
