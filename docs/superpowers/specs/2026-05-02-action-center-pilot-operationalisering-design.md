# Action Center Pilot Operationalisering

## Status
Proposed

## Intent
This wave makes Action Center more deliverable for real pilot customers without reopening the product model itself.

The goal is not to add new route semantics. The goal is to make the current post-scan follow-through layer easier to:

- onboard
- support
- demo
- gate for pilot go / no-go

---

## 1. Product Boundary

Action Center remains the follow-through layer that starts **after** scan truth.

This wave must not:

- redesign route, closeout, reopen, or follow-up semantics
- add new route workflow
- turn pilot operations into a full CS platform
- create a second admin product next to the existing health review surface

This wave should instead produce a small operational layer that helps Verisight run pilots with less hidden knowledge.

---

## 2. Current Basis

The product already has:

- route opening, assignment, closeout, reopen, follow-up, and lineage truth
- governance and operational hardening from earlier waves
- an admin health surface for suite and Action Center evidence
- existing operating model documents that describe bounded follow-through use

What is still missing is a compact pilot-operating bridge between:

- product truth
- internal support behavior
- pilot go / no-go decisions

---

## 3. Wave Goal

This wave should create three concrete capabilities:

1. a compact Action Center pilot playbook
2. a compact pilot readiness checklist
3. a visible pilot-readiness section inside the existing admin health review surface

Together these should make it easier to answer:

- how do we onboard HR and managers into this flow?
- how do we support the critical Action Center path?
- when is this ready enough for a live pilot customer?

---

## 4. Deliverable 1: Pilot Playbook

The pilot playbook should be a practical operating document, not a concept note.

It should cover:

- what Action Center is in the commercial story
- when it starts in the customer journey
- lightweight HR onboarding
- lightweight manager explanation
- the critical support path around open, action, review, closeout, reopen, and follow-up
- who checks what before and during a pilot

The playbook should explicitly position Action Center as:

> the bounded follow-through layer after a scan

---

## 5. Deliverable 2: Pilot Readiness Checklist

The readiness checklist should be more concrete than the central roadmap exit criteria.

It should provide a small go / no-go gate for first pilots, including:

- critical browser flows
- authority-safe write expectations
- minimum lineage/readback expectations
- minimum support and recovery evidence

This document is not a QA spreadsheet. It is a bounded operational checklist for deciding whether Action Center is ready to be used with a pilot customer.

---

## 6. Deliverable 3: Health Review Readiness Surface

The existing `beheer/health` page should gain a compact pilot-readiness section.

This should not become a new analytics dashboard.

It should simply expose:

- the existence of the pilot playbook
- the existence of the go / no-go checklist
- a concise explanation of the pilot-critical path
- links to the supporting documents

This keeps operational truth close to the same admin surface that already shows Action Center evidence.

---

## 7. UX Shape

The runtime addition should feel like an admin readiness layer, not like a new product feature.

That means:

- compact panels or cards
- short explanatory copy
- direct links to docs
- no forms
- no new write path

---

## 8. Success Criteria

This wave succeeds when:

- an internal operator can explain where Action Center starts in the customer journey
- HR and manager onboarding expectations are written down in a compact reusable format
- support has a single bounded pilot playbook to follow
- the admin health surface makes the pilot operating layer easy to find
- the central roadmap exit criteria become easier to operationalize in practice

---

## 9. Non-Goals

This wave does not:

- certify that every pilot gate is already green
- replace the broader operating model
- replace product verification and regression testing
- create external customer-facing training assets

It only makes the internal pilot operating layer explicit, compact, and reusable.
