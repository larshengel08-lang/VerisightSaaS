# Action Center Batch C Review Strategy

## Audience

Founder/product owner, governance/trust reviewer, buyer-readiness reviewer, route owner, privacy/legal reviewer

## Purpose

Define how Loep reviews Batch C artifacts for buyer safety, boundary discipline, acceptance completeness, and formal sign-off without broadening scope, weakening live-evidence gating, or reopening Batch A/B truth.

## Decision Use

Use this strategy as the final review layer for Batch C. It verifies that the artifact set, buyer language, and sign-off discipline are complete before Batch C is treated as buyer-ready or rollout-ready.

## Acceptance Test

A reviewer can identify every required artifact, test it against the correct audience and acceptance rule, run the buyer-language red-team check, and record final sign-off without ambiguity. No reader should mistake Batch C packaging for proof, route expansion approval, or a reopening of stable product truth.

## Sign-Off Owner

Product/founder owner

Additional required sign-off roles are recorded in the ledger below. If a role is not formally assigned, the product/founder owner must explicitly assume that responsibility.

## Fixed Review Rules

- Batch C stays embedded inside Loep and preserves Action Center as route-bound, HR-governed, and limited to approved route families only: `exit` and `retention`.
- Batch C may not broaden Action Center into workflow software, project or task management, case management, employee monitoring, personnel-dossier framing, employee risk-ledger framing, or a standalone module.
- Batch C may not introduce a Graph dependency or off-platform canonical writes.
- Batch C may not introduce broad analytics platform expansion or collaboration-suite behavior.
- Batch C may not introduce buyer-facing proof claims or causal impact claims.
- Batch C may not weaken the live-evidence gate into roadmap optimism or documentation-only approval.
- Batch C may not reopen Batch A or Batch B semantics unless a blocking inconsistency is discovered outside this review strategy.

## Buyer Audience Checks

| Audience | What must be clear after review | What must still be impossible to infer | Primary artifacts |
| --- | --- | --- | --- |
| `HR buyer / HR director` | Action Center is an HR-governed follow-through layer inside Loep for route-bound post-scan execution, review rhythm, and closeout discipline. | workflow software, task board, standalone module, impact-proof engine | governance one-pager, route -> action -> review -> closeout explanation, route-fit matrix |
| `Directie / MT sponsor` | Action Center makes follow-through visible and governable without claiming proof of intervention impact. | broad HR operating system, analytics proof engine, route-expansion approval | governance one-pager, buyer-safe reporting language, live-evidence gate definition |
| `HR operator` | HR works from bounded governance, review rhythm, continuation, and closeout rules. | ad hoc case-management behavior, dossier ownership, workflow-system administration | governance one-pager, HR operator rollout note, privacy / dossier boundary note |
| `Manager participant` | Managers participate through bounded route, action, and review steps inside an existing route. | dashboard ownership, project-board ownership, route-closeout authority | manager participation one-pager, route -> action -> review -> closeout explanation |
| `Legal / privacy / OR-style reviewer` | Action Center stores bounded follow-through history and governance state with explicit privacy boundaries. | employee monitoring, personnel dossier, employee risk ledger | privacy / dossier boundary note, governance one-pager |
| `IT / security reviewer` | Action Center remains canonical inside Loep with no off-platform canonical writes or workflow-platform drift. | shadow workflow platform, externally governed write surface, collaboration-suite sprawl | governance one-pager, privacy / dossier boundary note, activation-gate framework |
| `Product / founder owner` | Batch C packages stable truth from Batches A and B without widening claims, route scope, or activation readiness. | permission to expand routes, proof claims, weakened live-evidence discipline | product/founder rollout note, route-fit matrix, activation-gate framework, live-evidence gate |

## Required Artifact Checks

