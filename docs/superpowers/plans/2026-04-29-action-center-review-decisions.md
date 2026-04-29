# Action Center Review Decisions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an authored internal review-decision layer for Action Center so richer decisions, step progression, and result loops over time come from one canonical write-path instead of legacy projection alone.

**Architecture:** Introduce one small `action_center_review_decisions` persistence layer tied to existing learning dossiers/checkpoints, consume it through one shared server/lib pipeline, and keep Action Center itself read-only while an internal beheer write-surface manages the new records. Preserve legacy fallback only for routes that do not yet have any authored decisions.

**Tech Stack:** Supabase/Postgres, Next.js App Router, TypeScript, React, Vitest, ESLint

---

## File structure

### Existing files to modify

- `supabase/schema.sql`
  - Add the new `action_center_review_decisions` table, indexes, and RLS/policies.
- `frontend/lib/pilot-learning.ts`
  - Add types and helpers for authored review decisions.
- `frontend/lib/action-center-route-contract.ts`
  - Add hooks for authored review decisions alongside existing route truth.
- `frontend/lib/action-center-decision-history.ts`
  - Make authored decisions the primary source, with legacy fallback only when no authored decision exists.
- `frontend/lib/action-center-core-semantics.ts`
  - Consume authored `latestDecision`, `actionProgress`, and `decisionHistory`.
- `frontend/lib/action-center-live.ts`
  - Pipe authored review decisions into preview items and shared semantics.
- `frontend/components/dashboard/action-center-preview.tsx`
  - Render the richer authored semantics without adding manager input.
- `frontend/app/(dashboard)/beheer/klantlearnings/page.tsx`
  - Surface a small internal authored decision editor/readout in the existing beheer flow.
- `frontend/app/api/learning-dossiers/[id]/route.ts`
  - Optionally expose authored decision summaries in dossier fetch/update flows when needed.
- `frontend/app/api/learning-checkpoints/[id]/route.ts`
  - Validate coupling to `follow_up_review` / `first_management_use` as needed.
- `frontend/lib/action-center-core-semantics.test.ts`
- `frontend/lib/action-center-decision-history.test.ts`
- `frontend/lib/action-center-live.test.ts`
- `frontend/lib/action-center-preview-display.test.ts`
- `frontend/lib/action-center-preview-route-fields-render.test.ts`
- `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`

### New files to create

- `frontend/lib/action-center-review-decisions.ts`
  - Server/client-safe shared types, validation helpers, and mappers for authored review decisions.
- `frontend/app/api/action-center-review-decisions/route.ts`
  - Create endpoint for new authored decision records.
- `frontend/app/api/action-center-review-decisions/[id]/route.ts`
  - Update endpoint for authored decision records.
- `frontend/lib/action-center-review-decisions.test.ts`
  - Unit tests for authored decision coercion, selection, and fallback cutover rules.

### Boundaries to preserve

- Do not add manager write flows.
- Do not move review decision authoring into Action Center.
- Do not introduce a broad event timeline or task system.

---

### Task 1: Add the authored review decision schema and shared types

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `frontend/lib/pilot-learning.ts`
- Create: `frontend/lib/action-center-review-decisions.ts`
- Test: `frontend/lib/action-center-review-decisions.test.ts`

- [ ] **Step 1: Add failing tests for authored decision shape and fallback cutover**
- [ ] **Step 2: Run `npm test -- "lib/action-center-review-decisions.test.ts"` and confirm failure**
- [ ] **Step 3: Add `action_center_review_decisions` schema, indexes, and admin-only policies in `supabase/schema.sql`**
- [ ] **Step 4: Add `ActionCenterReviewDecision` types plus small validation helpers in `pilot-learning.ts` and the new review-decisions lib**
- [ ] **Step 5: Re-run `npm test -- "lib/action-center-review-decisions.test.ts"` and make it pass**
- [ ] **Step 6: Commit with `feat: add authored action center review decision contract`**

### Task 2: Add internal admin APIs for authored decisions

**Files:**
- Create: `frontend/app/api/action-center-review-decisions/route.ts`
- Create: `frontend/app/api/action-center-review-decisions/[id]/route.ts`
- Modify: `frontend/lib/action-center-review-decisions.ts`
- Test: `frontend/lib/action-center-review-decisions.test.ts`

