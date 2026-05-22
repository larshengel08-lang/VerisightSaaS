# Batch C Buyer Readiness And Controlled Scale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Action Center into a buyer-ready, rollout-ready, and controlled-scale-ready enterprise module inside Loep without reopening core product truth or implying proof, impact, or route expansion.

**Architecture:** Treat Batch C as an artifact-and-governance batch layered on top of stable Batch A and Batch B truth. First create the buyer-safe explanation layer, then the rollout and boundary artifacts, then the route-fit and activation decision machinery, and finally a red-team/sign-off layer that prevents overclaiming or scope drift before rollout planning.

**Tech Stack:** Markdown docs in `docs/superpowers/specs`, git-based review flow, PowerShell, `rg` for phrase checks, existing Batch A/B/C specs as canonical inputs.

---

## Scope Check

This plan implements **Batch C** only.

In scope:

- buyer governance framing artifacts
- manager participation framing
- privacy / dossier boundary framing
- rollout notes for HR operators and founder/product owner
- route -> action -> review -> closeout explanation
- route-fit matrix artifact
- activation-gate framework artifact
- live-evidence gate artifact
- Batch C review strategy and sign-off structure

Out of scope:

- any product code changes
- route expansion beyond `exit` and `retention`
- Graph dependency or off-platform canonical writes
- collaboration-suite behavior
- workflow / task / project / case-management broadening
- causal or adoption proof claims
- any reopening of Batch A or Batch B semantics unless a blocking inconsistency is discovered

Source specs:

- [2026-05-22-batch-c-buyer-readiness-and-controlled-scale-spec.md](/C:/Users/larsh/Desktop/Business/Verisight/.worktrees/spec-hr-routebeheer-structure/docs/superpowers/specs/2026-05-22-batch-c-buyer-readiness-and-controlled-scale-spec.md)
- [2026-05-22-action-center-post-batch-ab-evaluation.md](/C:/Users/larsh/Desktop/Business/Verisight/.worktrees/spec-hr-routebeheer-structure/docs/superpowers/specs/2026-05-22-action-center-post-batch-ab-evaluation.md)
- [2026-05-20-action-center-enterprise-roadmap.md](/C:/Users/larsh/Desktop/Business/Verisight/.worktrees/spec-hr-routebeheer-structure/docs/superpowers/specs/2026-05-20-action-center-enterprise-roadmap.md)

---

## File Structure Guidance

- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-governance-one-pager.md`
  - buyer-safe governance summary for HR buyers, HR operators, sponsors, and security reviewers
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-manager-participation-one-pager.md`
  - bounded manager-role explanation in under 60 seconds
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-privacy-dossier-boundary-note.md`
  - privacy, dossier, monitoring, and risk-ledger boundaries
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-route-action-review-closeout-explanation.md`
  - canonical operating-flow explainer for route -> action -> review -> closeout
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-hr-operator-rollout-note.md`
  - day-to-day rollout and operating note for HR operators
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-product-founder-rollout-note.md`
  - claim discipline, rollout guardrails, and launch-owner note
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-route-fit-matrix.md`
  - scoring-based route-fit artifact with must-pass dimensions
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-activation-gate-framework.md`
  - activation decision mechanics, owners, and completed-decision template
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-live-evidence-gate.md`
  - operating-readiness-only live-evidence definition
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-batch-c-review-strategy.md`
  - buyer-language red-team test, artifact acceptance checklist, and sign-off ledger
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\plans\2026-05-22-batch-c-buyer-readiness-and-controlled-scale-implementation.md`
  - verification notes added at closeout

---

### Task 1: Create Buyer Governance Framing Artifacts

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-governance-one-pager.md`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-manager-participation-one-pager.md`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-route-action-review-closeout-explanation.md`

- [x] **Step 1: Draft the governance one-pager with bounded language**

```md
# Action Center Governance One-Pager

## What Action Center Is
- embedded inside Loep
- route-bound follow-through after a scan
- HR-governed execution and review rhythm
- canonical inside Action Center

## What Action Center Is Not
- not workflow software
- not project or task management
- not a standalone module
- not employee monitoring

## Governance Model
- HR owns rhythm, continuation, and closeout
- managers participate through bounded route/action/review steps
- Action Center keeps canonical follow-through truth
- off-platform channels may notify but do not canonically mutate route truth

## Closeout And Escalation Boundaries
- action completion does not close a route by itself
- HR decides closeout or continuation
- governance queues point to follow-through pressure, not causal diagnosis
```

- [x] **Step 2: Draft the manager participation one-pager**

