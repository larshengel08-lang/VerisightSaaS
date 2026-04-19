# Report Visual System V3

## Role

This document translates the approved Verisight Report Architecture v3 into the active reporting visual system for implementation.

It is not a redesign brief.
It is the visual and structural operating contract for Verisight management reports.

## Current Baseline Status

ExitScan is the first fully migrated embedded recipe and therefore the active baseline for the current embedded v3 implementation.

RetentieScan is not yet migrated to that embedded architecture and remains on its current temporary flow until its migration is implemented explicitly.

This means:

- ExitScan is the current structural reference for embedded v3 implementation work
- RetentieScan should not be treated as the leading embedded baseline yet
- future report migrations should inherit the same shared reporting grammar where product logic allows

## Shared Grammar To Preserve

Across products, the following grammar should remain reusable where product logic allows:

- cover
- response / read quality layer
- handoff
- drivers / priorities
- route / action
- method / leeswijzer
- technical appendix

## Main Report Flow

The main report uses exactly six pages:

1. `P1 Executive cover`
2. `P2 Bestuurlijke handoff`
3. `P3 Drivers & prioriteitenbeeld`
4. `P4 Kernsignalen in samenhang`
5. `P5 Eerste route & managementactie`
6. `P6 Compacte methodiek / leeswijzer`

Appendices follow after the main report:

- `A1 Segmentanalyse` only when segment gating allows it
- `B1 Technische verantwoording` always

## Visual Discipline

The v3 visual system preserves the existing Verisight report language:

- high information density without generic dashboard clutter
- compact management readability
- clear spacing and page hierarchy
- disciplined chart use
- product-specific meaning without mixed semantics

## Page Rules

### P1 Executive cover

- logo / product badge top right
- client + period as primary header
- KPI strip as the only numeric overview layer
- exactly three executive cards:
  - wat speelt nu
  - scherpste factor(en)
  - eerste besluit

Forbidden on P1:

- charts
- tables
- band-colored cover backgrounds
- extra explanatory modules

### P2 Bestuurlijke handoff

P2 is a fixed four-block handoff page:

1. Signaal
2. Waarom telt dit
3. Wat eerst doen
4. Wat je hier niet uit moet concluderen

ExitScan may show an exposure card only when the data exists.
Exposure is secondary and may never dominate the page.

### P3 Drivers & prioriteitenbeeld

P3 always contains:

- scatter plot
- factor table
- top-2 factor detail cards

The factor table is mandatory even when the scatter already shows all factors.
Top detail cards are capped at two.

### P4 Kernsignalen in samenhang

P4 is the only five-zone page.
Zones render in this order:

- A + B
- C + D
- E

Conditional rules:

- if ExitScan cofactors are absent, zone B disappears and zone A expands
- if quotes are insufficient, zone D disappears and zone C expands
- if prior signals are absent, zone E disappears

P4 is the only page allowed to hold this density.
Do not spread its zones back out over multiple pages.

### P5 Eerste route & managementactie

P5 combines:

- priority header
- owner / first step / review row
- action cards
- route table

This is the only place where management route ownership is explicit.

### P6 Compacte methodiek / leeswijzer

P6 is compact by design.
It contains:

- score explanation
- what the product is
- what the product is not for
- privacy thresholds
- reporting boundaries
- contact

Technical accountability does not live here.
That belongs in `B1`.

## Appendix Rules

### A1 Segmentanalyse

- never in the main flow
- only visible when the segment threshold rule is satisfied
- when hidden, no placeholder page is added

### B1 Technische verantwoording

- always present
- contains factor weights, SDT explanation, score method, and band definitions
- remains structurally separate from P6

## Breaking v2-to-v3 Rules

v3 explicitly removes or relocates these v2 behaviors:

- no standalone verification page
- no standalone quotes page
- no standalone signal/gauge page
- no standalone segment page in the main report
- no technical accountability inside the main method page
- no duplicated owner / first step on the handoff page

## Guardrails

The following remain mandatory:

- do not mix ExitScan and RetentieScan semantics
- do not add placeholder copy for missing data
- do not invent new page types outside the v3 architecture
- do not reintroduce v2 spread-out logic
- do not make exposure structurally central
- do not move segment analysis into the main flow
- do not move technical accountability into the main flow

## Future Reuse

This visual system becomes the default reporting grammar for future Verisight management reports where product logic allows.

The future product should adapt the content semantics, not the page grammar, unless a justified deviation is explicitly approved.
