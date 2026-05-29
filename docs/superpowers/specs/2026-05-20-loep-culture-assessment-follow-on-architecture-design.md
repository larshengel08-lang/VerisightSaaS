# Loep Culture Assessment Follow-On Architecture

**Date:** 2026-05-20  
**Status:** later-wave design spec  
**Primary scope:** `Loep Culture Assessment / Loep Cultuurbeeld`  
**Canonical route id:** `culture_assessment`

---

## 1. Purpose

This spec defines the **Follow-On Architecture** for `Loep Culture Assessment / Loep Cultuurbeeld`.

Its purpose is to turn the route from:

- a strong annual baseline with bounded second-wave deepening

into:

- a clear post-baseline route system
- a disciplined handoff model to bounded next routes
- an explicit suite relationship with `Pulse`, `RetentieScan`, and `ExitScan`

This spec must answer:

- when the route should lead to no immediate next route
- when deeper governed work is the right next step
- when `Pulse` is justified as a follow-on
- when a buyer or customer should be routed toward another Loep route
- how enterprise and MKB differ in follow-on depth without becoming separate product logic

---

## 2. Strategic Role

Inside the operating system, this stream exists because a premium boardroom assessment should not leave the next route ambiguous.

Without this layer, the product risks becoming:

- strong in baseline value but weak in portfolio leverage
- clear in board-read delivery but inconsistent in next-step advice
- vulnerable to `Pulse` creep as the default continuation

This stream therefore adds:

- deterministic post-baseline route logic
- suite handoff clarity
- bounded continuation rules

without becoming:

- a broad suite redesign
- a generic lifecycle survey platform
- a benchmark-led expansion machine

---

## 3. Core Principle

The follow-on architecture follows one rule:

> No next route should open unless the baseline has created a clear, governance-safe reason for that route.

This means:

- no automatic `Pulse` continuation
- no route switching just because a customer wants "more data"
- no follow-on advice that bypasses threshold, release, or interpretation quality

---

## 4. Architecture Stance

The route treats follow-on as:

- one explicit post-baseline decision layer
- one bounded choice between no immediate next route, deeper governed work, or a defined next route
- one portfolio logic that keeps `Loep Culture Assessment` primary for broad annual baseline use

The route does not treat follow-on as:

- an endless measurement ladder
- default transition into `Pulse`
- generic upsell logic

---

## 5. Canonical Follow-On Outcomes

The route contains four canonical outcomes after the baseline.

### 5.1 No immediate next route

Use when:

- the board-read and HR interpretation are sufficient for now
- there is no bounded reason to re-measure
- governance-safe action can proceed without another route

### 5.2 Deeper governed work

Use when:

- the organization needs more governed interpretation, alignment, or bounded follow-up without opening another measurement route
- HR and sponsors need time to structure next steps before deciding on re-measurement

### 5.3 Pulse follow-on

Use only when:

- the deterministic Pulse eligibility rule passes
- the baseline has surfaced one bounded theme worth structured re-checking
- the route remains explicitly follow-on, not a substitute for the annual baseline

### 5.4 Another Loep route

Use when:

- the baseline reveals that the next useful question is no longer broad culture and engagement, but a narrower route question

Possible adjacent routes:

- `RetentieScan`
- `ExitScan`

This handoff must remain question-led, not SKU-led.

---

## 6. Baseline-to-Pulse Rule

`Pulse` remains a bounded follow-on route only.

### 6.1 Deterministic Pulse rule

`Pulse` may open only if:

- baseline board-read completed
- selected theme is bounded
- owner is assigned
- review question is specific
- measurement cadence is justified
- no unresolved release or governance dispute remains
- `Pulse` is not being used to compensate for unclear baseline interpretation

### 6.2 Pulse may not open when

- the organization wants a generic "next measurement" without a bounded question
- the baseline interpretation is still disputed
- governance or release logic remains unresolved
- the buyer is using `Pulse` as a substitute for the annual baseline

---

## 7. Suite Relationship Rules

### 7.1 Culture Assessment

Remains the primary route when the question is:

- broad annual culture and engagement baseline
- board-level and HR-level organization read
- multi-domain culture picture

### 7.2 RetentieScan

Becomes the better next route when the question shifts to:

- active-population retention pressure
- earlier verification around stay/leave pressure
- narrower retention-focused follow-up beyond the broad baseline

`RetentieScan` must not be framed as a default next step after every baseline.

### 7.3 ExitScan

Becomes the better next route when the question shifts to:

- departure patterns
- retrospective leaving context
- more explicit exit-informed work beyond broad culture baseline reading

`ExitScan` must not be framed as a default next step after every baseline.

### 7.4 Pulse

Remains:

- follow-on only

It must not become:

- the main identity of `Loep Culture Assessment`
- the implied route after every board-read

---

## 8. Route Selection Logic

The route must use one bounded selection tree after the baseline.

### 8.1 Step 1

Ask:

- is any next route needed now?

If no:

- choose `no immediate next route`

### 8.2 Step 2

If yes, ask:

- is the need interpretive and governed, or measurement-led?

If interpretive and governed:

- choose `deeper governed work`

### 8.3 Step 3

If measurement-led, ask:

- is the question a bounded re-check of one theme?
- is the question primarily retention-focused?
- is the question primarily departure-focused?

Outcomes:

- bounded re-check -> `Pulse` only if eligibility passes
- retention-focused -> `RetentieScan`
- departure-focused -> `ExitScan`

If none fit:

- do not force a next route

---

## 9. Enterprise and MKB Profiles

The same follow-on logic applies across profiles.

### 9.1 Enterprise profile

May include:

- stronger governed work before route switching
- more explicit route decision framing across business-unit complexity
- later, more structured `Pulse` use where justified

### 9.2 MKB profile

Primary value remains:

- executive and HR clarity first

Boundaries:

- fewer route branches in normal use
- simpler no-route / governed-work / Pulse decision logic
- no lighter product identity, only shallower route complexity

---

## 10. Ownership and Approval

At minimum, the follow-on architecture must define:

- route owner
- governance owner
- board-read facilitator
- follow-on decision approver

Approval must be explicit for:

- any Pulse handoff
- any route switch to `RetentieScan` or `ExitScan`
- any statement that no immediate next route is the correct decision

---

## 11. Acceptance Criteria

This spec is complete only when:

1. canonical post-baseline outcomes are explicit
2. baseline-to-Pulse rule is explicit
3. suite relationship rules are explicit
4. route selection logic is explicit
5. enterprise and MKB profile differences are explicit without separate product logic
6. ownership and approval logic are explicit
7. the next implementation plan can execute the stream without inventing portfolio logic from scratch

---

## 12. Out of Scope

This spec does not:

- redesign the whole Loep suite
- create a lifecycle survey platform
- create benchmark-driven route logic
- redefine `Pulse` as baseline runtime
- create generic commercial upsell logic disconnected from route fit

Those belong outside this stream.

---

## 13. Immediate Next Step

After this spec is approved, the next required artifact should be:

- a `Follow-On Architecture` implementation plan

That plan must define:

- follow-on decision artifacts
- suite handoff notes
- Pulse handoff controls
- no-next-route guardrails
- route-switch approval controls