```md
# Action Center Manager Participation

## Your Role
- you participate inside an existing route
- you create, update, and review bounded actions
- you do not own route closeout

## What You Do
- create a concrete route-bound action
- review whether follow-through happened
- signal blocker or no-progress where needed

## What You Do Not Own
- no dashboard ownership
- no workflow system ownership
- no project board
- no route closeout authority

## One-Sentence Summary
You help move route-bound follow-through forward through small, reviewable actions. You are not being asked to run a workflow system.
```

- [x] **Step 3: Draft the route -> action -> review -> closeout explainer**

```md
# Action Center Route To Closeout Flow

## 1. Route
A route opens from an approved scan context and becomes the canonical follow-through container.

## 2. Action
Managers add one or a small set of route-bound actions when execution is needed.

## 3. Review
Each action is reviewed inside a bounded rhythm to see whether follow-through happened, stalled, or needs continuation.

## 4. Closeout
HR decides whether the route is ready for closeout or continuation.

## What This Flow Is Not
- not a project plan
- not a task tree
- not workflow automation
```

- [x] **Step 4: Run a first phrase-safety scan on the three new artifacts**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure'
rg -n "solves retention|proves intervention impact|reduces employee risk|predicts individual turnover|measures manager effectiveness|workflow automation|HR operating system|standalone module" docs/superpowers/specs/2026-05-22-action-center-governance-one-pager.md docs/superpowers/specs/2026-05-22-action-center-manager-participation-one-pager.md docs/superpowers/specs/2026-05-22-action-center-route-action-review-closeout-explanation.md
```

Expected:

```text
Only intentional "not ..." boundary lines may match. No positive or promotional misuse of prohibited phrases appears.
```

- [x] **Step 5: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add docs/superpowers/specs/2026-05-22-action-center-governance-one-pager.md docs/superpowers/specs/2026-05-22-action-center-manager-participation-one-pager.md docs/superpowers/specs/2026-05-22-action-center-route-action-review-closeout-explanation.md
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Add Action Center buyer governance framing artifacts"
```

### Task 2: Create Privacy And Rollout Notes

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-privacy-dossier-boundary-note.md`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-hr-operator-rollout-note.md`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-product-founder-rollout-note.md`

- [x] **Step 1: Draft the privacy and dossier boundary note**

```md
# Action Center Privacy And Dossier Boundary Note

## Action Center Is Not
- not a personnel dossier
- not employee monitoring
- not an employee risk ledger
- not a broad narrative store for employee performance

## What Belongs
- route-bound follow-through state
- bounded action and review history
- governance signals tied to route/action/review semantics

## What Does Not Belong
- open-ended employee narratives
- surveillance commentary
- individual risk prediction
- broad HR case files

## Boundary Rule
Action Center records bounded follow-through. It does not judge individual employees or store dossier-like histories.
```

- [x] **Step 2: Draft the HR operator rollout note**

```md
# Action Center HR Operator Rollout Note

## Start Here
- use Action Center as the route-bound follow-through layer
- work from bounded governance and review interpretation
- keep route, action, review, and closeout semantics intact

## What To Watch
- stalled rhythm
- repeated no-progress loops
- sprawl pressure
- closeout readiness

## What Not To Turn This Into
- a case-management system
- a task tracker
- a workflow engine
```

- [x] **Step 3: Draft the product / founder rollout note**

```md
# Action Center Product And Founder Rollout Note

## Claims Discipline
- do not claim adoption proof
- do not claim intervention impact
- do not claim route-expansion readiness from documentation alone

## Rollout Guardrails
- stay inside `exit` and `retention`
- preserve Action Center as embedded and route-bound
- treat live evidence as a later gate, not as current proof

## Launch Rule
If buyer language only works by making Action Center sound like workflow software, stop and rewrite the framing.
```

- [x] **Step 4: Run a boundary scan on the three notes**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure'
rg -n "project management|case management|employee monitoring|personnel dossier|employee risk ledger" docs/superpowers/specs/2026-05-22-action-center-privacy-dossier-boundary-note.md docs/superpowers/specs/2026-05-22-action-center-hr-operator-rollout-note.md docs/superpowers/specs/2026-05-22-action-center-product-founder-rollout-note.md
```

Expected:

```text
Matches appear only in explicit "not ..." boundary sections. No artifact uses these phrases as positive framing.
```

- [x] **Step 5: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add docs/superpowers/specs/2026-05-22-action-center-privacy-dossier-boundary-note.md docs/superpowers/specs/2026-05-22-action-center-hr-operator-rollout-note.md docs/superpowers/specs/2026-05-22-action-center-product-founder-rollout-note.md
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Add Action Center privacy and rollout notes"
```

### Task 3: Create Route-Fit, Activation, And Live-Evidence Artifacts

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-route-fit-matrix.md`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-activation-gate-framework.md`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-live-evidence-gate.md`

