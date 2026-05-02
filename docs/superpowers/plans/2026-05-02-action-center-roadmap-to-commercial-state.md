# Action Center Roadmap to Commercial State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take Action Center from its current strong post-scan follow-through core to a pilot-ready commercial state without redoing already-settled foundations or confusing spec-truth with runtime-truth.

**Architecture:** This is a central orchestration plan, not a single feature plan. The work is executed as a staged capability program. Each wave hardens one layer of product truth, runtime trust, and pilot operability before the next wave deepens the surface area. Governance and operations move as near-prerequisites alongside the product waves rather than as end-of-line cleanup.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Playwright, Supabase, Action Center route/action/closeout/reopen/follow-up semantics, docs-driven delivery

---

## Program Rules

- [ ] Treat the roadmap spec as the source of truth for ordering and non-goals:

  File: `docs/superpowers/specs/2026-05-02-action-center-roadmap-to-commercial-state-design.md`

- [ ] Preserve the product boundary:

  - Action Center remains the **post-scan follow-through layer**
  - Do not broaden into general task/project management
  - Do not re-open already-settled route-open, closeout, reopen, or follow-up direction unless runtime evidence proves a real contradiction

- [ ] Use the three-reality model in every implementation wave:

  - `canonically decided`
  - `product/runtime present`
  - `directional but not yet hardened`

- [ ] Before every wave, write or update a wave-local spec if the target behavior is not already precise enough to code safely.

- [ ] Before every wave claims pilot-readiness, verify:

  - critical browser paths
  - authority-safe writes
  - support/recovery expectations
  - scan-to-route product framing

---

## File Structure

### Existing source-of-truth docs

- Spec: `docs/superpowers/specs/2026-05-02-action-center-roadmap-to-commercial-state-design.md`
- Plan (this file): `docs/superpowers/plans/2026-05-02-action-center-roadmap-to-commercial-state.md`

### Expected follow-on plan artifacts

- Create or update wave-local specs under:
  - `docs/superpowers/specs/`
- Create or update wave-local implementation plans under:
  - `docs/superpowers/plans/`

### Likely product/runtime files touched across the program

- Route and live semantics:
  - `frontend/lib/action-center-route-contract.ts`
  - `frontend/lib/action-center-core-semantics.ts`
  - `frontend/lib/action-center-live.ts`
  - `frontend/lib/action-center-live-context.ts`
  - `frontend/lib/action-center-route-reopen.ts`
  - `frontend/lib/action-center-route-closeout.ts`

- Primary UI surfaces:
  - `frontend/components/dashboard/action-center-preview.tsx`
  - `frontend/app/(dashboard)/action-center/page.tsx`

- APIs and write trust:
  - `frontend/app/api/action-center-manager-responses/route.ts`
  - `frontend/app/api/action-center-route-actions/route.ts`
  - `frontend/app/api/action-center-route-closeouts/route.ts`
  - `frontend/app/api/action-center-route-reopens/route.ts`
  - `frontend/app/api/action-center-route-follow-ups/route.ts`
  - `frontend/app/api/action-center/workspace-members/route.ts`

- Schema and policies:
  - `supabase/schema.sql`

- Pilot/demo/runtime evidence:
  - `frontend/scripts/seed-action-center-manager-pilot.mjs`
  - `frontend/tests/e2e/action-center-manager-access.spec.ts`
  - `frontend/tests/e2e/action-center-route-reopen.spec.ts`
  - plus wave-specific tests to be added as needed

---

## Task 1: Lock The Roadmap Baseline

**Files:**
- Verify: `docs/superpowers/specs/2026-05-02-action-center-roadmap-to-commercial-state-design.md`
- Verify: `docs/superpowers/plans/2026-05-02-action-center-roadmap-to-commercial-state.md`

- [ ] **Step 1: Re-read the roadmap spec and extract the hard constraints**

  Capture these constraints into the working notes for the next wave:

  - Action Center stays post-scan
  - governance and operations are near-prerequisites for pilots
  - manager action model is directional but still hardening
  - roadmap execution must distinguish canonical/spec/runtime truth

