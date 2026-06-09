# Broader Live Proof And Pilot Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a broader live proof and pilot layer that turns semireal and real customer runs into structured internal evidence, approved case proof, and bounded public proof updates without overselling the suite.

**Architecture:** Extend the existing learning/case playbooks into a concrete proof registry and pilot operations layer. First freeze the proof ladder and approval rules, then add a persisted proof registry and admin review surface, then connect approved proof to bounded public proof cards, and finally run a broader multi-run pilot cycle that updates site/sales proof only when approval state allows.

**Tech Stack:** Existing learning and Action Center ops surfaces, Supabase SQL patch files, Next.js admin pages under `/beheer`, marketing copy modules, pytest, Vitest, workbook-led governance.

---

## Inputs And Source Of Truth

- Main workbook: `C:/Users/larsh/Desktop/Business/tmp/guided-execution-roadmap/outputs/verisight_dashboard_roadmap_2026-04-23.xlsx`
- Supporting workbook copy: `C:/Users/larsh/Desktop/Business/tmp/guided-execution-roadmap/outputs/verisight_dashboard_roadmap_2026-04-23_commerciele-track.xlsx`
- Current proof baseline:
  - `C:/Users/larsh/Desktop/Business/Verisight/docs/ops/PILOT_LEARNING_PLAYBOOK.md`
  - `C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CASE_PROOF_CAPTURE_PLAYBOOK.md`
  - `C:/Users/larsh/Desktop/Business/Verisight/docs/active/ASSISTED_SAAS_LAUNCH_VERDICT_2026-04-26.md`
  - `C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts`

## Guardrails

- No public proof without explicit approval state.
- No sample output promoted into case proof.
- No ROI or behavior-change claims without specific approved evidence.
- Keep proof registry internal-first and admin-first.
- Public proof should stay bounded to what the suite truly does now.

---

### Task 1: Freeze The Proof Ladder And Approval Contract

**Files:**
- Create: `C:/Users/larsh/Desktop/Business/Verisight/docs/active/SUITE_PROOF_AND_PILOT_EXECUTION_CONTRACT.md`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/tests/test_suite_proof_and_pilot_contract.py`
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CASE_PROOF_CAPTURE_PLAYBOOK.md`

- [ ] **Step 1: Write the failing contract test**

```python
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "docs" / "active" / "SUITE_PROOF_AND_PILOT_EXECUTION_CONTRACT.md"


def test_proof_and_pilot_contract_locks_approval_ladder():
    text = CONTRACT.read_text(encoding="utf-8")
    assert "lesson_only" in text
    assert "internal_proof_only" in text
    assert "sales_usable" in text
    assert "public_usable" in text
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_suite_proof_and_pilot_contract.py -q`
Expected: fail because the file does not exist.

- [ ] **Step 3: Write the contract**

```md
# SUITE_PROOF_AND_PILOT_EXECUTION_CONTRACT.md

Proof ladder:
- lesson_only
- internal_proof_only
- sales_usable
- public_usable

No public proof without approved provenance.
```

- [ ] **Step 4: Tighten the case-proof playbook**

```md
Voeg expliciet toe:
- public proof mag alleen vanuit `public_usable`
- Action Center en manager-only usage mogen wel proof dragen, maar geen brede orchestrationclaim
```

- [ ] **Step 5: Run the contract test again**

Run: `pytest tests/test_suite_proof_and_pilot_contract.py -q`
Expected: `1 passed`

- [ ] **Step 6: Commit**

```bash
git add docs/active/SUITE_PROOF_AND_PILOT_EXECUTION_CONTRACT.md docs/ops/CASE_PROOF_CAPTURE_PLAYBOOK.md tests/test_suite_proof_and_pilot_contract.py
git commit -m "docs: define suite proof and pilot execution contract"
```

### Task 2: Add A Persisted Internal Proof Registry

**Files:**
- Create: `C:/Users/larsh/Desktop/Business/Verisight/supabase/proof_registry_patch.sql`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/proof-registry.ts`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/proof-registry.test.ts`

- [ ] **Step 1: Write the failing registry test**

```ts
import { describe, expect, it } from 'vitest'
import { getProofApprovalLabel } from '@/lib/proof-registry'

describe('proof registry helpers', () => {
  it('labels proof approval states correctly', () => {
    expect(getProofApprovalLabel('draft')).toBe('Concept')
    expect(getProofApprovalLabel('approved')).toBe('Goedgekeurd')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- lib/proof-registry.test.ts`
Expected: fail because module does not exist.

- [ ] **Step 3: Add the SQL patch**

```sql
create table if not exists public.case_proof_registry (
  id uuid primary key default gen_random_uuid(),
  org_id uuid null references public.organizations(id) on delete set null,
  campaign_id uuid null references public.campaigns(id) on delete set null,
  route text not null,
  proof_state text not null check (proof_state in ('lesson_only','internal_proof_only','sales_usable','public_usable')),
  approval_state text not null check (approval_state in ('draft','internal_review','claim_check','customer_permission','approved','rejected')),
  summary text not null,
  claimable_observation text null,
  supporting_artifacts jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
```

- [ ] **Step 4: Add the helper**