- [x] **Step 1: Draft the route-fit matrix with scoring**

```md
# Action Center Route-Fit Matrix

## Scoring
- 0 = no fit
- 1 = weak / high risk
- 2 = conditional fit
- 3 = strong fit

## Must-Pass Dimensions
| Dimension | Score | Notes |
| --- | --- | --- |
| bounded management question |  |  |
| post-scan follow-through fit |  |  |
| review rhythm fit |  |  |
| closeout / continuation fit |  |  |
| evidence grammar fit |  |  |
| HR governance fit |  |  |
| privacy / dossier safety |  |  |
| no workflow broadening |  |  |

## Decision Rules
- any must-pass dimension scored 0 = rejected
- high workflow-broadening risk = rejected or parked
- conceptual fit alone never activates a route family
```

- [x] **Step 2: Draft the activation-gate framework with decision template**

```md
# Action Center Activation Gate Framework

## Rule
No route-family activation may happen without a completed decision record.

## Decision Template
| Field | Value |
| --- | --- |
| candidate route family |  |
| proposed use case |  |
| route-fit scores |  |
| must-pass failures |  |
| live evidence available |  |
| governance risks |  |
| privacy / dossier risks |  |
| required route defaults |  |
| required evidence grammar |  |
| required closeout semantics |  |
| decision owner |  |
| decision date |  |
| decision outcome | approved / rejected / conditional / parked |
| rationale |  |
```

- [x] **Step 3: Draft the live-evidence gate**

```md
# Action Center Live-Evidence Gate

## Minimum Evidence
- live usage across multiple route instances
- evidence from ExitScan and RetentieScan contexts unless one is explicitly excluded
- manager action completion data
- action review completion data
- stale / sprawl / repeated-no-progress data
- HR chasing proxy data
- buyer or HR-operator feedback
- no unresolved governance or privacy incident tied to action execution

## Interpretation Rules
- proves operating readiness only
- does not prove causal impact
- does not prove intervention effectiveness
- does not authorize expansion without explicit approval
```

- [x] **Step 4: Run a structure check on the three artifacts**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure'
rg -n "candidate route family|decision outcome|0 = no fit|proves operating readiness only" docs/superpowers/specs/2026-05-22-action-center-route-fit-matrix.md docs/superpowers/specs/2026-05-22-action-center-activation-gate-framework.md docs/superpowers/specs/2026-05-22-action-center-live-evidence-gate.md
```

Expected:

```text
All required structural fields are present in the three artifacts.
```

- [x] **Step 5: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add docs/superpowers/specs/2026-05-22-action-center-route-fit-matrix.md docs/superpowers/specs/2026-05-22-action-center-activation-gate-framework.md docs/superpowers/specs/2026-05-22-action-center-live-evidence-gate.md
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Add Action Center scale-control artifacts"
```

### Task 4: Create Batch C Review Strategy And Sign-Off Ledger

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-22-action-center-batch-c-review-strategy.md`

- [x] **Step 1: Draft the review strategy with audience, artifact, and sign-off coverage**

```md
# Action Center Batch C Review Strategy

## Buyer Audience Checks
- HR buyer / HR director
- Directie / MT sponsor
- HR operator
- Manager participant
- Legal / privacy / OR-style reviewer
- IT / security reviewer
- Product / founder owner

## Required Artifact Checks
- governance one-pager
- manager participation one-pager
- privacy / dossier boundary note
- route -> action -> review -> closeout explanation
- HR operator rollout note
- product / founder rollout note
- route-fit matrix
- activation-gate framework
- live-evidence gate
```

- [x] **Step 2: Add the buyer language red-team checklist**

```md
## Buyer Language Red-Team Test

### Reject if any artifact positively claims:
- solves retention
- proves intervention impact
- reduces employee risk
- predicts individual turnover
- measures manager effectiveness
- workflow automation
- HR operating system
- standalone module

### Accept only if artifacts consistently say:
- makes follow-through visible
- records ownership and review rhythm
- supports HR-governed follow-through
- does not judge individual employees
- does not claim causal impact
```

- [x] **Step 3: Add sign-off ledger and exit checklist**

```md
## Sign-Off Ledger
| Role | Name | Date | Approved | Notes |
| --- | --- | --- | --- | --- |
| product/founder owner |  |  |  |  |
| governance/trust reviewer |  |  |  |  |
| route owner |  |  |  |  |
| buyer-readiness reviewer or sales owner |  |  |  |  |
| privacy/legal reviewer |  |  |  |  |

