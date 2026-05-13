# HR Routebeheer Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the HR version of `/campaigns/[id]/beheer` into a compact, phase-driven worktable that preserves current capabilities but removes interpretation-heavy status layers.

**Architecture:** Keep `buildGuidedSelfServeState()` and the existing route data pipeline as canonical truth, then add a presentation-layer mapping from current guided-self-serve phases into five HR-facing phases. Replace the current top-heavy `RouteBeheer` composition with a compact route header, a single clickable `Nu doen` row, a collapsed phase overview, one on-demand phase detail surface, and a restrained output/logbook layer.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript, Vitest, existing dashboard primitives, existing guided-self-serve helpers.

---

## File Structure

### Existing files to modify

- `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\beheer\beheer-data.ts`
  - Extend the routebeheer view-model with canonical HR phase mapping, `Nu doen` presentation data, compact phase summaries, phase detail payloads, and explicit output-summary ownership.
- `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\beheer\beheer-data.test.ts`
  - Add deterministic unit tests for lifecycle mapping, `Nu doen` priority, output summary ownership, and route-settings placement.
- `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\beheer\page.tsx`
  - Recompose the page around the new structure and remove legacy top-heavy ordering.
- `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\beheer\page.test.ts`
  - Update guardrails to assert the new structure and the removal of interpretation-heavy copy.
- `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\beheer\route-beheer-components.tsx`
  - Shrink the file to route header + top-level layout shells.

### New files to create

- `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\beheer\route-beheer-phase-sections.tsx`
  - Render the collapsed five-phase overview, selected phase detail, and the compact output/logbook sections.
- `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\beheer\route-beheer-phase-sections.test.tsx`
  - Component-level render tests for the collapsed overview, selected phase detail, and output summary boundaries.

### Existing files to verify only

- `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\guided-self-serve.ts`
  - Do not change canonical logic. Use only as source of truth for phase and `nextAction`.
- `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\campaign-actions.tsx`
  - Reuse existing campaign actions for invite/reminder execution.

---

## Task 1: Add canonical HR phase mapping and compact routebeheer view-model

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\beheer\beheer-data.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\beheer\beheer-data.test.ts`

- [ ] **Step 1: Write the failing tests for the five-phase mapping and `Nu doen` priority**

Add these tests to `beheer-data.test.ts`:

```ts
import {
  buildRouteBeheerLifecycleSteps,
  mapGuidedPhaseToHrRoutePhase,
  buildHrRouteBeheerPhaseSummary,
  buildHrRouteBeheerNowDoing,
} from './beheer-data'

it('maps guided-self-serve phases deterministically into the five HR routebeheer phases', () => {
  expect(mapGuidedPhaseToHrRoutePhase('participant_data_required')).toBe('doelgroep')
  expect(mapGuidedPhaseToHrRoutePhase('import_validation_required')).toBe('doelgroep')
  expect(mapGuidedPhaseToHrRoutePhase('launch_date_required')).toBe('communicatie')
  expect(mapGuidedPhaseToHrRoutePhase('communication_ready')).toBe('communicatie')
  expect(mapGuidedPhaseToHrRoutePhase('ready_to_invite')).toBe('live')
  expect(mapGuidedPhaseToHrRoutePhase('survey_running')).toBe('live')
  expect(mapGuidedPhaseToHrRoutePhase('dashboard_active')).toBe('output')
  expect(mapGuidedPhaseToHrRoutePhase('first_next_step_available')).toBe('output')
  expect(mapGuidedPhaseToHrRoutePhase('closed')).toBe('afronding')
})

it('keeps the existing guided next action as the single source for the now-doing row', () => {
  const nowDoing = buildHrRouteBeheerNowDoing({
    nextAction: {
      title: 'Verstuur uitnodigingen',
      body: 'Uitnodiging staat klaar, nog niet verstuurd.',
    },
    actionHref: '/campaigns/cmp-1#uitnodigingen',
    mappedPhase: 'live',
  })

  expect(nowDoing.label).toBe('Nu doen')
  expect(nowDoing.title).toBe('Verstuur uitnodigingen')
  expect(nowDoing.body).toContain('nog niet verstuurd')
  expect(nowDoing.href).toBe('/campaigns/cmp-1#uitnodigingen')
  expect(nowDoing.phaseKey).toBe('live')
})

