# Loep Culture Assessment Hierarchy Register

**Date:** 2026-05-20  
**Status:** governed drilldown source-of-truth artifact  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This register defines the bounded hierarchy and segment structure for governed drilldown.

---

## 2. Canonical Levels

Allowed normal drilldown levels:

1. organization
2. business unit
3. approved segment dimension A
4. approved segment dimension B

Not allowed in normal second-wave scope:

- named manager hierarchy
- dynamic local subtrees
- free-form custom segment creation

---

## 3. Segment Dimension Rules

Normal governed scope allows:

- maximum two active segment dimensions
- approved fields only
- metadata completeness check before use

Approved dimension examples may include:

- business unit
- location cluster
- tenure band
- function family

No dimension becomes active by default simply because it exists in raw metadata.

---

## 4. Comparison Rules

Comparison requires:

- both groups meet threshold independently
- comparison is approved for the relevant audience
- comparison does not create de facto ranking behavior

The register distinguishes:

- available layer
- comparable layer

These are not the same state.

---

## 5. Approval

Approved when:

- bounded levels are explicit
- active dimension ceiling is explicit
- comparison rules are explicit
- non-allowed hierarchy behavior is explicit