## Exit Checklist
- all artifacts meet acceptance criteria
- buyer audience matrix is reflected in artifacts
- red-team test passed
- route-fit matrix uses scoring and must-pass rules
- activation gate record template is complete
- live-evidence interpretation rules are explicit
- sign-off complete
```

- [x] **Step 4: Run a completeness check**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure'
rg -n "Sign-Off Ledger|Buyer Language Red-Team Test|Exit Checklist|product/founder owner" docs/superpowers/specs/2026-05-22-action-center-batch-c-review-strategy.md
```

Expected:

```text
Review strategy contains the red-team checklist, sign-off ledger, and exit checklist headings.
```

- [x] **Step 5: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add docs/superpowers/specs/2026-05-22-action-center-batch-c-review-strategy.md
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Add Action Center Batch C review strategy"
```

### Task 5: Final Red-Team, Cross-Artifact Consistency, And Verification Closeout

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\plans\2026-05-22-batch-c-buyer-readiness-and-controlled-scale-implementation.md`
- Review: all Batch C artifacts created in Tasks 1-4

- [x] **Step 1: Run the full prohibited-language scan**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure'
rg -n "solves retention|proves intervention impact|reduces employee risk|predicts individual turnover|measures manager effectiveness|workflow automation|HR operating system|employee monitoring|personnel dossier|standalone module" docs/superpowers/specs/2026-05-22-action-center-*.md
```

Expected:

```text
Only explicit negative-boundary or red-team checklist contexts may match. No artifact uses prohibited language as a positive claim.
```

- [x] **Step 2: Run a placeholder and structure scan**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure'
rg -n "TODO|TBD|implement later|fill in details" docs/superpowers/specs/2026-05-22-action-center-*.md
```

Expected:

```text
No placeholder text found.
```

- [x] **Step 3: Add verification notes to this implementation plan**

```md
## Verification Notes

- buyer governance framing artifacts completed
- privacy and rollout notes completed
- route-fit, activation-gate, and live-evidence artifacts completed
- buyer language red-team scan passed
- placeholder scan passed
- sign-off ledger and exit checklist present
- no route expansion, proof claim, Graph dependency, or off-platform canonical write behavior introduced
```

- [x] **Step 4: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add docs/superpowers/plans/2026-05-22-batch-c-buyer-readiness-and-controlled-scale-implementation.md docs/superpowers/specs/2026-05-22-action-center-*.md
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Close out Action Center Batch C buyer readiness artifacts"
```

---

## Verification Notes

- Full prohibited-language scan run across `docs/superpowers/specs/2026-05-22-action-center-*.md`.
- Matches appeared only in explicit negative-boundary, rollout-guardrail, post-batch evaluation, or red-team checklist contexts; no Batch C artifact uses prohibited language as a positive claim.
- Placeholder scan run across `docs/superpowers/specs/2026-05-22-action-center-*.md`.
- No `TODO`, `TBD`, `implement later`, or `fill in details` placeholders were found.
- Buyer governance framing artifacts completed.
- Privacy and rollout notes completed.
- Route-fit, activation-gate, and live-evidence artifacts completed.
- Sign-off ledger and exit checklist are present in the Batch C review strategy artifact.
- No route expansion was introduced; Batch C artifacts keep Action Center limited to approved route families only: `exit` and `retention` unless a later explicit approval process says otherwise.
- No proof claim was introduced; artifacts consistently state that follow-through visibility and live evidence do not prove intervention effectiveness or causal impact.
- No Graph dependency was introduced.
- No off-platform canonical write behavior was introduced; artifacts preserve Action Center as canonical inside Loep and reject off-platform canonical writes.

## Self-Review

### Spec coverage

This plan covers:

- buyer audience matrix via artifact content and review strategy
- artifact acceptance criteria through per-artifact templates and acceptance checks
- buyer language red-team test through explicit phrase scans and checklist review
- route-fit scoring and must-pass rules through the route-fit matrix artifact
- activation decision mechanics through the activation-gate framework
- live-evidence interpretation discipline through the live-evidence gate artifact
- sign-off requirements through the review strategy ledger

### Placeholder scan

No `TBD`, `TODO`, or "implement later" placeholders were intentionally left in this plan.

### Type consistency

Artifact names and file paths are kept consistent across:

- file structure guidance
- task file lists
- commit steps
- verification closeout

If any artifact filename changes during implementation, update all references in this plan before execution continues.