- [ ] **Step 1: Write failing tests for create/update validation and coupling to review checkpoints**
- [ ] **Step 2: Run the targeted test file and confirm failure**
- [ ] **Step 3: Implement create API with admin auth, required `routeSourceId`, `checkpointId`, `decision`, `decisionReason`, `nextCheck`, `currentStep`, `nextStep`, `expectedEffect`**
- [ ] **Step 4: Implement update API with the same validation and no manager access**
- [ ] **Step 5: Re-run the targeted API/mapper tests**
- [ ] **Step 6: Commit with `feat: add action center review decision admin apis`**

### Task 3: Make authored decisions the primary Action Center source

**Files:**
- Modify: `frontend/lib/action-center-route-contract.ts`
- Modify: `frontend/lib/action-center-decision-history.ts`
- Modify: `frontend/lib/action-center-core-semantics.ts`
- Modify: `frontend/lib/action-center-live.ts`
- Test: `frontend/lib/action-center-core-semantics.test.ts`
- Test: `frontend/lib/action-center-decision-history.test.ts`
- Test: `frontend/lib/action-center-live.test.ts`

- [ ] **Step 1: Add failing tests for “authored decisions win fully over legacy fallback”**
- [ ] **Step 2: Run the three targeted semantic/history/live tests and confirm failure**
- [ ] **Step 3: Thread authored review decisions into route projection**
- [ ] **Step 4: Update decision-history logic so authored history is primary and legacy fallback only applies when zero authored decisions exist**
- [ ] **Step 5: Update core semantics and live preview builders to use authored `latestDecision`, `actionProgress`, and `decisionHistory`**
- [ ] **Step 6: Re-run the three targeted test files and make them pass**
- [ ] **Step 7: Commit with `feat: consume authored review decisions in action center semantics`**

### Task 4: Add the internal beheer write-surface

**Files:**
- Modify: `frontend/app/(dashboard)/beheer/klantlearnings/page.tsx`
- Modify: `frontend/lib/action-center-live.ts`
- Modify: `frontend/lib/action-center-preview-display.test.ts`
- Modify: `frontend/lib/action-center-preview-route-fields-render.test.ts`

- [ ] **Step 1: Add failing render tests for authored decision visibility and compact admin write context**
- [ ] **Step 2: Run the targeted render tests and confirm failure**
- [ ] **Step 3: Add a small authored review-decision editor/readout in klantlearnings tied to the review checkpoint context**
- [ ] **Step 4: Keep Action Center read-only and consume the authored output only through shared semantics**
- [ ] **Step 5: Re-run the targeted render tests and make them pass**
- [ ] **Step 6: Commit with `feat: add internal authored review decision surface`**

### Task 5: Final verification and documentation closeout

**Files:**
- Modify only if verification exposes drift

- [ ] **Step 1: Run the authored decision test set**

Run:

```bash
npm test -- "lib/action-center-review-decisions.test.ts" "lib/action-center-decision-history.test.ts" "lib/action-center-core-semantics.test.ts" "lib/action-center-live.test.ts" "lib/action-center-preview-display.test.ts" "lib/action-center-preview-route-fields-render.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

- [ ] **Step 2: Run lint on the touched files**

Run:

```bash
npx eslint "lib/action-center-review-decisions.ts" "lib/action-center-route-contract.ts" "lib/action-center-decision-history.ts" "lib/action-center-core-semantics.ts" "lib/action-center-live.ts" "components/dashboard/action-center-preview.tsx" "app/(dashboard)/beheer/klantlearnings/page.tsx" "app/api/action-center-review-decisions/route.ts" "app/api/action-center-review-decisions/[id]/route.ts"
```

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

- [ ] **Step 4: Commit verification fixes if needed**

```bash
git add .
git commit -m "test: verify authored action center review decisions"
```

- [ ] **Step 5: Prepare PR summary**

Include:
- canonical authored review decision write-path
- authored step progression and result loop over time
- managers still read-only
- legacy fallback only for zero-authored-decision routes