- [ ] **Step 2: Create a wave checklist document for live tracking**

  Create:

  - `docs/superpowers/plans/action-center-commercial-roadmap-checklist.md`

  Seed it with:

  ```md
  # Action Center Commercial Roadmap Checklist

  - [ ] Wave 1: Routebrede voortgang en samenvatting
  - [ ] Wave 2: Manageractie-semantiek harden en ervaring verfijnen
  - [ ] Wave 3: Governance en rechten
  - [ ] Wave 4: Betrouwbare operatie
  - [ ] Wave 5: Rapportage en bestuurlijke teruglezing
  - [ ] Wave 6: UX-volwassenheid
  - [ ] Wave 7: Inbedding in scan -> route flow
  - [ ] Wave 8: Pilot operationalisering
  - [ ] Pilot-ready go / no-go review
  ```

- [ ] **Step 3: Commit the roadmap baseline tracking artifact**

  ```bash
  git add docs/superpowers/plans/action-center-commercial-roadmap-checklist.md
  git commit -m "docs: add action center commercial roadmap checklist"
  ```

---

## Task 2: Execute Wave 1 - Routebrede Voortgang en Samenvatting

**Files:**
- Spec: create or update `docs/superpowers/specs/2026-05-02-action-center-route-summary-design.md`
- Plan: create or update `docs/superpowers/plans/2026-05-02-action-center-route-summary.md`
- Modify likely:
  - `frontend/lib/action-center-core-semantics.ts`
  - `frontend/lib/action-center-live.ts`
  - `frontend/components/dashboard/action-center-preview.tsx`
  - `frontend/app/(dashboard)/action-center/page.tsx`
  - `frontend/lib/action-center-live.test.ts`
  - `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`

- [ ] **Step 1: Write or refine the route-summary spec from the roadmap constraints**

  The spec must explicitly answer:

  - what route-level meaning is read from existing truth
  - what remains action-level detail
  - how overview and detail differ
  - how open/active/reviewable/closed/followed-up states read without becoming workflow-heavy

- [ ] **Step 2: Write the wave implementation plan**

  The plan must include:

  - grouped semantics changes
  - route summary projection updates
  - UI projection changes
  - regression coverage

- [ ] **Step 3: Implement route-level summary changes**

  Minimum execution target:

  - clearer route summary in overview
  - clearer route summary in detail
  - no redefinition of action truth
  - no hidden dependency on non-canonical fields

- [ ] **Step 4: Verify the wave**

  Run at minimum:

  ```bash
  npm test -- "lib/action-center-live.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
  npx eslint "components/dashboard/action-center-preview.tsx" "lib/action-center-core-semantics.ts" "lib/action-center-live.ts" "app/(dashboard)/action-center/page.tsx"
  npm run build
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add docs/superpowers/specs/2026-05-02-action-center-route-summary-design.md docs/superpowers/plans/2026-05-02-action-center-route-summary.md frontend/lib/action-center-core-semantics.ts frontend/lib/action-center-live.ts frontend/components/dashboard/action-center-preview.tsx frontend/app/(dashboard)/action-center/page.tsx frontend/lib/action-center-live.test.ts frontend/app/(dashboard)/action-center/page.route-shell.test.ts
  git commit -m "feat: add action center route summary layer"
  ```

---

## Task 3: Execute Wave 2 - Manageractie-Semantiek Harden en Ervaring Verfijnen

**Files:**
- Spec: create or update `docs/superpowers/specs/2026-05-02-action-center-manager-action-hardening-design.md`
- Plan: create or update `docs/superpowers/plans/2026-05-02-action-center-manager-action-hardening.md`
- Modify likely:
  - `frontend/components/dashboard/action-center-preview.tsx`
  - `frontend/lib/action-center-manager-responses.ts`
  - `frontend/lib/action-center-route-contract.ts`
  - `frontend/lib/action-center-core-semantics.ts`
  - `frontend/lib/action-center-live.ts`
  - `frontend/app/api/action-center-manager-responses/route.ts`
  - `frontend/app/api/action-center-route-actions/route.ts`
  - relevant tests and e2e specs

- [ ] **Step 1: Write the hardening spec, not just a polish spec**

  The spec must explicitly answer:

  - what is already runtime-real
  - what is still directional
  - what can still be simplified before pilots
  - what must not expand into generic task management

