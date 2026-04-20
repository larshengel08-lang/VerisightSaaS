# Verisight Action Center Cockpit Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the MTO Action Center into a calm, overview-first department cockpit that guides managers from department context to theme, dossier, and review without overloading the main screen.

**Architecture:** Keep the existing MTO-only action contracts, traceability, and suite-capable seams intact while replacing the current edit-heavy cockpit surface with an afdelingssuite. The main screen becomes a navigation-led overview, while creation, dossier editing, and review logging move into focused follow-up contexts that still live inside the same bounded Action Center track.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, Vitest, pytest

**Spec:** `docs/superpowers/specs/2026-04-20-action-center-cockpit-redesign-design.md`

---

## Bestandsoverzicht

| Bestand | Actie | Verantwoordelijkheid |
|---------|-------|----------------------|
| `docs/active/ACTION_CENTER_COCKPIT_REDESIGN_PLAN.md` | Create | Strategisch openingsdocument voor de redesign-track |
| `docs/active/ACTION_CENTER_COCKPIT_REDESIGN_WAVE_STACK_PLAN.md` | Create | Toegestane wave-volgorde, boundary-regels en closeoutcriteria |
| `docs/active/WAVE_01_ACTION_CENTER_OVERVIEW_REFRAME.md` | Create | Wave 1 source of truth |
| `docs/active/WAVE_02_ACTION_CENTER_THEME_AND_NAVIGATION.md` | Create | Wave 2 source of truth |
| `docs/active/WAVE_03_ACTION_CENTER_DOSSIER_AND_REVIEW_RELOCATION.md` | Create | Wave 3 source of truth |
| `docs/active/WAVE_04_ACTION_CENTER_VISUAL_POLISH_AND_CLOSEOUT.md` | Create | Wave 4 source of truth |
| `tests/test_mto_department_intelligence_program.py` | Modify | Docs/boundary tests for the redesign-track and MTO-only activation |
| `frontend/lib/action-center/mto-cockpit.ts` | Modify | Split view-model into department suite header, priority themes, and navigation zones |
| `frontend/lib/action-center/mto-cockpit.test.ts` | Modify | Unit tests for the redesigned hierarchy and follow-through navigation |
| `frontend/components/dashboard/action-center/mto-manager-cockpit.tsx` | Modify | Replace stacked layout with overview-first cockpit orchestration |
| `frontend/components/dashboard/action-center/mto-department-overview.tsx` | Modify | Reduce stat overload and support department-suite headline |
| `frontend/components/dashboard/action-center/mto-theme-panel.tsx` | Modify | Turn inline theme cards into summary-first, navigation-led tiles |
| `frontend/components/dashboard/action-center/mto-action-composer.tsx` | Modify | Move to focused create context instead of inline main-screen block |
| `frontend/components/dashboard/action-center/mto-action-list.tsx` | Modify | Turn action list into dossier index / read-first cards |
| `frontend/components/dashboard/action-center/mto-review-queue.tsx` | Modify | Reduce to navigational review pressure rather than editing surface |
| `frontend/components/dashboard/action-center/mto-priority-theme-grid.tsx` | Create | Dedicated priority theme zone for overview surface |
| `frontend/components/dashboard/action-center/mto-follow-through-nav.tsx` | Create | Navigation tiles for dossiers, reviews, follow-up, and all themes |
| `frontend/components/dashboard/action-center/mto-theme-detail-panel.tsx` | Create | Focused detail context for selected theme and action creation |
| `frontend/components/dashboard/action-center/mto-dossier-panel.tsx` | Create | Read-first dossier context with updates, blockers, review history, and next step |
| `frontend/lib/management-actions.test.ts` | Modify | Ensure redesign keeps permissions, traceability, and suite-capable contracts intact |

**Ongewijzigd:** survey methods for non-MTO scans, non-MTO dashboards, non-MTO product scoring, action contracts for source traceability, suite adapter seams, public marketing routes

---

## Task 1: Open the redesign track docs

