# Action Center Route Defaults And Suite Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to execute this plan task-by-task. Keep this slice bounded to route eligibility, route defaults, and the first suite-parity unlock only.

**Goal:** Add an explicit route-family eligibility and defaults model for Action Center so ExitScan remains the proven baseline, RetentieScan becomes the first bounded parity unlock, and all other route families stay blocked until separately justified.

**Architecture:** Treat route parity as a contract layer above the existing Action Center core, not as ad hoc `scan_type === 'exit'` checks spread across rhythm, mail, invite, reschedule, and Graph features. Centralize route eligibility, default cadence, escalation, and capability flags in one bounded route-defaults contract, then thread that contract through the existing loaders and review surfaces without widening Action Center semantics for Pulse, Onboarding, or Leadership.

**Tech Stack:** Next.js App Router, TypeScript, React 19, Supabase-backed Action Center data loaders, existing review rhythm / invite / follow-through mail / reschedule / Graph layers, Vitest.

---

## Scope Check

This child plan assumes the following baselines are already live on `main`:

- contextual Action Center deeplinks
- bounded review invite contract + `.ics` rendering
- HR Rhythm Console
- triggered follow-through mail layer
- review reschedule flows
- optional native Outlook / Graph integration

Verify before implementation starts:

- `git merge-base --is-ancestor d84536f0ceaf8bcc9109cc74104d1bfe9c8a3a2e HEAD`
- `git merge-base --is-ancestor fdf8641fc07976b8c653f250291092fde6b756ad HEAD`
- `git merge-base --is-ancestor c0d9653f397ac45ec91a24acefcfa48dc877164b HEAD`
- `git merge-base --is-ancestor d1fc50916867e170a32680b0b34b5fecbb165cde HEAD`

If one of these checks fails, sync the worktree from `main` before writing code.

In scope here:

- explicit route-family eligibility matrix for Action Center follow-through
- shared route-defaults contract for cadence, reminders, escalation, and provider capability flags
- bounded reuse of that contract across rhythm, invite, mail, reschedule, and Graph seams
- first parity unlock for `retention` / `RetentieScan`
- explicit blocking of `pulse`, `onboarding`, and `leadership`

Explicitly out of scope here:

- new Action Center object types
- new buyer-facing packaging surfaces
- new off-platform write paths
- Teams, Slack, or additional channel providers
- parity unlock for Pulse, Onboarding 30-60-90, Leadership Scan, or Combinatie
- broad dashboard redesign or routebeheer redesign

## Product Rules To Preserve

- Action Center remains a shared follow-through layer, not a third product line.
- ExitScan remains the proven live baseline for all existing Action Center semantics.
- RetentieScan is the only route family eligible for the first parity expansion in this slice.
- Pulse and Leadership stay bounded support routes and must not inherit full Action Center parity here.
- Onboarding 30-60-90 stays a bounded peer route and must not silently become a parity carrier here.
- Route defaults may shape cadence, reminders, escalation, and provider eligibility, but may not redefine canonical review truth or ownership truth.
- Existing `.ics` fallback and Graph-optional behavior must remain intact for all in-scope routes.

## Canonical Route Matrix

| Route family | Action Center status after this slice | Notes |
| --- | --- | --- |
| `exit` / ExitScan | full baseline | already live and remains the reference path |
| `retention` / RetentieScan | first bounded parity unlock | may reuse the same follow-through semantics where they fit, but only through explicit defaults |
| `onboarding` / Onboarding 30-60-90 | blocked | remains outside parity until a separate child plan justifies the lifecycle semantics |
| `pulse` / Pulse | blocked | remains bounded support and may not silently inherit review/rhythm parity |
| `leadership` / Leadership Scan | blocked | remains bounded support and may not silently inherit review/rhythm parity |
| `team` / TeamScan | blocked | not a parity candidate in this slice |

Additional rules:

- every Action Center feature gate that currently assumes ExitScan-only must move to a shared route-defaults contract
- parity means “same bounded follow-through semantics with route-specific defaults,” not “every scan type can do everything”
- if a route family is not explicitly enabled by the contract, the system must fail closed

## What Parity Means In This Slice

Parity in this slice means:

- the route family can appear as an eligible carrier for the existing Action Center follow-through layer
- the route family gets explicit defaults for review cadence, reminder governance, escalation expectation, and optional provider eligibility
- the existing reviewmomenten, invite, reminder, reschedule, and Graph seams read from the same route contract instead of bespoke `exit` checks

