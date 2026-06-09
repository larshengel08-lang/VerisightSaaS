# Deeper Telemetry And Health Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bounded but real telemetry layer that captures activation, first value, first management use, denied access, and Action Center follow-through events, then turns those into operational health signals inside the suite.

**Architecture:** Build telemetry as a small internal evidence layer, not as a product-led growth stack. Start by freezing the event taxonomy and SQL contract, then add a single event-ingest path plus typed helpers, then instrument only the suite-critical moments that already exist, then surface a `/beheer` health review page driven by those events and the current delivery/Action Center truth.

**Tech Stack:** Next.js app router, Supabase SQL patch files, TypeScript helpers, admin-only `/beheer` pages, Vitest, existing suite/access/runtime tests, workbook-led governance.

---

## Inputs And Source Of Truth

- Main workbook: `C:/Users/larsh/Desktop/Business/tmp/guided-execution-roadmap/outputs/verisight_dashboard_roadmap_2026-04-23.xlsx`
- Supporting workbook copy: `C:/Users/larsh/Desktop/Business/tmp/guided-execution-roadmap/outputs/verisight_dashboard_roadmap_2026-04-23_commerciele-track.xlsx`
- Current health baseline:
  - `C:/Users/larsh/Desktop/Business/Verisight/docs/active/ASSISTED_SAAS_HEALTH_AND_ADOPTION_REVIEW.md`
  - `C:/Users/larsh/Desktop/Business/Verisight/docs/ops/PILOT_LEARNING_PLAYBOOK.md`
  - `C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/suite-access.ts`
  - `C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/action-center-live.ts`

## Guardrails

- Do not build a broad analytics product.
- Do not instrument every click.
- Do not leak survey content into telemetry payloads.
- Only log bounded suite events tied to lifecycle, access, and follow-through.
- Health review stays admin/internal-first.

---

### Task 1: Freeze The Telemetry Event Contract

**Files:**
- Create: `C:/Users/larsh/Desktop/Business/Verisight/docs/active/SUITE_TELEMETRY_EVENT_CONTRACT.md`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/tests/test_suite_telemetry_contract.py`
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/docs/ops/README.md`

- [ ] **Step 1: Write the failing contract test**

```python
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "docs" / "active" / "SUITE_TELEMETRY_EVENT_CONTRACT.md"


def test_suite_telemetry_contract_lists_bounded_core_events():
    text = CONTRACT.read_text(encoding="utf-8")
    assert "owner_access_confirmed" in text
    assert "first_value_confirmed" in text
    assert "manager_denied_insights" in text
    assert "action_center_review_scheduled" in text
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_suite_telemetry_contract.py -q`
Expected: fail because the file does not exist.

- [ ] **Step 3: Write the contract**

```md
# SUITE_TELEMETRY_EVENT_CONTRACT.md

Core events:
- owner_access_confirmed
- first_value_confirmed
- first_management_use_confirmed
- manager_denied_insights
- action_center_review_scheduled
- action_center_closeout_recorded
```

- [ ] **Step 4: Index the contract in ops README**

```md
- [SUITE_TELEMETRY_EVENT_CONTRACT.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/SUITE_TELEMETRY_EVENT_CONTRACT.md)
  - bounded event taxonomy for suite health evidence
```

- [ ] **Step 5: Run the contract test again**

Run: `pytest tests/test_suite_telemetry_contract.py -q`
Expected: `1 passed`

- [ ] **Step 6: Commit**

```bash
git add docs/active/SUITE_TELEMETRY_EVENT_CONTRACT.md docs/ops/README.md tests/test_suite_telemetry_contract.py
git commit -m "docs: define suite telemetry event contract"
```

### Task 2: Add The Telemetry Storage And Helper Layer

**Files:**
- Create: `C:/Users/larsh/Desktop/Business/Verisight/supabase/suite_telemetry_events_patch.sql`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/telemetry/events.ts`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/telemetry/events.test.ts`

- [ ] **Step 1: Write the failing helper test**

```ts
import { describe, expect, it } from 'vitest'
import { buildSuiteTelemetryEvent } from '@/lib/telemetry/events'

describe('suite telemetry event builder', () => {
  it('normalizes a bounded telemetry payload', () => {
    const event = buildSuiteTelemetryEvent('first_value_confirmed', {
      orgId: 'org_123',
      campaignId: 'cmp_123',
      actorId: 'user_123',
    })
    expect(event.eventType).toBe('first_value_confirmed')
    expect(event.orgId).toBe('org_123')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- lib/telemetry/events.test.ts`
Expected: fail because module does not exist.

- [ ] **Step 3: Add the SQL patch**