- [ ] **Step 2: Write the wave implementation plan**

  The plan must separate:

  - semantic hardening
  - UX simplification
  - write-path trust checks
  - browser flow verification

- [ ] **Step 3: Implement the manager action hardening pass**

  Minimum execution target:

  - lighter action creation
  - clearer action review entry
  - no ambiguity about ownership
  - no drift toward project/subtask semantics

- [ ] **Step 4: Verify the wave**

  Run at minimum:

  ```bash
  npm test -- "app/api/action-center-manager-responses/route.test.ts" "lib/action-center-route-contract.test.ts" "lib/action-center-core-semantics.test.ts"
  npx playwright test tests/e2e/action-center-manager-access.spec.ts --project=chromium --workers=1
  npm run build
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add docs/superpowers/specs/2026-05-02-action-center-manager-action-hardening-design.md docs/superpowers/plans/2026-05-02-action-center-manager-action-hardening.md
  git commit -m "feat: harden action center manager action model"
  ```

---

## Task 4: Execute Wave 3 - Governance en Rechten

**Files:**
- Spec: create or update `docs/superpowers/specs/2026-05-02-action-center-governance-design.md`
- Plan: create or update `docs/superpowers/plans/2026-05-02-action-center-governance.md`
- Modify likely:
  - `supabase/schema.sql`
  - relevant Action Center APIs under `frontend/app/api/`
  - `frontend/lib/action-center-route-write-access.ts` if applicable
  - route/follow-up/reopen/closeout tests

- [ ] **Step 1: Write the governance spec**

  It must explicitly map:

  - who may open, assign, respond, close, reopen, and start follow-up
  - which writes must remain admin-client mediated
  - what must be audit-attributable for pilots

- [ ] **Step 2: Write the governance implementation plan**

  The plan must include:

  - role matrix
  - schema/policy impact
  - API validation changes
  - regression tests

- [ ] **Step 3: Implement governance hardening**

  Minimum execution target:

  - authority-safe critical writes
  - explicit auditability expectations on critical route writes
  - no cross-scope or cross-org continuation leakage

- [ ] **Step 4: Verify the wave**

  Run at minimum:

  ```bash
  npm test -- "app/api/action-center-route-follow-ups/route.test.ts" "app/api/action-center-route-reopens/route.test.ts"
  npx eslint "app/api/action-center-route-follow-ups/route.ts" "app/api/action-center-route-reopens/route.ts" "supabase/schema.sql"
  npm run build
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add docs/superpowers/specs/2026-05-02-action-center-governance-design.md docs/superpowers/plans/2026-05-02-action-center-governance.md supabase/schema.sql frontend/app/api/
  git commit -m "feat: harden action center governance boundaries"
  ```

---

## Task 5: Execute Wave 4 - Betrouwbare Operatie

**Files:**
- Spec: create or update `docs/superpowers/specs/2026-05-02-action-center-operations-design.md`
- Plan: create or update `docs/superpowers/plans/2026-05-02-action-center-operations.md`
- Modify likely:
  - `frontend/scripts/seed-action-center-manager-pilot.mjs`
  - e2e specs under `frontend/tests/e2e/`
  - deployment/schema docs
  - support/runbook docs under `docs/`

- [ ] **Step 1: Write the operations spec**

  It must define:

  - schema rollout expectations
  - recovery expectations
  - health evidence
  - pilot-critical browser regression path

- [ ] **Step 2: Write the operations implementation plan**

  Include:

  - rollout playbook
  - verification commands
  - seed/demo expectations
  - incident recovery notes

- [ ] **Step 3: Implement operational hardening**

  Minimum execution target:

  - reliable seed path
  - explicit browser verification path
  - reduced manual SQL/runtime rescue
  - known recovery notes for broken route writes

- [ ] **Step 4: Verify the wave**

  Run at minimum:

  ```bash
  node ./scripts/seed-action-center-manager-pilot.mjs
  npx playwright test tests/e2e/action-center-manager-access.spec.ts tests/e2e/action-center-route-reopen.spec.ts --project=chromium --workers=1
  npm run build
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add docs/superpowers/specs/2026-05-02-action-center-operations-design.md docs/superpowers/plans/2026-05-02-action-center-operations.md frontend/scripts/seed-action-center-manager-pilot.mjs frontend/tests/e2e/
  git commit -m "chore: harden action center pilot operations"
  ```

