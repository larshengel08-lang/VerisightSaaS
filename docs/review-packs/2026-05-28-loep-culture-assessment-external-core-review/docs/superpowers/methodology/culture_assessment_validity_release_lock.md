# Loep Culture Assessment Validity and Release Lock

**Date:** 2026-05-20  
**Status:** method-governance lock artifact  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This file separates:

- scoring eligibility

from:

- safe release eligibility

for `culture_assessment`.

It exists to prevent technically scorable datasets from being treated as automatically safe to show.

---

## 2. Valid Response Lock

Current valid-response rule set:

- minimum closed items answered: `32`
- minimum answered items per domain: `3`
- minimum valid domains: `8`
- open text: optional

A response contributes to normal scoring only if this rule set is satisfied.

---

## 3. Safe Release Lock

Aggregate results may be shown only if:

- the campaign is closed
- release approval is granted
- organization minimum-n is satisfied
- segment or layer threshold rules are satisfied
- suppressed layers remain hidden

This means:

- valid response is necessary but not sufficient
- closure is necessary but not sufficient
- release approval is necessary but not sufficient

All three layers must align before normal output may render.

---

## 4. Invalid Response and No-Index Contract

The following fixtures must exist and remain aligned with the lock:

- invalid response fixture
- no-index-when-invalid fixture
- release-boundary fixture

These fixtures must confirm:

- incomplete response sets do not silently score like complete ones
- no Culture Index renders when validity fails
- no normal output renders when release conditions fail

---

## 5. Claim-Safe Boundary Summary

Buyer-safe and output-safe language must remain:

- descriptive
- governance-aware
- non-causal

It must never imply:

- that enough responses automatically means enough safety
- that closure automatically means full visibility
- that any valid score automatically becomes a board-ready result

---

## 6. Approval

Approved when:

- valid response rules are explicit
- release rules are explicit
- the distinction between the two is explicit
- fixture expectations are explicit