```sql
create table if not exists public.suite_telemetry_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  org_id uuid null references public.organizations(id) on delete set null,
  campaign_id uuid null references public.campaigns(id) on delete set null,
  actor_id uuid null references auth.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

- [ ] **Step 4: Add the helper**

```ts
export type SuiteTelemetryEventType =
  | 'owner_access_confirmed'
  | 'first_value_confirmed'
  | 'first_management_use_confirmed'
  | 'manager_denied_insights'
  | 'action_center_review_scheduled'
  | 'action_center_closeout_recorded'

export function buildSuiteTelemetryEvent(
  eventType: SuiteTelemetryEventType,
  args: { orgId?: string | null; campaignId?: string | null; actorId?: string | null; payload?: Record<string, unknown> },
) {
  return {
    eventType,
    orgId: args.orgId ?? null,
    campaignId: args.campaignId ?? null,
    actorId: args.actorId ?? null,
    payload: args.payload ?? {},
  }
}
```

- [ ] **Step 5: Run the helper test**

Run: `npm run test -- lib/telemetry/events.test.ts`
Expected: `1 passed`

- [ ] **Step 6: Commit**

```bash
git add supabase/suite_telemetry_events_patch.sql frontend/lib/telemetry/events.ts frontend/lib/telemetry/events.test.ts
git commit -m "feat: add bounded suite telemetry event model"
```

### Task 3: Add A Single Internal Event Ingest Path And Instrument Core Moments

**Files:**
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/internal/telemetry/route.ts`
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/suite-access.ts`
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/action-center-live.ts`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/internal/telemetry/route.test.ts`

- [ ] **Step 1: Write the failing route test**

```ts
import { describe, expect, it } from 'vitest'
import { POST } from './route'

describe('internal telemetry route', () => {
  it('rejects incomplete telemetry payloads', async () => {
    const response = await POST(new Request('http://localhost/api/internal/telemetry', {
      method: 'POST',
      body: JSON.stringify({}),
    }))
    expect(response.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- "app/api/internal/telemetry/route.test.ts"`
Expected: fail because the route does not exist.

- [ ] **Step 3: Implement a minimal ingest route**

```ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body?.eventType) {
    return NextResponse.json({ error: 'Missing event type.' }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Add two concrete instrumentation points**

```ts
// suite-access.ts
if (context.managerOnly && !context.canViewInsights) {
  // queue manager_denied_insights event
}

// action-center-live.ts
// when a review date is resolved for an item, queue action_center_review_scheduled
```

- [ ] **Step 5: Run route and runtime tests**

Run:
```bash
npm run test -- "app/api/internal/telemetry/route.test.ts" "lib/suite-access.test.ts" "lib/action-center-live.test.ts"
```
Expected: all pass

- [ ] **Step 6: Commit**

```bash
git add frontend/app/api/internal/telemetry/route.ts frontend/app/api/internal/telemetry/route.test.ts frontend/lib/suite-access.ts frontend/lib/action-center-live.ts
git commit -m "feat: add bounded telemetry ingest and core instrumentation"
```

### Task 4: Add The Internal Health Review Surface

**Files:**
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/health/page.tsx`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/health/page.test.ts`
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/page.tsx`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/docs/active/SUITE_HEALTH_REVIEW_CLOSEOUT_YYYY-MM-DD.md`

- [ ] **Step 1: Write the failing page test**

```ts
import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import HealthPage from './page'

describe('beheer health page', () => {
  it('renders the bounded suite health review headings', async () => {
    const html = renderToString(await HealthPage())
    expect(html).toContain('Suite health review')
    expect(html).toContain('First value')
    expect(html).toContain('Action Center')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- "app/(dashboard)/beheer/health/page.test.ts"`
Expected: fail because the page does not exist.

- [ ] **Step 3: Implement the health page**

```tsx
export default async function HealthPage() {
  return (
    <main>
      <h1>Suite health review</h1>
      <section><h2>First value</h2></section>
      <section><h2>Action Center</h2></section>
    </main>
  )
}
```

- [ ] **Step 4: Link it from `/beheer`**

```tsx
<Link href="/beheer/health">Suite health review</Link>
```

- [ ] **Step 5: Run the focused tests and build**

Run:
```bash
npm run test -- "app/(dashboard)/beheer/health/page.test.ts" "app/(dashboard)/beheer/page.test.ts" "lib/telemetry/events.test.ts"
npm run build
```
Expected: green

- [ ] **Step 6: Commit**

```bash
git add frontend/app/(dashboard)/beheer/health/page.tsx frontend/app/(dashboard)/beheer/health/page.test.ts frontend/app/(dashboard)/beheer/page.tsx docs/active/SUITE_HEALTH_REVIEW_CLOSEOUT_YYYY-MM-DD.md
git commit -m "feat: add suite health review surface"
```