---

## Task 6: Execute Wave 5 - Rapportage en Bestuurlijke Teruglezing

**Files:**
- Spec: create or update `docs/superpowers/specs/2026-05-02-action-center-reporting-design.md`
- Plan: create or update `docs/superpowers/plans/2026-05-02-action-center-reporting.md`
- Modify likely:
  - `frontend/lib/action-center-live.ts`
  - `frontend/components/dashboard/action-center-preview.tsx`
  - route/report summary surfaces
  - tests for lineage/readback/report summaries

- [ ] **Step 1: Write the reporting spec**

  It must stay intentionally light:

  - route-level readback
  - open/closed/followed-up summary
  - no heavy BI expansion

- [ ] **Step 2: Write the reporting implementation plan**

  Include:

  - summary projections
  - surface placement
  - regression expectations

- [ ] **Step 3: Implement the light reporting layer**

  Minimum execution target:

  - route-over-time readback
  - compact bestuurlijke summary
  - direct continuation visibility

- [ ] **Step 4: Verify the wave**

  Run at minimum:

  ```bash
  npm test -- "lib/action-center-live.test.ts" "lib/action-center-preview-display.test.ts"
  npm run build
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add docs/superpowers/specs/2026-05-02-action-center-reporting-design.md docs/superpowers/plans/2026-05-02-action-center-reporting.md
  git commit -m "feat: add action center route readback summaries"
  ```

---

## Task 7: Execute Wave 6 - UX-Volwassenheid

**Files:**
- Spec: create or update `docs/superpowers/specs/2026-05-02-action-center-ux-maturity-design.md`
- Plan: create or update `docs/superpowers/plans/2026-05-02-action-center-ux-maturity.md`
- Modify likely:
  - `frontend/components/dashboard/action-center-preview.tsx`
  - supporting render tests

- [ ] **Step 1: Write the UX maturity spec**

  It must focus on:

  - calmness
  - empty/blocked/closed states
  - confidence, not novelty

- [ ] **Step 2: Write the UX maturity implementation plan**

  Include:

  - priority surfaces
  - non-goals
  - regression boundaries

- [ ] **Step 3: Implement the polish pass**

  Minimum execution target:

  - clearer empty and blocked states
  - improved state feedback
  - reduced visual and cognitive noise

- [ ] **Step 4: Verify the wave**

  Run at minimum:

  ```bash
  npm test -- "lib/action-center-preview-display.test.ts" "lib/action-center-preview-route-fields-render.test.ts"
  npm run build
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add docs/superpowers/specs/2026-05-02-action-center-ux-maturity-design.md docs/superpowers/plans/2026-05-02-action-center-ux-maturity.md
  git commit -m "feat: polish action center pilot surfaces"
  ```

---

## Task 8: Execute Wave 7 - Inbedding in Scan -> Route Flow

**Files:**
- Spec: create or update `docs/superpowers/specs/2026-05-02-action-center-scan-route-integration-design.md`
- Plan: create or update `docs/superpowers/plans/2026-05-02-action-center-scan-route-integration.md`
- Modify likely:
  - route launch surfaces
  - campaign/report links into Action Center
  - route context language in UI

- [ ] **Step 1: Write the scan-route integration spec**

  It must define:

  - how a scan hands off into Action Center
  - what context must survive the transition
  - how Action Center remains visibly post-scan

- [ ] **Step 2: Write the implementation plan**

  Include:

  - deeplink points
  - language continuity
  - regression and demo expectations

- [ ] **Step 3: Implement integration improvements**

  Minimum execution target:

  - stronger scan-to-route continuity
  - less “loose module” feeling
  - clearer product story in runtime

