# Loep Culture Assessment Cluster Register

**Date:** 2026-05-20  
**Status:** text-governance cluster artifact  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This register defines the canonical cluster schema for governed text interpretation.

It does not claim that all listed clusters are always visible.
Visibility still depends on threshold, safety, audience, and release.

---

## 2. Required Cluster Schema

Every cluster must define:

- `cluster_id`
- `label_nl`
- `label_en`
- inclusion rule
- exclusion rule
- linked domains
- role visibility
- confidence rule
- approval owner
- minimum safe cluster size

---

## 3. Default Confidence Rule

Allowed confidence labels:

- `low confidence`
- `moderate confidence`
- `high confidence`

These labels describe only:

- the stability and sufficiency of the safe grouped signal

They do not describe:

- truth certainty
- causal certainty
- intervention certainty

---

## 4. Initial Cluster Set

| cluster_id | label_nl | label_en | inclusion rule | exclusion rule | linked domains | role visibility | confidence rule | approval owner | minimum safe cluster size |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `leadership_direction_signal` | `Richting en leiderschap` | `Direction and leadership` | comments about strategic direction, leadership clarity, or visible steering | exclude personal accusations or named incidents | `leadership_direction`, `change_readiness` | `executive`, `hr_partner` | bounded by cluster size and consistency | text governance owner | `3` |
| `safety_trust_signal` | `Veiligheid en vertrouwen` | `Safety and trust` | comments about trust, voice, psychological safety, or fear of speaking up | exclude legal allegations and named conflict detail | `trust_psychological_safety` | `executive`, `hr_partner` | bounded by cluster size and consistency | text governance owner | `3` |
| `workload_role_signal` | `Werkdruk en rolhelderheid` | `Workload and role clarity` | comments about workload, capacity, priorities, role confusion, or overload | exclude medical detail and personally identifying absence context | `workload_capacity`, `autonomy_role_clarity` | `executive`, `hr_partner` | bounded by cluster size and consistency | text governance owner | `3` |
| `collaboration_alignment_signal` | `Samenwerking en afstemming` | `Collaboration and alignment` | comments about coordination, handoff quality, silos, or alignment friction | exclude named team blame or uniquely identifying local disputes | `collaboration_alignment` | `executive`, `hr_partner` | bounded by cluster size and consistency | text governance owner | `3` |
| `growth_connection_signal` | `Ontwikkeling en verbondenheid` | `Growth and connection` | comments about development, belonging, organizational connection, or intent to stay | exclude individual career cases or identifiable retention stories | `growth_development`, `organizational_connection_intent` | `executive`, `hr_partner` | bounded by cluster size and consistency | text governance owner | `3` |

---

## 5. Role Visibility Rule

Cluster visibility defaults:

- `executive`: short cluster summary only
- `hr_partner`: deeper governed summary where safe
- `manager_limited`: no raw cluster depth
- `sales_demo`: synthetic or fictive illustration only

---

## 6. Approval

Approved when:

- cluster schema is explicit
- initial cluster set is explicit
- confidence labels are explicit
- role visibility defaults are explicit
