# Plan: Action Center UX-Volwassenheid

## Objective
Make the existing Action Center runtime feel calmer and more intentional by improving state readability, empty-state meaning, and route-summary clarity without changing core truth or flow semantics.

## Scope

In scope:

- Action Center preview/detail rendering
- route summary copy and section empty states
- tests covering preview render output and route shell expectations

Out of scope:

- new statuses
- new APIs or schema work
- governance logic
- scan-to-route bridge changes

## Steps

1. Inspect the current preview surface and identify the route phases that still read as accidental emptiness or internal scaffolding.
2. Update preview rendering so route summary and section copy better distinguish:
   - awaiting first move
   - bounded small route
   - active action route
   - closed historical route
3. Tighten copy around historical and followed-up routes so they read as intentionally completed.
4. Add or update focused render/shell tests that assert the new UX contract without widening semantics.
5. Run targeted tests, lint, and build.
6. Commit, push, open draft PR, and merge when clean.

## Verification

- targeted Vitest for preview/render/shell coverage
- `eslint` on touched files
- `npm run build`

## Done When

- the Action Center preview feels more phase-aware and less accidentally empty
- closed and quiet states read intentionally
- no truth/model changes were required
- verification is green
