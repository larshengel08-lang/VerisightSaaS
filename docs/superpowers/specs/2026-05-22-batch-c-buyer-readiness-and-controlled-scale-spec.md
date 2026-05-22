# Batch C Buyer Readiness And Controlled Scale

## Status
Proposed

## 1. Purpose

This document defines **Batch C** from the Action Center Enterprise Roadmap.

Batch C exists to make Action Center **buyer-ready, rollout-ready, and controlled-scale ready** without turning it into a broader workflow, task, project, case-management, or standalone product.

This document is a **batch spec**, not an implementation plan.

Batch C produces:

- buyer-readiness
- governance packaging readiness
- rollout readiness
- controlled-scale readiness

Batch C does **not** produce:

- adoption proof
- causal intervention proof
- route-expansion approval by itself
- live evidence by roadmap work alone

Commercial proof and route-expansion readiness require later **live evidence**.

## 2. Batch Role

Batch C begins only after:

- Batch A has stabilized bounded execution truth
- Batch B has stabilized governance and measurement readback truth

Batch C should not repair core execution or governance semantics except where a blocking inconsistency is discovered.

Its role is to translate stable product truth into:

- buyer-safe framing
- rollout-safe operator framing
- privacy / dossier-safe boundary framing
- route-fit and activation-gate framing for any later scale decisions

Batch C may define how Action Center is explained and governed externally. It may not redefine what Action Center canonically is.

## 3. Starting Point

Batch C depends on the following outputs being stable before work begins:

- Action Center bounded execution truth from Batch A
- manager action-card model, lifecycle, transition matrix, and route defaults from Batch A
- unified HR governance queue and intervention logic from Batch B
- measurement readback layers and metric definitions from Batch B
- buyer-safe reporting vocabulary from Batch B
- ExitScan and RetentieScan route differentiation from Batch A and Batch B

These are input truth for Batch C, not open design territory.

## 4. Batch Constraints

The following constraints remain fixed throughout Batch C:

- no route-family expansion
- no standalone Action Center framing
- no generic workflow, project-management, or task-management framing
- no case-management framing
- no employee-monitoring framing
- no personnel dossier framing
- no employee risk-ledger framing
- no broad analytics platform expansion
- no collaboration-suite behavior
- no Graph dependency
- no off-platform canonical writes
- no buyer-facing proof claims
- no causal impact claims
- no reopening Batch A or Batch B truth unless a blocking inconsistency is found

Action Center remains:

- embedded inside Loep
- route-bound
- limited to approved route families only: `exit` and `retention`
- HR-governed
- manager-light
- post-scan follow-through only
- canonical inside Action Center

## 5. Batch Outcome

By the end of Batch C:

- buyers can understand what Action Center is and is not
- operators can understand how Action Center should be used and governed
- privacy and dossier boundaries are explicit and defensible
- route-fit logic exists for evaluating any later route-family candidates
- an activation-gate framework exists for any later scale decision
- Batch C leaves route-family expansion gated behind live evidence instead of roadmap optimism

## 5A. Buyer Audience Matrix

Batch C must define audience-specific understanding instead of relying on one generic buyer story.

| Audience | What they must understand | What they must not misunderstand | Artifact(s) that serve this audience |
| --- | --- | --- | --- |
| `HR buyer / HR director` | Action Center is an HR-governed follow-through layer for route-bound post-scan execution, review rhythm, and closeout discipline | It is not workflow software, a task board, or a standalone module | governance one-pager, route -> action -> review -> closeout explanation, route-fit matrix |
| `Directie / MT sponsor` | Action Center makes follow-through visible and governable without claiming impact proof | It is not an analytics proof engine, intervention-success product, or broad people operating system | governance one-pager, buyer-safe reporting language, live-evidence gate definition |
| `HR operator` | HR works from bounded governance and rollout rules, not from free-form case management | HR is not expected to operate a broad workflow system or maintain employee dossiers | internal rollout note for HR operators, governance one-pager, privacy / dossier boundary note |
| `Manager participant` | Managers participate through bounded route/action/review steps inside approved routes | They do not own a dashboard, project board, or workflow system | manager participation one-pager, route -> action -> review -> closeout explanation |
| `Legal / privacy / OR-style reviewer` | Action Center tracks bounded follow-through history and governance state with explicit privacy boundaries | It is not employee monitoring, a personnel dossier, or an employee risk ledger | privacy / dossier boundary note, governance one-pager |
| `IT / security reviewer` | Action Center remains canonical inside Loep with no off-platform canonical writes or broad collaboration sprawl | It is not a shadow workflow platform or externally-governed write surface | governance one-pager, privacy / dossier boundary note, activation-gate framework |
| `Product / founder owner` | Batch C packages stable truth from A and B without reopening core semantics or weakening live-evidence discipline | Batch C is not permission to expand route scope, widen claims, or hide unresolved product truth | internal rollout note for product / founder owner, route-fit matrix, live-evidence gate definition |