**Files:**
- Create: `docs/active/ACTION_CENTER_COCKPIT_REDESIGN_PLAN.md`
- Create: `docs/active/ACTION_CENTER_COCKPIT_REDESIGN_WAVE_STACK_PLAN.md`
- Create: `docs/active/WAVE_01_ACTION_CENTER_OVERVIEW_REFRAME.md`
- Create: `docs/active/WAVE_02_ACTION_CENTER_THEME_AND_NAVIGATION.md`
- Create: `docs/active/WAVE_03_ACTION_CENTER_DOSSIER_AND_REVIEW_RELOCATION.md`
- Create: `docs/active/WAVE_04_ACTION_CENTER_VISUAL_POLISH_AND_CLOSEOUT.md`
- Modify: `tests/test_mto_department_intelligence_program.py`

- [ ] **Step 1: Write the failing docs test**

```python
def test_action_center_redesign_docs_open_mto_only_visual_track():
    plan = _read("docs/active/action_center_cockpit_redesign_plan.md")
    stack = _read("docs/active/action_center_cockpit_redesign_wave_stack_plan.md")

    assert "mto blijft de enige actieve drager" in plan
    assert "suite-capable contracts blijven intact" in plan
    assert "geen wijziging aan exitscan, retentiescan of andere scanmethodiek" in plan
    assert "wave_01_action_center_overview_reframe.md" in stack
    assert "wave_02_action_center_theme_and_navigation.md" in stack
    assert "wave_03_action_center_dossier_and_review_relocation.md" in stack
    assert "wave_04_action_center_visual_polish_and_closeout.md" in stack
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_mto_department_intelligence_program.py::test_action_center_redesign_docs_open_mto_only_visual_track -q
```

Expected: `FAIL` because the redesign docs do not exist yet.

- [ ] **Step 3: Write the docs**

`docs/active/ACTION_CENTER_COCKPIT_REDESIGN_PLAN.md`

```md
# ACTION_CENTER_COCKPIT_REDESIGN_PLAN.md

## Status
- Plan status: active
- Build permission: wave_01_open
- Next allowed step: `WAVE_01_ACTION_CENTER_OVERVIEW_REFRAME.md`

## Summary
- MTO blijft de enige actieve drager
- suite-capable contracts blijven intact
- geen wijziging aan ExitScan, RetentieScan of andere scanmethodiek
- hoofdscherm wordt overview-first en navigation-led
```

`docs/active/ACTION_CENTER_COCKPIT_REDESIGN_WAVE_STACK_PLAN.md`

```md
# ACTION_CENTER_COCKPIT_REDESIGN_WAVE_STACK_PLAN.md

## Allowed Wave Stack
1. `WAVE_01_ACTION_CENTER_OVERVIEW_REFRAME.md`
2. `WAVE_02_ACTION_CENTER_THEME_AND_NAVIGATION.md`
3. `WAVE_03_ACTION_CENTER_DOSSIER_AND_REVIEW_RELOCATION.md`
4. `WAVE_04_ACTION_CENTER_VISUAL_POLISH_AND_CLOSEOUT.md`

## Hard Boundaries
- Geen non-MTO dashboardwijzigingen
- Geen methodiekwijzigingen aan andere scans
- Geen live suitekoppeling openen in deze redesign-track
```

`docs/active/WAVE_01_ACTION_CENTER_OVERVIEW_REFRAME.md`

```md
- Wave status: active
- Build permission: allowed
- Focus: afdelingssuite header en overzichtshiërarchie
- Next allowed step after green completion: `WAVE_02_ACTION_CENTER_THEME_AND_NAVIGATION.md`
```

`docs/active/WAVE_02_ACTION_CENTER_THEME_AND_NAVIGATION.md`

```md
- Wave status: blocked_until_wave_01_green
- Build permission: blocked
- Focus: prioriteitsthema's en follow-through navigatie
- Next allowed step after green completion: `WAVE_03_ACTION_CENTER_DOSSIER_AND_REVIEW_RELOCATION.md`
```

`docs/active/WAVE_03_ACTION_CENTER_DOSSIER_AND_REVIEW_RELOCATION.md`

