# Loep Culture Assessment Enterprise Trust & Procurement Implementation Plan

**Date:** 2026-05-20  
**Status:** first-wave implementation plan  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This plan translates the `Enterprise Trust & Procurement Readiness` spec into a bounded execution sequence.

Its purpose is to produce the minimum trust pack that supports:

- serious board and HR buying conversations
- first-pilot procurement and governance questions
- claim-safe sales and output language

without creating unsupported legal or security theater.

---

## 2. Execution Rules

1. trust claims must never outrun actual operating capability
2. privacy, export, and release boundaries must be explicit
3. the buyer FAQ and OR pack must stay consistent with the route
4. unsupported certifications or platform claims are forbidden
5. trust language must remain aligned with the admin/access note

---

## 3. Work Package Sequence

### WP1 - Trust Source-of-Truth Lock

Goal:

- define where trust posture is formally maintained

Deliverables:

- trust source-of-truth file map
- trust owner map
- claim approval owner note

Dependencies:

- approved trust/procurement spec

Acceptance:

- one trust source of truth is identifiable
- trust approval ownership is explicit

### WP2 - Buyer FAQ Draft

Goal:

- produce the core buyer-facing trust answer set

Deliverables:

- enterprise buyer FAQ draft
- sales-safe condensed FAQ

Dependencies:

- WP1
- methodology authority implementation plan

Acceptance:

- all required FAQ topics are covered
- no unsupported claims appear
- answers stay consistent with route governance

FAQ must cover:

- purpose of the measurement
- anonymity and confidentiality
- minimum-n and suppression
- open text
- manager ranking excluded
- individual prediction excluded
- data retention
- exports
- access and roles
- OR / employee representation
- security and hosting at a bounded level
- incident and contact route

### WP3 - Privacy, Export, and Release Boundary Pack

Goal:

- make operational governance legible to buyers

Deliverables:

- privacy/process role explanation
- export boundary summary
- release and approval summary
- data processing and subprocessor note

Dependencies:

- admin/access control note
- WP1

Acceptance:

- no respondent-level export posture is explicit
- release and threshold logic are explained in plain language
- valid response versus safe release is not conflated
- processor/controller role, DPA status, subprocessors, hosting or data location, retention summary, access summary, and incident route are explicit

### WP4 - OR / Works-Council Explanation Draft

Goal:

- produce a bounded governance explanation for employee representation contexts

Deliverables:

- OR / works-council note
- short explanatory summary for guided conversations

Dependencies:

- WP3

Acceptance:

- aggregate-level purpose is clear
- manager ranking and individual prediction are explicitly excluded
- open-text boundaries are explicit
- OR / works-council note is Dutch-first and usable in guided customer conversations

### WP5 - Retention and Incident Basics

Goal:

- close the most sensitive operational trust gaps

Deliverables:

- retention/deletion posture note
- incident/escalation basic path note

Dependencies:

- WP1

Acceptance:

- retention posture is supportable
- incident ownership is explicit
- no fake enterprise support-machine language appears

---

## 3.1 Artifact Lock Table

| WP | Required artifact path | Format | Owner | Reviewer | Acceptance method |
| --- | --- | --- | --- | --- | --- |
| WP1 | `docs/superpowers/trust/culture_assessment_trust_source_map.md` | markdown | trust owner | product owner | trust source review |
| WP2 | `docs/superpowers/trust/culture_assessment_buyer_faq.md` | markdown | trust owner | sales reviewer | FAQ review |
| WP3 | `docs/superpowers/trust/culture_assessment_privacy_export_release_pack.md` | markdown | trust owner | governance reviewer | boundary review |
| WP4 | `docs/superpowers/trust/culture_assessment_or_note_nl.md` | markdown | trust owner | delivery reviewer | guided-conversation review |
| WP5 | `docs/superpowers/trust/culture_assessment_retention_incident_note.md` | markdown | trust owner | governance reviewer | supportability review |

---

## 4. Cross-Artifact Dependencies

This plan must stay aligned with:

- methodology authority implementation plan
- admin/access control note
- premium delivery implementation plan

It directly supports:

- pilot-readiness gate
- listening operations implementation plan

---

## 5. Approval

At minimum, this plan requires:

- trust owner
- product owner
- governance reviewer

---

## 6. Done-When

This implementation plan is complete only when:

1. trust source-of-truth ownership is explicit
2. buyer FAQ exists
3. privacy, export, and release boundaries are explainable
4. OR / works-council note exists
5. retention and incident basics are explicit
6. trust language is consistent with route behavior
