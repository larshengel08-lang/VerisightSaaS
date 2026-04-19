# Report Architecture Policy

## Status

Verisight Report Architecture v3 is the default Verisight management report architecture.

This policy is leading for Verisight management reports and should be reused across future Verisight management reports where product logic allows, including TeamScan, Onboarding 30-60-90, Pulse, and Leadership Scan.

## Current Implementation Status

### ExitScan

ExitScan is the first fully migrated recipe.

It is the active baseline for the embedded v3 implementation.

That means:

- ExitScan is the leading embedded implementation reference in the reporting system
- future embedded refinements should align to the ExitScan structure unless product logic clearly requires otherwise
- older Exit report flows are no longer the active baseline

### RetentieScan

RetentieScan is not yet migrated to the new embedded architecture.

It remains on the current flow temporarily.

Future migration should inherit the shared reporting grammar where product logic allows.

That means:

- RetentieScan keeps its current temporary flow until its embedded migration is done explicitly
- RetentieScan should not be treated as the leading structural baseline while that migration is still open
- when migrated, it should reuse the same shared reporting grammar where its product logic supports that

### Shared Grammar To Keep Reusable

The following reporting grammar should remain shared across products where product logic allows:

- cover
- response / read quality layer
- handoff
- drivers / priorities
- route / action
- method / leeswijzer
- technical appendix

## Default Reporting Grammar

Where product logic allows, Verisight management reports use this default grammar:

1. Executive summary
2. Bestuurlijke handoff
3. Drivers / prioriteitenbeeld
4. Kernsignalen in samenhang
5. Eerste route / managementactie
6. Compact method guide
7. Appendices when needed

Appendix handling follows the same architecture rule:

- `A1 Segmentanalyse` is conditional by n-threshold.
- `B1 Technische verantwoording` is always present.

## Decision Rule

The v3 architecture is the primary source of truth for reporting.

That means:

- v3 overrules older report structures when they conflict
- v2 spread-out page logic must not be reintroduced
- technical accountability does not move back into the main flow
- segment analysis does not move back into the main flow
- exposure is never structurally central

## Reuse Across The Portfolio

Future reports do not need to have identical content, but they should reuse the v3 reporting grammar where product logic allows.

The reusable defaults are:

- executive summary
- bestuurlijke handoff
- drivers / priorities
- core signal synthesis
- route / action
- compact method guide
- appendices only when justified

## Deviation Rule

Deviations from v3 must be explicit and justified.

A valid deviation must state:

1. which page or module deviates
2. why product logic requires the deviation
3. why reuse of the default v3 grammar was not sufficient
4. why management readability remains intact

Implicit improvisation is not allowed.

## Precedence Rule

Shared visual language and management readability take precedence over product-specific improvisation.

This includes:

- the same page hierarchy
- the same density discipline
- the same chart discipline
- the same appendix separation
- the same management readability standard

## Implementation Rule

The reporting system should be implemented as a reusable scene / page / fallback framework.

ExitScan and RetentieScan are the first required implementations.
Future products should plug into the same grammar through product-specific content and logic, not through ad hoc page invention.
