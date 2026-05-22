# Action Center Activation Gate Framework

## Audience

Founder/product owner, governance/trust reviewer, buyer-readiness reviewer, route owner

## Purpose

Define the decision mechanics required before Loep may approve any future Action Center route-family activation beyond the currently approved `exit` and `retention` routes.

## Decision Use

Use this framework only after a candidate route has already been evaluated through the route-fit matrix. This framework governs whether the candidate may move from conceptual discussion into an explicit activation decision. It does not convert conceptual fit into approval automatically, and it does not allow live evidence to be skipped.

## Acceptance Test

No activation proposal can be discussed as real unless a complete decision record exists, the required reviewers are named, the route-fit outcome is attached, and the live-evidence position is explicitly stated.

## Sign-Off Owner

Founder/product owner

Additional required reviewers should include a governance/trust reviewer and the relevant route owner where assigned.

## Fixed Rule

No route-family activation may happen without a completed decision record. Informal agreement, roadmap intent, or conceptual enthusiasm is not sufficient.

## Preconditions Before Review Opens

The activation gate may open only when all of the following are true:

- the candidate route has been scored through the approved route-fit matrix
- no must-pass rejection remains unresolved
- the route can preserve shared Action Center truth around route, action, review, governance, and closeout
- the proposal explicitly states whether live evidence exists, is partial, or is still missing
- the proposal does not rely on workflow broadening, case-management behavior, or off-platform canonical writes

## What The Gate Reviews

The activation decision must review:

- route-fit results and unresolved weaknesses
- bounded management question quality
- bounded closeout semantics
- bounded evidence semantics
- bounded governance semantics
- privacy / dossier safety
- buyer-safe route distinction
- route-default requirements
- workflow-broadening risk
- live-evidence status and interpretation

## Decision Outcomes

- `approved`: activation is permitted because the route meets conceptual, governance, and live-evidence requirements with no blocking risk.
- `conditional`: activation is not yet approved; specific additional conditions must be met and re-reviewed.
- `parked`: activation is deferred because the route may conceptually fit but timing, evidence, or governance readiness is still insufficient.
- `rejected`: activation is denied because the route breaks bounded Action Center truth or carries unacceptable governance, privacy, or workflow risk.

## Completed Decision Record Template

| Field | Required entry |
| --- | --- |
| candidate route family | Name of the route family under review |
| proposed use case | Bounded description of the route's intended use inside Loep |
| route-fit scores | Full score set or linked matrix result |
| must-pass failures | Any `0` or `1` must-pass results, or `none` if not present |
| live evidence available | `none`, `partial`, or `sufficient`, with short explanation |
| governance risks | Explicit summary of unresolved governance concerns |
| privacy / dossier risks | Explicit summary of privacy, dossier, or monitoring concerns |
| required route defaults | Defaults required to preserve shared Action Center truth |
| required evidence grammar | Evidence rules needed to keep the route bounded and interpretable |
| required closeout semantics | Closeout and continuation rules required for the route |
| required review rhythm | Review cadence or review rule assumptions needed for governance |
| workflow-broadening assessment | Explicit judgment on whether the route widens Action Center |
| decision owner | Named owner responsible for the final recommendation |
| decision date | Date the record is reviewed for approval |
| decision outcome | `approved` / `rejected` / `conditional` / `parked` |
| rationale | Short decision narrative tied to the evidence above |

## Review Discipline

- Every required field must be completed before review begins.
- Missing fields invalidate the review and return the proposal to draft status.
- The route-fit matrix must be attached or quoted directly enough that reviewers can verify the scores.
- The record must say explicitly whether the route is being blocked by missing live evidence.
- Any proposed exception to shared Action Center truth must be treated as a rejection signal unless the product truth itself is re-opened separately.

## Live-Evidence Dependency

- Passing conceptual fit review is still insufficient without live evidence.
- If live evidence is `none` or clearly inadequate, the strongest available outcome is normally `parked` or `conditional`, not `approved`.
- Live evidence is reviewed for operating readiness only. It is not treated as proof of impact, adoption, or intervention effectiveness.

## Non-Negotiable Interpretation

- Conceptual fit is not activation.
- A completed decision record is required for every activation conversation that seeks approval.
- Approval requires explicit decision ownership and explicit rationale.
- This framework does not expand Action Center by itself; it exists to make later approval disciplined and auditable.

## Plain-Language Summary

This framework answers a governance question, not a product-marketing question: if Loep ever wants to activate a new route family in Action Center, who decides, on what evidence, and in what documented form? The answer is a completed decision record tied to route-fit and live-evidence review, not an informal yes.