```md
- Wave status: blocked_until_wave_02_green
- Build permission: blocked
- Focus: read-first dossiers en reviewrelocatie
- Next allowed step after green completion: `WAVE_04_ACTION_CENTER_VISUAL_POLISH_AND_CLOSEOUT.md`
```

`docs/active/WAVE_04_ACTION_CENTER_VISUAL_POLISH_AND_CLOSEOUT.md`

```md
- Wave status: blocked_until_wave_03_green
- Build permission: blocked
- Focus: kleurhiërarchie, polish en redesign closeout
- Next allowed step after green completion: expliciete nieuwe track of suite adapter-gate
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_mto_department_intelligence_program.py::test_action_center_redesign_docs_open_mto_only_visual_track -q
```

Expected: `1 passed`.

- [ ] **Step 5: Commit**

```bash
git add docs/active/ACTION_CENTER_COCKPIT_REDESIGN_PLAN.md docs/active/ACTION_CENTER_COCKPIT_REDESIGN_WAVE_STACK_PLAN.md docs/active/WAVE_01_ACTION_CENTER_OVERVIEW_REFRAME.md docs/active/WAVE_02_ACTION_CENTER_THEME_AND_NAVIGATION.md docs/active/WAVE_03_ACTION_CENTER_DOSSIER_AND_REVIEW_RELOCATION.md docs/active/WAVE_04_ACTION_CENTER_VISUAL_POLISH_AND_CLOSEOUT.md tests/test_mto_department_intelligence_program.py
git commit -m "docs: open action center cockpit redesign track"
```

---

## Task 2: Reframe the cockpit overview and view model

**Files:**
- Modify: `frontend/lib/action-center/mto-cockpit.ts`
- Modify: `frontend/lib/action-center/mto-cockpit.test.ts`
- Modify: `frontend/components/dashboard/action-center/mto-manager-cockpit.tsx`
- Modify: `frontend/components/dashboard/action-center/mto-department-overview.tsx`

- [ ] **Step 1: Write the failing unit test**

```ts
it('builds a department-suite overview with one primary summary and limited headline stats', () => {
  const model = buildMtoActionCenterViewModel({
    departmentReads: [
      makeDepartmentRead({ segmentLabel: 'Operations', factorKey: 'workload', factorLabel: 'Werkbelasting', signalValue: 7.9 }),
      makeDepartmentRead({ segmentLabel: 'Operations', factorKey: 'leadership', factorLabel: 'Leiderschap', signalValue: 5.8 }),
    ],
    actions: [
      makeAction({ id: 'a-1', source_scope_label: 'Operations', source_factor_key: 'workload', status: 'in_review', review_date: '2026-04-20' }),
      makeAction({ id: 'a-2', source_scope_label: 'Operations', source_factor_key: 'leadership', status: 'assigned', review_date: '2026-04-29' }),
    ],
    updates: [],
    reviews: [],
    todayIsoDate: '2026-04-20',
  })

  expect(model.departmentSuite.headline).toContain('Operations')
  expect(model.departmentSuite.summary).toContain('Werkbelasting')
  expect(model.departmentSuite.stats).toHaveLength(4)
  expect(model.priorityThemes[0].factorKey).toBe('workload')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cmd /c npm test -- --run lib/action-center/mto-cockpit.test.ts
```

Expected: `FAIL` because `departmentSuite` and `priorityThemes` do not exist yet.

- [ ] **Step 3: Implement the new overview model**

`frontend/lib/action-center/mto-cockpit.ts`

```ts
export interface MtoActionCenterViewModel {
  departmentSuite: {
    headline: string
    summary: string
    stats: Array<{
      label: string
      value: string
      tone: 'slate' | 'blue' | 'amber'
    }>
  }
  priorityThemes: MtoActionCenterThemeCard[]
  followThroughNavigation: Array<{
    key: 'dossiers' | 'reviews' | 'follow_up' | 'all_themes'
    label: string
    value: string
    tone: 'slate' | 'blue' | 'amber'
  }>
  allThemesCount: number
}
```

Add a dedicated suite summary builder:

```ts
function buildDepartmentSuite(args: {
  primaryTheme: MtoActionCenterThemeCard | null
  actionCount: number
  reviewDueNow: number
  followUpCount: number
  quietActions: number
}) {
  const headline = args.primaryTheme
    ? `${args.primaryTheme.departmentLabel} vraagt nu gerichte managementopvolging`
    : 'Afdelingsoverzicht nog niet beschikbaar'

  const summary = args.primaryTheme
    ? `${args.primaryTheme.factorLabel} staat bovenaan. Gebruik het cockpitoverzicht om door te gaan naar thema, dossier of review.`
    : 'Zodra veilige afdelingsdata beschikbaar is, opent hier de managementsamenvatting.'

  return {
    headline,
    summary,
    stats: [
      { label: 'Open dossiers', value: `${args.actionCount}`, tone: 'blue' },
      { label: 'Review nu', value: `${args.reviewDueNow}`, tone: args.reviewDueNow > 0 ? 'amber' : 'slate' },
      { label: 'Vervolg nodig', value: `${args.followUpCount}`, tone: args.followUpCount > 0 ? 'amber' : 'slate' },
      { label: 'Stille dossiers', value: `${args.quietActions}`, tone: args.quietActions > 0 ? 'amber' : 'slate' },
    ],
  }
}
```

`frontend/components/dashboard/action-center/mto-manager-cockpit.tsx`

```tsx
return (
  <div className="space-y-8">
    <MtoDepartmentOverview suite={model.departmentSuite} />
    <MtoPriorityThemeGrid
      themes={model.priorityThemes}
      onOpenTheme={setSelectedThemeKey}
    />
    <MtoFollowThroughNav
      items={model.followThroughNavigation}
      onOpenSection={setActiveSection}
    />
    {activeSection === 'dossier' ? <MtoDossierPanel ... /> : null}
  </div>
)
```

`frontend/components/dashboard/action-center/mto-department-overview.tsx`

```tsx
export function MtoDepartmentOverview({ suite }: { suite: MtoActionCenterViewModel['departmentSuite'] }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Afdelingssuite</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{suite.headline}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{suite.summary}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {suite.stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
cmd /c npm test -- --run lib/action-center/mto-cockpit.test.ts
cmd /c npx tsc --noEmit
```