Parity does **not** mean:

- equal commercial framing to ExitScan
- broad adapter claims
- route-specific custom UX
- new object models or new follow-through states

## File Structure

| File | Responsibility |
| --- | --- |
| `frontend/lib/action-center-route-defaults.ts` | shared route-family contract, eligibility matrix, defaults, and helper predicates |
| `frontend/lib/action-center-route-defaults.test.ts` | contract tests for defaults, inclusion/exclusion, and fail-closed behavior |
| `frontend/lib/action-center-review-rhythm.ts` | consume route defaults instead of hardcoded ExitScan assumptions where cadence defaults belong |
| `frontend/lib/action-center-follow-through-mail-data.ts` | use shared route eligibility when preparing snapshots |
| `frontend/lib/action-center-follow-through-mail-planner.ts` | preserve bounded triggers while respecting route eligibility/defaults |
| `frontend/lib/action-center-graph-calendar.ts` | shift provider eligibility from raw scan-type assumptions to the shared route-defaults contract |
| `frontend/lib/action-center-review-reschedule-data.ts` | reuse shared route eligibility/defaults instead of local `scan_type` branching |
| `frontend/lib/action-center-review-invite.ts` | reuse shared route eligibility/defaults for invite gating where needed |
| `frontend/lib/action-center-page-data.ts` | derive eligible route ids and parity-safe visibility from the shared contract |
| `frontend/app/(dashboard)/action-center/reviewmomenten/page.tsx` | thread server-derived parity-safe eligibility without adding new surface area |
| `frontend/components/dashboard/review-moment-page-client.tsx` | consume parity-safe route ids only through existing props |
| `frontend/components/dashboard/review-moment-detail-panel.tsx` | stay bounded while allowing RetentieScan to reuse eligible controls only where the contract says so |

Do **not** touch:

- `frontend/app/(dashboard)/action-center/page.tsx`
- marketing/pricing pages
- non-Action Center report output logic
- onboarding/pulse/leadership feature surfaces outside explicit guardrail tests

---

### Task 1: Add the Shared Route Defaults Contract

**Files:**
- Create: `frontend/lib/action-center-route-defaults.ts`
- Create: `frontend/lib/action-center-route-defaults.test.ts`

- [ ] Add failing contract tests for:
  - ExitScan remains fully enabled
  - RetentieScan is the only non-exit parity unlock in this slice
  - Pulse, Onboarding, Leadership, and TeamScan fail closed
  - defaults expose cadence, reminder, escalation, and provider flags without widening semantics

- [ ] Define the shared route-defaults contract to include:
  - route family key
  - `actionCenterStatus` such as `enabled` vs `blocked`
  - default review cadence seed
  - default reminder governance seed
  - default escalation expectation
  - invite/reschedule/mail/Graph capability flags

- [ ] Keep the contract explicit:
  - no fallback “everything else is enabled”
  - no generic route registry for future families beyond the known scan types
  - no buyer-facing metadata here

- [ ] Commit with:
  - `git commit -m "Add Action Center route defaults contract"`

### Task 2: Thread Route Defaults Through The Shared Action Center Logic

**Files:**
- Modify: `frontend/lib/action-center-page-data.ts`
- Modify: `frontend/lib/action-center-review-rhythm.ts`
- Modify: `frontend/lib/action-center-review-invite.ts`
- Modify: `frontend/lib/action-center-review-reschedule-data.ts`
- Modify: `frontend/lib/action-center-follow-through-mail-data.ts`
- Modify: `frontend/lib/action-center-follow-through-mail-planner.ts`
- Modify: `frontend/lib/action-center-graph-calendar.ts`

- [ ] Add failing tests where needed for:
  - route eligibility no longer relies on scattered `scan_type === 'exit'`
  - RetentieScan can flow through the same bounded loaders when the contract enables it
  - blocked route families still fail closed in every seam

- [ ] Replace local route-family assumptions with shared helpers only where needed:
  - invite eligibility
  - review rhythm eligibility
  - follow-through mail snapshot eligibility
  - reschedule eligibility
  - Graph capability eligibility

- [ ] Keep the threading bounded:
  - no new Action Center item kinds
  - no route-specific copy explosion
  - no hidden enablement for blocked route families

- [ ] Commit with:
  - `git commit -m "Thread Action Center route defaults through shared logic"`

