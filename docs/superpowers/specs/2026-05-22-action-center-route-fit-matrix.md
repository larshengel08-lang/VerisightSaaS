# Action Center Route-Fit Matrix

## Audience

Founder/product owner, route owner, governance/trust reviewer, buyer-readiness reviewer

## Purpose

Provide a disciplined, repeatable way to evaluate whether a future route family is conceptually compatible with Action Center inside Loep without treating conceptual fit as activation approval.

## Decision Use

Use this matrix only when Loep is considering whether a candidate route family belongs inside the Action Center frame at all. This artifact is evaluative only. It does not approve route expansion, does not authorize rollout, and does not weaken the later live-evidence gate.

## Acceptance Test

A reviewer can score a candidate route family, identify must-pass failures, and classify the concept as rejected, parked, conditional fit, or strong conceptual fit without ambiguity. No reader should mistake conceptual fit for activation approval.

## Sign-Off Owner

Primary: route owner or founder/product owner
Fallback: founder/product owner if no separate route owner is assigned

## Fixed Boundary

Action Center remains embedded inside Loep, route-bound, HR-governed, manager-light, and limited to approved route families only: `exit` and `retention` unless a later process explicitly approves otherwise. This matrix exists to evaluate later candidates against that bounded truth, not to broaden the product by document alone.

## Scoring Scale

- `0 = no fit`
- `1 = weak / high risk`
- `2 = conditional fit`
- `3 = strong fit`

## Route-Fit Dimensions

| Dimension | Why it matters | Must pass |
| --- | --- | --- |
| post-scan follow-through fit | Confirms the route is genuinely about bounded follow-through after a scan rather than general work management. | yes |
| bounded management question | Confirms the route can be governed through one clear management question instead of broad operational handling. | yes |
| review rhythm fit | Confirms the route can support recurring review without inventing a separate workflow layer. | yes |
| closeout / continuation fit | Confirms HR can decide continuation or closeout through bounded route semantics. | yes |
| evidence grammar fit | Confirms route, action, review, and governance state can be expressed in the existing Action Center evidence grammar. | yes |
| HR governance fit | Confirms the route belongs under HR-governed follow-through rather than another department's operating system. | yes |
| privacy / dossier safety | Confirms the route can stay outside dossier, monitoring, and employee risk-ledger behavior. | yes |
| buyer-safe route distinction | Confirms the route can be explained clearly without confusing buyers about what Action Center is. | no |
| workflow-broadening risk | Confirms the route does not push Action Center toward project, task, case-management, or workflow software behavior. | yes |

## Scoring Guidance

| Dimension | `0` | `1` | `2` | `3` |
| --- | --- | --- | --- | --- |
| post-scan follow-through fit | Route is not meaningfully post-scan or not follow-through driven. | Follow-through exists but is secondary to a broader operating process. | Follow-through is central but some edge cases need stricter boundary rules. | Route is clearly post-scan follow-through and naturally fits Action Center. |
| bounded management question | Route needs multiple open-ended questions or broad case handling. | Management question exists but is too broad or unstable. | Management question is mostly clear but needs explicit narrowing. | Route can be governed through one bounded management question. |
| review rhythm fit | No workable review rhythm exists. | Review would be irregular or depend on ad hoc handling. | Review rhythm is possible with route-specific guardrails. | Review rhythm is natural, bounded, and easy to explain. |
| closeout / continuation fit | No clear closeout or continuation decision can be made. | Closeout depends on vague judgment or outside process sprawl. | Closeout is possible but needs clear defaults and constraints. | HR can clearly decide continue versus close out inside bounded semantics. |
| evidence grammar fit | Existing route, action, review, and governance grammar cannot represent the route. | Significant exceptions or custom evidence logic would be needed. | Evidence mostly fits but requires explicit route defaults. | Existing evidence grammar supports the route with limited adaptation. |
| HR governance fit | Route should not be governed by HR at all. | HR could be involved but not as the natural governance owner. | HR governance is plausible with explicit scope limits. | HR governance is clearly the right fit for the route. |
| privacy / dossier safety | Route would predictably create dossier or monitoring pressure. | Safety is weak and relies on constant exception handling. | Safety is manageable with strong documented boundaries. | Route can remain cleanly outside dossier, monitoring, and risk-ledger behavior. |
| buyer-safe route distinction | Buyers would likely misunderstand the route as a different product category. | Distinction is possible but fragile. | Distinction is mostly explainable with careful framing. | Route can be explained cleanly within the Action Center frame. |
| workflow-broadening risk | Route would clearly turn Action Center into workflow software. | Risk is materially high and hard to contain. | Risk exists but can be contained with explicit rules. | Risk is low and the bounded model remains intact. |

## Must-Pass Rules

- Any must-pass dimension scored `0` means the candidate route is rejected.
- Any unresolved must-pass dimension scored `1` means the candidate route is `parked` and may not advance.
- A `conditional fit` is allowed only when every must-pass score of `1` is explicitly bounded, explicitly remediable, and recorded with concrete safeguards or defaults in the evaluation record.
- Workflow-broadening risk scored `0` or `1` means the candidate route is rejected or parked even if other dimensions look strong.
- Privacy / dossier safety scored below `2` means the candidate route cannot proceed.
- Evidence grammar fit scored below `2` means the candidate route is incompatible with shared Action Center truth until proven otherwise.

## Decision Bands

- `rejected`: one or more must-pass dimensions score `0`, or the route would materially broaden Action Center beyond its bounded truth.
- `parked`: no outright rejection, but the concept still carries an unresolved must-pass score of `1`, workflow-broadening risk, or unclear governance fit.
- `conditional fit`: the route is conceptually plausible and any must-pass score of `1` has already been explicitly bounded and explicitly remediated in the record through defined defaults or safeguards; later live evidence is still required before activation can even be considered.
- `strong conceptual fit`: the route appears compatible with Action Center's bounded model, but it still remains conceptual only until the later activation and live-evidence gates are passed.

## Required Evaluation Record

Every scoring session should capture:

- candidate route family
- proposed use case
- scorer names and decision date
- scores for every dimension
- must-pass failures or weaknesses
- workflow-broadening concerns
- privacy / dossier concerns
- evidence grammar concerns
- final evaluation band
- rationale

## Non-Negotiable Interpretation

- Conceptual fit is not activation.
- A strong conceptual score is still not rollout approval.
- This matrix does not authorize route expansion by itself.
- Later live evidence is an operating-readiness gate, not an acceptable substitute for formal activation approval or impact evidence.

## Plain-Language Summary

This matrix answers one question only: does a future route family conceptually belong inside Action Center as Loep currently defines it? If the answer is yes, that still does not activate the route or remove the need for later live evidence and explicit approval.
