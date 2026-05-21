# Action Center Enterprise Roadmap

## 1. Purpose

This roadmap defines the full follow-on route for **Action Center as an enterprise-worthy bounded execution layer inside Loep**.

Its purpose is to stop working through disconnected micro-waves and instead make the next major product steps explicit in advance:

- which large batches follow
- what each batch must deliver
- which non-goals remain fixed
- which gates must be passed before the next batch starts
- how Action Center development connects to `ExitScan` and `RetentieScan`

This roadmap is a steering document. It is not a design spec and not an implementation plan.

## 2. Current Position

Loep now has a strong bounded foundation for Action Center.

What already exists:

- route truth remains canonical
- Action Center is the canonical follow-through surface
- action cards exist inside routes
- managers can create and review route-bound actions
- HR governs rhythm, oversight, closeout, and continuation
- governance signals exist for execution gaps, sprawl, stuck actions, and repeated no-progress loops
- adoption measurement readiness exists
- approved route families remain bounded to `exit` and `retention`

What is still incomplete:

- repeated-use manager execution quality
- deeper HR readback and operating control
- broader measurement surfaces and proof readiness
- buyer-safe packaging and rollout framing
- controlled route expansion logic

## 3. Product Principles

These principles apply to every future batch.

Action Center remains:

- embedded inside Loep
- route-bound
- bounded to approved route families
- HR-governed
- manager-light
- post-scan follow-through only
- canonical inside Action Center

Action Center does not become:

- a standalone product
- a third first-buy route
- generic workflow software
- a broad action or project management platform
- advisory tooling
- an HR operating system
- a personnel dossier or employee risk ledger
- a task board
- a broad collaboration system

## 4. End State

The target end state is an Action Center that feels enterprise-worthy while staying smaller, sharper, and more governed than generic employee-experience suites.

In that state:

- managers can create, review, and adjust a small set of route-bound actions
- HR governs rhythm, oversight, continuation, and closeout
- metrics show whether follow-through happened and how it progressed, without claiming causal intervention impact
- buyers can quickly understand that this is not project management, employee monitoring, or case management
- only route families with explicit activation gates may carry this model

## 5. Batch Overview

### Batch A - Productization of Execution

**Goal:** turn the current manager action-card model into an enterprise-worthy execution layer.

**Core scope:**

- action contract
- action lifecycle and transition truth
- draft / invalid / HR-review flow
- route-to-action policy
- manager create / update / review experience
- parallel route-track hardening for `ExitScan` and `RetentieScan`

**Gate to Batch B:**

- Action Center no longer feels like a capability-set
- managers can use bounded execution with low friction
- `ExitScan` and `RetentieScan` are product-wise more clearly differentiated

### Batch B - Governance + Proof

**Goal:** make the execution layer governable and measurable.

**Core scope:**

- HR control and readback on action execution
- governance queues and intervention logic
- measurement surfaces on top of bounded execution events
- buyer-safe reporting vocabulary
- proof readiness for live route usage

**Gate to Batch C:**

- HR can track execution quality at scale
- metrics are stable and interpretable
- internal teams can clearly explain what the metrics do and do not prove

### Batch C - Buyer Readiness + Controlled Scale

**Goal:** make Action Center enterprise-buyable and only then evaluate controlled expansion.

**Core scope:**

- buyer-safe governance framing
- rollout and operating materials
- route-fit logic
- activation gates for any later route-family expansion
- suite-convergence decisions

**Gate to any later expansion:**

- the buyer story is strong and bounded
- governance remains defensible
- route expansion is justified route-by-route, not by portfolio pressure

## 6. Batch Detail

### Batch A

**Goal**

Land Action Center as a serious execution product instead of a partially-finished operational layer.

**Primary deliverables**

- `Action Center Manager Execution Productization` spec
- implementation plan for manager execution productization
- `ExitScan Differentiation Hardening` spec
- `RetentieScan Evidence + Confidence Hardening` spec
- finalized action-card contract
- finalized action transition truth
- draft / invalid / HR-review behavior
- route-to-action policy
- compact manager execution UX
- bounded evidence UX contract

**Non-goals**

- no new route families
- no analytics expansion as the main focus
- no buyer packaging as the main focus
- no workflow broadening

**Batch gate**

- the action-card model feels stable
- HR no longer has to resolve core execution ambiguity ad hoc
- managers can use execution flows without high interpretation load

### Batch B

**Goal**

Make Action Center governable and measurable at enterprise operating depth.

**Primary deliverables**

- `Action Center HR Control & Readback` spec
- `Action Center Measurement & Proof` spec
- HR oversight surfaces
- governance intervention logic
- metric surfaces
- route-to-action conversion readback
- action review, completion, stop, and reopen readback
- internal KPI interpretation guide

**Non-goals**

- no causal impact claims
- no broad analytics platform
- no route expansion
- no collaboration-suite behavior

**Batch gate**

- HR can follow the execution layer at scale
- measurement semantics are stable
- reporting language is buyer-safe

### Batch C

**Goal**

Finish the product commercially and strategically without creating scope sprawl.

**Primary deliverables**

- `Action Center Buyer Readiness & Rollout` spec
- governance one-pager
- manager participation one-pager
- privacy / dossier boundary note
- route -> action -> review -> closeout explanation
- route-fit matrix
- activation gate framework

**Non-goals**

- no automatic route expansion
- no generic suite story
- no standalone Action Center packaging
- no broad upsell framing without gates

**Batch gate**

- buyers understand the product quickly and correctly
- any later expansion can be explicitly approved or rejected per route family

## 7. Parallel Route Tracks

Alongside Action Center, two route tracks must move in parallel.

### ExitScan Differentiation

**Goal:** make `ExitScan` read as a clearer, sharper first-buy route.

It must produce:

- stronger management grammar
- clearer differentiation versus `RetentieScan`
- better buyer-safe framing of question, output, and claims

### RetentieScan Evidence + Confidence

**Goal:** make `RetentieScan` buyer-proof as a route for active retention pressure.

It must produce:

- anti-MTO-light positioning
- a stronger confidence architecture
- clearer evidence discipline
- a more compact management read

## 8. Dependencies

- Batch B depends on Batch A because metrics are weak without a stable execution model
- Batch C depends on Batch B because buyer readiness is weak without governance and readback maturity
- `ExitScan` and `RetentieScan` must reach sufficient product clarity before late Batch B, otherwise the buyer story remains uneven
- route expansion may only be evaluated after the Batch C gate

## 9. Decision Gates And Stop Rules

The following stop rules remain in force:

- no new route families before Batch C
- no off-platform canonical writes
- no broad workflow automation
- no manager dashboard expansion as a standalone product goal
- no buyer claims beyond measurement readiness without live evidence
- no expansion purely because the portfolio should look broader

## 10. Document Map

The following documents should sit under this roadmap:

- Batch A spec
- Batch B spec
- Batch C spec
- implementation plans per batch
- `ExitScan` hardening spec
- `RetentieScan` hardening spec
- governance notes
- buyer artifacts
- route-fit and activation-gate documents

## 11. Sequencing

Recommended order:

1. Batch A
2. Batch B
3. Batch C

Parallel tracks:

- `ExitScan` hardening
- `RetentieScan` hardening

## 12. Success Definition

This roadmap is successful when:

- Action Center is enterprise-worthy without becoming generic
- managers can use bounded execution calmly and repeatedly
- HR can govern the follow-through layer at operating depth
- metrics show operating quality without over-claiming proof
- buyers quickly understand what Action Center is and is not
- Loep can make controlled, explicit decisions about which route families may later carry this model
