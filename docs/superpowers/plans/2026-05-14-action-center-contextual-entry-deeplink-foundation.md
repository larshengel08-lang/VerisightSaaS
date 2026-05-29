# Action Center Contextual Entry and Deeplink Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the contextual entry and deeplink foundation that lets Action Center open in the exact route and view context needed for strong-hybrid follow-through.

**Architecture:** Introduce one small shared entry-contract helper that owns Action Center URL shape, parsing, validation, and focused landing behavior. Reuse that helper from existing route-open producers, review surfaces, the Action Center page shell, and the client preview so that `focus`, `view`, and `source` stop drifting across handwritten links and browser-history updates.

**Tech Stack:** Next.js App Router, TypeScript, React 19 client components, Vitest, existing Action Center preview model, existing dashboard route helpers.

---

## Scope Check

The strong-hybrid upsell roadmap spans multiple independent subsystems. This file is intentionally only **child plan 1** from [2026-05-14-action-center-strong-hybrid-upsell-design.md](/C:/Users/larsh/Desktop/Business/Verisight/.worktrees/spec-hr-routebeheer-structure/docs/superpowers/specs/2026-05-14-action-center-strong-hybrid-upsell-design.md):

- in scope here: contextual Action Center entry, route-aware deeplinks, server parsing, and client URL sync
- explicitly out of scope here: Outlook invites, email triggers, HR rhythm console, route defaults, instrumentation, commercialization

This child plan should land shippable software on its own and become the foundation for the Outlook/email initiatives that follow.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `frontend/lib/action-center-entry.ts` | Canonical Action Center entry contract: parse, validate, and build contextual URLs |
| `frontend/lib/action-center-entry.test.ts` | Unit coverage for entry parsing and href generation |
| `frontend/lib/dashboard/open-action-center-route.ts` | Campaign-detail route open helper delegates to shared entry contract |
| `frontend/lib/dashboard/open-action-center-route.test.ts` | Redirect contract coverage for route-open producer |
| `frontend/components/dashboard/review-moment-detail-panel.tsx` | Review detail links back into Action Center via the shared entry contract |
| `frontend/components/dashboard/review-moment-detail-panel.test.ts` | Source contract for review-detail focused Action Center links |
| `frontend/app/(dashboard)/action-center/page.tsx` | Read `focus`, `view`, and `source` from search params and pass the parsed entry to the preview shell |
| `frontend/app/(dashboard)/action-center/page.route-shell.test.ts` | Route-shell coverage for contextual page entry and initial view wiring |
| `frontend/components/dashboard/action-center-preview.tsx` | Keep `focus` and `view` in browser history when the selected route or active view changes |
| `frontend/components/dashboard/action-center-preview.contextual-entry.test.ts` | Source contract proving the preview now uses the shared entry helper for URL sync |

Do **not** touch:

- `frontend/lib/action-center-route-contract.ts`
- `frontend/lib/action-center-live.ts`
- any API route
- route eligibility or Outlook/ICS delivery behavior

---

### Task 1: Add the Shared Action Center Entry Contract

**Files:**
- Create: `frontend/lib/action-center-entry.ts`
- Create: `frontend/lib/action-center-entry.test.ts`

- [ ] **Step 1: Write the failing tests for parsing and building contextual entry URLs**

```ts
// frontend/lib/action-center-entry.test.ts
import { describe, expect, it } from 'vitest'
import {
  ACTION_CENTER_ENTRY_SOURCES,
  ACTION_CENTER_ENTRY_VIEWS,
  buildActionCenterEntryHref,
  resolveActionCenterEntryParams,
} from './action-center-entry'

describe('action center entry contract', () => {
  it('keeps the allowed source and view lists explicit', () => {
    expect(ACTION_CENTER_ENTRY_VIEWS).toEqual(['overview', 'actions', 'reviews', 'managers', 'teams'])
    expect(ACTION_CENTER_ENTRY_SOURCES).toEqual(['campaign-detail', 'review-moments', 'action-center', 'notification'])
  })

  it('parses valid focus, source, and view values from raw params', () => {
    expect(
      resolveActionCenterEntryParams({
        focus: 'route-exit::org-1::department::operations',
        view: 'reviews',
        source: 'review-moments',
      }),
    ).toEqual({
      focus: 'route-exit::org-1::department::operations',
      view: 'reviews',
      source: 'review-moments',
    })
  })

  it('falls back to overview and null source for invalid input', () => {
    expect(
      resolveActionCenterEntryParams({
        focus: '   ',
        view: 'workflow',
        source: 'outlook',
      }),
    ).toEqual({
      focus: null,
      view: 'overview',
      source: null,
    })
  })

  it('builds a focused actions URL without leaking empty params', () => {
    expect(
      buildActionCenterEntryHref({
        focus: 'cmp-1',
        view: 'actions',
        source: 'campaign-detail',
      }),
    ).toBe('/action-center?focus=cmp-1&view=actions&source=campaign-detail')
  })

  it('omits the default overview view from the canonical URL', () => {
    expect(
      buildActionCenterEntryHref({
        focus: 'route-1',
        view: 'overview',
        source: null,
      }),
    ).toBe('/action-center?focus=route-1')
  })
})
```

