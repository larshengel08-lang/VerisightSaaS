# Loep Culture Assessment Governed Drilldown & Analysis Environment

**Date:** 2026-05-20  
**Status:** second-wave design spec  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This spec defines the **Governed Drilldown & Analysis Environment** for `Loep Culture Assessment / Loep Cultuurbeeld`.

Its purpose is to turn the route from:

- a board-level baseline with bounded governance controls

into:

- an enterprise-credible drilldown environment for HR and governed sponsor roles
- a contrast and segmentation layer that remains thresholded, role-safe, and release-controlled
- a deeper analysis surface that does not collapse into a free-form analytics sandbox

This spec must answer:

- which hierarchy and segment layers may exist
- who may see which layer
- when a layer is shown, suppressed, merged, or not comparable
- how deeper outputs differ from executive outputs
- how export entitlements stay narrower than curiosity or role labels
- how hidden layers are explained without leaking unsafe detail

---

## 2. Strategic Role

Inside the operating system, this stream exists because premium board output alone is not enough to feel enterprise-grade.

Without governed drilldown, the route risks becoming:

- strong in the boardroom but too shallow for serious HR follow-through
- methodically disciplined but operationally weak in larger organizations
- commercially attractive but not credible in heavier governance contexts

This stream therefore adds:

- governed depth
- safe contrast reading
- release-controlled HR analysis
- explicit reasons for visibility and non-visibility

without becoming:

- a self-serve analyst platform
- a manager ranking environment
- an unrestricted local dashboard stack

---

## 3. Core Principle

The drilldown environment follows one rule:

> No deeper layer may be shown unless hierarchy, threshold, entitlement, and release conditions all pass at the same time.

This means:

- a closed campaign is not automatically fully drilldown-visible
- a safe organization-level read does not imply safe local visibility
- a role label alone does not unlock deeper layers
- HR depth is governed, not assumed
- exports are stricter than views

---

## 4. Environment Stance

The route is designed as:

- one governed analysis environment tied to the annual baseline
- one bounded deeper layer for HR and explicit sponsor roles
- one controlled segment contrast surface
- one explicit suppression and hidden-reason model

The route is not designed as:

- a continuous people analytics workspace
- a self-serve custom slicing environment
- a live team leaderboard
- a broad manager dashboard estate

---

## 5. Canonical Drilldown Layers

The environment contains five canonical layers.

### 5.1 Organization layer

Purpose:

- the primary released read for board and executive users

Includes:

- response basis and coverage
- Loep Culture Index
- domain picture
- board attention points
- safe organization-level patterns

### 5.2 Governed segment layer

Purpose:

- compare safe aggregate segment views where release and threshold rules allow

Includes:

- safe segment response basis
- domain contrasts
- contrast strength labels
- hidden or suppressed segment reasons

### 5.3 Governed business-unit layer

Purpose:

- allow bounded relevant read for business-unit leadership where explicitly entitled

Includes:

- aggregate results for the user's governed scope
- no unrestricted comparison browsing
- no export backdoor to deeper HR views

### 5.4 HR governed analysis layer

Purpose:

- give HR a deeper but still bounded environment for segment contrast, hidden-layer review, and release-safe interpretation

Includes:

- thresholded segment view
- release status and hidden-reason model
- export entitlement status
- governed follow-up cues

### 5.5 Cascade-safe manager layer

Purpose:

- support bounded communication only

Includes:

- what the organization-level read means
- what may safely be discussed locally
- what may not be inferred

Does not include:

- free-form manager analytics
- local rankings
- hidden threshold exceptions

---

## 6. Hierarchy and Segment Model

The environment must define one bounded hierarchy model.

### 6.1 Canonical hierarchy levels

Allowed hierarchy levels:

1. organization
2. business unit
3. optional approved segment dimension A
4. optional approved segment dimension B

For V1 and early second-wave maturity:

- no more than two active segment dimensions should drive normal drilldown
- no default named manager hierarchy should exist
- no dynamic hierarchy creation is allowed

### 6.2 Segment eligibility

A segment may only appear if:

- the segmentation field is approved in campaign setup
- metadata quality is sufficient
- minimum-n threshold is met
- release owner permits the layer
- the segment does not create obvious identifiability risk

### 6.3 Comparison eligibility

A comparison is only allowed when:

- both compared groups independently meet threshold
- the contrast is methodologically interpretable
- the audience role is allowed to see the comparison
- comparison does not create de facto ranking behavior

The environment must treat "available" and "comparable" as separate states.

---

## 7. Visibility and Permission Model

This spec builds on the `Admin & Access Control Note` and must remain consistent with it.

### 7.1 Canonical visibility rule

Every visible layer must satisfy:

1. role identity
2. release entitlement
3. drilldown entitlement
4. threshold pass
5. release approval

If any one of these fails, the layer is not shown as normal output.

### 7.2 Canonical role behavior

`executive`

- may see organization layer
- may see safe segment contrasts where enabled and approved
- may not browse HR governed deepening as a sandbox

`hr_partner`

- may see governed deepening where release and package allow
- may access HR appendix and governed segment summary where entitled
- may not bypass suppression or hidden-layer rules

