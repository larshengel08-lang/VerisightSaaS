# Billing And Self-Serve Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bounded billing and self-serve operations layer that makes account/billing reality explicit in product and ops, without falsely turning Verisight into checkout-first or full self-serve SaaS.

**Architecture:** Build this as an assisted-first internal operating layer, not as a public checkout wave. First lock the suite-era billing contract and registry model, then add an admin-only billing registry surface inside `/beheer`, then wire a limited customer-facing readiness signal so billing/self-serve stays honest and usable without inventing plans, seats, or subscriptions the runtime still does not carry.

**Tech Stack:** Next.js app router, Supabase SQL patch files, existing `organizations` / `org_members` / `campaigns` primitives, admin-first `/beheer` surfaces, TypeScript, Vitest, pytest, workbook-led governance in `verisight_dashboard_roadmap_2026-04-23.xlsx`.

---

## Inputs And Source Of Truth

- Main workbook: `C:/Users/larsh/Desktop/Business/tmp/guided-execution-roadmap/outputs/verisight_dashboard_roadmap_2026-04-23.xlsx`
- Secondary workbook copy: `C:/Users/larsh/Desktop/Business/tmp/guided-execution-roadmap/outputs/verisight_dashboard_roadmap_2026-04-23_commerciele-track.xlsx`
- Current readiness baseline:
  - `C:/Users/larsh/Desktop/Business/Verisight/docs/active/ACCOUNT_AND_BILLING_MODEL_READINESS_PLAN.md`
  - `C:/Users/larsh/Desktop/Business/Verisight/docs/active/ASSISTED_SAAS_OPERATING_CONTRACT.md`
  - `C:/Users/larsh/Desktop/Business/Verisight/docs/active/SUITE_WORKSPACE_ACCOUNT_AND_PROVISIONING_MODEL.md`
  - `C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts`

## Guardrails

- Do not add Stripe, Checkout, subscriptions, invoices, or seat-billing in this tranche.
- Do not create public self-serve signup or payment flows.
- `organization` remains the current tenant/account boundary.
- `org_members` remain access roles, not billable seats.
- `campaigns` remain fulfillment units, not subscriptions.
- Any customer-facing self-serve signal must remain readiness-oriented, not transactional.

---

### Task 1: Freeze The Bounded Billing Execution Contract

**Files:**
- Create: `C:/Users/larsh/Desktop/Business/Verisight/docs/active/BILLING_AND_SELF_SERVE_EXECUTION_CONTRACT.md`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/tests/test_billing_self_serve_execution_contract.py`
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/docs/ops/README.md`

- [ ] **Step 1: Write the failing contract test**

```python
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "docs" / "active" / "BILLING_AND_SELF_SERVE_EXECUTION_CONTRACT.md"


def test_billing_self_serve_contract_locks_bounded_runtime_truth():
    text = CONTRACT.read_text(encoding="utf-8")
    assert "organization-first" in text
    assert "geen Stripe" in text
    assert "geen plans of seats" in text
    assert "admin-only billing registry" in text
    assert "customer-facing readiness signal" in text
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_billing_self_serve_execution_contract.py -q`
Expected: `FAILED` with file-not-found or missing text assertions.

- [ ] **Step 3: Write the contract**

```md
# BILLING_AND_SELF_SERVE_EXECUTION_CONTRACT.md

Last updated: 2026-04-27
Status: active

## Summary

Verisight bouwt nu een bounded billing- en self-serve model:

- organization-first
- admin-only billing registry
- assisted payment and contract reality
- customer-facing readiness signal

Niet toegestaan in deze tranche:

- geen Stripe
- geen plans of seats
- geen public checkout
- geen self-serve org creation
```

- [ ] **Step 4: Update the ops index**

```md
### Billing en self-serve

- [BILLING_AND_SELF_SERVE_EXECUTION_CONTRACT.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/BILLING_AND_SELF_SERVE_EXECUTION_CONTRACT.md)
  - bounded execution contract voor account-, billing- en self-serve waarheid
```

- [ ] **Step 5: Run the contract test again**

Run: `pytest tests/test_billing_self_serve_execution_contract.py -q`
Expected: `1 passed`

- [ ] **Step 6: Commit**

