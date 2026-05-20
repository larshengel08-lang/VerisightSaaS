# Loep Culture Assessment Text & Open Comment Intelligence

**Date:** 2026-05-20  
**Status:** second-wave design spec  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This spec defines the **Text & Open Comment Intelligence** layer for `Loep Culture Assessment / Loep Cultuurbeeld`.

Its purpose is to turn open comments from:

- a bounded but still fragile qualitative source

into:

- a governed context layer that can support executive, HR, and cascade interpretation
- a safe clustering and summary layer that avoids raw-comment theater
- a thresholded text environment that behaves like evidence context, not proof

This spec must answer:

- when open text may be used at all
- how comments are clustered and summarized
- which roles may see which form of text-derived insight
- how sensitive content is suppressed
- what quotes, examples, or themes may never be shown
- how text may support interpretation without becoming causal evidence

---

## 2. Strategic Role

Inside the operating system, this stream exists because enterprise-grade culture and engagement products are expected to say something disciplined about open comments.

Without this layer, the route risks becoming:

- too shallow in qualitative interpretation
- overly dependent on scores and contrasts alone
- operationally cautious but commercially underpowered against stronger market expectations

This stream therefore adds:

- safe clustering
- role-specific summaries
- sensitive-content suppression
- confidence-bounded theme language

without becoming:

- a raw comment browser
- an AI theater layer
- a sentiment machine with unsupported claims

---

## 3. Core Principle

The text layer follows one rule:

> Open comments may contribute context only when clustering, threshold, and sensitivity controls make that context safe enough for the relevant audience.

This means:

- comments are context, not proof
- no raw quote is inherently safe because it exists
- executive visibility is not the same as HR visibility
- unsafe text must disappear cleanly, not half-show

---

## 4. Environment Stance

The route treats open comments as:

- one optional governed layer on top of the baseline
- one clustered and summarized signal family
- one audience-specific interpretation surface

The route does not treat open comments as:

- a comment dump
- a manager feedback mailbox
- a sentiment score engine
- a diagnosis engine

---

## 5. Canonical Text Stages

The text layer contains five canonical stages.

### 5.1 Input stage

Purpose:

- define whether text is present and eligible for governed processing

Checks:

- comments exist
- text collection is in scope
- comment volume is above minimum safe threshold
- processing can occur without violating route boundaries

### 5.2 Safety stage

Purpose:

- remove or suppress unsafe text before any summary layer exists

Checks:

- names or obvious identifiers
- medical or highly sensitive personal disclosures
- incident-specific allegations
- legal or disciplinary details
- uniquely identifying local context

### 5.3 Clustering stage

Purpose:

- convert text into grouped themes rather than raw comment artifacts

Outputs:

- cluster label
- cluster size
- audience eligibility
- confidence label

### 5.4 Summary stage

Purpose:

- produce role-safe text summaries

Outputs:

- executive-safe summary
- HR-safe deeper summary
- optional cascade-safe wording

### 5.5 Release stage

Purpose:

- decide whether any text-derived insight may appear in normal output

Checks:

- threshold passes
- cluster safety passes
- audience entitlement passes
- release approval passes

---

## 6. Threshold and Eligibility Model

Text intelligence must follow a stricter threshold model than raw survey completion.

### 6.1 Minimum text threshold

Open-comment outputs may appear only if:

- text input volume is above the minimum safe cluster threshold
- clustering produces enough safe grouped material to avoid thin inference

### 6.2 Audience eligibility

A text summary may appear only if:

- the audience role is allowed to see that form
- the release is approved for that audience
- the summary does not create local identifiability risk

### 6.3 No-threshold outcome

If the threshold fails:

- no text-derived insight is shown
- the route may explain that open text is not displayed because safe volume or safe clustering was insufficient

---

## 7. Canonical Audience Model

### 7.1 Executive layer

May receive:

- short cluster-level summary
- broad pattern wording
- confidence-bounded contextual themes

May not receive:

- raw quotes
- local complaint detail
- person-level inference

### 7.2 HR governed layer

May receive:

- deeper cluster explanation
- grouped summary themes
- hidden-text reason model

May not receive:

- unsafe raw dump
- thin identifiable subgroup detail