`business_unit_lead`

- may see bounded aggregate view for the approved relevant scope
- may not gain unrestricted cross-unit contrast browsing

`manager_limited`

- may receive cascade-safe interpretation only
- may not access the governed drilldown environment

`admin`

- may inspect release and entitlement state
- may not use admin posture as a content-governance override

---

## 8. Suppression, Merge, and Hidden-Layer Rules

The environment must treat hidden layers as a first-class governed outcome.

### 8.1 Suppression rule

A layer is suppressed when:

- minimum-n fails
- identifiability risk remains too high
- release approval is not granted
- the package does not include the governed layer

### 8.2 Merge rule

If a layer is not safe on its own but can be safely interpreted only as part of a broader parent layer, the environment may:

- merge upward into the parent interpretation layer

The environment may not:

- simulate visibility with a thinly disguised unsafe subgroup

### 8.3 Hidden reasons

Every hidden layer must map to one canonical reason.

Allowed reason types:

- `below_threshold`
- `not_released`
- `not_entitled`
- `package_not_included`
- `unsafe_to_compare`
- `metadata_incomplete`

The environment must never describe a hidden reason in a way that reveals unsafe local detail.

### 8.4 Why-hidden model

The product must be able to say, in plain language:

- why the layer is not shown
- whether the blocker is threshold, entitlement, release, comparison safety, or package scope
- what can be done next, if anything, without implying governance can simply be bypassed

---

## 9. Export Entitlement Model

Exports must remain narrower than on-screen visibility.

### 9.1 Always forbidden

- respondent-level export
- raw local score export below threshold
- manager-limited export of drilldown layers
- export of hidden suppressed layer data

### 9.2 Governed only

- segment summary export
- HR appendix export
- governed comparison summary

### 9.3 Export approval conditions

An export may only occur if:

- the layer is already release-safe
- the role is export-entitled
- the route package includes the governed output
- governance owner or delegated approval path exists

The route must define:

- who may download
- who may approve
- who may review disputes about hidden or denied export

---

## 10. Contrast and Interpretation Rules

The environment exists to support governed interpretation, not score hunting.

### 10.1 Allowed interpretation forms

- domain contrasts
- response basis differences
- contrast-strength labels
- safe recurring pattern observations
- thresholded hidden-layer explanation

### 10.2 Forbidden interpretation forms

- manager ranking
- team league tables
- local blame narratives
- causal diagnosis
- performance inference
- health-score framing

### 10.3 Contrast language

Contrast wording must stay descriptive, for example:

- "this contrast is visible at aggregate level"
- "this layer is not shown because release conditions are not met"
- "this difference suggests an area for governed follow-up"

It may not say:

- "this manager underperforms"
- "this team is the problem"
- "this proves the cause"

---

## 11. HR Governed Analysis Environment

The HR layer must feel deeper without behaving like an unbounded analytics tool.

It must provide:

- safe segment layer overview
- suppression and hidden-reason visibility
- governed comparison summary
- export entitlement status
- follow-up boundaries and escalation cues

It must not provide:

- infinite slicing
- free-form query behavior
- silent hidden-layer overrides
- raw quote browsing

---

## 12. Enterprise and MKB Deployment Profiles

The drilldown logic remains one product logic across profiles.

### 12.1 Enterprise profile

May include:

- deeper approved segment layers
- HR governed deepening
- governed segment export
- more explicit business-unit scope

### 12.2 MKB profile

Primary value remains:

- organization-level read first

Boundaries:

- fewer active segment layers
- no default named manager layer
- no deep team comparison by default
- drilldown remains governed rather than analyst-led

This is not a lite product.
It is the same core governance logic with shallower default depth.

---

## 13. Ownership and Approval

At minimum, the drilldown environment must define:

- governance owner
- release owner
- HR visibility approver
- export approver
- suppression dispute owner

Approval logic must be explicit for:

- normal release
- deeper HR visibility
- segment summary export
- denied visibility explanation

---

## 14. Acceptance Criteria

This spec is complete only when:

1. the canonical drilldown layers are explicit
2. the hierarchy and segment model are explicit
3. comparison eligibility is explicit
4. visibility and permission logic are explicit
5. suppression, merge, and hidden-reason rules are explicit
6. export entitlement logic is explicit
7. contrast language boundaries are explicit
8. HR governed analysis scope is explicit
9. enterprise and MKB profile differences are explicit without separate product logic
10. the next implementation plan can execute this stream without inventing new governance logic

---

## 15. Out of Scope

This spec does not:

- create a self-serve analyst platform
- create benchmark comparisons
- define open-comment intelligence in full
- create a manager dashboard system
- introduce Pulse runtime or action-workflow tooling
- define broad suite-wide RBAC beyond this route's governed needs

Those belong to adjacent second-wave or later-wave specs.

---

## 16. Immediate Next Step

After this spec is approved, the next required artifact should be:

- a `Governed Drilldown & Analysis Environment` implementation plan

That plan must define:

- the bounded hierarchy register
- visibility and entitlement control artifacts
- suppression and why-hidden artifacts
- governed export readiness controls
- HR analysis environment readiness controls
- explicit acceptance and ownership for every deeper layer