## 6. Workstream C1 - Buyer Governance Framing

Batch C must define a buyer-safe explanation of Action Center.

### 6.1 Required framing

Action Center must be explainable as:

- route-bound execution after a scan
- HR-governed follow-through
- bounded manager participation
- auditable review rhythm
- canonical inside Action Center

### 6.2 Required negative framing

Action Center must be explainable as not being:

- project management
- task management
- workflow software
- case management
- employee monitoring
- a personnel dossier
- a standalone module

### 6.3 Required buyer-safe phrase

Batch C must preserve and standardize language equivalent to:

> Action Center tracks whether agreed follow-through happened, was reviewed, and requires continuation. It does not judge individual employees or claim causal intervention impact.

## 7. Workstream C2 - Rollout And Operating Materials

Batch C must define the artifacts needed to roll Action Center out safely.

### 7.1 Required artifacts

- governance one-pager
- manager participation one-pager
- privacy / dossier boundary note
- route -> action -> review -> closeout explanation
- internal rollout note for HR operators
- internal rollout note for product / founder owner

### 7.2 Rollout rules

- rollout materials must reuse canonical product truth from Batches A and B
- rollout materials must not compensate for unresolved product semantics
- rollout materials must make boundedness easier to understand, not broader to sell

### 7.3 Artifact Acceptance Criteria

Every required artifact must have a clear audience, bounded purpose, acceptance test, and sign-off owner.

| Artifact | Audience | Purpose | Must include | Must not include | Acceptance test | Sign-off owner |
| --- | --- | --- | --- | --- | --- | --- |
| `governance one-pager` | HR buyer, HR operator, MT sponsor, IT/security reviewer | Explain HR governance, closeout authority, escalation boundaries, and Action Center role | HR governance model, closeout/continuation rules, bounded intervention framing, route-bound scope, no off-platform writes | workflow-software framing, project-management language, standalone-module framing | A buyer can explain HR governance and boundaries in under 2 minutes without calling the product workflow software | product/founder owner |
| `manager participation one-pager` | manager participant, HR operator | Explain the manager role in bounded route/action/review participation | manager role, bounded actions, review rhythm, what managers do not own | dashboard ownership, workflow ownership, project-board framing | A manager can explain their role in under 60 seconds without assuming dashboard ownership | route owner or product/founder owner |
| `privacy / dossier boundary note` | legal/privacy reviewer, HR buyer, HR operator, IT/security reviewer | Define what Action Center stores and what it must never become | not a personnel dossier, not employee monitoring, not employee risk ledger, bounded evidence rules | open employee narratives, surveillance framing, risk scoring framing | A privacy reviewer can point to explicit prohibited uses and no dossier ambiguity remains | privacy/legal reviewer |
| `route -> action -> review -> closeout explanation` | HR buyer, manager participant, HR operator, MT sponsor | Explain the canonical operating flow simply and accurately | route truth, action role, review checkpoints, HR closeout role, continuation logic | project-plan framing, task-tree framing, workflow-automation framing | A reader can describe the flow without turning it into project management | product/founder owner |
| `internal rollout note for HR operators` | HR operator | Explain how to roll out and operate Action Center day-to-day | operator responsibilities, queue/governance interpretation, escalation boundaries, what to avoid | ad hoc case-management behavior, broad operating-system framing | An HR operator can run the rollout without inventing missing governance behavior | governance/trust reviewer |
| `internal rollout note for product / founder owner` | product/founder owner | Explain rollout boundaries, claims discipline, and launch guardrails | positioning boundaries, live-evidence dependency, route-scope guardrails, sign-off expectations | premature proof claims, automatic route expansion assumptions | Founder/product owner can state what may and may not be claimed or expanded | product/founder owner |
| `route-fit matrix` | product/founder owner, route owner, governance/trust reviewer | Evaluate whether any future route family conceptually fits Action Center | scored dimensions, must-pass rules, rejection/parking rules, workflow-broadening risk | automatic approval language, unsupported route-family assumptions | A candidate route can be scored and either rejected, parked, conditional, or judged strong-fit without ambiguity | route owner or product/founder owner |
| `activation-gate framework` | product/founder owner, governance/trust reviewer, buyer-readiness reviewer | Define the decision mechanics for any later activation proposal | decision template, owners, required fields, route-fit reference, live-evidence dependency | vague "expand later" language, undocumented approvals | No activation can be discussed without a complete decision record | product/founder owner |
| `live-evidence gate definition` | product/founder owner, governance/trust reviewer, buyer-readiness reviewer | Define the minimum operating evidence required before any expansion decision | usage, review, stale/sprawl/no-progress, HR chasing proxy, operator feedback, privacy/governance incident requirement, interpretation rules | impact-proof claims, route-expansion by document alone | A reviewer can state exactly what evidence is still missing before expansion | governance/trust reviewer |