### 7.3 Manager cascade layer

May receive:

- optional safe wording for communication support only

May not receive:

- raw quote content
- attributed complaint language
- local score defense prompts

### 7.4 Sales and demo layer

May receive:

- synthetic or fictive examples only

May not receive:

- real client open text
- pseudo-anonymized raw examples presented as safe by default

---

## 8. Clustering and Theme Model

The route must use deterministic cluster logic at the product level, even if future tooling becomes more advanced.

### 8.1 Cluster requirements

Every cluster must define:

- cluster label
- inclusion rule
- minimum safe cluster size
- audience eligibility
- confidence label

### 8.2 Allowed theme behavior

Themes may:

- summarize recurring context
- strengthen interpretation of already visible quantitative patterns
- indicate where follow-up questions belong

Themes may not:

- declare causality
- assign blame
- imply individual performance diagnosis

### 8.3 Confidence labels

The route may use:

- `low confidence`
- `moderate confidence`
- `high confidence`

These labels describe only:

- the stability and sufficiency of the safe cluster signal

They do not describe:

- truth certainty
- causal certainty
- intervention certainty

---

## 9. Sensitive Content Policy

The route must explicitly suppress:

- names
- personal health details
- uniquely identifying incidents
- legal allegations
- disciplinary cases
- content that could identify a small local subgroup

Allowed visible output should prefer:

- synthesized cluster language
- generalized wording
- safe summary phrases

The route must not show:

- raw quote blocks in executive view
- raw quote blocks in manager-limited view
- text examples that feel anonymous but are still reconstructable

---

## 10. Quote Policy

V1 and early second-wave maturity should strongly prefer **no live client quotes** in normal output.

### 10.1 Default policy

- no raw quotes in executive outputs
- no raw quotes in manager cascade outputs
- no raw quotes in normal governed HR outputs unless future maturity explicitly approves it

### 10.2 Allowed alternatives

Instead of quotes, the product may show:

- cluster labels
- short synthesized summary lines
- "what participants often described" style wording

---

## 11. Interpretation Rules

Text-derived insight may support:

- executive context
- HR deepening
- governed follow-up framing

Text-derived insight may not support:

- causal proof
- sentiment verdicts
- local blame
- manager rating
- individual risk prediction

The route must be able to say:

- "open comments add context to the baseline"
- "these summaries do not prove cause"
- "governance boundaries are part of interpretation quality"

---

## 12. Enterprise and MKB Profiles

The text logic remains one product logic across profiles.

### 12.1 Enterprise profile

May include:

- deeper HR-safe cluster summaries
- more explicit hidden-text reason model
- stronger governed follow-up cues

### 12.2 MKB profile

Primary value remains:

- broad contextual signal at organization level

Boundaries:

- no deep local text surfacing by default
- no manager-layer text depth
- cluster visibility remains strictly governed

---

## 13. Ownership and Approval

At minimum, the text layer must define:

- text governance owner
- release owner
- HR summary approver
- suppression reviewer

Approval must be explicit for:

- whether open text is active in the route
- whether any text summary may render
- whether HR may see deeper text context
- whether a no-text outcome is the correct safe outcome

---

## 14. Acceptance Criteria

This spec is complete only when:

1. the canonical text stages are explicit
2. threshold and audience-eligibility rules are explicit
3. cluster requirements are explicit
4. sensitive-content policy is explicit
5. quote policy is explicit
6. role-safe summary boundaries are explicit
7. interpretation limits are explicit
8. enterprise and MKB profile differences are explicit without separate product logic
9. the next implementation plan can execute the stream without inventing text-governance logic from scratch

---

## 15. Out of Scope

This spec does not:

- create a generic text analytics engine
- create raw quote browsing
- create sentiment scoring claims without method support
- create AI summary marketing theater
- replace the governed drilldown model
- define follow-through workflows

Those belong to adjacent or later streams.

---

## 16. Immediate Next Step

After this spec is approved, the next required artifact should be:

- a `Text & Open Comment Intelligence` implementation plan

That plan must define:

- text threshold controls
- cluster and summary control artifacts
- sensitive-content suppression controls
- quote-policy controls
- role-safe release and readiness artifacts