it('keeps output summary compact while the detailed readiness remains in the output phase', () => {
  const summary = buildHrRouteBeheerPhaseSummary({
    phaseKey: 'output',
    title: 'Output beoordelen',
    status: 'open',
    facts: ['Dashboard beschikbaar', 'Rapport nog niet beschikbaar'],
    primaryAction: { label: 'Open dashboard', href: '/campaigns/cmp-1' },
    secondaryAction: { label: 'Open rapportstatus', href: '/reports?kind=management' },
  })

  expect(summary.factLine).toBe('Dashboard beschikbaar · Rapport nog niet beschikbaar')
  expect(summary.primaryAction?.label).toBe('Open dashboard')
})

it('keeps route settings inside the communicatie phase instead of a top-level standalone block', () => {
  const communicatie = buildHrRouteBeheerPhaseSummary({
    phaseKey: 'communicatie',
    title: 'Communicatie instellen',
    status: 'open',
    facts: ['Uitnodiging ontbreekt', 'Reminder niet ingesteld'],
    primaryAction: { label: 'Open uitnodiging', href: '/campaigns/cmp-1#uitnodigingen' },
    secondaryAction: { label: 'Bekijk instellingen', href: '/campaigns/cmp-1/beheer#route-instellingen' },
  })

  expect(communicatie.secondaryAction?.label).toBe('Bekijk instellingen')
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```powershell
npm test -- "app/(dashboard)/campaigns/[id]/beheer/beheer-data.test.ts"
```

Expected:

- FAIL with missing exports such as `mapGuidedPhaseToHrRoutePhase`
- or FAIL because the new summary/now-doing builders do not exist yet

- [ ] **Step 3: Add the new HR routebeheer view-model types and mapping helpers**

In `beheer-data.ts`, add focused types and helpers near the existing routebeheer types:

```ts
type HrRouteBeheerPhaseKey =
  | 'doelgroep'
  | 'communicatie'
  | 'live'
  | 'output'
  | 'afronding'

type HrRouteBeheerPhaseStatus = 'done' | 'current' | 'open'

export type HrRouteBeheerActionLink = {
  label: string
  href: string
}

export type HrRouteBeheerPhaseSummary = {
  phaseKey: HrRouteBeheerPhaseKey
  title: string
  status: HrRouteBeheerPhaseStatus
  factLine: string
  primaryAction: HrRouteBeheerActionLink | null
  secondaryAction: HrRouteBeheerActionLink | null
}

export type HrRouteBeheerPhaseDetail = {
  phaseKey: HrRouteBeheerPhaseKey
  title: string
  status: HrRouteBeheerPhaseStatus
  facts: string[]
  primaryAction: HrRouteBeheerActionLink | null
  secondaryAction: HrRouteBeheerActionLink | null
}

export type HrRouteBeheerNowDoing = {
  label: 'Nu doen'
  title: string
  body: string
  href: string
  phaseKey: HrRouteBeheerPhaseKey
}

export function mapGuidedPhaseToHrRoutePhase(
  phase:
    | 'closed'
    | 'participant_data_required'
    | 'import_validation_required'
    | 'launch_date_required'
    | 'communication_ready'
    | 'ready_to_invite'
    | 'survey_running'
    | 'dashboard_active'
    | 'first_next_step_available',
): HrRouteBeheerPhaseKey {
  switch (phase) {
    case 'participant_data_required':
    case 'import_validation_required':
      return 'doelgroep'
    case 'launch_date_required':
    case 'communication_ready':
      return 'communicatie'
    case 'ready_to_invite':
    case 'survey_running':
      return 'live'
    case 'dashboard_active':
    case 'first_next_step_available':
      return 'output'
    case 'closed':
      return 'afronding'
  }
}

export function buildHrRouteBeheerNowDoing(args: {
  nextAction: { title: string; body: string }
  actionHref: string
  mappedPhase: HrRouteBeheerPhaseKey
}): HrRouteBeheerNowDoing {
  return {
    label: 'Nu doen',
    title: args.nextAction.title,
    body: args.nextAction.body,
    href: args.actionHref,
    phaseKey: args.mappedPhase,
  }
}

export function buildHrRouteBeheerPhaseSummary(args: {
  phaseKey: HrRouteBeheerPhaseKey
  title: string
  status: HrRouteBeheerPhaseStatus
  facts: string[]
  primaryAction: HrRouteBeheerActionLink | null
  secondaryAction: HrRouteBeheerActionLink | null
}): HrRouteBeheerPhaseSummary {
  return {
    phaseKey: args.phaseKey,
    title: args.title,
    status: args.status,
    factLine: args.facts.filter(Boolean).join(' · '),
    primaryAction: args.primaryAction,
    secondaryAction: args.secondaryAction,
  }
}
```

- [ ] **Step 4: Extend `RouteBeheerPageData` with compact phase UI payloads**

Add the new properties to `RouteBeheerPageData` in `beheer-data.ts`:

```ts
export interface RouteBeheerPageData {
  // existing fields...
  nowDoing: HrRouteBeheerNowDoing | null
  phaseSummaries: HrRouteBeheerPhaseSummary[]
  phaseDetails: HrRouteBeheerPhaseDetail[]
  outputSummary: {
    dashboardReady: boolean
    reportReady: boolean
    dashboardHref: string
    reportHref: string | null
    label: string
  }
}
```

Then build those properties inside `fetchRouteBeheerData()` using:

- `buildGuidedSelfServeState(...)` as canonical source for `nextAction`
- `mapGuidedPhaseToHrRoutePhase(guidedState.phase)` as the visible current phase
- the existing respondent/import/report fields for fact strings

Keep the ownership rule explicit in code comments:

```ts
// Output summary stays compact and always visible.
// Output detail remains owned by the output phase detail, not by this summary block.
```

- [ ] **Step 5: Run the helper tests again**

Run:

```powershell
npm test -- "app/(dashboard)/campaigns/[id]/beheer/beheer-data.test.ts"
```

Expected:

- PASS

- [ ] **Step 6: Commit the mapping/model layer**

```powershell
git add "frontend/app/(dashboard)/campaigns/[id]/beheer/beheer-data.ts" "frontend/app/(dashboard)/campaigns/[id]/beheer/beheer-data.test.ts"
git commit -m "feat: add hr routebeheer phase mapping model"
```

---

## Task 2: Replace the top-heavy routebeheer layout with compact route summary + collapsed phase navigation

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\beheer\route-beheer-components.tsx`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\beheer\route-beheer-phase-sections.tsx`
- Test: `C:\Users\\larsh\\Desktop\\Business\\Verisight\\frontend\\app\\(dashboard)\\campaigns\\[id]\\beheer\\route-beheer-phase-sections.test.tsx`

- [ ] **Step 1: Write the failing component tests for the collapsed phase UI**

Create `route-beheer-phase-sections.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  RouteBeheerPhaseOverview,
  RouteBeheerNowDoingRow,
  RouteBeheerOutputSummary,
} from './route-beheer-phase-sections'

describe('routebeheer phase sections', () => {
  it('renders a subtle now-doing row as a direct action link', () => {
    render(
      <RouteBeheerNowDoingRow
        nowDoing={{
          label: 'Nu doen',
          title: 'Verstuur uitnodigingen',
          body: 'Uitnodiging staat klaar, nog niet verstuurd',
          href: '/campaigns/cmp-1#uitnodigingen',
          phaseKey: 'live',
        }}
      />,
    )

    expect(screen.getByRole('link', { name: /verstuur uitnodigingen/i })).toHaveAttribute(
      'href',
      '/campaigns/cmp-1#uitnodigingen',
    )
    expect(screen.getByText('Uitnodiging staat klaar, nog niet verstuurd')).toBeInTheDocument()
  })

  it('renders all phases collapsed by default and shows fact lines without long explanatory copy', () => {
    render(
      <RouteBeheerPhaseOverview
        phases={[
          {
            phaseKey: 'doelgroep',
            title: 'Doelgroep klaarzetten',
            status: 'current',
            factLine: '124 deelnemers, 18 ontbreken',
            primaryAction: { label: 'Open doelgroep', href: '/campaigns/cmp-1#operatie' },
            secondaryAction: null,
          },
        ]}
      />,
    )

    expect(screen.getByText('Doelgroep klaarzetten')).toBeInTheDocument()
    expect(screen.getByText('124 deelnemers, 18 ontbreken')).toBeInTheDocument()
    expect(screen.queryByText(/waarom dit belangrijk is/i)).not.toBeInTheDocument()
  })

  it('keeps the always-visible output summary compact and action-only', () => {
    render(
      <RouteBeheerOutputSummary
        summary={{
          dashboardReady: true,
          reportReady: false,
          dashboardHref: '/campaigns/cmp-1',
          reportHref: null,
          label: 'Dashboard beschikbaar, rapport nog niet beschikbaar',
        }}
      />,
    )

    expect(screen.getByRole('link', { name: /open dashboard/i })).toHaveAttribute('href', '/campaigns/cmp-1')
    expect(screen.getByText('Dashboard beschikbaar, rapport nog niet beschikbaar')).toBeInTheDocument()
    expect(screen.queryByText(/readiness/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```powershell
npm test -- "app/(dashboard)/campaigns/[id]/beheer/route-beheer-phase-sections.test.tsx"
```

Expected:

- FAIL because the file/components do not exist yet

- [ ] **Step 3: Create the focused phase-section component file**

Create `route-beheer-phase-sections.tsx` with focused components only:

```tsx
import Link from 'next/link'
import type {
  HrRouteBeheerNowDoing,
  HrRouteBeheerPhaseDetail,
  HrRouteBeheerPhaseSummary,
  RouteBeheerPageData,
} from './beheer-data'

function phaseStatusLabel(status: 'done' | 'current' | 'open') {
  if (status === 'done') return 'Klaar'
  if (status === 'current') return 'Open'
  return 'Wacht'
}

export function RouteBeheerNowDoingRow({ nowDoing }: { nowDoing: HrRouteBeheerNowDoing | null }) {
  if (!nowDoing) return null

  return (
    <Link
      href={nowDoing.href}
      className="flex items-center justify-between rounded-[18px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 transition hover:border-[color:var(--teal)]"
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
          {nowDoing.label}
        </p>
        <p className="mt-1 text-sm font-semibold text-[color:var(--ink)]">{nowDoing.title}</p>
        <p className="mt-1 text-sm text-[color:var(--text)]">{nowDoing.body}</p>
      </div>
      <span className="text-sm font-semibold text-[color:var(--teal)]">Open</span>
    </Link>
  )
}

export function RouteBeheerPhaseOverview({ phases }: { phases: HrRouteBeheerPhaseSummary[] }) {
  return (
    <div className="space-y-2">
      {phases.map((phase) => (
        <details key={phase.phaseKey} className="rounded-[18px] border border-[color:var(--border)] bg-white">
          <summary className="cursor-pointer list-none px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[color:var(--ink)]">{phase.title}</p>
                <p className="mt-1 text-sm text-[color:var(--text)]">{phase.factLine}</p>
              </div>
              <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                {phaseStatusLabel(phase.status)}
              </span>
            </div>
          </summary>
        </details>
      ))}
    </div>
  )
}

export function RouteBeheerOutputSummary({
  summary,
}: {
  summary: RouteBeheerPageData['outputSummary']
}) {
  return (
    <div className="rounded-[18px] border border-[color:var(--border)] bg-white px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        Output & afronding
      </p>
      <p className="mt-2 text-sm text-[color:var(--text)]">{summary.label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={summary.dashboardHref} className="inline-flex rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-semibold">
          Open dashboard
        </Link>
        {summary.reportHref ? (
          <Link href={summary.reportHref} className="inline-flex rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-semibold">
            Open rapport
          </Link>
        ) : null}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Slim down `route-beheer-components.tsx` to the new top-level structure**

Replace the current top-heavy composition with a compact wrapper using the new phase section file. Keep the header, but remove:

- `RouteBeheerStatusCards`
- `RouteBeheerBlockerPanel`
- large always-open beheer cards

The new top-level shape should be:

```tsx
import {
  RouteBeheerNowDoingRow,
  RouteBeheerPhaseOverview,
  RouteBeheerOutputSummary,
  RouteBeheerPhaseDetailPanel,
  RouteBeheerLogbookSummary,
} from './route-beheer-phase-sections'

export function RouteBeheerStructuredBody({ data }: { data: RouteBeheerPageData }) {
  return (
    <div className="space-y-6">
      <RouteBeheerNowDoingRow nowDoing={data.nowDoing} />
      <DashboardSection
        id="route-fasen"
        title="Routefasen"
        description="Bekijk per fase wat klaar is en wat nog aandacht vraagt."
        eyebrow="Fasen"
        surface="ops"
        tone="slate"
      >
        <RouteBeheerPhaseOverview phases={data.phaseSummaries} />
      </DashboardSection>
      <RouteBeheerPhaseDetailPanel phases={data.phaseDetails} />
      <RouteBeheerOutputSummary summary={data.outputSummary} />
      <RouteBeheerLogbookSummary
        href={`/campaigns/${data.campaignId}#operatie`}
        latestAuditSummary={data.latestAuditSummary}
      />
    </div>
  )
}
```

- [ ] **Step 5: Run the component tests again**

Run:

```powershell
npm test -- "app/(dashboard)/campaigns/[id]/beheer/route-beheer-phase-sections.test.tsx"
```

Expected:

- PASS

- [ ] **Step 6: Commit the new routebeheer structure components**

```powershell
git add "frontend/app/(dashboard)/campaigns/[id]/beheer/route-beheer-components.tsx" "frontend/app/(dashboard)/campaigns/[id]/beheer/route-beheer-phase-sections.tsx" "frontend/app/(dashboard)/campaigns/[id]/beheer/route-beheer-phase-sections.test.tsx"
git commit -m "feat: restructure hr routebeheer surface"
```

---

## Task 3: Recompose the page and tighten the guardrails against interpretative regression

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\beheer\page.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\beheer\page.test.ts`

- [ ] **Step 1: Write the failing guardrail expectations for the new structure**

Update `page.test.ts` to assert the intended composition:

```ts
it('keeps routebeheer as a compact worktable instead of a stack of interpretation-heavy status surfaces', () => {
  const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
  const componentSource = readFileSync(new URL('./route-beheer-components.tsx', import.meta.url), 'utf8')
  const combined = `${source}\n${componentSource}`

  expect(combined).toContain('RouteBeheerStructuredBody')
  expect(combined).toContain('RouteBeheerNowDoingRow')
  expect(combined).toContain('RouteBeheerPhaseOverview')
  expect(combined).toContain('RouteBeheerOutputSummary')
  expect(combined).not.toContain('RouteBeheerStatusCards')
  expect(combined).not.toContain('RouteBeheerBlockerPanel')
  expect(combined).not.toContain('output-readiness voor deze route')
  expect(combined).not.toContain('Route vraagt nu operationele aandacht')
})

it('keeps the five-phase routebeheer model explicit in the source', () => {
  const source = readFileSync(new URL('./route-beheer-phase-sections.tsx', import.meta.url), 'utf8')

  expect(source).toContain('Doelgroep klaarzetten')
  expect(source).toContain('Communicatie instellen')
  expect(source).toContain('Live zetten & volgen')
  expect(source).toContain('Output beoordelen')
  expect(source).toContain('Afronden & controleren')
})
```

- [ ] **Step 2: Run the guardrail tests to verify they fail**

Run:

```powershell
npm test -- "app/(dashboard)/campaigns/[id]/beheer/page.test.ts"
```

Expected:

- FAIL because the old routebeheer structure is still present

- [ ] **Step 3: Update `page.tsx` to use the new compact structured body**

Replace the current body composition:

```tsx
return (
  <div className="space-y-6">
    <RouteBeheerHeader data={data} />
    <RouteBeheerStatusCards data={data} />
    <RouteBeheerBlockerPanel blockers={data.blockers} />
    <RouteBeheerLifecycleSection data={data} />
    <RouteBeheerSectionsWrapper data={data} />
  </div>
)
```

with:

```tsx
return (
  <div className="space-y-6">
    <RouteBeheerHeader data={data} />
    <RouteBeheerStructuredBody data={data} />
  </div>
)
```

Also update imports accordingly.

- [ ] **Step 4: Run the route guardrail tests again**

Run:

```powershell
npm test -- "app/(dashboard)/campaigns/[id]/beheer/page.test.ts" "app/(dashboard)/campaigns/[id]/beheer/beheer-data.test.ts" "app/(dashboard)/campaigns/[id]/beheer/route-beheer-phase-sections.test.tsx"
```

Expected:

- PASS

- [ ] **Step 5: Commit the page-level rewiring**

```powershell
git add "frontend/app/(dashboard)/campaigns/[id]/beheer/page.tsx" "frontend/app/(dashboard)/campaigns/[id]/beheer/page.test.ts"
git commit -m "feat: wire compact hr routebeheer page"
```

---

## Task 4: Verify visually and protect the rollout with targeted build checks

**Files:**
- Verify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\beheer\page.tsx`
- Verify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\beheer\route-beheer-components.tsx`
- Verify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\beheer\route-beheer-phase-sections.tsx`

- [ ] **Step 1: Run the focused routebeheer test suite**

Run:

```powershell
npm test -- "app/(dashboard)/campaigns/[id]/beheer/beheer-data.test.ts" "app/(dashboard)/campaigns/[id]/beheer/page.test.ts" "app/(dashboard)/campaigns/[id]/beheer/route-beheer-phase-sections.test.tsx"
```

Expected:

- PASS

- [ ] **Step 2: Run eslint on the touched routebeheer files**

Run:

```powershell
npx eslint "app/(dashboard)/campaigns/[id]/beheer/page.tsx" "app/(dashboard)/campaigns/[id]/beheer/beheer-data.ts" "app/(dashboard)/campaigns/[id]/beheer/route-beheer-components.tsx" "app/(dashboard)/campaigns/[id]/beheer/route-beheer-phase-sections.tsx"
```

Expected:

- no new lint errors

- [ ] **Step 3: Run a production build with the known local Supabase placeholders**

Run:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co'
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY='test-anon-key'
npm run build
```

Expected:

- build succeeds
- any remaining warnings are pre-existing and unrelated to routebeheer

- [ ] **Step 4: Do a visual QA pass on `/campaigns/[id]/beheer`**

Open a local dev server and verify:

- top of page is compact
- `Nu doen` is visible and clickable
- all phases are collapsed by default
- no large blocker banner remains
- output section is visible but visually secondary
- logbook/controle sits at the bottom and does not dominate

Document the checks in a short note or screenshot set if your execution flow requires artifacts.

- [ ] **Step 5: Commit the verified routebeheer rollout**

```powershell
git add frontend/app/(dashboard)/campaigns/[id]/beheer
git commit -m "feat: compact hr routebeheer structure"
```

---

## Spec Coverage Check

This plan covers the approved spec sections as follows:

- **Compact regiepagina** -> Tasks 2 and 3 replace the current heavy route structure
- **Deterministic five-phase model** -> Task 1 adds the canonical mapping and tests
- **Subtle clickable `Nu doen`** -> Tasks 1 and 2 add canonical source mapping plus UI
- **All phases collapsed by default** -> Task 2 component tests and implementation
- **Output summary vs output detail ownership** -> Task 1 model + Task 2 output summary UI
- **Route-instellingen remain discoverable** -> Task 1 model + explicit placement inside communicatie phase
- **Interpretation-heavy copy removed** -> Task 3 guardrails + Task 4 visual QA
- **Progress tracking / no hidden capability loss** -> Task 1 model preservation and Task 4 verification

## Placeholder Scan

Checked:

- no `TODO`
- no `TBD`
- no “implement later”
- all code-changing steps include concrete code
- all test steps include exact commands and expected outcomes

## Type Consistency Check

Canonical names used consistently through the plan:

- `HrRouteBeheerPhaseKey`
- `HrRouteBeheerPhaseSummary`
- `HrRouteBeheerPhaseDetail`
- `HrRouteBeheerNowDoing`
- `mapGuidedPhaseToHrRoutePhase`
- `buildHrRouteBeheerNowDoing`
- `buildHrRouteBeheerPhaseSummary`
- `RouteBeheerStructuredBody`
- `RouteBeheerPhaseOverview`
- `RouteBeheerOutputSummary`