### 7.4 Buyer Language Red-Team Test

Every buyer-facing artifact must pass a required language review before Batch C exit.

#### Prohibited phrases or claim types

- solves retention
- proves intervention impact
- reduces employee risk
- predicts individual turnover
- measures manager effectiveness
- project management
- workflow automation
- HR operating system
- employee monitoring
- personnel dossier
- standalone module

#### Allowed safer language

- makes follow-through visible
- records ownership and review rhythm
- shows where rhythm stalls
- supports HR-governed follow-through
- tracks whether agreed follow-through happened and was reviewed
- does not judge individual employees
- does not claim causal impact

#### Red-team rule

Each buyer-facing artifact must be reviewed as if an external buyer is looking for overclaim, scope drift, or workflow framing.

Batch C may not exit unless all buyer-facing artifacts pass this red-team test.

## 8. Workstream C3 - Privacy, Dossier, And Monitoring Boundaries

Batch C must make Action Center defensible from a trust and privacy perspective.

### 8.1 Explicit boundaries

Action Center must not be framed or used as:

- an employee case file
- a risk register about named employees
- a long-form narrative repository about employee performance
- a monitoring or surveillance surface

### 8.2 Boundary artifacts must explain

- what data belongs in route, action, review, and governance history
- what data does not belong there
- how evidence remains bounded
- why readback is not employee judgment

## 9. Workstream C4 - Route-Fit Matrix

Batch C must define how Loep will later decide whether other route families can ever use Action Center.

### 9.1 Route-fit dimensions

Any future candidate route family must be evaluated against at least:

- post-scan follow-through fit
- bounded management question
- review rhythm fit
- closeout / continuation fit
- evidence grammar fit
- HR governance fit
- privacy / dossier safety
- buyer-safe route distinction
- risk of workflow broadening

### 9.2 Route-fit scoring

Each dimension must be scored as:

- `0` = no fit
- `1` = weak / high risk
- `2` = conditional fit
- `3` = strong fit

### 9.3 Must-pass dimensions

The following dimensions are must-pass:

- bounded management question
- post-scan follow-through fit
- review rhythm fit
- closeout / continuation fit
- evidence grammar fit
- HR governance fit
- privacy / dossier safety
- no workflow broadening

### 9.4 Route-fit rules

- If any must-pass dimension scores `0`, the route is rejected.
- If workflow-broadening risk is high, the route is rejected or parked.
- Conceptual route-fit is not enough for activation without live evidence.
- The route-fit matrix is evaluative only. It does not expand Action Center by itself.

## 10. Workstream C5 - Activation Gate Framework

Batch C must define the gate that any later route-family expansion would have to pass.

### 10.1 Gate requirements

Any future expansion proposal must show:

- route-fit against the approved matrix
- bounded closeout semantics
- bounded evidence semantics
- bounded governance semantics
- no route-specific workflow exception that breaks shared Action Center truth

### 10.2 Gate rule

Passing a conceptual fit review is still insufficient without live evidence.

### 10.3 Activation Gate Decision Template

No activation may happen without a completed decision record containing at least:

- candidate route family
- proposed use case
- route-fit scores
- must-pass failures, if any
- live evidence available
- governance risks
- privacy / dossier risks
- required route defaults
- required evidence grammar
- required closeout semantics
- decision owner
- decision date
- decision outcome: `approved` / `rejected` / `conditional` / `parked`
- rationale