```bash
git add docs/active/BILLING_AND_SELF_SERVE_EXECUTION_CONTRACT.md docs/ops/README.md tests/test_billing_self_serve_execution_contract.py
git commit -m "docs: define bounded billing and self-serve execution contract"
```

### Task 2: Add The Admin-Only Billing Registry Model

**Files:**
- Create: `C:/Users/larsh/Desktop/Business/Verisight/supabase/billing_registry_patch.sql`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/billing-registry.ts`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/billing-registry.test.ts`
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts`

- [ ] **Step 1: Write the failing Vitest**

```ts
import { describe, expect, it } from 'vitest'
import { getBillingRegistryStatusLabel, isBillingReadyForAssistedLaunch } from '@/lib/billing-registry'

describe('billing registry helpers', () => {
  it('keeps billing truth assisted and bounded', () => {
    expect(getBillingRegistryStatusLabel('draft')).toBe('Concept')
    expect(getBillingRegistryStatusLabel('active_manual')).toBe('Actief (handmatig)')
    expect(isBillingReadyForAssistedLaunch({ contractSigned: true, paymentMethodConfirmed: true })).toBe(true)
    expect(isBillingReadyForAssistedLaunch({ contractSigned: true, paymentMethodConfirmed: false })).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- lib/billing-registry.test.ts`
Expected: `FAILED` because `@/lib/billing-registry` does not exist.

- [ ] **Step 3: Add the SQL patch**

```sql
create table if not exists public.billing_registry (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  legal_customer_name text not null,
  contract_state text not null check (contract_state in ('draft','pending_signature','signed')),
  billing_state text not null check (billing_state in ('draft','active_manual','paused','closed')),
  payment_method_confirmed boolean not null default false,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id)
);
```

- [ ] **Step 4: Add the TypeScript helper**

```ts
export type ContractState = 'draft' | 'pending_signature' | 'signed'
export type BillingState = 'draft' | 'active_manual' | 'paused' | 'closed'

export interface BillingRegistryRow {
  orgId: string
  legalCustomerName: string
  contractState: ContractState
  billingState: BillingState
  paymentMethodConfirmed: boolean
}

export function getBillingRegistryStatusLabel(state: BillingState) {
  if (state === 'active_manual') return 'Actief (handmatig)'
  if (state === 'paused') return 'Gepauzeerd'
  if (state === 'closed') return 'Gesloten'
  return 'Concept'
}

export function isBillingReadyForAssistedLaunch(args: {
  contractSigned: boolean
  paymentMethodConfirmed: boolean
}) {
  return args.contractSigned && args.paymentMethodConfirmed
}
```

- [ ] **Step 5: Extend shared types without creating fake seat logic**

```ts
export interface BillingRegistry {
  id: string
  org_id: string
  legal_customer_name: string
  contract_state: 'draft' | 'pending_signature' | 'signed'
  billing_state: 'draft' | 'active_manual' | 'paused' | 'closed'
  payment_method_confirmed: boolean
  notes: string | null
  created_at: string
  updated_at: string
}
```

- [ ] **Step 6: Run tests**

Run: `npm run test -- lib/billing-registry.test.ts`
Expected: `1 passed`

- [ ] **Step 7: Commit**

```bash
git add supabase/billing_registry_patch.sql frontend/lib/billing-registry.ts frontend/lib/billing-registry.test.ts frontend/lib/types.ts
git commit -m "feat: add bounded billing registry model"
```

### Task 3: Add An Internal Billing Registry Surface In `/beheer`

**Files:**
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/billing/page.tsx`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/billing/page.test.ts`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/billing-registry/route.ts`
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/page.tsx`

- [ ] **Step 1: Write the failing page test**

```ts
import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import BillingPage from './page'

describe('beheer billing page', () => {
  it('renders the manual billing registry framing', async () => {
    const html = renderToString(await BillingPage())
    expect(html).toContain('Billing registry')
    expect(html).toContain('Actief (handmatig)')
    expect(html).toContain('Geen Stripe of checkout in deze fase')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- "app/(dashboard)/beheer/billing/page.test.ts"`
Expected: `FAILED` because the page does not exist.

- [ ] **Step 3: Implement the page**

```tsx
export default async function BillingPage() {
  return (
    <main>
      <h1>Billing registry</h1>
      <p>Actief (handmatig)</p>
      <p>Geen Stripe of checkout in deze fase.</p>
    </main>
  )
}
```

- [ ] **Step 4: Add the API route skeleton**

```ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ ok: true, items: [] })
}
```

- [ ] **Step 5: Add a beheer entry point**

```tsx
<Link href="/beheer/billing">Billing registry</Link>
```

- [ ] **Step 6: Run the page test and a focused build-safe suite**

Run: `npm run test -- "app/(dashboard)/beheer/billing/page.test.ts" "app/(dashboard)/beheer/page.test.ts"`
Expected: both pass

- [ ] **Step 7: Commit**

```bash
git add frontend/app/(dashboard)/beheer/billing/page.tsx frontend/app/(dashboard)/beheer/billing/page.test.ts frontend/app/api/billing-registry/route.ts frontend/app/(dashboard)/beheer/page.tsx
git commit -m "feat: add internal billing registry surface"
```

### Task 4: Add A Bounded Customer-Facing Readiness Signal

**Files:**
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/billing-readiness-copy.ts`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/billing-readiness-copy.test.ts`
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx`
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/contact-form.tsx`

- [ ] **Step 1: Write the failing copy test**

```ts
import { describe, expect, it } from 'vitest'
import { billingReadinessCopy } from '@/lib/billing-readiness-copy'

describe('billing readiness copy', () => {
  it('keeps customer messaging assisted and non-transactional', () => {
    expect(billingReadinessCopy.badge).toContain('Assisted')
    expect(billingReadinessCopy.body).toContain('geen checkout')
    expect(billingReadinessCopy.body).toContain('suite-activatie')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- lib/billing-readiness-copy.test.ts`
Expected: `FAILED` because the module does not exist.

- [ ] **Step 3: Add the bounded copy module**

```ts
export const billingReadinessCopy = {
  badge: 'Assisted activatie',
  body: 'Verisight werkt in deze fase zonder checkout: contract, activatie en suite-activatie blijven begeleid en expliciet.',
}
```

- [ ] **Step 4: Surface the signal on pricing and contact**

```tsx
<p>{billingReadinessCopy.body}</p>
```

- [ ] **Step 5: Run the focused tests and build**

Run: `npm run test -- lib/billing-readiness-copy.test.ts lib/marketing-flow.test.ts`
Expected: green  
Run: `npm run build`
Expected: green

- [ ] **Step 6: Commit**

```bash
git add frontend/lib/billing-readiness-copy.ts frontend/lib/billing-readiness-copy.test.ts frontend/app/tarieven/page.tsx frontend/components/marketing/contact-form.tsx
git commit -m "feat: add bounded billing readiness messaging"
```

### Task 5: Review, Closeout, And Workbook Sync

**Files:**
- Create: `C:/Users/larsh/Desktop/Business/Verisight/docs/active/BILLING_AND_SELF_SERVE_MODEL_CLOSEOUT_YYYY-MM-DD.md`
- Modify: `C:/Users/larsh/Desktop/Business/tmp/guided-execution-roadmap/outputs/verisight_dashboard_roadmap_2026-04-23.xlsx`

- [ ] **Step 1: Write the closeout artifact**

```md
# BILLING_AND_SELF_SERVE_MODEL_CLOSEOUT_YYYY-MM-DD.md

- billing registry exists
- admin-only billing surface exists
- customer-facing readiness signal stays assisted
- no checkout / no plan / no seat logic was introduced
```

- [ ] **Step 2: Run the final verification batch**

Run:
```bash
pytest tests/test_billing_self_serve_execution_contract.py tests/test_account_billing_model_readiness.py -q
npm run test -- lib/billing-registry.test.ts lib/billing-readiness-copy.test.ts "app/(dashboard)/beheer/billing/page.test.ts"
npm run build
```
Expected: all green

- [ ] **Step 3: Open PR, review, land, and update workbook**

Run:
```bash
git status --short
git push
```
Then:
- open PR
- add sign-off comment
- land on `main`
- write the resulting PR number and merge commit into the workbook

- [ ] **Step 4: Commit workbook-safe closeout if needed**

```bash
git add docs/active/BILLING_AND_SELF_SERVE_MODEL_CLOSEOUT_YYYY-MM-DD.md
git commit -m "docs: close out bounded billing and self-serve model"
```