- [ ] **Step 2: Run the new helper test and verify it fails**

Run:

```bash
npx vitest run "lib/action-center-entry.test.ts"
```

Expected: FAIL because `frontend/lib/action-center-entry.ts` does not exist yet.

- [ ] **Step 3: Implement the shared entry helper**

```ts
// frontend/lib/action-center-entry.ts
import type { ActionCenterPreviewView } from '@/lib/action-center-preview-model'

export const ACTION_CENTER_ENTRY_VIEWS = [
  'overview',
  'actions',
  'reviews',
  'managers',
  'teams',
] as const satisfies ActionCenterPreviewView[]

export type ActionCenterEntryView = (typeof ACTION_CENTER_ENTRY_VIEWS)[number]

export const ACTION_CENTER_ENTRY_SOURCES = [
  'campaign-detail',
  'review-moments',
  'action-center',
  'notification',
] as const

export type ActionCenterEntrySource = (typeof ACTION_CENTER_ENTRY_SOURCES)[number]

export interface ActionCenterEntryParams {
  focus: string | null
  view: ActionCenterEntryView
  source: ActionCenterEntrySource | null
}

function isActionCenterEntryView(value: string | null | undefined): value is ActionCenterEntryView {
  return ACTION_CENTER_ENTRY_VIEWS.includes(value as ActionCenterEntryView)
}

export function isActionCenterEntrySource(
  value: string | null | undefined,
): value is ActionCenterEntrySource {
  return ACTION_CENTER_ENTRY_SOURCES.includes(value as ActionCenterEntrySource)
}

export function resolveActionCenterEntryParams(args: {
  focus?: string | null
  view?: string | null
  source?: string | null
}): ActionCenterEntryParams {
  const focus = args.focus?.trim() ? args.focus.trim() : null
  const view = isActionCenterEntryView(args.view) ? args.view : 'overview'
  const source = isActionCenterEntrySource(args.source) ? args.source : null

  return { focus, view, source }
}

export function buildActionCenterEntryHref(args: {
  focus?: string | null
  view?: ActionCenterEntryView
  source?: ActionCenterEntrySource | null
}) {
  const params = new URLSearchParams()

  if (args.focus?.trim()) {
    params.set('focus', args.focus.trim())
  }

  if (args.view && args.view !== 'overview') {
    params.set('view', args.view)
  }

  if (args.source) {
    params.set('source', args.source)
  }

  const query = params.toString()
  return query.length > 0 ? `/action-center?${query}` : '/action-center'
}
```

- [ ] **Step 4: Run the helper tests again and verify they pass**

Run:

```bash
npx vitest run "lib/action-center-entry.test.ts"
```

Expected: PASS

- [ ] **Step 5: Commit the helper foundation**

```bash
git add frontend/lib/action-center-entry.ts frontend/lib/action-center-entry.test.ts
git commit -m "feat(action-center): add contextual entry contract"
```

---

### Task 2: Wire Server Entry Parsing and External Producers to the Shared Contract

**Files:**
- Modify: `frontend/lib/dashboard/open-action-center-route.ts`
- Modify: `frontend/lib/dashboard/open-action-center-route.test.ts`
- Create: `frontend/components/dashboard/review-moment-detail-panel.test.ts`
- Modify: `frontend/components/dashboard/review-moment-detail-panel.tsx`
- Modify: `frontend/app/(dashboard)/action-center/page.tsx`
- Modify: `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`

- [ ] **Step 1: Write the failing redirect, review-panel, and page-shell tests**

