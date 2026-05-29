# Loep Culture Assessment Visibility & Entitlement Matrix

**Date:** 2026-05-20  
**Status:** governed drilldown control artifact  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Combined Visibility Rule

A layer is normally visible only if all of the following pass:

1. role identity
2. release entitlement
3. drilldown entitlement
4. threshold pass
5. release approval

---

## 2. Matrix

| Role | Organization layer | Safe segment contrasts | Business-unit layer | HR governed layer | Governed export |
| --- | --- | --- | --- | --- | --- |
| `executive` | yes | yes, if approved | no default browse | no | no |
| `hr_partner` | yes | yes, if approved | yes, where governed | yes | yes, if export-entitled |
| `business_unit_lead` | bounded | bounded relevant scope only | yes, relevant scope only | no | no |
| `manager_limited` | no direct drilldown | no | no | no | no |
| `admin` | operational visibility only | operational visibility only | operational visibility only | operational visibility only | no methodological override |

---

## 3. Notes

- role label alone never unlocks deeper visibility
- export permission is stricter than view permission
- `manager_limited` is excluded from the governed drilldown environment
- `admin` may inspect status, not bypass governance

---

## 4. Approval

Approved when:

- every canonical role has explicit layer behavior
- view vs export distinction is explicit
- `manager_limited` exclusion is explicit