| Artifact | Audience | Purpose | Must include | Must not include | Review check | Acceptance rule | Sign-off owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `governance one-pager` | HR buyer, HR operator, MT sponsor, IT/security reviewer | Explain HR governance, route-bound scope, closeout authority, and Action Center's role inside Loep. | HR governance model, closeout/continuation rules, bounded intervention framing, route-bound scope, no off-platform writes | workflow-software framing, project-management language, standalone-module framing | Confirms HR governance, route-bound scope, closeout authority, and off-platform boundary language stay intact. | A buyer can explain governance and product boundaries in under 2 minutes without workflow framing. | product/founder owner |
| `manager participation one-pager` | manager participant, HR operator | Explain the bounded manager role inside route, action, and review participation. | manager role, bounded actions, review rhythm, what managers do not own | dashboard ownership, workflow ownership, project-board framing | Confirms manager role stays bounded to route actions and reviews inside an existing route. | A manager can explain the role in under 60 seconds without assuming dashboard or workflow ownership. | product/founder owner or route owner for ExitScan / RetentieScan if separate |
| `privacy / dossier boundary note` | legal/privacy reviewer, HR buyer, HR operator, IT/security reviewer | Define what Action Center stores, what it must never become, and how bounded follow-through stays separate from dossier or surveillance behavior. | not a personnel dossier, not employee monitoring, not employee risk ledger, bounded evidence rules | open employee narratives, surveillance framing, risk scoring framing | Confirms stored content, prohibited content, and plain-language boundary rules are explicit. | A reviewer can point to clear prohibited uses with no dossier, monitoring, or risk-ledger ambiguity. | privacy/legal reviewer |
| `route -> action -> review -> closeout explanation` | HR buyer, manager participant, HR operator, MT sponsor | Explain the canonical operating flow simply and accurately. | route truth, action role, review checkpoints, HR closeout role, continuation logic | project-plan framing, task-tree framing, workflow-automation framing | Confirms route truth, review rhythm, continuation, and HR closeout semantics stay canonical. | A reader can explain the flow without turning it into project management or workflow automation. | product/founder owner |
| `HR operator rollout note` | HR operator | Explain day-to-day rollout and operating guidance for bounded Action Center use. | operator responsibilities, queue/governance interpretation, escalation boundaries, what to avoid | ad hoc case-management behavior, broad operating-system framing | Confirms day-to-day operating guidance reinforces queue interpretation, escalation, and bounded rollout behavior. | An HR operator can run the rollout without inventing missing governance behavior. | governance/trust reviewer |
| `product / founder rollout note` | product/founder owner | Explain claim discipline, route-scope guardrails, and launch-owner limits. | positioning boundaries, live-evidence dependency, route-scope guardrails, sign-off expectations | premature proof claims, automatic route expansion assumptions | Confirms claim discipline, route-scope guardrails, and launch-owner limits remain explicit. | Product/founder owner can state what may and may not be claimed, activated, or expanded. | product/founder owner |
| `route-fit matrix` | product/founder owner, route owner, governance/trust reviewer, buyer-readiness reviewer | Evaluate whether a future route family conceptually fits Action Center without treating fit as approval. | scored dimensions, must-pass rules, rejection/parking rules, workflow-broadening risk | automatic approval language, unsupported route-family assumptions | Confirms scoring scale, must-pass rules, and non-approval interpretation are complete. | A reviewer can classify a candidate route as rejected, parked, conditional fit, or strong conceptual fit without ambiguity. | product/founder owner or route owner for ExitScan / RetentieScan if separate |
| `activation-gate framework` | product/founder owner, governance/trust reviewer, buyer-readiness reviewer, route owner | Define the decision mechanics required before any future route-family activation can enter approval review. | decision template, owners, required fields, route-fit reference, live-evidence dependency | vague "expand later" language, undocumented approvals | Confirms activation review cannot open without a complete decision record and explicit live-evidence status. | No activation proposal can enter approval review with missing fields or undocumented ownership. | product/founder owner |
| `live-evidence gate` | product/founder owner, governance/trust reviewer, buyer-readiness reviewer, route owner | Define the minimum live operating evidence required before route-family expansion can be considered operating-ready for review. | usage, review, stale/sprawl/no-progress, HR chasing proxy, operator feedback, privacy/governance incident requirement, interpretation rules | impact-proof claims, route-expansion by document alone | Confirms operating-readiness evidence requirements and interpretation rules remain explicit and bounded. | A reviewer can state what evidence exists, what is missing, and why live evidence is not impact proof. | governance/trust reviewer |

## Buyer Language Red-Team Test

### Reject if any artifact positively claims

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

### Reject if any artifact weakens fixed boundaries

- treats conceptual fit as activation approval
- treats documentation as live evidence
- suggests route expansion beyond `exit` and `retention`
- reframes Action Center as case management, project management, or employee monitoring
- implies that Batch C can repair or replace unresolved Batch A/B truth

### Accept only if artifacts consistently reinforce

- Action Center is embedded inside Loep
- Action Center supports HR-governed, route-bound follow-through
- Action Center makes agreed follow-through visible and reviewable
- Action Center records ownership and review rhythm
- Action Center does not judge individual employees
- Action Center does not claim causal impact
- live evidence proves operating readiness only
- activation still requires an explicit decision record and sign-off

### Red-Team Method

1. Read each buyer-facing artifact as if an external enterprise buyer is looking for overclaim, workflow drift, or privacy ambiguity.
2. Mark any phrase that would require a seller or operator to "explain around" the document.
3. Reject the artifact if safe interpretation depends on unstated product truth or verbal correction.
4. Re-run the test after edits until every artifact passes without softening route, governance, or live-evidence boundaries.

## Sign-Off Ledger

| Role | Name | Date | Approved | Notes |
| --- | --- | --- | --- | --- |
| product/founder owner |  |  |  |  |
| governance/trust reviewer |  |  |  |  |
| route owner for ExitScan / RetentieScan if separate |  |  |  |  |
| buyer-readiness reviewer or sales owner |  |  |  |  |
| privacy/legal reviewer |  |  |  |  |

## Exit Checklist

- all required Batch C artifacts exist and match the approved artifact list
- buyer audience checks are covered by the artifact set without gaps
- required artifact checks pass with their stated acceptance rules
- buyer language red-team test passes across all buyer-facing artifacts
- no artifact broadens Action Center into workflow, project, case-management, monitoring, dossier, or standalone-product framing
- route-fit matrix keeps scoring, must-pass rules, and non-approval interpretation intact
- activation-gate framework keeps complete-decision-record discipline intact
- live-evidence gate keeps operating-readiness-only interpretation intact
- no route expansion, documentation-only approval, or Batch A/B truth reopening is introduced
- no unresolved product truth remains around buyer framing, route-fit, activation rules, or boundary semantics
- sign-off ledger is complete or explicitly assumed by the product/founder owner where needed

## Plain-Language Summary

This review strategy is the final governance check for Batch C. It makes sure Loep can present Action Center in buyer-safe language, prove every required artifact is complete, and record formal sign-off without turning documentation into proof, activation approval, or broader product scope.