- [ ] **Step 4: Verify the wave**

  Run at minimum:

  ```bash
  npm run build
  npx playwright test tests/e2e/action-center-manager-access.spec.ts --project=chromium --workers=1
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add docs/superpowers/specs/2026-05-02-action-center-scan-route-integration-design.md docs/superpowers/plans/2026-05-02-action-center-scan-route-integration.md
  git commit -m "feat: tighten scan to action center continuity"
  ```

---

## Task 9: Execute Wave 8 - Pilot Operationalisering

**Files:**
- Spec: create or update `docs/superpowers/specs/2026-05-02-action-center-pilot-ops-design.md`
- Plan: create or update `docs/superpowers/plans/2026-05-02-action-center-pilot-ops.md`
- Create likely:
  - onboarding docs
  - support runbooks
  - demo narrative docs

- [ ] **Step 1: Write the pilot ops spec**

  It must define:

  - lightweight HR onboarding
  - lightweight manager explanation
  - support runbook expectations
  - demo narrative and commercial framing

- [ ] **Step 2: Write the implementation plan**

  Include:

  - which docs exist
  - which flows support depends on
  - how pilot teams verify readiness

- [ ] **Step 3: Implement pilot operational assets**

  Minimum execution target:

  - onboarding-light docs
  - support-light runbook
  - demo framing as post-scan follow-through

- [ ] **Step 4: Verify the wave**

  Verification means reviewing that the artifacts exist and match the current runtime product truth.

- [ ] **Step 5: Commit**

  ```bash
  git add docs/superpowers/specs/2026-05-02-action-center-pilot-ops-design.md docs/superpowers/plans/2026-05-02-action-center-pilot-ops.md
  git commit -m "docs: prepare action center pilot operations"
  ```

---

## Task 10: Run The Pilot-Ready Go / No-Go Review

**Files:**
- Verify: `docs/superpowers/specs/2026-05-02-action-center-roadmap-to-commercial-state-design.md`
- Verify: all wave-local specs and plans
- Create: `docs/superpowers/plans/action-center-pilot-readiness-review.md`

- [ ] **Step 1: Create the final readiness review document**

  Create:

  - `docs/superpowers/plans/action-center-pilot-readiness-review.md`

  It must include these sections:

  - Product understanding
  - HR usability
  - Manager usability
  - Bestuurlijke terugleesbaarheid
  - Governance trust
  - Operational stability
  - UX confidence
  - Commercial clarity
  - Pilot operational readiness
  - Go / no-go recommendation

- [ ] **Step 2: Re-run the pilot-critical verification set**

  Run:

  ```bash
  npm run build
  node ./scripts/seed-action-center-manager-pilot.mjs
  npx playwright test tests/e2e/action-center-manager-access.spec.ts tests/e2e/action-center-route-reopen.spec.ts --project=chromium --workers=1
  ```

- [ ] **Step 3: Record gaps honestly**

  If any of the roadmap go/no-go gates are still materially unstable, mark the overall result as:

  - `not pilot-ready yet`

  Do not upgrade the product to pilot-ready based on sentiment or polish alone.

- [ ] **Step 4: Commit the review artifact**

  ```bash
  git add docs/superpowers/plans/action-center-pilot-readiness-review.md
  git commit -m "docs: record action center pilot readiness review"
  ```

---

## Spec Coverage Check

This plan covers the roadmap requirements by:

- preserving Action Center as a post-scan layer
- separating settled foundation from still-hardening runtime truth
- explicitly hardening the manager action model before treating it as solved
- moving governance and operations ahead of reporting in pilot criticality
- translating the roadmap exit criteria into a concrete go/no-go review

No major roadmap section is left without a program task.

---

## Placeholder Scan

This plan intentionally avoids placeholder implementation language such as:

- “add appropriate validation”
- “write tests later”
- “TBD”

Where future wave-local plans are required, this central plan explicitly names those artifacts rather than pretending the code details already exist here.

---

## Type / Naming Consistency Check

This plan uses the following canonical wave names consistently:

- Routebrede voortgang en samenvatting
- Manageractie-semantiek harden en ervaring verfijnen
- Governance en rechten
- Betrouwbare operatie
- Rapportage en bestuurlijke teruglezing
- UX-volwassenheid
- Inbedding in scan -> route flow
- Pilot operationalisering

These names match the sharpened central roadmap spec ordering.
