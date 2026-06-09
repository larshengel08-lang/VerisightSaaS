# Live Dashboard And Action Center Rollout Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land a genuinely working and live Verisight dashboard, report layer, and Action Center that follow current product logic, visually track the approved screenshots as closely as possible, and progressively connect the Action Center to the active product lines.

**Architecture:** Treat this as a live delivery program, not a paper exercise. Each phase must end in a real runtime artifact: a landed slice on `main`, a visible preview/live verification, or a bounded coupling to a current product line. Visual fidelity follows the screenshot set, but product truth, bounded routing, and honest state handling always win over pixel copying.

**Tech Stack:** Next.js frontend, existing backend/report layer, current Action Center shared core, Git worktrees, GitHub PR flow, browser/runtime verification, workbook-led governance in `verisight_dashboard_roadmap_2026-04-23.xlsx`.

---

## Inputs and Source Of Truth

- Workbook lead: `C:/Users/larsh/Desktop/Business/tmp/guided-execution-roadmap/outputs/verisight_dashboard_roadmap_2026-04-23.xlsx`
- Live delivery sheet: `5. Live uitvoerplan`
- Screenshot source folder: `C:/Users/larsh/Desktop/Business/tmp/guided-execution-roadmap/outputs/screenshotsmappen`
- Dashboard reference branch: `feat/dashboard-redesign-v2`
- Dashboard reference commit: `7068a18`
- Action Center reference branch: `dashboard-redesign`
- Action Center reference commit: `4d94bac`

## Guardrails

- Every phase must produce something real: landed code, visible preview truth, or a bounded product coupling that actually runs.
- No broad "adapter wave" or cross-product abstraction sprint.
- Dashboard and Action Center are separate modules inside one suite environment, not two separate apps.
- The logged-in customer/admin experience must stay combinable through one shared shell and navigation model.
- One product-line coupling at a time after the dashboard and Action Center are visually/live-stable.
- No mock-only visual parity.
- No copy/site/strategy reopening inside these phases unless directly needed for runtime truth.

## Delivery Cadence Per Phase

1. Open implementation worktree from `main`.
2. Implement only the bounded phase scope.
3. Verify with tests, build, and browser/runtime checks.
4. Open review PR.
5. Run review/sign-off.
6. Close out by landing on `main` or explicitly recording the blocker.
7. Update column `I` (`Nieuwe output`) in the workbook.

---

## Phase Order

### LX-1 Dashboard live and visual parity

- Make the dashboard genuinely work on current product logic and real routes.
- Bring shell, home, campaign overview, metrics, and report access as close to the screenshots as bounded truth allows.
- Keep the dashboard in the shared suite shell so the same logged-in environment can route to both product results and Action Center.
- End state:
  - landed on `main`
  - verified on preview/live surface
  - screenshot delta documented only where product truth required deviation

### LX-2 Action Center live and visual parity

- Make the Action Center genuinely work as an admin-first follow-through surface.
- Bring overview, dossier, assignment, owner, reviewmoment, and action-creation surfaces close to the screenshots.
- Keep Action Center reachable as its own module from the same shared suite shell and left navigation used for dashboard/result routes.
- End state:
  - landed on `main`
  - verified on preview/live surface
  - dossier/assignment/review logic remains real and bounded

### LX-3 Dashboard-report-Action Center runtime parity

- Tighten the live runtime language and handoff behavior after LX-1 and LX-2.
- Align:
  - metrics and signals
  - managementread
  - follow-through / owner / review language
  - report-to-Action Center handoff
- Confirm one combined navigation model where users can move from product results to reports to Action Center inside the same environment.
- End state:
  - landed parity pass on `main`
  - visible consistency across live routes

### LX-4 RetentieScan live Action Center coupling

- Add one bounded live carrier slice for RetentieScan.
- Only couple dossier/owner/assignment/review truth needed for this product.
- End state:
  - RetentieScan feeds Action Center live
  - no scope leak to other product lines

### LX-5 Onboarding live Action Center coupling

- Repeat the same bounded live carrier pattern for Onboarding.
- End state:
  - Onboarding feeds Action Center live
  - coupling is honest and product-specific

### LX-6 Pulse live Action Center coupling

- Repeat the same bounded live carrier pattern for Pulse.
- End state:
  - Pulse feeds Action Center live
  - no fake generic adapter story

### LX-7 Leadership live Action Center coupling

- Repeat the same bounded live carrier pattern for Leadership.
- End state:
  - Leadership feeds Action Center live
  - coupling stays bounded and review-safe

### LX-8 Live pilot and family closeout

- Run a small real or semireal live pilot on the now-connected family.
- Observe 2-4 dossiers across the available live carriers.
- Test whether the full chain feels coherent:
  - dashboard first-read
  - report as managementread
  - Action Center as owner/review/follow-through layer
- End state:
  - explicit family-level verdict
  - only small hardening left, or clear blockers documented

---

## Current Baseline Before Execution

- Dashboard redesign basis already landed on `main`.
- Action Center shared core already exists on `main`.
- Language parity and report-layer strengthening already landed on `main`.
- Action Center ops-pilot observation artifact already landed on `main`.
- ExitScan baseline truth exists; broader coupling beyond that remains open.

## Execution Update 2026-04-26

- A current-main-based live suite shell slice is now implemented in `codex/live-suite-rollout`.
- The logged-in suite shell now treats dashboard/results and Action Center as two separate modules inside one shared environment and left navigation.
- A new live `/action-center` route now reads real campaigns, delivery records, learning dossiers, and review checkpoints and renders them as a bounded read-first Action Center surface.
- That live Action Center surface is no longer ExitScan-only; it now reads current supported product lines:
  - `exit`
  - `retention`
  - `onboarding`
  - `pulse`
  - `leadership`
- Because that shared live slice already covers the current product family as bounded read-first follow-through, LX-4 through LX-7 no longer need to be treated as mandatory separate first-pass implementation waves unless later owner-mutation workflows diverge per product.
- The main open family step after this slice is therefore no longer "wire the next scan at all", but:
  - validate the family in small live usage
  - decide whether deeper per-product mutation workflows need separate follow-up slices

## Current Verification Snapshot

- Targeted shell/navigation tests pass.
- New Action Center live-item builder tests pass.
- Full production build passes with the existing `.env.local` values.
- Production-like browser verification on `127.0.0.1:3011` confirms:
  - `/dashboard` works after login
  - `/reports` works after login
  - `/action-center` works after login
  - the shared navigation visibly includes:
    - overview
    - `ExitScan`
    - `RetentieScan`
    - `Onboarding`
    - `Pulse`
    - `Leadership Scan`
    - `Reports`
    - `Action Center`
- A broader campaign-detail copy test remains red on current `main`, but that failure is pre-existing baseline test drift rather than a regression introduced by this rollout slice.

## What Success Looks Like

- The dashboard is genuinely live and visually close to the approved references.
- The Action Center is genuinely live and visually close to the approved references.
- Dashboard, report, and Action Center read like one family.
- Action Center works with the active product lines, one bounded coupling at a time.
- A small live pilot confirms the family is not only technically correct, but operationally logical for Verisight and the client.
