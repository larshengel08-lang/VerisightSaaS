# Loep Culture Assessment Pulse Handoff Control

**Date:** 2026-05-20  
**Status:** follow-on Pulse control artifact  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This control defines when `Pulse` may open as a bounded follow-on after `culture_assessment`.

`Pulse` remains follow-on only.

---

## 2. Deterministic Pulse Eligibility Checklist

All checks must pass:

- baseline board-read completed
- selected theme is bounded
- named owner is assigned
- review question is specific
- measurement cadence is justified
- no unresolved release or governance dispute remains
- `Pulse` is not being used to compensate for unclear baseline interpretation

---

## 3. Denied-Pulse Reason Model

Denied-Pulse reasons must use one of these canonical labels:

- `baseline_not_completed`
- `theme_not_bounded`
- `owner_missing`
- `review_question_not_specific`
- `cadence_not_justified`
- `release_or_governance_dispute_open`
- `baseline_interpretation_not_clear`
- `no_follow_on_measurement_needed`

Free-form local denial labels are not allowed.

---

## 4. Never Allowed

`Pulse` may not open when:

- it is treated as the default next step after every board-read
- the organization mainly wants "more data"
- the baseline still needs interpretation repair
- governance issues remain unresolved
- it is used as a workaround for weak annual-baseline discipline

---

## 5. Approval Read

This control is acceptable only when:

- the eligibility rule is explicit
- denied-Pulse reasons are explicit
- no default Pulse continuation remains