```ts
// frontend/lib/dashboard/open-action-center-route.test.ts
import { describe, expect, it } from 'vitest'
import { buildActionCenterRouteOpenRedirect } from './open-action-center-route'

describe('open action center route', () => {
  it('opens the route directly in the actions view', () => {
    expect(buildActionCenterRouteOpenRedirect('cmp-1')).toBe('/action-center?focus=cmp-1&view=actions')
    expect(buildActionCenterRouteOpenRedirect('cmp-1', 'campaign-detail')).toBe(
      '/action-center?focus=cmp-1&view=actions&source=campaign-detail',
    )
  })
})
```

```ts
// frontend/components/dashboard/review-moment-detail-panel.test.ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('review moment detail panel entry links', () => {
  it('uses the shared Action Center entry helper for focused review landing', () => {
    const source = readFileSync(new URL('./review-moment-detail-panel.tsx', import.meta.url), 'utf8')

    expect(source).toContain('buildActionCenterEntryHref')
    expect(source).toContain("view: 'reviews'")
    expect(source).toContain("source: 'review-moments'")
    expect(source).not.toContain('href={`/action-center?focus=${encodeURIComponent(item.id)}`')
  })
})
```

```ts
// frontend/app/(dashboard)/action-center/page.route-shell.test.ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('action center landing shell', () => {
  it('parses contextual entry params and passes the selected view through to the preview', () => {
    const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(pageSource).toContain('view?: string')
    expect(pageSource).toContain('resolveActionCenterEntryParams')
    expect(pageSource).toContain('initialView={entry.view}')
    expect(pageSource).toContain("source === 'campaign-detail'")
    expect(pageSource).toContain("source === 'review-moments'")
  })
})
```

- [ ] **Step 2: Run the failing producer and page-shell tests**

Run:

```bash
npx vitest run "lib/dashboard/open-action-center-route.test.ts" "components/dashboard/review-moment-detail-panel.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected: FAIL because the route-open helper still emits the old URL shape, the review panel hardcodes `/action-center?focus=...`, and the page shell ignores `view`.

- [ ] **Step 3: Implement the shared producer and page-shell wiring**

```ts
// frontend/lib/dashboard/open-action-center-route.ts
import type { ActionCenterEntryView, ActionCenterEntrySource } from '@/lib/action-center-entry'
import { buildActionCenterEntryHref } from '@/lib/action-center-entry'
import type { DeliveryLifecycleStage } from '@/lib/ops-delivery'

// ... keep the existing lifecycle constants and open/closed helpers

export function buildActionCenterRouteOpenRedirect(
  campaignId: string,
  source: Extract<ActionCenterEntrySource, 'campaign-detail'> | null = null,
  view: ActionCenterEntryView = 'actions',
) {
  return buildActionCenterEntryHref({
    focus: campaignId,
    view,
    source,
  })
}
```

```tsx
// frontend/components/dashboard/review-moment-detail-panel.tsx
import Link from 'next/link'
import { buildActionCenterEntryHref } from '@/lib/action-center-entry'

// ...

<Link
  href={buildActionCenterEntryHref({
    focus: item.id,
    view: 'reviews',
    source: 'review-moments',
  })}
  className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-ink)] transition hover:bg-[color:var(--dashboard-muted-surface)]"
>
  Bekijk gekoppelde opvolging
</Link>
```

```tsx
// frontend/app/(dashboard)/action-center/page.tsx
import { resolveActionCenterEntryParams } from '@/lib/action-center-entry'

export default async function ActionCenterPage({
  searchParams,
}: {
  searchParams?: Promise<{ focus?: string; source?: string; view?: string }>
}) {
  const params = (await searchParams) ?? {}
  const entry = resolveActionCenterEntryParams({
    focus: typeof params.focus === 'string' ? params.focus : null,
    view: typeof params.view === 'string' ? params.view : null,
    source: typeof params.source === 'string' ? params.source : null,
  })

  const focusItemId = entry.focus
  const source = entry.source

  // ... keep the existing initialSelectedItemId fallback logic

  const workspaceSubtitle =
    source === 'campaign-detail'
      ? 'Geopend vanuit campaign detail: hier worden eigenaarschap, eerste managerstap en reviewritme expliciet.'
      : source === 'review-moments'
        ? 'Geopend vanuit reviewmomenten: hier blijft de gekoppelde opvolging en reviewcontext bij elkaar.'
        : summary.productCount > 0
          ? `Live opvolging over ${summary.productCount} product${summary.productCount === 1 ? '' : 'en'}`
          : 'Live opvolging'

  return (
    <ActionCenterPreview
      initialItems={items}
      initialSelectedItemId={initialSelectedItemId}
      initialView={entry.view}
      // ... keep the existing props
    />
  )
}
```

- [ ] **Step 4: Re-run the producer and page-shell tests**

Run:

```bash
npx vitest run "lib/dashboard/open-action-center-route.test.ts" "components/dashboard/review-moment-detail-panel.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected: PASS

