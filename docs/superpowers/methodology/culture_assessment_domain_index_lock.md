# Loep Culture Assessment Domain and Index Lock

**Date:** 2026-05-20  
**Status:** method lock artifact  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This file locks the domain model, Culture Index rule, recurring theme pairs, and core scoring fixtures for `culture_assessment`.

---

## 2. Canonical Domain Register

The route uses exactly ten domains:

1. `engagement_involvement`
2. `trust_psychological_safety`
3. `leadership_direction`
4. `collaboration_alignment`
5. `workload_capacity`
6. `autonomy_role_clarity`
7. `growth_development`
8. `change_readiness`
9. `reward_conditions`
10. `organizational_connection_intent`

These domains are fixed inside the current method version family.

---

## 3. Culture Index Lock

The `Loep Culture Index` is calculated as:

- an equal-weighted average of valid domain scores
- only if at least `8 of 10` domains are valid
- consistently transformed to the route reporting scale

The index must not render if:

- valid-response rules fail
- domain-validity rules fail
- release threshold or governance rules fail

Any change to:

- weighting
- minimum valid domains
- transformation logic
- rendering eligibility

is a method version event.

---

## 4. Recurring Theme Pair Register

Allowed recurring theme pairs:

1. `leadership_direction` + `trust_psychological_safety`
2. `workload_capacity` + `autonomy_role_clarity`
3. `collaboration_alignment` + `leadership_direction`
4. `growth_development` + `organizational_connection_intent`
5. `change_readiness` + `leadership_direction`

Rules:

- descriptive only
- never causal
- may strengthen an executive read
- never replace domain reading

---

## 5. Scoring and Contract Lock

The following fixtures must exist and remain aligned with the method:

- scoring fixture for Culture Index
- valid response fixture
- 8-of-10 domain fixture
- recurring theme pair fixture

These fixtures must confirm:

- ten-domain coverage remains fixed
- index eligibility logic does not drift
- recurring pair list does not change silently

---

## 6. Product-Side Alignment Targets

This lock must stay aligned with:

- [scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/culture_assessment/scoring.py)
- [contract.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/culture_assessment/contract.ts)
- [report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/culture_assessment/report_content.py)

---

## 7. Approval

Approved when:

- all ten domains are fixed
- the 8-of-10 rule is explicit
- equal weighting is explicit
- recurring theme pairs are fixed
- fixture expectations are explicit

