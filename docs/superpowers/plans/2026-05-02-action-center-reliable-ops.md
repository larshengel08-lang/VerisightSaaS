# Action Center Reliable Operation Plan

## Objective
Add a small but real operations-readiness slice for Action Center pilots by turning existing telemetry into a bounded health snapshot and documenting first-line recovery order.

## Task 1: Add Action Center ops health summarizer
- Build a helper that summarizes existing suite telemetry rows into:
  - critical event coverage
  - per-event counts
  - latest Action Center evidence

Verification:
- helper test covers missing and present critical events

## Task 2: Extend the admin health review page
- Add a dedicated Action Center pilot-ops section to the existing Verisight admin health surface.
- Keep it compact and operational.

Verification:
- health page test asserts the new section and coverage copy

## Task 3: Add pilot ops runbook
- Write a compact internal runbook that explains:
  - what to check first
  - what critical telemetry evidence means
  - bounded recovery order

Verification:
- runbook exists in repo and matches the implemented health surface

## Task 4: Verify and package
- Run focused tests.
- Run ESLint on touched files.
- Run `npm run build`.
- Commit, push, and open a draft PR.