- [ ] **Step 5: Commit the producer and shell wiring**

```bash
git add frontend/lib/dashboard/open-action-center-route.ts frontend/lib/dashboard/open-action-center-route.test.ts frontend/components/dashboard/review-moment-detail-panel.tsx frontend/components/dashboard/review-moment-detail-panel.test.ts frontend/app/'(dashboard)'/action-center/page.tsx frontend/app/'(dashboard)'/action-center/page.route-shell.test.ts
git commit -m "feat(action-center): wire contextual entry into producers and page shell"
```

---

### Task 3: Keep Focus and View in the Browser URL While Navigating the Preview

**Files:**
- Create: `frontend/components/dashboard/action-center-preview.contextual-entry.test.ts`
- Modify: `frontend/components/dashboard/action-center-preview.tsx`

- [ ] **Step 1: Write the failing preview source-contract test**

```ts
// frontend/components/dashboard/action-center-preview.contextual-entry.test.ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('action center preview contextual entry sync', () => {
  it('uses the shared entry helper to keep focus and view in the browser URL', () => {
    const source = readFileSync(new URL('./action-center-preview.tsx', import.meta.url), 'utf8')

    expect(source).toContain('buildActionCenterEntryHref')
    expect(source).toContain('setContextualView')
    expect(source).toContain("url.searchParams.get('source')")
    expect(source).toContain("focusActionRoute(routeId)")
    expect(source).not.toContain("url.searchParams.set('focus', routeId)")
  })
})
```

- [ ] **Step 2: Run the preview contextual-entry test and confirm it fails**

Run:

```bash
npx vitest run "components/dashboard/action-center-preview.contextual-entry.test.ts"
```

Expected: FAIL because the preview still mutates only `focus` by hand and does not use the shared entry helper.

- [ ] **Step 3: Implement client-side URL synchronization through the shared helper**

```tsx
// frontend/components/dashboard/action-center-preview.tsx
import {
  buildActionCenterEntryHref,
  isActionCenterEntrySource,
  type ActionCenterEntrySource,
} from '@/lib/action-center-entry'

// ... inside ActionCenterPreview

  function replaceEntryUrl(args: {
    focus?: string | null
    view: ActionCenterPreviewView
  }) {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    const source = url.searchParams.get('source')
    const nextHref = buildActionCenterEntryHref({
      focus: args.focus ?? selectedItemId,
      view: args.view,
      source: isActionCenterEntrySource(source) ? (source as ActionCenterEntrySource) : null,
    })

    window.history.replaceState(window.history.state, '', nextHref)
  }

  function setContextualView(nextView: ActionCenterPreviewView) {
    setActiveView(nextView)
    replaceEntryUrl({ focus: selectedItemId, view: nextView })
  }

  function focusActionRoute(routeId: string) {
    setSelectedItemId(routeId)
    setActiveView('actions')
    replaceEntryUrl({ focus: routeId, view: 'actions' })
  }

// Replace direct setActiveView(...) calls in navigation and overview CTA handlers with setContextualView(...)
```

- [ ] **Step 4: Run the preview source-contract test and the Action Center shell regression**

Run:

```bash
npx vitest run "components/dashboard/action-center-preview.contextual-entry.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts" "lib/action-center-entry.test.ts" "lib/dashboard/open-action-center-route.test.ts"
```

Expected: PASS

- [ ] **Step 5: Commit the preview URL-sync behavior**

```bash
git add frontend/components/dashboard/action-center-preview.tsx frontend/components/dashboard/action-center-preview.contextual-entry.test.ts
git commit -m "feat(action-center): keep contextual focus and view in preview urls"
```

---

## Verification Checklist

- [ ] `/action-center?focus=<routeId>&view=actions` opens directly into the selected route in the actions view
- [ ] `/action-center?focus=<routeId>&view=reviews&source=review-moments` preserves the review entry context
- [ ] opening Action Center from campaign detail defaults to `view=actions`
- [ ] invalid `view` values fall back to `overview`
- [ ] empty or whitespace-only `focus` values are ignored safely
- [ ] no route semantics, permissions, closeout rules, or follow-up logic changed

## Suggested Follow-Up Plan

After this child plan is implemented and verified, the next child plan to write should be:

- `Outlook / Email / ICS Channel Contract`

That plan can then safely assume contextual landing already exists.
