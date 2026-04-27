# Commercial TODO Truth & Proof Wave Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the non-design-dependent commercial TODO chain by hardening portfolio truth, formal report policy, case-evidence rules, and Action Center proposition truth without colliding with the active homepage and dashboard design threads.

**Architecture:** Treat this wave as a truth-contract and bounded copy/runtime alignment pass. New active docs become the explicit policy source; small, safe copy and categorization updates in marketing and dashboard surfaces make that truth visible without reopening homepage or dashboard design implementation.

**Tech Stack:** Markdown docs, Next.js/React marketing surfaces, dashboard report library helpers, workbook follow-up.

---

## File map

- Create: `docs/active/COMMERCIAL_PORTFOLIO_TRUTH_CONTRACT_2026-04-27.md`
- Create: `docs/active/REPORT_POLICY_AND_OUTPUT_TRUTH_2026-04-27.md`
- Create: `docs/active/CASE_EVIDENCE_AND_PROOF_POLICY_2026-04-27.md`
- Modify: `docs/active/SUITE_PRODUCT_FAMILY_MODEL.md`
- Modify: `docs/active/ACTION_CENTER_PROPOSITION_CONTRACT.md`
- Modify: `frontend/lib/dashboard/report-library.ts`
- Modify: `frontend/app/(dashboard)/reports/page.tsx`
- Modify: `frontend/components/marketing/producten-content.tsx`
- Modify: `frontend/components/marketing/aanpak-content.tsx`
- Modify: `frontend/components/marketing/contact-form.tsx`
- Modify: `frontend/app/vertrouwen/page.tsx`

### Task 1: TD-0 portfolio commercial truth

**Files:**
- Create: `docs/active/COMMERCIAL_PORTFOLIO_TRUTH_CONTRACT_2026-04-27.md`
- Modify: `docs/active/SUITE_PRODUCT_FAMILY_MODEL.md`

- [ ] Write the commercial portfolio truth contract that answers:
  - what Verisight sells now
  - which routes are primary
  - how scan, dashboard, report/output, and Action Center relate
  - why only ExitScan and RetentieScan carry standard report weight
- [ ] Update `SUITE_PRODUCT_FAMILY_MODEL.md` so the shared module logic explicitly distinguishes:
  - dashboard as shared read layer
  - formal report as standard for Exit/Retentie
  - Action Center as shared follow-through layer
- [ ] Review the new contract and model for contradiction with the current portfolio truth.

### Task 2: TD-3 report policy and output truth

**Files:**
- Create: `docs/active/REPORT_POLICY_AND_OUTPUT_TRUTH_2026-04-27.md`
- Modify: `frontend/lib/dashboard/report-library.ts`
- Modify: `frontend/app/(dashboard)/reports/page.tsx`
- Modify: `frontend/components/marketing/producten-content.tsx`
- Modify: `frontend/components/marketing/aanpak-content.tsx`
- Modify: `frontend/components/marketing/contact-form.tsx`
- Modify: `frontend/app/vertrouwen/page.tsx`

- [ ] Write the report/output policy doc that defines:
  - standard formal report carriers
  - bounded output routes
  - what "management read" means per route type
- [ ] Update the report library helper so only ExitScan and RetentieScan are treated as formal management-report routes by default.
- [ ] Tighten `/reports` copy so the page explains formal reports as primary for Exit/Retentie and bounded output for other routes.
- [ ] Tighten safe marketing copy so broad route pages say "dashboard, managementread/output and Action Center" instead of implying every route carries the same formal report layer.
- [ ] Review all touched strings for consistency with the new report policy.

### Task 3: TD-5 case evidence and proof upgrade

**Files:**
- Create: `docs/active/CASE_EVIDENCE_AND_PROOF_POLICY_2026-04-27.md`

- [ ] Write a proof policy doc that distinguishes:
  - lesson_only
  - internal_proof_only
  - sales_usable
  - public_usable
- [ ] Make the doc explicit about:
  - semireal seeded usage vs true customer proof
  - public-proof approval requirements
  - when claims may be strengthened after real usage
- [ ] Cross-check the new policy against the already landed RU closeout and proof execution contract.

### Task 4: TD-4 Action Center proposition sharpening

**Files:**
- Modify: `docs/active/ACTION_CENTER_PROPOSITION_CONTRACT.md`
- Optionally adjust safe supporting copy in files already touched above if needed for consistency

- [ ] Update the Action Center proposition contract so it explicitly fits the sharpened portfolio truth:
  - Action Center as shared follow-through layer
  - not every route starts with the same report weight
  - Action Center remains commercially strongest after insight/output has landed
- [ ] Recheck that no language turns Action Center into a separate product line or generic workflow suite.

### Task 5: Verification and handoff

**Files:**
- Modify: workbook later in canonical output path

- [ ] Run targeted tests or build checks for any changed frontend code.
- [ ] Review git diff for accidental homepage/dashboard design collisions.
- [ ] Commit the wave on the dedicated branch.
- [ ] Update the workbook rows for `TD-0`, `TD-3`, `TD-5`, and `TD-4` in the canonical `.xlsx`.

