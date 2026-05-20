# Loep Culture Assessment Premium Delivery & Board Output Implementation Plan

**Date:** 2026-05-20  
**Status:** first-wave implementation plan  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This plan translates the `Premium Delivery & Board Output System` spec into a bounded execution sequence.

Its purpose is to make the output family:

- structurally consistent
- claim-safe
- readiness-scored
- commercially demoable
- operationally usable in first pilots

without pretending that every artifact is already a fully automated production deliverable.

---

## 2. Execution Rules

1. all outputs follow one executive reading spine
2. standard versus governed outputs remain explicit
3. readiness state must be declared for every artifact
4. no output may outrun method or governance truth
5. manager cascade artifacts stay bounded and non-ranking

### 2.1 Readiness states

- `blueprint_ready`: structure is correct, not yet commercially showable
- `demo_ready`: showable in guided sales or review without customer data
- `pilot_delivery_ready`: usable in a first guided pilot delivery
- `production_ready`: reusable without ad hoc rewriting

---

## 3. Work Package Sequence

### WP1 - Output Registry Lock

Goal:

- define the full output family and source-of-truth ownership

Deliverables:

- output family register
- artifact owner map
- readiness-state register
- standard versus governed output classification

Dependencies:

- approved premium delivery spec
- methodology authority spec

Acceptance:

- all canonical artifacts are listed
- standard versus governed outputs are explicit
- each artifact has an owner and readiness state

Output classification:

Standard outputs:

- board report
- executive one-pager
- board-read agenda or facilitator script

Governed outputs:

- HR appendix
- segment summary
- manager cascade handout
- open-text summary if enabled and safe

### WP2 - Executive Spine Alignment

Goal:

- ensure all outputs map back to one reading sequence

Deliverables:

- executive reading spine mapping
- condensed versus full sequence map
- per-artifact structure note

Dependencies:

- WP1

Acceptance:

- board report, board deck, one-pager, HR appendix, and manager handout all map back to the same executive logic
- no artifact starts from ranking or local blame

### WP3 - Claim-Safe Copy Lock

Goal:

- align copy boundaries across the output family

Deliverables:

- claim-safe copy source note
- forbidden-claims checklist
- per-artifact “what not to conclude” guidance

Dependencies:

- methodology authority implementation plan
- WP2

Acceptance:

- no output claims culture good/bad, causality, or individual prediction
- copy remains consistent across board, HR, manager, and demo layers

### WP4 - Board Pack Readiness

Goal:

- move the executive artifacts to usable delivery quality

Deliverables:

- board report readiness review
- boardroom deck readiness review
- executive one-pager readiness review
- facilitator script readiness review

Dependencies:

- WP2
- WP3

Acceptance:

- board report is delivery-ready
- deck is at least demo-ready
- one-pager stands alone
- facilitator script can support a 60-90 minute board-read

Board deck artifact format must be explicit:

- PPTX
- PDF deck
- markdown blueprint
- static design deck

For V1 pilot, minimum:

- demo-ready PDF, PPTX, or visually representative slide deck

### WP5 - Governed HR and Cascade Readiness

Goal:

- make deeper outputs usable without breaching governance

Deliverables:

- HR appendix governed-readiness review
- manager cascade handout governance-safe review
- governed segment output boundary note

Dependencies:

- WP3
- admin/access control note

Acceptance:

- HR appendix stays thresholded and explicit about hidden layers
- manager handout cannot create ranking behavior
- governed expansion is clearly separated from the standard baseline pack

### WP6 - Demo and Sample Pack Readiness

Goal:

- create a sales- and review-usable output pack without live dependency

Deliverables:

- sample output pack review
- demo organization pack review
- sample asset status map

Dependencies:

- WP4
- WP5

Acceptance:

- sample pack explains the route in ten minutes
- every asset is clearly marked as blueprint, demo, or delivery-ready
- internal-only versus guided-demo status is explicit

---

## 3.1 Artifact Lock Table

| WP | Required artifact path | Format | Owner | Reviewer | Acceptance method |
| --- | --- | --- | --- | --- | --- |
| WP1 | `docs/superpowers/output/culture_assessment_output_registry.md` | markdown | output owner | product owner | registry review |
| WP2 | `docs/superpowers/output/culture_assessment_executive_spine_map.md` | markdown | output owner | method reviewer | structure review |
| WP3 | `docs/superpowers/output/culture_assessment_claim_safe_copy_lock.md` | markdown | output owner | governance reviewer | copy review |
| WP4 | `docs/superpowers/output/culture_assessment_board_pack_readiness.md` | markdown | output owner | delivery reviewer | artifact readiness review |
| WP5 | `docs/superpowers/output/culture_assessment_governed_output_readiness.md` | markdown | governance owner | HR reviewer | governance review |
| WP6 | `docs/superpowers/output/culture_assessment_demo_sample_pack_status.md` | markdown | output owner | sales reviewer | demo-readiness review |

---

## 4. Cross-Artifact Dependencies

This plan must stay aligned with:

- methodology authority implementation plan
- admin and access control note
- trust/procurement implementation plan

It directly supports:

- pilot-readiness gate
- listening operations implementation plan

---

## 5. Approval

At minimum, this plan requires:

- output owner
- method reviewer
- governance reviewer
- delivery owner

---

## 6. Done-When

This implementation plan is complete only when:

1. the output registry is locked
2. the executive spine is aligned across outputs
3. claim-safe copy is locked
4. the board pack is delivery-usable
5. HR and cascade outputs are governance-safe
6. the sample/demo pack is explicitly status-marked and commercially coherent