```ts
export type ProofState = 'lesson_only' | 'internal_proof_only' | 'sales_usable' | 'public_usable'
export type ApprovalState = 'draft' | 'internal_review' | 'claim_check' | 'customer_permission' | 'approved' | 'rejected'

export function getProofApprovalLabel(state: ApprovalState) {
  if (state === 'approved') return 'Goedgekeurd'
  if (state === 'rejected') return 'Afgewezen'
  if (state === 'internal_review') return 'Interne review'
  if (state === 'claim_check') return 'Claim check'
  if (state === 'customer_permission') return 'Klanttoestemming'
  return 'Concept'
}
```

- [ ] **Step 5: Run the registry test**

Run: `npm run test -- lib/proof-registry.test.ts`
Expected: `1 passed`

- [ ] **Step 6: Commit**

```bash
git add supabase/proof_registry_patch.sql frontend/lib/proof-registry.ts frontend/lib/proof-registry.test.ts
git commit -m "feat: add internal proof registry model"
```

### Task 3: Add The Admin Proof Review Surface

**Files:**
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/proof/page.tsx`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/proof/page.test.ts`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/proof-registry/route.ts`
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/page.tsx`

- [ ] **Step 1: Write the failing page test**

```ts
import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import ProofPage from './page'

describe('beheer proof page', () => {
  it('renders the proof ladder and approval headings', async () => {
    const html = renderToString(await ProofPage())
    expect(html).toContain('Case proof registry')
    expect(html).toContain('sales_usable')
    expect(html).toContain('public_usable')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- "app/(dashboard)/beheer/proof/page.test.ts"`
Expected: fail because the page does not exist.

- [ ] **Step 3: Implement the admin page**

```tsx
export default async function ProofPage() {
  return (
    <main>
      <h1>Case proof registry</h1>
      <p>sales_usable</p>
      <p>public_usable</p>
    </main>
  )
}
```

- [ ] **Step 4: Add the registry API route**

```ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ ok: true, items: [] })
}
```

- [ ] **Step 5: Link it from `/beheer`**

```tsx
<Link href="/beheer/proof">Case proof registry</Link>
```

- [ ] **Step 6: Run the page tests**

Run: `npm run test -- "app/(dashboard)/beheer/proof/page.test.ts" "app/(dashboard)/beheer/page.test.ts"`
Expected: both pass

- [ ] **Step 7: Commit**

```bash
git add frontend/app/(dashboard)/beheer/proof/page.tsx frontend/app/(dashboard)/beheer/proof/page.test.ts frontend/app/api/proof-registry/route.ts frontend/app/(dashboard)/beheer/page.tsx
git commit -m "feat: add proof review surface"
```

### Task 4: Add A Bounded Public Proof Feed And Pilot Closeout

**Files:**
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/public-proof-feed.ts`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/public-proof-feed.test.ts`
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/docs/ops/BROADER_LIVE_PROOF_PILOT_RUNBOOK.md`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/docs/active/BROADER_LIVE_PROOF_CLOSEOUT_YYYY-MM-DD.md`

- [ ] **Step 1: Write the failing feed test**

```ts
import { describe, expect, it } from 'vitest'
import { canPublishProofCard } from '@/lib/public-proof-feed'

describe('public proof feed', () => {
  it('only publishes approved public proof', () => {
    expect(canPublishProofCard({ proofState: 'public_usable', approvalState: 'approved' })).toBe(true)
    expect(canPublishProofCard({ proofState: 'sales_usable', approvalState: 'approved' })).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- lib/public-proof-feed.test.ts`
Expected: fail because module does not exist.

- [ ] **Step 3: Implement the bounded feed helper**

```ts
export function canPublishProofCard(args: {
  proofState: 'lesson_only' | 'internal_proof_only' | 'sales_usable' | 'public_usable'
  approvalState: 'draft' | 'internal_review' | 'claim_check' | 'customer_permission' | 'approved' | 'rejected'
}) {
  return args.proofState === 'public_usable' && args.approvalState === 'approved'
}
```

- [ ] **Step 4: Add a narrow site-content insertion point**

```ts
export const approvedProofFeed = []
```

- [ ] **Step 5: Add the pilot runbook**

```md
# BROADER_LIVE_PROOF_PILOT_RUNBOOK.md

- target 3-5 live or semireal runs
- capture first value, first management use, first assignment, first review
- classify each run into lesson_only / internal_proof_only / sales_usable / public_usable
```

- [ ] **Step 6: Run final proof tests and build**

Run:
```bash
pytest tests/test_suite_proof_and_pilot_contract.py tests/test_case_proof_and_evidence_system.py -q
npm run test -- lib/proof-registry.test.ts lib/public-proof-feed.test.ts "app/(dashboard)/beheer/proof/page.test.ts"
npm run build
```
Expected: green

- [ ] **Step 7: Commit**

```bash
git add frontend/lib/public-proof-feed.ts frontend/lib/public-proof-feed.test.ts frontend/components/marketing/site-content.ts docs/ops/BROADER_LIVE_PROOF_PILOT_RUNBOOK.md docs/active/BROADER_LIVE_PROOF_CLOSEOUT_YYYY-MM-DD.md
git commit -m "feat: add bounded public proof feed and pilot runbook"
```
