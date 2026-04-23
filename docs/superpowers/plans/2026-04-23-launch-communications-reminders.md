# Launch Communications Reminders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add bounded launch date, communication preview/customization, reminder presets, and explicit launch confirmation to guided self-serve without opening a free email builder or breaking delivery governance.

**Architecture:** Extend the existing delivery-record spine with bounded launch communication config, validate it in shared delivery helpers plus API routes, and surface it inside the existing guided self-serve panel and preflight checklist. Keep launch execution route-aware and governed by the same readiness grammar already used for launch, activation, and first value.

**Tech Stack:** Next.js App Router, TypeScript, Supabase schema SQL, Vitest, Playwright

---

### Task 1: Persist bounded launch communication config

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `frontend/lib/ops-delivery.ts`
- Test: `frontend/lib/ops-delivery.test.ts`

- [ ] Add delivery-record fields and TypeScript types for launch date, launch confirmation, participant communication config, and reminder config.
- [ ] Add shared validation helpers for safe communication overrides and bounded reminder presets.
- [ ] Add launch-control governance outputs so readiness and discipline warnings can include launch config blockers.
- [ ] Write/expand unit tests that prove missing launch date, missing confirmation, or invalid reminder settings block launch readiness.

### Task 2: Expose safe launch config through delivery APIs

**Files:**
- Modify: `frontend/app/api/campaign-delivery/[id]/route.ts`
- Modify: `frontend/app/api/campaigns/[id]/respondents/send-invites/route.ts`
- Test: `frontend/lib/ops-delivery.test.ts`

- [ ] Extend the delivery PATCH route to accept bounded launch communication fields and reject invalid payloads.
- [ ] Enforce launch-config completeness before invite-start requests can pass through the send-invites route.
- [ ] Keep admin-owned delivery governance intact while allowing viewer-safe config updates through a dedicated guarded path if needed.
- [ ] Add tests for rejected launch attempts when config is incomplete or unconfirmed.

### Task 3: Add bounded launch configuration UI to guided self-serve

**Files:**
- Modify: `frontend/components/dashboard/guided-self-serve-panel.tsx`
- Modify: `frontend/lib/guided-self-serve.ts`
- Modify: `frontend/lib/implementation-readiness.ts`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- Test: `frontend/lib/guided-self-serve.test.ts`

- [ ] Add a pre-launch overview card that shows start date, communication status, reminder status, and launch confirmation status.
- [ ] Add participant communication preview with safe field-level customization only.
- [ ] Add bounded reminder preset controls.
- [ ] Add explicit launch confirmation UI and wire it into launch CTA availability.
- [ ] Update guided-self-serve/readiness copy so it reflects controlled launch behavior without introducing new product terms.
- [ ] Add unit tests for new guided state transitions and readiness messaging.

### Task 4: Extend browser acceptance flow

**Files:**
- Modify: `frontend/tests/e2e/guided-self-serve-acceptance.spec.ts`
- Modify: `frontend/tests/e2e/guided-self-serve-acceptance.helpers.ts` (only if fixture handling needs support)

- [ ] Extend the acceptance flow so invites do not start until launch date, preview, reminder settings, and launch confirmation are complete.
- [ ] Verify the customer can see and adjust only safe communication fields.
- [ ] Verify reminder controls stay preset-based and visible in the flow.
- [ ] Verify launch confirmation unlocks invite start and preserves existing response-threshold behavior.

### Task 5: Verify and close out

**Files:**
- Modify: `docs/superpowers/specs/2026-04-23-launch-communications-reminders-design.md` (only if implementation reveals a necessary clarification)

- [ ] Run focused Vitest coverage for launch/readiness/reminder logic.
- [ ] Run the guided self-serve Playwright acceptance flow if runtime allows.
- [ ] Run a production-safety pass on copy to ensure canon, bounded claims, and shared grammar remain intact.
- [ ] Prepare the requested end report with launch/communication improvements, guardrails, assisted boundaries, and verdict.
