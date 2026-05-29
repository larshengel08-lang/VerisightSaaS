# Loep Culture Assessment Method Source Map

**Date:** 2026-05-20  
**Status:** method source-of-truth artifact  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This file identifies the canonical source of truth for the `Loep Cultuurbeeld Methode`.

It exists to prevent:

- silent method drift
- duplicate method truth across docs and code
- scoring logic being treated as separate from interpretation logic

---

## 2. Named Method Core

The fixed method core name for this route is:

- `Loep Cultuurbeeld Methode`
- English working label: `Loep Culture Method`

This is the product method identity.
It is not a claim of external scientific certification.

---

## 3. Canonical Method Sources

### 3.1 Primary method authority

Authoritative design source:

- [2026-05-20-loep-culture-assessment-methodology-authority-system-design.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/superpowers/specs/2026-05-20-loep-culture-assessment-methodology-authority-system-design.md)

Purpose:

- method stance
- domain constructs
- Culture Index philosophy
- valid response policy
- evidence framing
- versioning rules

### 3.2 Canonical benchmark and roadmap controls

Control sources:

- [2026-05-20-loep-culture-assessment-category-capability-benchmark.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/superpowers/specs/2026-05-20-loep-culture-assessment-category-capability-benchmark.md)
- [2026-05-20-loep-culture-assessment-master-roadmap.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/superpowers/plans/2026-05-20-loep-culture-assessment-master-roadmap.md)

Purpose:

- maturity expectations
- launch-criticality
- next artifact sequencing

### 3.3 Canonical implementation source

Execution source:

- [2026-05-20-loep-culture-assessment-methodology-authority-implementation-plan.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/superpowers/plans/2026-05-20-loep-culture-assessment-methodology-authority-implementation-plan.md)

Purpose:

- work package order
- artifact lock paths
- test and contract expectations

### 3.4 Product-side method carriers

Product-side method carriers that must remain aligned with the primary method authority:

- [scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/culture_assessment/scoring.py)
- [definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/culture_assessment/definition.py)
- [report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/culture_assessment/report_content.py)
- [questionnaire.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/culture_assessment/questionnaire.ts)
- [contract.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/culture_assessment/contract.ts)
- [definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/culture_assessment/definition.ts)

Purpose:

- questionnaire structure
- scoring logic
- visible contract language
- output-safe method framing

Rule:

- these carriers implement or surface the method
- they do not redefine the method independently

---

## 4. Ownership

Minimum ownership:

- method owner
- product owner
- engineering reviewer
- delivery reviewer

The method owner is responsible for:

- approving method truth
- preventing duplicate method variants
- deciding whether a change is a method version event

---

## 5. Drift Rule

No document, code path, or output layer may:

- redefine the ten domains
- change the Culture Index rule
- change validity rules
- widen claims beyond the method authority

without:

- a documented rationale
- a version note
- a comparability statement
- method owner approval

---

## 6. Approval

Approved when:

- this map points to one primary method authority
- all known product-side carriers are listed
- ownership is explicit
- no parallel method truth remains unexplained

