# Loep Culture Assessment Pilot-Readiness Gate

**Date:** 2026-05-20  
**Status:** wave-1.5 gate artifact  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This gate determines whether `Loep Culture Assessment / Loep Cultuurbeeld` is ready to run its first bounded pilot.

This gate is not a launch-celebration checklist.
It is a go / no-go control artifact.

---

## 2. Gate Rule

The first pilot may proceed only if every launch-critical control below is:

- `ready`
- or explicitly accepted as a bounded pilot risk by the route owner

If a launch-critical control is neither ready nor explicitly accepted, the pilot must not proceed.

---

## 3. Launch-Critical Controls

## 3.1 Method source locked

Done when:

- canonical method source exists
- domain model is locked
- Culture Index logic is locked
- versioning owner is explicit

Status:

- `pending`

## 3.2 Output pack demo-ready

Done when:

- board report is usable
- executive one-pager is usable
- board deck is demoable
- board-read script exists
- sample output pack is coherent

Status:

- `pending`

## 3.3 Trust / procurement FAQ ready

Done when:

- buyer FAQ exists
- trust boundaries are claim-safe
- privacy, export, and role boundaries are documented

Status:

- `pending`

## 3.4 Launch-to-close operating cadence ready

Done when:

- launch cadence exists
- reminder cadence exists
- closure protocol exists
- release protocol exists
- board-read handoff exists

Status:

- `pending`

## 3.5 No unsafe exports

Done when:

- no respondent-level export path is allowed
- governed export boundaries are explicit
- manager-limited export path is blocked

Status:

- `pending`

## 3.6 Minimum-n and release rules tested

Done when:

- organization minimum-n rule is tested
- suppressed layers remain hidden
- release does not occur before closure and release approval

Status:

- `pending`

## 3.7 Board-read script ready

Done when:

- facilitator can run a 60-90 minute board-read
- decision questions are explicit
- causal diagnosis and manager blame are excluded

Status:

- `pending`

## 3.8 First pilot constraints accepted

Done when:

- one-organization constraint is accepted
- no benchmark is accepted
- no manager layer unlock is accepted
- no custom questions is accepted
- maximum two segment dimensions is accepted

Status:

- `pending`

---

## 4. Approval Owners

At minimum, the gate must name:

- route owner
- method owner
- delivery owner
- governance owner

The same person may hold multiple roles in the first pilot, but ownership may not be implicit.

---

## 5. Gate Outcome States

- `go`
- `go with bounded accepted risks`
- `no-go`

---

## 6. Immediate Next Step

After this gate is first populated, the next required artifact is:

- the 90-day product maturity plan

