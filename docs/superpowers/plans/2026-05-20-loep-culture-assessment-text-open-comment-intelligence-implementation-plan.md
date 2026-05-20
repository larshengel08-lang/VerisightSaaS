# Loep Culture Assessment Text & Open Comment Intelligence Implementation Plan

**Date:** 2026-05-20  
**Status:** second-wave implementation plan  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This plan translates the `Text & Open Comment Intelligence` spec into a bounded execution sequence.

Its purpose is to make the route's text layer:

- threshold-controlled
- cluster-first
- role-safe
- suppression-safe
- interpretation-bounded

without becoming a raw comment or AI-summary product.

---

## 2. Execution Rules

1. no text output appears before safe threshold and release conditions pass
2. cluster logic comes before summary logic
3. executive and manager layers must stay stricter than HR governed depth
4. quote policy defaults to no live client quotes
5. text may strengthen context, but never serve as causal proof

---

## 3. Work Package Sequence

### WP1 - Text Threshold and Eligibility Lock

Goal:

- define when text is eligible for governed use at all

Deliverables:

- text threshold note
- audience eligibility note
- no-text outcome rule

Dependencies:

- approved text/open-comment spec
- governed drilldown implementation plan

Acceptance:

- minimum text threshold is explicit
- audience eligibility is explicit
- no-text outcome is defined as a safe normal outcome

### WP2 - Cluster Control Lock

Goal:

- define the canonical structure of text themes

Deliverables:

- cluster register
- cluster confidence rule
- cluster audience map

Dependencies:

- WP1
- methodology authority implementation plan

Acceptance:

- every cluster has label, inclusion rule, minimum size, audience eligibility, and confidence label
- clusters remain descriptive rather than causal

### WP3 - Sensitive Content and Quote Policy Lock

Goal:

- make text safety explicit before summaries are allowed

Deliverables:

- sensitive-content suppression note
- quote policy note
- denied-text reason model

Dependencies:

- WP1
- trust/procurement implementation plan

Acceptance:

- prohibited content classes are explicit
- quote policy is explicit
- denied-text outcomes can be explained without leaking detail

### WP4 - Role-Safe Summary Control

Goal:

- define what each audience may receive

Deliverables:

- executive summary rules
- HR summary rules
- cascade-safe wording rules

Dependencies:

- WP2
- WP3

Acceptance:

- executive layer gets only bounded cluster context
- HR layer may deepen within governance
- manager layer never becomes a raw text or blame layer

### WP5 - Text Release and Readiness Review

Goal:

- confirm the text layer can be activated without destabilizing governance

Deliverables:

- text release control note
- text readiness review
- unresolved risk note

Dependencies:

- WP4
- governed drilldown readiness review

Acceptance:

- text release remains stricter than simple survey release
- unresolved risks are explicit
- the stream clearly unlocks `Action & Follow-through System`

---

## 3.1 Artifact Lock Table

| WP | Required artifact path | Format | Owner | Reviewer | Acceptance method |
| --- | --- | --- | --- | --- | --- |
| WP1 | `docs/superpowers/text/culture_assessment_text_threshold_eligibility.md` | markdown | text governance owner | product owner | threshold review |
| WP2 | `docs/superpowers/text/culture_assessment_cluster_register.md` | markdown | text governance owner | method reviewer | cluster review |
| WP3 | `docs/superpowers/text/culture_assessment_sensitive_content_quote_policy.md` | markdown | text governance owner | trust reviewer | safety review |
| WP4 | `docs/superpowers/text/culture_assessment_role_safe_summary_rules.md` | markdown | text governance owner | delivery reviewer | summary review |
| WP5 | `docs/superpowers/text/culture_assessment_text_readiness_review.md` | markdown | text governance owner | route owner | readiness review |

---

## 4. Cross-Artifact Dependencies

This plan must stay aligned with:

- governed drilldown implementation plan
- methodology authority implementation plan
- enterprise trust/procurement implementation plan
- admin and access control note

It directly supports:

- `Action & Follow-through System`
- later benchmark-readiness quality
- stronger enterprise maturity claims

---

## 5. Approval

At minimum, this plan requires:

- text governance owner
- product owner
- method reviewer
- trust reviewer
- delivery reviewer

---

## 6. Done-When

This implementation plan is complete only when:

1. text threshold and eligibility are explicit
2. cluster logic is explicit
3. sensitive-content and quote policy are explicit
4. role-safe summary rules are explicit
5. the readiness review identifies what is safely usable and what remains later-wave
