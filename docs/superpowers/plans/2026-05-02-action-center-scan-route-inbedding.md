# Plan: Action Center Inbedding in Scan -> Route Flow

## Objective
Make the campaign-detail to Action Center handoff feel like a coherent continuation of the scan route, while preserving the explicit product boundary between reading and follow-through.

## Scope

In scope:

- campaign detail bridge copy and CTA presentation
- Action Center continuity/focus behavior when entered from campaign detail
- shell assertions around the bridge contract

Out of scope:

- new route truth
- new manager actions from campaign detail
- reporting, governance, or ops changes

## Steps

1. Inspect the current campaign detail bridge and identify where the handoff still reads as a generic module link.
2. Update campaign detail bridge presentation so it explains:
   - this page clarifies the signal
   - Action Center opens ownership and follow-through
3. Preserve or improve canonical focus continuity when entering Action Center from campaign detail.
4. Add or tighten shell tests that lock the campaign -> Action Center boundary and continuity language.
5. Run targeted tests, lint, and build.
6. Commit, push, open draft PR, and merge when clean.

## Verification

- targeted Vitest for campaign detail and Action Center shells
- `eslint` on touched files
- `npm run build`

## Done When

- the handoff reads as scan-first, follow-through-second
- the CTA is less generic and more contextual
- Action Center entry preserves continuity
- verification is green
