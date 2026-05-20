# Loep Culture Assessment Admin & Access Control Note

**Date:** 2026-05-20  
**Status:** first-wave governed control note  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This note defines the minimum **Admin & Access Control** model for `Loep Culture Assessment / Loep Cultuurbeeld`.

It exists to make the route's access posture explicit across:

- product behavior
- governed exports
- result release
- buyer trust explanation
- pilot operation

This note is intentionally bounded.
It does not design a broad enterprise permissions platform.

### 1.1 Control ownership

This note is a launch-critical control artifact.

Minimum ownership must be explicit for:

- route owner
- governance owner
- release approver
- governed export approver
- HR visibility approver

This note must be reviewed before:

- Premium WP5
- Trust WP3
- Listening WP5

---

## 2. Core Control Principle

The route follows one access rule:

> No role may see more than the methodology, threshold rules, and governance model safely allow.

This means:

- closed baseline does not equal full access
- managerial curiosity does not override governance
- export access is stricter than dashboard curiosity
- deeper layers require explicit entitlement and release ownership

---

## 3. Canonical Roles

The route uses five canonical roles.

### 3.1 `executive`

May:

- view executive overview
- view Loep Culture Index
- view board attention points
- view safe organization-level results
- view safe segment contrasts where enabled and allowed

May not:

- download respondent-level data
- unlock named manager layer
- bypass suppressed layers

### 3.2 `hr_partner`

May:

- view executive layer
- view governed HR deepening where thresholds and package allow
- access HR appendix
- access safe governed segment summary export when entitled

May not:

- export respondent-level data
- bypass threshold or release logic
- unlock named manager layer by default

### 3.3 `business_unit_lead`

May:

- view bounded relevant aggregate results where governance allows
- receive safe business-unit-level interpretation

May not:

- access unrestricted HR layer
- access unsafe segment exports
- see suppressed local layers

### 3.4 `manager_limited`

May:

- receive bounded cascade-safe communication where explicitly allowed

May not:

- access governed segment summary export
- see local scores below threshold
- compare teams as ranking
- see named manager layer

### 3.5 `admin`

May:

- manage bounded configuration
- inspect release and export status
- maintain campaign operational metadata

May not:

- treat admin access as methodological override
- bypass release ownership without explicit authority model

---

## 4. Entitlement Layers

The route must distinguish between:

1. role identity
2. release entitlement
3. export entitlement
4. governed drilldown entitlement

No one gets deeper access by role label alone if release and governance conditions are not satisfied.

---

## 5. Release Permissions

Release permissions must define:

- who can mark a baseline as releasable
- who can confirm thresholds are satisfied
- who can approve governed deeper layers
- who owns suppression disputes

Minimum V1 control bar:

- one release owner
- one delivery owner
- one governance approver for deeper outputs

---

## 6. Export Permissions

The route must define export permissions separately from view permissions.

### 6.1 Always forbidden

- respondent-level export
- unsafe local export below threshold
- manager-limited export of governed segment layers

### 6.2 Governed only

- segment summary export
- HR appendix export where applicable

### 6.3 Operationally visible

- export status
- release status
- suppression reason

---

## 7. Manager-Limited Restrictions

The `manager_limited` role is explicitly bounded.

It must never:

- receive ranking behavior
- receive named manager comparisons
- see unsafe local scores
- use exports as backdoor drilldown
- become a proxy for performance management

If a cascade artifact exists, it is communication support, not analytic access.

---

## 8. Audit and Release Ownership

The route must maintain clear ownership for:

- release decision
- governed export approval
- threshold exception handling
- suppression challenge handling

V1 does not require a full audit platform.
It does require that ownership is explicit and reviewable.

At minimum, the route must name:

- who may approve release
- who may approve segment summary export download
- who may approve HR appendix visibility
- who owns audit and release review

---

## 9. Buyer-Facing Explanation

The access model must be explainable in plain language:

- executives see the board-level read
- HR may see governed deeper outputs where allowed
- managers do not get free-form local analytics
- exports are limited and governed
- hidden layers stay hidden for methodological and privacy reasons

---

## 10. Acceptance Criteria

This note is complete only when:

1. canonical roles are explicit
2. entitlement layers are explicit
3. release permissions are explicit
4. export permissions are explicit
5. manager-limited restrictions are explicit
6. audit and release ownership are explicit
7. the trust spec and the product route can point to the same access story

---

## 11. Out of Scope

This note does not:

- define a broad SaaS RBAC system
- create complex inheritance rules for the full suite
- introduce self-serve access provisioning
- override route governance
