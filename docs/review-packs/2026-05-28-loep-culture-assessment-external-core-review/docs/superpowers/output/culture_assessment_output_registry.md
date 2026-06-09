# Loep Culture Assessment Output Registry

**Date:** 2026-05-20  
**Status:** output registry artifact  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This registry is the canonical output family register for `culture_assessment`.

It identifies:

- every canonical output artifact
- standard versus governed output classification
- readiness state
- primary owner
- review owner

---

## 2. Readiness States

- `blueprint_ready`: structure is correct, not yet commercially showable
- `demo_ready`: showable in guided sales or review without customer data
- `pilot_delivery_ready`: usable in a first guided pilot delivery
- `production_ready`: reusable without ad hoc rewriting

---

## 3. Standard Outputs

| Artifact | Purpose | Default class | Readiness state | Primary owner | Review owner |
| --- | --- | --- | --- | --- | --- |
| Board report PDF | Formal executive baseline report | standard | `pilot_delivery_ready` | output owner | delivery reviewer |
| Executive one-pager | Stand-alone executive summary | standard | `pilot_delivery_ready` | output owner | method reviewer |
| Board-read facilitator script | Guided board-read support | standard | `pilot_delivery_ready` | delivery owner | governance reviewer |
| Board-read agenda | Guided session structure | standard | `pilot_delivery_ready` | delivery owner | output owner |

---

## 4. Governed Outputs

| Artifact | Purpose | Governed condition | Readiness state | Primary owner | Review owner |
| --- | --- | --- | --- | --- | --- |
| HR appendix PDF | Governed HR deepening | only where package and thresholds allow | `demo_ready` | governance owner | HR reviewer |
| Segment summary export | Governed aggregate export | only where release and entitlements allow | `pilot_delivery_ready` | governance owner | release reviewer |
| Manager cascade handout | Safe local communication support | only as bounded cascade support | `demo_ready` | governance owner | delivery reviewer |
| Open-text summary | Safe text context layer | only when enabled and safely clustered | `blueprint_ready` | governance owner | method reviewer |

---

## 5. Demo and Sales Support Outputs

| Artifact | Purpose | Default class | Readiness state | Primary owner | Review owner |
| --- | --- | --- | --- | --- | --- |
| Boardroom deck | Guided executive demo or board-read deck | demo | `demo_ready` | output owner | sales reviewer |
| Sample output pack | Guided commercial explanation pack | demo | `demo_ready` | output owner | sales reviewer |
| Demo organization and screenshots | Guided illustration environment | demo | `demo_ready` | output owner | product owner |
| Sample invite mail | Buyer and delivery illustration | demo | `demo_ready` | delivery owner | sales reviewer |
| "What you receive after completion" page | Buyer expectation support | demo | `demo_ready` | output owner | product owner |

---

## 6. Classification Rules

Standard outputs:

- board report
- executive one-pager
- board-read agenda and facilitator script

Governed outputs:

- HR appendix
- segment summary export
- manager cascade handout
- open-text summary if enabled and safe

Demo and sales support:

- boardroom deck
- sample output pack
- demo organization
- sample invite mail
- "what you receive" explainer

---

## 7. Approval

Approved when:

- all canonical outputs are listed
- standard versus governed classification is explicit
- every output has a readiness state
- every output has an owner and reviewer

