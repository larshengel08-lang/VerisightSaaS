# Loep Culture Assessment Follow-On Architecture Implementation Plan

**Date:** 2026-05-20  
**Status:** later-wave implementation plan  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This plan translates the `Follow-On Architecture` spec into a bounded execution sequence.

Its purpose is to make the route's post-baseline continuation:

- explicit
- governance-safe
- suite-aware
- non-automatic

without turning the route into a broad suite redesign.

---

## 2. Execution Rules

1. no next route opens by default
2. `Pulse` remains follow-on only
3. `RetentieScan` and `ExitScan` handoffs remain question-led
4. route switching requires explicit approval logic
5. "no immediate next route" must remain a valid and supported outcome

---

## 3. Work Package Sequence

### WP1 - Canonical Outcome Lock

Goal:

- define the bounded set of post-baseline outcomes

Deliverables:

- outcome register
- no-next-route guardrail note
- deeper-governed-work note

Dependencies:

- approved follow-on architecture spec
- action/follow-through implementation plan

Acceptance:

- the canonical outcomes are explicit
- no-next-route remains a real supported state
- deeper governed work is distinguished from route switching

### WP2 - Pulse Handoff Control

Goal:

- operationalize the deterministic `Pulse` handoff rule

Deliverables:

- Pulse handoff control note
- Pulse eligibility checklist
- denied-Pulse reason model

Dependencies:

- WP1
- listening operations implementation plan

Acceptance:

- Pulse eligibility rule is explicit
- denied-Pulse outcomes are explicit
- no default Pulse continuation exists

### WP3 - Route Switch Control

Goal:

- define when handoff to `RetentieScan` or `ExitScan` is justified

Deliverables:

- route-switch decision note
- `RetentieScan` handoff note
- `ExitScan` handoff note

Dependencies:

- WP1
- governed drilldown implementation plan

Acceptance:

- route switch logic is question-led
- `RetentieScan` and `ExitScan` are not default next steps
- route-switch approval is explicit

### WP4 - Enterprise and MKB Follow-On Model

Goal:

- translate the same logic into bounded profile differences

Deliverables:

- enterprise follow-on note
- MKB follow-on note
- profile comparison note

Dependencies:

- WP2
- WP3

Acceptance:

- one product logic remains intact
- enterprise and MKB differ only in depth and branching complexity
- no lite logic is introduced

### WP5 - Follow-On Readiness Review

Goal:

- confirm the route can describe continuation clearly without portfolio drift

Deliverables:

- follow-on readiness review
- unresolved risk note
- next-wave unlock note

Dependencies:

- WP2
- WP3
- WP4

Acceptance:

- continuation logic is coherent
- unresolved risks are explicit
- the stream clearly supports later benchmark-readiness and broader suite governance

---

## 3.1 Artifact Lock Table

| WP | Required artifact path | Format | Owner | Reviewer | Acceptance method |
| --- | --- | --- | --- | --- | --- |
| WP1 | `docs/superpowers/followon/culture_assessment_followon_outcome_register.md` | markdown | route owner | product reviewer | outcome review |
| WP2 | `docs/superpowers/followon/culture_assessment_pulse_handoff_control.md` | markdown | route owner | governance reviewer | Pulse control review |
| WP3 | `docs/superpowers/followon/culture_assessment_route_switch_control.md` | markdown | route owner | suite reviewer | route-switch review |
| WP4 | `docs/superpowers/followon/culture_assessment_followon_profile_model.md` | markdown | route owner | product reviewer | profile review |
| WP5 | `docs/superpowers/followon/culture_assessment_followon_readiness_review.md` | markdown | route owner | governance reviewer | readiness review |

---

## 4. Cross-Artifact Dependencies

This plan must stay aligned with:

- action and follow-through implementation plan
- governed drilldown implementation plan
- listening operations implementation plan
- premium delivery implementation plan

It directly supports:

- broader suite-governance maturity
- later benchmark-readiness discipline
- stronger portfolio leverage after the baseline

---

## 5. Approval

At minimum, this plan requires:

- route owner
- governance reviewer
- product reviewer
- suite reviewer

---

## 6. Done-When

This implementation plan is complete only when:

1. follow-on outcomes are explicit
2. Pulse handoff control is explicit
3. route-switch logic to `RetentieScan` and `ExitScan` is explicit
4. enterprise and MKB follow-on depth differences are explicit
5. the readiness review identifies what is now portfolio-coherent and what remains later-wave
