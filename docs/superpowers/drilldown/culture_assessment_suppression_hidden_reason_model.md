# Loep Culture Assessment Suppression & Hidden Reason Model

**Date:** 2026-05-20  
**Status:** governed drilldown suppression artifact  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This model defines when layers are hidden, suppressed, or merged upward.

---

## 2. Canonical Hidden Reasons

Allowed reason types:

- `below_threshold`
- `not_released`
- `not_entitled`
- `package_not_included`
- `unsafe_to_compare`
- `metadata_incomplete`

No additional ad hoc reason labels should appear in normal route behavior.

---

## 3. Suppression Rule

A layer is suppressed when:

- minimum-n fails
- identifiability risk remains too high
- release approval is not granted
- package scope excludes the deeper layer

---

## 4. Merge-Up Rule

If a layer is unsafe on its own but safe only as part of a broader parent layer:

- merge upward into the parent interpretation layer

Never:

- simulate local visibility through disguised subgroup wording

---

## 5. Why-Hidden Explanation Rule

The route may explain:

- why a layer is hidden
- whether the blocker is threshold, entitlement, release, comparison safety, or package scope

The route may not explain hidden layers in a way that reveals unsafe local detail.

---

## 6. Approval

Approved when:

- hidden reasons are exhaustive
- suppression rule is explicit
- merge-up rule is explicit
- why-hidden explanation boundary is explicit