## 11. Workstream C6 - Live Evidence Gate

No route-family expansion may begin after Batch C until live evidence exists.

### 11.1 Minimum live-evidence requirements

Live evidence must include at least:

- live Action Center usage across multiple route instances
- evidence from both ExitScan and RetentieScan contexts, unless one is explicitly excluded
- manager action completion data
- action review completion data
- stale / sprawl / repeated-review-without-progress data
- HR chasing proxy data
- buyer or HR-operator feedback
- no unresolved governance or privacy incident tied to action execution

### 11.2 What the gate does and does not prove

This gate can show operating readiness sufficient to consider expansion.

It still does not prove:

- causal retention impact
- causal exit impact
- intervention effectiveness
- adoption proof in the broad commercial sense

### 11.3 Live-evidence interpretation rules

- live evidence proves operating readiness only, not causal impact
- evidence must include usage, review, sprawl/stale/no-progress, HR chasing proxy, and operator feedback
- absence of governance/privacy incidents is required but not sufficient
- route expansion after live evidence still requires explicit approval through the activation decision template

## 12. Required Deliverables

Batch C must produce:

- Batch C buyer readiness and controlled scale spec
- governance one-pager
- manager participation one-pager
- privacy / dossier boundary note
- route -> action -> review -> closeout explanation
- internal rollout note for HR operators
- internal rollout note for product / founder owner
- route-fit matrix
- activation-gate framework
- live-evidence gate definition
- implementation plan for Batch C
- test / review strategy for buyer-language, route-fit, and boundary consistency

## 12A. Sign-Off Requirements

Batch C output cannot move to rollout or implementation unless approved by:

- product/founder owner
- governance/trust reviewer
- route owner for ExitScan / RetentieScan if separate
- buyer-readiness reviewer or sales owner
- privacy/legal reviewer, where available

If any role is not formally assigned, the founder/product owner must explicitly assume that sign-off responsibility.

## 13. Decision Order

Batch C decisions must be settled in this order:

1. preserve stable Action Center truth from Batches A and B
2. define buyer governance framing
3. define privacy / dossier / monitoring boundaries
4. define rollout and operating materials
5. define route-fit matrix
6. define activation-gate framework
7. define live-evidence gate
8. define review and test strategy

## 14. Non-Goals

Batch C does not do the following:

- no route expansion
- no causal claims
- no proof claims
- no broad analytics
- no generic workflow
- no project or task management
- no collaboration suite
- no HR operating system
- no personnel dossier
- no employee monitoring
- no off-platform canonical writes

## 15. Exit Criteria

Batch C may exit only when:

- all required artifacts meet their acceptance criteria
- buyer audience matrix is complete
- buyer language red-team test is passed
- route-fit matrix includes scoring and must-pass rules
- activation-gate decision template is complete
- live-evidence gate definition includes interpretation rules
- sign-off is complete
- no buyer-facing language presents Action Center as workflow, project management, monitoring, personnel dossier, standalone module, or causal-impact product
- no unresolved product truth remains around buyer framing, route-fit, activation rules, or boundary semantics

## 16. Stop Conditions

Batch C must stop and simplify if:

- buyer framing requires calling Action Center a workflow or project-management product
- rollout materials only make sense by softening existing boundedness
- route-fit logic implicitly expands route scope without explicit approval
- live-evidence gating gets watered down into roadmap optimism
- privacy or dossier boundaries cannot be explained cleanly
- Batch C starts compensating for unresolved Batch A or Batch B semantics

## 17. Implementation Preconditions

Coding must not start from this batch spec directly.

Before implementation begins:

- Batch C spec must be approved
- implementation plan must be approved
- review and test strategy must be defined
- Batch A and Batch B outputs must be stable
- no route expansion may be bundled into Batch C execution
- no off-platform canonical write behavior may be introduced
- no unresolved canonical product truth may remain

## 18. Success Definition

Batch C is successful when:

- Action Center is explainable and defensible to enterprise buyers without losing boundedness
- operators can understand how Action Center should be used and governed
- buyer-safe language is strong enough that Batch C does not need to disguise the product as workflow software
- route-fit and activation logic are clear enough to prevent opportunistic expansion
- Batch C leaves any later scale decision behind a real live-evidence gate instead of documentation alone