Expected: `PASS` for the updated unit test and no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/action-center/mto-cockpit.ts frontend/lib/action-center/mto-cockpit.test.ts frontend/components/dashboard/action-center/mto-manager-cockpit.tsx frontend/components/dashboard/action-center/mto-department-overview.tsx
git commit -m "feat: reframe action center cockpit overview"
```

---

## Task 3: Replace inline theme editing with navigation-led priority themes

**Files:**
- Create: `frontend/components/dashboard/action-center/mto-priority-theme-grid.tsx`
- Create: `frontend/components/dashboard/action-center/mto-follow-through-nav.tsx`
- Create: `frontend/components/dashboard/action-center/mto-theme-detail-panel.tsx`
- Modify: `frontend/components/dashboard/action-center/mto-theme-panel.tsx`
- Modify: `frontend/components/dashboard/action-center/mto-action-composer.tsx`
- Modify: `frontend/components/dashboard/action-center/mto-manager-cockpit.tsx`

- [ ] **Step 1: Write the failing component test**

```ts
it('shows summary-first priority themes and does not render inline creation forms on the overview surface', () => {
  render(
    <MtoPriorityThemeGrid
      themes={[
        makeThemeCard({ departmentLabel: 'Operations', factorKey: 'workload', factorLabel: 'Werkbelasting' }),
      ]}
      onOpenTheme={vi.fn()}
    />,
  )

  expect(screen.getByText('Werkbelasting')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /open thema/i })).toBeInTheDocument()
  expect(screen.queryByText('Nieuwe actie')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cmd /c npm test -- --run lib/action-center/mto-cockpit.test.ts
```

Expected: `FAIL` because `MtoPriorityThemeGrid` does not exist yet and the old theme surface still renders inline creation.

- [ ] **Step 3: Implement the new navigation surface**

`frontend/components/dashboard/action-center/mto-priority-theme-grid.tsx`

```tsx
export function MtoPriorityThemeGrid(props: {
  themes: MtoActionCenterThemeCard[]
  onOpenTheme: (themeKey: string) => void
}) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Prioriteitsthema's</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">Thema's die nu managementaandacht vragen</h3>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {props.themes.map((theme) => (
          <article key={`${theme.departmentLabel}-${theme.factorKey}`} className="rounded-[24px] border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{theme.departmentLabel}</p>
            <h4 className="mt-2 text-lg font-semibold text-slate-950">{theme.factorLabel}</h4>
            <p className="mt-2 text-sm leading-7 text-slate-600">{theme.departmentRead.decision}</p>
            <button
              type="button"
              onClick={() => props.onOpenTheme(`${theme.departmentLabel}:${theme.factorKey}`)}
              className="mt-4 inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Open thema
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
```

`frontend/components/dashboard/action-center/mto-follow-through-nav.tsx`

```tsx
export function MtoFollowThroughNav(props: {
  items: MtoActionCenterViewModel['followThroughNavigation']
  onOpenSection: (key: string) => void
}) {
  return (
    <section className="grid gap-3 md:grid-cols-4">
      {props.items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => props.onOpenSection(item.key)}
          className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-blue-200"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{item.value}</p>
        </button>
      ))}
    </section>
  )
}
```

`frontend/components/dashboard/action-center/mto-theme-detail-panel.tsx`

```tsx
export function MtoThemeDetailPanel(props: {
  theme: MtoActionCenterThemeCard
  onClose: () => void
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{props.theme.departmentLabel}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">{props.theme.factorLabel}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">{props.theme.departmentRead.decision}</p>
        </div>
        <button type="button" onClick={props.onClose} className="text-sm font-semibold text-slate-600">
          Sluiten
        </button>
      </div>
      <div className="mt-5">
        <MtoActionComposer card={props.theme} mode="detail" />
      </div>
    </section>
  )
}
```

Update `frontend/components/dashboard/action-center/mto-action-composer.tsx` to support focused mode:

```tsx
interface Props {
  card: MtoActionCenterThemeCard
  organizationId: string
  campaignId: string
  ownerDefault?: ManagementActionDepartmentOwnerDefault | null
  mode?: 'inline' | 'detail'
}
```

Use `mode="detail"` from the selected theme panel and stop rendering the composer inline inside `mto-theme-panel.tsx`.

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
cmd /c npm test -- --run lib/action-center/mto-cockpit.test.ts
cmd /c npx tsc --noEmit
```

Expected: `PASS` with no inline create copy on the overview surface.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/dashboard/action-center/mto-priority-theme-grid.tsx frontend/components/dashboard/action-center/mto-follow-through-nav.tsx frontend/components/dashboard/action-center/mto-theme-detail-panel.tsx frontend/components/dashboard/action-center/mto-theme-panel.tsx frontend/components/dashboard/action-center/mto-action-composer.tsx frontend/components/dashboard/action-center/mto-manager-cockpit.tsx
git commit -m "feat: redesign action center theme navigation"
```

---

## Task 4: Turn actions and reviews into read-first dossier contexts

**Files:**
- Create: `frontend/components/dashboard/action-center/mto-dossier-panel.tsx`
- Modify: `frontend/components/dashboard/action-center/mto-action-list.tsx`
- Modify: `frontend/components/dashboard/action-center/mto-review-queue.tsx`
- Modify: `frontend/components/dashboard/action-center/mto-manager-cockpit.tsx`
- Modify: `frontend/lib/management-actions.test.ts`

- [ ] **Step 1: Write the failing dossier behavior test**

```ts
it('renders actions as dossier summaries and moves review logging behind dossier navigation', () => {
  render(
    <MtoActionList
      actions={[makeAction({ id: 'a-1', title: 'Herijk prioriteiten', status: 'in_review' })]}
      updates={[]}
      reviews={[]}
      onOpenDossier={vi.fn()}
      readOnly={false}
    />,
  )

  expect(screen.getByText('Herijk prioriteiten')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /open dossier/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /log review/i })).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cmd /c npm test -- --run lib/management-actions.test.ts lib/action-center/mto-cockpit.test.ts
```

Expected: `FAIL` because the action list still renders editing and the review queue still renders direct review forms.

- [ ] **Step 3: Implement dossier-first behavior**

`frontend/components/dashboard/action-center/mto-action-list.tsx`

```tsx
export function MtoActionList(props: {
  actions: ManagementActionRecord[]
  updates: ManagementActionUpdateRecord[]
  reviews?: ManagementActionReviewRecord[]
  onOpenDossier: (actionId: string) => void
}) {
  return (
    <section className="space-y-4">
      {props.actions.map((action) => (
        <article key={action.id} className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {buildManagementActionTraceabilitySummary(action)}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">{action.title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">{action.expected_outcome ?? 'Nog geen verwachte uitkomst vastgelegd.'}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              {getManagementActionStatusLabel(action.status)}
            </span>
            {action.review_date ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                Review {action.review_date}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => props.onOpenDossier(action.id)}
            className="mt-4 inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Open dossier
          </button>
        </article>
      ))}
    </section>
  )
}
```

`frontend/components/dashboard/action-center/mto-review-queue.tsx`

```tsx
export function MtoReviewQueue(props: {
  reviewQueue: MtoActionCenterViewModel['reviewQueue']
  onOpenDossier: (actionId: string) => void
}) {
  return (
    <section className="space-y-3">
      {props.reviewQueue.map((item) => (
        <button
          key={item.actionId}
          type="button"
          onClick={() => props.onOpenDossier(item.actionId)}
          className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-left"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.departmentLabel}</p>
          <p className="mt-2 text-base font-semibold text-slate-950">{item.title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.stateLabel}</p>
        </button>
      ))}
    </section>
  )
}
```

`frontend/components/dashboard/action-center/mto-dossier-panel.tsx`

```tsx
export function MtoDossierPanel(props: {
  action: ManagementActionRecord
  updates: ManagementActionUpdateRecord[]
  reviews: ManagementActionReviewRecord[]
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Verbeterdossier</p>
      <h3 className="mt-2 text-xl font-semibold text-slate-950">{props.action.title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{props.action.decision_context}</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Eigenaar</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">{props.action.owner_label ?? 'Nog geen eigenaar'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Volgende review</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">{props.action.review_date ?? 'Nog niet gepland'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">{getManagementActionStatusLabel(props.action.status)}</p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
cmd /c npm test -- --run lib/management-actions.test.ts lib/action-center/mto-cockpit.test.ts
cmd /c npx tsc --noEmit
```

Expected: `PASS` and no direct review-logging controls on the overview surface.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/dashboard/action-center/mto-dossier-panel.tsx frontend/components/dashboard/action-center/mto-action-list.tsx frontend/components/dashboard/action-center/mto-review-queue.tsx frontend/components/dashboard/action-center/mto-manager-cockpit.tsx frontend/lib/management-actions.test.ts
git commit -m "feat: move action center into dossier-first flow"
```

---

## Task 5: Apply calm cockpit styling and close the redesign track

**Files:**
- Modify: `frontend/components/dashboard/action-center/mto-manager-cockpit.tsx`
- Modify: `frontend/components/dashboard/action-center/mto-priority-theme-grid.tsx`
- Modify: `frontend/components/dashboard/action-center/mto-follow-through-nav.tsx`
- Modify: `frontend/components/dashboard/action-center/mto-theme-detail-panel.tsx`
- Modify: `frontend/components/dashboard/action-center/mto-dossier-panel.tsx`
- Modify: `frontend/lib/action-center/mto-cockpit.test.ts`
- Modify: `tests/test_mto_department_intelligence_program.py`
- Modify: `docs/active/WAVE_04_ACTION_CENTER_VISUAL_POLISH_AND_CLOSEOUT.md`

- [ ] **Step 1: Write the failing test for semantic tones**

```ts
it('uses calm neutral surfaces with targeted amber accents for review pressure', () => {
  const model = buildMtoActionCenterViewModel({
    departmentReads: [makeDepartmentRead({ signalValue: 7.4, factorKey: 'workload', factorLabel: 'Werkbelasting' })],
    actions: [makeAction({ status: 'in_review', review_date: '2026-04-20' })],
    updates: [],
    reviews: [],
    todayIsoDate: '2026-04-20',
  })

  expect(model.departmentSuite.stats.find((item) => item.label === 'Review nu')?.tone).toBe('amber')
  expect(model.followThroughNavigation.find((item) => item.key === 'all_themes')?.tone).toBe('slate')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cmd /c npm test -- --run lib/action-center/mto-cockpit.test.ts
```

Expected: `FAIL` until the tone mapping and final view model are aligned with the redesign.

- [ ] **Step 3: Implement the final visual hierarchy**

Use these styling rules across the redesign components:

```tsx
const calmPanel = 'rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]'
const calmInset = 'rounded-2xl border border-slate-200 bg-slate-50'
const amberAccent = 'border-amber-200 bg-amber-50 text-amber-900'
const blueAccent = 'border-blue-200 bg-blue-50 text-blue-800'
```

Update priority theme tiles so only signal badges carry accent:

```tsx
<span className={theme.actionHealth.tone === 'amber' ? amberAccent : blueAccent}>
  {theme.actionHealth.label}
</span>
```

Update nav items so they stay mostly neutral and only turn amber when the underlying queue actually demands attention:

```tsx
const itemToneClass =
  item.tone === 'amber'
    ? 'border-amber-200 bg-amber-50'
    : 'border-slate-200 bg-white'
```

Update `docs/active/WAVE_04_ACTION_CENTER_VISUAL_POLISH_AND_CLOSEOUT.md` to mark the redesign track complete and explicitly state:

```md
- redesign closeout: green
- main screen is now overview-first and navigation-led
- inline create/edit removed from overview surface
- MTO-only activation preserved
- suite-capable seams preserved
```

- [ ] **Step 4: Run the full redesign validation**

Run:

```bash
cmd /c npm test -- --run lib/action-center/mto-cockpit.test.ts lib/management-actions.test.ts
C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_mto_department_intelligence_program.py -q
cmd /c npx tsc --noEmit
```

Expected:

- all targeted Vitest tests pass
- Python redesign-track docs/boundary tests pass
- TypeScript passes cleanly

- [ ] **Step 5: Commit**

```bash
git add frontend/components/dashboard/action-center/mto-manager-cockpit.tsx frontend/components/dashboard/action-center/mto-priority-theme-grid.tsx frontend/components/dashboard/action-center/mto-follow-through-nav.tsx frontend/components/dashboard/action-center/mto-theme-detail-panel.tsx frontend/components/dashboard/action-center/mto-dossier-panel.tsx frontend/lib/action-center/mto-cockpit.test.ts tests/test_mto_department_intelligence_program.py docs/active/WAVE_04_ACTION_CENTER_VISUAL_POLISH_AND_CLOSEOUT.md
git commit -m "feat: polish action center cockpit redesign"
```

---

## Self-review

### Spec coverage

- Department suite header: covered in Task 2
- Priority themes as main reading layer: covered in Task 3
- Follow-through navigation: covered in Task 3
- All themes accessible but not on the main screen: covered in Task 3
- Action creation moved off the main screen: covered in Task 3
- Dossier read-first, edit-second: covered in Task 4
- Review relocation: covered in Task 4
- Color narrative and calm cockpit visual system: covered in Task 5
- MTO-first with suite-capable seams preserved: covered in Tasks 1, 2, 4, and 5

### Placeholder scan

- No `TODO`, `TBD`, or deferred implementation markers remain
- Every task contains exact files, commands, and concrete implementation snippets
- Each validation step has explicit expected outcomes

### Type consistency

- The plan keeps `buildMtoActionCenterViewModel` as the central view-model entry point
- New surface primitives are consistently named `departmentSuite`, `priorityThemes`, and `followThroughNavigation`
- Focused follow-up contexts are consistently named `MtoThemeDetailPanel` and `MtoDossierPanel`

