# Loep Culture Assessment Text Threshold & Eligibility

**Date:** 2026-05-20  
**Status:** text-governance threshold artifact  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This artifact defines when open text is eligible for governed use in `culture_assessment`.

It exists to prevent:

- thin qualitative inference
- local threshold improvisation
- role drift from raw comment presence to assumed visibility

---

## 2. Canonical Rule

Open-text output may appear only if:

1. text was collected for the route
2. text volume is above the canonical minimum safe threshold
3. safe clustering produces enough grouped material
4. audience eligibility passes
5. release approval passes

If any one of these fails, no normal text-derived output should render.

---

## 3. Canonical Threshold Source

Until a separate threshold register is explicitly created and approved, the route uses these bounded defaults:

- no text-derived output below `5` safe comments at the relevant aggregate layer
- no visible cluster below `3` safely grouped comments
- no manager-layer text output

These defaults are route-level controls.
Implementation may not invent local text threshold values per team, manager scope, or ad hoc delivery preference.

---

## 4. Audience Eligibility

Text may appear only for audiences whose role and release posture allow it.

`executive`

- may receive short cluster-level summary only

`hr_partner`

- may receive deeper governed summary where safe

`manager_limited`

- may not receive raw or local text depth

`sales_demo`

- may receive synthetic or fictive examples only

---

## 5. No-Text Outcome

If threshold or safety conditions fail:

- no text-derived insight is shown
- the route may explain that open text is not visible because safe volume, clustering, or approval was insufficient

This is a safe normal outcome, not a product failure.

---

## 6. Approval

Approved when:

- threshold values are explicit
- no local threshold invention is allowed
- audience eligibility is explicit
- no-text outcome is explicit