### Task 3: Unlock RetentieScan In The Existing Review Surfaces

**Files:**
- Modify: `frontend/app/(dashboard)/action-center/reviewmomenten/page.tsx`
- Modify: `frontend/app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts`
- Modify: `frontend/components/dashboard/review-moment-page-client.tsx`
- Modify: `frontend/components/dashboard/review-moment-page-client.test.ts`
- Modify: `frontend/components/dashboard/review-moment-detail-panel.tsx`
- Modify: `frontend/components/dashboard/review-moment-detail-panel.test.ts`

- [ ] Add failing UI contract tests for:
  - RetentieScan routes can reuse the bounded review controls only when the shared contract enables them
  - Pulse / Onboarding / Leadership still do not receive those controls
  - no new wording suggests broad suite parity beyond the bounded follow-through promise

- [ ] Keep the UI changes intentionally small:
  - reuse existing props and panels
  - no new route-family tabs or new workbench views
  - no new route-specific CTA taxonomy

- [ ] Ensure the first parity unlock remains server-derived:
  - no client-side route-family guessing
  - no direct UI branching on raw `sourceLabel` without shared contract support

- [ ] Commit with:
  - `git commit -m "Unlock RetentieScan in bounded Action Center review surfaces"`

### Task 4: Add Explicit Guardrails For Blocked Route Families

**Files:**
- Modify: `frontend/lib/action-center-page-data.test.ts`
- Modify: `frontend/app/api/action-center-review-invites/route.test.ts`
- Modify: `frontend/app/api/action-center-review-reschedules/route.test.ts`
- Modify: `frontend/lib/action-center-follow-through-mail-data.test.ts`
- Modify: `frontend/lib/action-center-follow-through-mail-planner.test.ts`
- Modify: `frontend/lib/action-center-graph-calendar.test.ts`

- [ ] Add guardrail tests for:
  - `pulse` remains blocked for review invite / rhythm / reschedule / Graph parity
  - `onboarding` remains blocked
  - `leadership` remains blocked
  - `team` remains blocked
  - RetentieScan is enabled only where the shared contract explicitly says so

- [ ] Make the tests assert fail-closed behavior, not just absence of happy-path coverage.

- [ ] Keep the guardrails route-family specific:
  - no fuzzy “unsupported” bucket without naming the blocked family in tests

- [ ] Commit with:
  - `git commit -m "Add Action Center route parity guardrails"`

### Task 5: End-To-End Verification

- [ ] Run bounded suites:

```bash
npx vitest run "lib/action-center-route-defaults.test.ts" "lib/action-center-review-rhythm.test.ts" "lib/action-center-review-invite.test.ts" "lib/action-center-review-reschedule-data.test.ts" "lib/action-center-follow-through-mail-data.test.ts" "lib/action-center-follow-through-mail-planner.test.ts" "lib/action-center-graph-calendar.test.ts" "lib/action-center-page-data.test.ts" "app/api/action-center-review-invites/route.test.ts" "app/api/action-center-review-reschedules/route.test.ts" "components/dashboard/review-moment-detail-panel.test.ts" "components/dashboard/review-moment-page-client.test.ts" "app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts"
```

- [ ] Run a production-style build:

```bash
npm run build
```

- [ ] Verify expected outcome:
  - ExitScan remains green
  - RetentieScan is the only new parity unlock
  - blocked route families stay blocked
  - no new type/build failures are introduced by this slice

- [ ] Commit any final fixups with:
  - `git commit -m "Polish Action Center route defaults and suite parity"`

---

## Execution Order

1. Shared route-defaults contract
2. Thread defaults through shared logic
3. Unlock RetentieScan in bounded review surfaces
4. Add blocked-family guardrails
5. Verification

## Acceptance Criteria

- A single shared route-defaults contract defines Action Center eligibility and defaults by route family.
- ExitScan remains fully supported without regression.
- RetentieScan becomes the only bounded parity unlock in this slice.
- Pulse, Onboarding, Leadership, and TeamScan remain explicitly blocked.
- Existing invite, reminder, reschedule, and Graph flows read from the shared route contract instead of scattered ExitScan-only checks.

## Notes

- This child plan is intentionally not a commercial broadening plan; it is an internal parity and guardrail plan.
- If execution reveals that RetentieScan needs materially different follow-through semantics, stop and split that delta into a separate child plan instead of deforming the shared contract.
