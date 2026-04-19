# Verisight Action Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first mature MTO-native Action Center track: a department cockpit where managers can open theme-first actions, optionally link them to a specific question, and track updates, blockers, reviews, and outcomes without changing non-MTO product behavior.

**Architecture:** Extend the existing bounded MTO action loop instead of replacing it. Keep MTO as the only active carrier, add richer action contracts and review records, introduce a dedicated Action Center view-model layer, and split the UI into smaller cockpit components that render inside the existing campaign dashboard only when `scan_type = 'mto'`.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Supabase Postgres/RLS, Vitest, pytest

**Spec:** `docs/superpowers/specs/2026-04-19-action-center-design.md`

---

## Bestandsoverzicht

| Bestand | Actie | Verantwoordelijkheid |
|---------|-------|----------------------|
| `docs/active/ACTION_CENTER_MANAGER_COCKPIT_PLAN.md` | Create | Strategisch openingdocument voor de nieuwe Action Center-track |
| `docs/active/ACTION_CENTER_MANAGER_COCKPIT_WAVE_STACK_PLAN.md` | Create | Toegestane wave-volgorde en non-impact-regels |
| `docs/active/WAVE_01_ACTION_CENTER_CONTRACT_HARDENING.md` | Create | Wave 1 source of truth |
| `docs/active/WAVE_02_ACTION_CENTER_MTO_COCKPIT.md` | Create | Wave 2 source of truth |
| `docs/active/WAVE_03_ACTION_CENTER_REVIEW_DISCIPLINE.md` | Create | Wave 3 source of truth |
| `frontend/lib/management-actions.ts` | Modify | Shared action types, question linkage, blocker fields, review summary helpers |
| `frontend/lib/management-actions.test.ts` | Modify | Contract tests for theme/question linkage, blocker handling, review states |
| `supabase/schema.sql` | Modify | Contract-safe schema extensions for richer action records and review rows |
| `frontend/app/api/management-action-reviews/route.ts` | Create | Create formal review records |
| `frontend/lib/action-center/mto-cockpit.ts` | Create | Build department overview, theme cards, action queues, and review queues |
| `frontend/lib/action-center/mto-cockpit.test.ts` | Create | Unit tests for cockpit summaries and visibility logic |
| `frontend/components/dashboard/action-center/*` | Create | Smaller cockpit UI units |
| `frontend/components/dashboard/mto-action-tracker.tsx` | Modify | Reduce to compatibility wrapper |
| `frontend/app/(dashboard)/campaigns/[id]/page.tsx` | Modify | Replace current bounded action block with cockpit-first rendering |
| `frontend/lib/products/mto/focus-questions.ts` | Modify | Add stable keys alongside question labels |
| `tests/test_mto_department_intelligence_program.py` | Modify | Boundary tests for MTO-only action center activation and docs status |

**Ongewijzigd:** non-MTO product definitions, non-MTO dashboards, existing survey methods, non-MTO scoring logic, route hierarchy, buyer-facing marketing

---

## Task 1: Open the Action Center track docs

**Files:**
- Create: `docs/active/ACTION_CENTER_MANAGER_COCKPIT_PLAN.md`
- Create: `docs/active/ACTION_CENTER_MANAGER_COCKPIT_WAVE_STACK_PLAN.md`
- Create: `docs/active/WAVE_01_ACTION_CENTER_CONTRACT_HARDENING.md`
- Create: `docs/active/WAVE_02_ACTION_CENTER_MTO_COCKPIT.md`
- Create: `docs/active/WAVE_03_ACTION_CENTER_REVIEW_DISCIPLINE.md`
- Test: `tests/test_mto_department_intelligence_program.py`

- [ ] **Step 1: Write the failing docs test**

  ```python
  def test_action_center_docs_open_new_mto_only_track():
      plan = _read("docs/active/action_center_manager_cockpit_plan.md")
      stack = _read("docs/active/action_center_manager_cockpit_wave_stack_plan.md")

      assert "mto blijft de eerste en enige actieve drager" in plan
      assert "geen wijziging aan exitscan, retentiescan of andere scanmethodiek" in plan
      assert "wave_01_action_center_contract_hardening.md" in stack
      assert "wave_02_action_center_mto_cockpit.md" in stack
      assert "wave_03_action_center_review_discipline.md" in stack
  ```

- [ ] **Step 2: Run test to verify it fails**

  ```bash
  C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_mto_department_intelligence_program.py::test_action_center_docs_open_new_mto_only_track -q
  ```

  Expected: `FAIL` because the new docs do not exist yet.

- [ ] **Step 3: Write the docs**

  `docs/active/ACTION_CENTER_MANAGER_COCKPIT_PLAN.md`

  ```md
  # ACTION_CENTER_MANAGER_COCKPIT_PLAN.md

  ## Status
  - Plan status: active
  - Build permission: wave_01_open
  - Next allowed step: `WAVE_01_ACTION_CENTER_CONTRACT_HARDENING.md`

  ## Summary
  - MTO blijft de eerste en enige actieve drager
  - geen wijziging aan ExitScan, RetentieScan of andere scanmethodiek
  - geen suitebreed action center in deze track
  ```

  `docs/active/ACTION_CENTER_MANAGER_COCKPIT_WAVE_STACK_PLAN.md`

  ```md
  # ACTION_CENTER_MANAGER_COCKPIT_WAVE_STACK_PLAN.md

  ## Allowed Wave Stack
  1. `WAVE_01_ACTION_CENTER_CONTRACT_HARDENING.md`
  2. `WAVE_02_ACTION_CENTER_MTO_COCKPIT.md`
  3. `WAVE_03_ACTION_CENTER_REVIEW_DISCIPLINE.md`
  ```

  `docs/active/WAVE_01_ACTION_CENTER_CONTRACT_HARDENING.md`

  ```md
  - Wave status: active
  - Build permission: allowed
  - Next allowed step after green completion: `WAVE_02_ACTION_CENTER_MTO_COCKPIT.md`
  ```

  `docs/active/WAVE_02_ACTION_CENTER_MTO_COCKPIT.md`

  ```md
  - Wave status: blocked_until_wave_01_green
  - Build permission: blocked
  - Next allowed step after green completion: `WAVE_03_ACTION_CENTER_REVIEW_DISCIPLINE.md`
  ```

  `docs/active/WAVE_03_ACTION_CENTER_REVIEW_DISCIPLINE.md`

  ```md
  - Wave status: blocked_until_wave_02_green
  - Build permission: blocked
  - Next allowed step after green completion: explicit suite adapter track
  ```

- [ ] **Step 4: Run test to verify it passes**

  ```bash
  C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_mto_department_intelligence_program.py::test_action_center_docs_open_new_mto_only_track -q
  ```

  Expected: `1 passed`.

- [ ] **Step 5: Commit**

  ```bash
  git add docs/active/ACTION_CENTER_MANAGER_COCKPIT_PLAN.md docs/active/ACTION_CENTER_MANAGER_COCKPIT_WAVE_STACK_PLAN.md docs/active/WAVE_01_ACTION_CENTER_CONTRACT_HARDENING.md docs/active/WAVE_02_ACTION_CENTER_MTO_COCKPIT.md docs/active/WAVE_03_ACTION_CENTER_REVIEW_DISCIPLINE.md tests/test_mto_department_intelligence_program.py
  git commit -m "docs: open action center manager cockpit track"
  ```

---

## Task 2: Harden the action contracts for themes, questions, blockers, and reviews

**Files:**
- Modify: `frontend/lib/management-actions.ts`
- Modify: `frontend/lib/management-actions.test.ts`
- Modify: `supabase/schema.sql`
- Modify: `frontend/app/api/management-actions/route.ts`
- Modify: `frontend/app/api/management-actions/[id]/route.ts`
- Modify: `frontend/app/api/management-action-updates/route.ts`
- Create: `frontend/app/api/management-action-reviews/route.ts`

- [ ] **Step 1: Write the failing unit test**

  ```ts
  it('tracks theme, optional question, blockers, and next review summary', () => {
    const seed = buildManagementActionSeedFromDepartmentRead({
      organizationId: 'org-1',
      campaignId: 'camp-1',
      departmentRead: {
        segmentLabel: 'Operations',
        factorKey: 'workload',
        factorLabel: 'Werkbelasting',
        avgSignal: 7.2,
        decision: 'Open eerst een bounded werkdruksprint.',
        handoffBody: 'Gebruik dit alleen binnen MTO.',
        owner: 'Manager Operations',
      },
      ownerDefault: {
        owner_label: 'Manager Operations',
        owner_email: 'ops@example.com',
      },
      question: {
        key: 'workload.q1',
        label: 'Welke brede managementvraag over werkbelasting moet nu eerst expliciet worden beantwoord?',
      },
    })

    expect(seed.source_question_key).toBe('workload.q1')
    expect(seed.source_question_label).toContain('werkbelasting')
    expect(seed.blocker_note).toBeNull()
  })
  ```

- [ ] **Step 2: Run test to verify it fails**

  ```bash
  cmd /c npm test -- --run lib/management-actions.test.ts
  ```

  Expected: `FAIL` because `question`, `source_question_key`, and `source_question_label` are not implemented.

- [ ] **Step 3: Implement the contract extensions**

  `frontend/lib/management-actions.ts`

  ```ts
  export interface ManagementActionRecord {
    id: string
    organization_id: string
    campaign_id: string | null
    source_product: ScanType
    source_scope_type: ManagementActionSourceScopeType
    source_scope_key: string | null
    source_scope_label: string | null
    source_read_stage: ManagementActionSourceReadStage
    source_factor_key: string | null
    source_factor_label: string | null
    source_signal_value: number | null
    source_question_key: string | null
    source_question_label: string | null
    title: string
    decision_context: string | null
    expected_outcome: string | null
    measured_outcome: string | null
    blocker_note: string | null
    last_review_outcome: 'continue' | 'close' | 'reopen' | 'follow_up_needed' | null
    status: ManagementActionStatus
    owner_label: string | null
    owner_email: string | null
    due_date: string | null
    review_date: string | null
    created_by: string | null
    updated_by: string | null
    created_at: string
    updated_at: string
  }

  export interface ManagementActionReviewRecord {
    id: string
    action_id: string
    summary: string
    outcome: 'continue' | 'close' | 'reopen' | 'follow_up_needed'
    next_review_date: string | null
    created_by: string | null
    created_at: string
  }
  ```

  Extend the seed helper:

  ```ts
  export function buildManagementActionSeedFromDepartmentRead(args: {
    organizationId: string
    campaignId: string
    departmentRead: {
      segmentLabel: string
      factorKey: string
      factorLabel: string
      avgSignal: number
      decision: string
      handoffBody: string
      owner: string
    }
    ownerDefault?: ManagementActionDepartmentOwnerDefault | null
    question?: { key: string; label: string } | null
  }) {
    return {
      organization_id: args.organizationId,
      campaign_id: args.campaignId,
      source_product: 'mto',
      source_scope_type: 'department',
      source_scope_key: `department:${args.departmentRead.segmentLabel.toLowerCase()}`,
      source_scope_label: args.departmentRead.segmentLabel,
      source_read_stage: 'mto_department_intelligence',
      source_factor_key: args.departmentRead.factorKey,
      source_factor_label: args.departmentRead.factorLabel,
      source_signal_value: args.departmentRead.avgSignal,
      source_question_key: args.question?.key ?? null,
      source_question_label: args.question?.label ?? null,
      title: `${args.departmentRead.segmentLabel}: ${args.departmentRead.factorLabel} vraagt opvolging`,
      decision_context: `${args.departmentRead.decision} ${args.departmentRead.handoffBody}`.trim(),
      expected_outcome: 'Heldere prioriteit, expliciete eigenaar en reviewmoment.',
      measured_outcome: null,
      blocker_note: null,
      last_review_outcome: null,
      status: 'assigned',
      owner_label: args.ownerDefault?.owner_label?.trim() || args.departmentRead.owner,
      owner_email: args.ownerDefault?.owner_email?.trim() || null,
      due_date: null,
      review_date: null,
    }
  }
  ```

  `supabase/schema.sql`

  ```sql
  alter table public.management_actions
    add column if not exists source_question_key text,
    add column if not exists source_question_label text,
    add column if not exists blocker_note text,
    add column if not exists last_review_outcome text
      check (last_review_outcome in ('continue', 'close', 'reopen', 'follow_up_needed'));

  create table if not exists public.management_action_reviews (
    id uuid primary key default gen_random_uuid(),
    action_id uuid not null references public.management_actions(id) on delete cascade,
    summary text not null,
    outcome text not null check (outcome in ('continue', 'close', 'reopen', 'follow_up_needed')),
    next_review_date date,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default timezone('utc', now())
  );
  ```

  `frontend/app/api/management-action-reviews/route.ts`

  ```ts
  import { NextResponse } from 'next/server'
  import { createClient } from '@/lib/supabase/server'

  export async function POST(request: Request) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })

    const body = await request.json()
    const { data, error } = await supabase
      .from('management_action_reviews')
      .insert({
        action_id: body.action_id,
        summary: body.summary,
        outcome: body.outcome,
        next_review_date: body.next_review_date ?? null,
        created_by: user.id,
      })
      .select('*')
      .single()

    if (error) return NextResponse.json({ detail: error.message }, { status: 400 })
    return NextResponse.json({ review: data, message: 'Review opgeslagen.' })
  }
  ```

- [ ] **Step 4: Run tests to verify they pass**

  ```bash
  cmd /c npm test -- --run lib/management-actions.test.ts
  cmd /c npx tsc --noEmit
  ```

  Expected:

  ```text
  Test Files  1 passed
  ```

  and no TypeScript errors.

- [ ] **Step 5: Commit**

  ```bash
  git add frontend/lib/management-actions.ts frontend/lib/management-actions.test.ts supabase/schema.sql frontend/app/api/management-actions/route.ts frontend/app/api/management-actions/[id]/route.ts frontend/app/api/management-action-updates/route.ts frontend/app/api/management-action-reviews/route.ts
  git commit -m "feat: harden action center contracts for reviews"
  ```

---

## Task 3: Add stable MTO question references and cockpit view-models

**Files:**
- Modify: `frontend/lib/products/mto/focus-questions.ts`
- Create: `frontend/lib/action-center/mto-cockpit.ts`
- Create: `frontend/lib/action-center/mto-cockpit.test.ts`

- [ ] **Step 1: Write the failing cockpit test**

  ```ts
  import { describe, expect, it } from 'vitest'
  import { buildMtoActionCenterViewModel } from '@/lib/action-center/mto-cockpit'

  describe('buildMtoActionCenterViewModel', () => {
    it('groups actions per department theme and surfaces review pressure', () => {
      const model = buildMtoActionCenterViewModel({
        departmentReads: [
          {
            segmentType: 'department',
            segmentLabel: 'Operations',
            factorKey: 'workload',
            factorLabel: 'Werkbelasting',
            n: 12,
            avgSignal: 7.2,
            deltaVsOrg: 1.1,
            signalValue: 6.8,
            title: 'Werkbelasting vraagt aandacht',
            decision: 'Open een bounded werkdruksprint.',
            validate: 'Check teamritme.',
            owner: 'Manager Operations',
            actions: ['Herplan piekbelasting'],
            caution: 'Maak het niet suitebreed.',
            review: 'Review binnen 30 dagen.',
            handoffBody: 'Bounded MTO-traject.',
            stayIntentAverage: 5.9,
          },
        ],
        actions: [],
        updates: [],
        reviews: [],
        todayIsoDate: '2026-04-26',
      })

      expect(model.themeCards[0].factorKey).toBe('workload')
      expect(model.themeCards[0].questionOptions[0].key).toBe('workload.q1')
    })
  })
  ```

- [ ] **Step 2: Run test to verify it fails**

  ```bash
  cmd /c npm test -- --run lib/action-center/mto-cockpit.test.ts
  ```

  Expected: `FAIL` because the new module does not exist yet.

- [ ] **Step 3: Implement question keys and the cockpit builder**

  `frontend/lib/products/mto/focus-questions.ts`

  ```ts
  export interface FocusQuestionOption {
    key: string
    label: string
  }

  function buildBandQuestions(factorKey: string, factorLabel: string, band: Band): FocusQuestionOption[] {
    if (band === 'HOOG') {
      return [
        {
          key: `${factorKey}.q1`,
          label: `Waar raakt ${factorLabel.toLowerCase()} nu het breedste organisatiethema dat als eerste duiding vraagt?`,
        },
        {
          key: `${factorKey}.q2`,
          label: `Welke brede managementvraag over ${factorLabel.toLowerCase()} moet nu eerst expliciet worden beantwoord?`,
        },
      ]
    }
    return [
      {
        key: `${factorKey}.q1`,
        label: `Gaat ${factorLabel.toLowerCase()} nu vooral om een eerste verificatie of al om een beperkte correctie?`,
      },
      {
        key: `${factorKey}.q2`,
        label: `Welke brede managementhuddle helpt het snelst om ${factorLabel.toLowerCase()} scherper te duiden?`,
      },
    ]
  }
  ```

  `frontend/lib/action-center/mto-cockpit.ts`

  ```ts
  import { MTO_FOCUS_QUESTIONS } from '@/lib/products/mto/focus-questions'
  import type {
    ManagementActionRecord,
    ManagementActionReviewRecord,
    ManagementActionUpdateRecord,
  } from '@/lib/management-actions'
  import type { MtoDepartmentReadItem } from '@/lib/products/mto/department-intelligence'

  export function buildMtoActionCenterViewModel(args: {
    departmentReads: MtoDepartmentReadItem[]
    actions: ManagementActionRecord[]
    updates: ManagementActionUpdateRecord[]
    reviews: ManagementActionReviewRecord[]
    todayIsoDate?: string
  }) {
    const themeCards = args.departmentReads.map((read) => ({
      departmentRead: read,
      departmentLabel: read.segmentLabel,
      factorKey: read.factorKey,
      factorLabel: read.factorLabel,
      questionOptions: MTO_FOCUS_QUESTIONS[read.factorKey]?.HOOG ?? [],
      actions: args.actions.filter(
        (action) =>
          action.source_scope_label === read.segmentLabel &&
          action.source_factor_key === read.factorKey,
      ),
    }))

    const reviewQueue = args.actions
      .filter((action) => action.review_date)
      .map((action) => ({
        actionId: action.id,
        departmentLabel: action.source_scope_label ?? 'Onbekende afdeling',
        title: action.title,
        tone:
          action.status === 'closed'
            ? 'slate'
            : action.review_date! < (args.todayIsoDate ?? new Date().toISOString().slice(0, 10))
              ? 'amber'
              : 'blue',
      }))

    return {
      departmentOverview: {
        actionCount: args.actions.length,
        reviewCount: reviewQueue.length,
        topThemes: themeCards.slice(0, 3),
      },
      themeCards,
      reviewQueue,
    }
  }
  ```

- [ ] **Step 4: Run tests to verify they pass**

  ```bash
  cmd /c npm test -- --run lib/action-center/mto-cockpit.test.ts lib/management-actions.test.ts
  cmd /c npx tsc --noEmit
  ```

  Expected:

  ```text
  Test Files  2 passed
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add frontend/lib/products/mto/focus-questions.ts frontend/lib/action-center/mto-cockpit.ts frontend/lib/action-center/mto-cockpit.test.ts frontend/lib/management-actions.ts frontend/lib/management-actions.test.ts
  git commit -m "feat: add action center cockpit view models"
  ```

---

## Task 4: Build the MTO manager cockpit UI

**Files:**
- Create: `frontend/components/dashboard/action-center/mto-department-overview.tsx`
- Create: `frontend/components/dashboard/action-center/mto-theme-panel.tsx`
- Create: `frontend/components/dashboard/action-center/mto-action-composer.tsx`
- Create: `frontend/components/dashboard/action-center/mto-action-list.tsx`
- Create: `frontend/components/dashboard/action-center/mto-review-queue.tsx`
- Create: `frontend/components/dashboard/action-center/mto-manager-cockpit.tsx`
- Modify: `frontend/components/dashboard/mto-action-tracker.tsx`

- [ ] **Step 1: Write the failing UI-oriented unit test**

  ```ts
  it('surfaces empty action states per theme so the UI can prompt creation', () => {
    const model = buildMtoActionCenterViewModel({
      departmentReads: [
        {
          segmentType: 'department',
          segmentLabel: 'People Ops',
          factorKey: 'leadership',
          factorLabel: 'Leiderschap',
          n: 10,
          avgSignal: 6.7,
          deltaVsOrg: 0.8,
          signalValue: 6.2,
          title: 'Leiderschap vraagt aandacht',
          decision: 'Start een bounded leiderschapsreview.',
          validate: 'Check ritme en voorbeeldgedrag.',
          owner: 'Manager People Ops',
          actions: ['Open leiderschapsdialoog'],
          caution: 'Niet verbreden buiten MTO.',
          review: 'Review binnen 21 dagen.',
          handoffBody: 'Bounded MTO-traject.',
          stayIntentAverage: 6.1,
        },
      ],
      actions: [],
      updates: [],
      reviews: [],
    })

    expect(model.themeCards[0].actions).toHaveLength(0)
    expect(model.themeCards[0].questionOptions.length).toBeGreaterThan(0)
  })
  ```

- [ ] **Step 2: Run test to verify it fails**

  ```bash
  cmd /c npm test -- --run lib/action-center/mto-cockpit.test.ts
  ```

  Expected: `FAIL` if the view-model does not yet expose the expected empty-state shape.

- [ ] **Step 3: Implement the cockpit components**

  `frontend/components/dashboard/action-center/mto-manager-cockpit.tsx`

  ```tsx
  'use client'

  import { buildMtoActionCenterViewModel } from '@/lib/action-center/mto-cockpit'
  import { MtoDepartmentOverview } from './mto-department-overview'
  import { MtoThemePanel } from './mto-theme-panel'
  import { MtoActionList } from './mto-action-list'
  import { MtoReviewQueue } from './mto-review-queue'

  export function MtoManagerCockpit(props: MtoManagerCockpitProps) {
    const model = buildMtoActionCenterViewModel({
      departmentReads: props.departmentReads,
      actions: props.actions,
      updates: props.updates,
      reviews: props.reviews,
    })

    return (
      <div className="space-y-6">
        <MtoDepartmentOverview overview={model.departmentOverview} />
        <MtoThemePanel
          themeCards={model.themeCards}
          organizationId={props.organizationId}
          campaignId={props.campaignId}
          ownerDefaults={props.ownerDefaults}
        />
        <MtoActionList actions={props.actions} updates={props.updates} />
        <MtoReviewQueue reviewQueue={model.reviewQueue} reviews={props.reviews} />
      </div>
    )
  }
  ```

  `frontend/components/dashboard/action-center/mto-action-composer.tsx`

  ```tsx
  export function MtoActionComposer({ card, organizationId, campaignId, ownerDefault }: Props) {
    const [selectedQuestionKey, setSelectedQuestionKey] = useState(card.questionOptions[0]?.key ?? '')
    const selectedQuestion = card.questionOptions.find((question) => question.key === selectedQuestionKey) ?? null

    async function createAction() {
      await fetch('/api/management-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          buildManagementActionSeedFromDepartmentRead({
            organizationId,
            campaignId,
            departmentRead: card.departmentRead,
            ownerDefault,
            question: selectedQuestion,
          }),
        ),
      })
    }

    return (
      <div className="space-y-3">
        <select value={selectedQuestionKey} onChange={(event) => setSelectedQuestionKey(event.target.value)}>
          <option value="">Alleen thema</option>
          {card.questionOptions.map((question) => (
            <option key={question.key} value={question.key}>
              {question.label}
            </option>
          ))}
        </select>
        <button onClick={() => void createAction()}>Open actie</button>
      </div>
    )
  }
  ```

  `frontend/components/dashboard/mto-action-tracker.tsx`

  ```tsx
  import { MtoManagerCockpit } from '@/components/dashboard/action-center/mto-manager-cockpit'

  export function MtoActionTracker(props: Props) {
    return <MtoManagerCockpit {...props} />
  }
  ```

- [ ] **Step 4: Run tests to verify they pass**

  ```bash
  cmd /c npm test -- --run lib/action-center/mto-cockpit.test.ts lib/management-actions.test.ts lib/products/mto/department-intelligence.test.ts
  cmd /c npx tsc --noEmit
  ```

  Expected:

  ```text
  Test Files  3 passed
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add frontend/components/dashboard/action-center/mto-department-overview.tsx frontend/components/dashboard/action-center/mto-theme-panel.tsx frontend/components/dashboard/action-center/mto-action-composer.tsx frontend/components/dashboard/action-center/mto-action-list.tsx frontend/components/dashboard/action-center/mto-review-queue.tsx frontend/components/dashboard/action-center/mto-manager-cockpit.tsx frontend/components/dashboard/mto-action-tracker.tsx frontend/lib/action-center/mto-cockpit.ts frontend/lib/action-center/mto-cockpit.test.ts
  git commit -m "feat: add mto manager cockpit action center"
  ```

---

## Task 5: Integrate the cockpit into the MTO dashboard only

**Files:**
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- Test: `tests/test_mto_department_intelligence_program.py`

- [ ] **Step 1: Write the failing boundary test**

  ```python
  def test_action_center_stays_mto_only_in_dashboard_page():
      page = _read("frontend/app/(dashboard)/campaigns/[id]/page.tsx")

      assert "mtomanagercockpit" in page
      assert "stats.scan_type === 'mto'" in page
      assert "bounded action center" in page
  ```

- [ ] **Step 2: Run test to verify it fails**

  ```bash
  C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_mto_department_intelligence_program.py::test_action_center_stays_mto_only_in_dashboard_page -q
  ```

  Expected: `FAIL` because the new cockpit copy and component call are not present yet.

- [ ] **Step 3: Replace the current action block with the cockpit**

  `frontend/app/(dashboard)/campaigns/[id]/page.tsx`

  ```ts
  import { MtoManagerCockpit } from '@/components/dashboard/action-center/mto-manager-cockpit'
  import type { ManagementActionReviewRecord } from '@/lib/management-actions'
  ```

  ```ts
  const { data: managementActionReviewsRaw } =
    stats.scan_type === 'mto' && actionIds.length > 0
      ? await supabase
          .from('management_action_reviews')
          .select('*')
          .in('action_id', actionIds)
          .order('created_at', { ascending: false })
      : { data: [] }

  const managementActionReviews = (managementActionReviewsRaw ?? []) as ManagementActionReviewRecord[]
  ```

  ```tsx
  <div className="mt-6 rounded-[22px] border border-[#d6e4e8] bg-[#f7fbfb] p-4 sm:p-5">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#567684]">
      Bounded Action Center
    </p>
    <h3 className="mt-2 text-base font-semibold text-slate-950">
      Afdelingscockpit voor acties, reviews en opvolging
    </h3>
    <div className="mt-4">
      <MtoManagerCockpit
        organizationId={stats.organization_id}
        campaignId={id}
        currentViewerRole={currentViewerRole}
        currentUserEmail={currentUserEmail}
        canManageCampaign={canManageCampaign}
        departmentReads={mtoDepartmentReadModel?.visibleDepartments ?? []}
        actions={managementActions}
        updates={managementActionUpdates}
        reviews={managementActionReviews}
        ownerDefaults={managementActionOwnerDefaults}
      />
    </div>
  </div>
  ```

- [ ] **Step 4: Run tests to verify they pass**

  ```bash
  C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_mto_department_intelligence_program.py::test_action_center_stays_mto_only_in_dashboard_page -q
  cmd /c npx tsc --noEmit
  ```

  Expected: `1 passed` and no TypeScript errors.

- [ ] **Step 5: Commit**

  ```bash
  git add frontend/app/(dashboard)/campaigns/[id]/page.tsx tests/test_mto_department_intelligence_program.py
  git commit -m "feat: integrate bounded action center into mto dashboard"
  ```

---

## Task 6: Add formal review discipline and mature manager signals

**Files:**
- Modify: `frontend/components/dashboard/action-center/mto-action-list.tsx`
- Modify: `frontend/components/dashboard/action-center/mto-review-queue.tsx`
- Modify: `frontend/app/api/management-action-reviews/route.ts`
- Modify: `frontend/lib/action-center/mto-cockpit.ts`
- Modify: `frontend/lib/action-center/mto-cockpit.test.ts`
- Modify: `tests/test_mto_department_intelligence_program.py`
- Modify: `docs/active/WAVE_01_ACTION_CENTER_CONTRACT_HARDENING.md`
- Modify: `docs/active/WAVE_02_ACTION_CENTER_MTO_COCKPIT.md`
- Modify: `docs/active/WAVE_03_ACTION_CENTER_REVIEW_DISCIPLINE.md`
- Modify: `docs/active/ACTION_CENTER_MANAGER_COCKPIT_PLAN.md`
- Modify: `docs/active/ACTION_CENTER_MANAGER_COCKPIT_WAVE_STACK_PLAN.md`

- [ ] **Step 1: Write the failing maturity test**

  ```ts
  it('surfaces quiet actions and review pressure separately', () => {
    const model = buildMtoActionCenterViewModel({
      departmentReads: [],
      actions: [
        {
          id: 'a1',
          organization_id: 'org-1',
          campaign_id: 'camp-1',
          source_product: 'mto',
          source_scope_type: 'department',
          source_scope_key: 'department:ops',
          source_scope_label: 'Operations',
          source_read_stage: 'mto_closed_improvement_loop',
          source_factor_key: 'workload',
          source_factor_label: 'Werkbelasting',
          source_question_key: null,
          source_question_label: null,
          source_signal_value: 7.1,
          title: 'Herstel werkritme',
          decision_context: 'Bounded sprint.',
          expected_outcome: 'Rustiger weekstart.',
          measured_outcome: null,
          blocker_note: 'Capaciteit nog niet vrijgemaakt.',
          last_review_outcome: 'continue',
          status: 'in_review',
          owner_label: 'Ops manager',
          owner_email: 'ops@example.com',
          due_date: '2026-05-01',
          review_date: '2026-04-28',
          created_by: null,
          updated_by: null,
          created_at: '2026-04-01T10:00:00Z',
          updated_at: '2026-04-10T10:00:00Z',
        },
      ],
      updates: [],
      reviews: [
        {
          id: 'r1',
          action_id: 'a1',
          summary: 'Werkritme is deels verbeterd.',
          outcome: 'continue',
          next_review_date: '2026-05-10',
          created_by: null,
          created_at: '2026-04-20T10:00:00Z',
        },
      ],
      todayIsoDate: '2026-04-29',
    })

    expect(model.followThroughSignals.quietActions).toBe(1)
    expect(model.followThroughSignals.reviewDueNow).toBe(1)
  })
  ```

- [ ] **Step 2: Run test to verify it fails**

  ```bash
  cmd /c npm test -- --run lib/action-center/mto-cockpit.test.ts
  ```

  Expected: `FAIL` because `followThroughSignals` does not exist yet.

- [ ] **Step 3: Implement review-first UX hardening and close the docs**

  `frontend/lib/action-center/mto-cockpit.ts`

  ```ts
  return {
    departmentOverview: {
      actionCount: args.actions.length,
      reviewCount: reviewQueue.length,
      topThemes: themeCards.slice(0, 3),
    },
    themeCards,
    reviewQueue,
    followThroughSignals: {
      quietActions: args.actions.filter((action) => action.updated_at < quietCutoffIso && action.status !== 'closed').length,
      reviewDueNow: reviewQueue.filter((item) => item.tone === 'amber').length,
      recentlyReviewed: args.reviews.length,
    },
  }
  ```

  `frontend/components/dashboard/action-center/mto-review-queue.tsx`

  ```tsx
  async function saveReview(actionId: string) {
    await fetch('/api/management-action-reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action_id: actionId,
        summary,
        outcome,
        next_review_date: nextReviewDate || null,
      }),
    })
  }
  ```

  `frontend/components/dashboard/action-center/mto-action-list.tsx`

  ```tsx
  {action.blocker_note ? (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
      Blokkade: {action.blocker_note}
    </div>
  ) : null}
  ```

  Update the docs to completed status:

  ```md
  - Wave status: completed_green
  - Build permission: closed
  ```

  and add completion notes that:

  - the Action Center remains MTO-only
  - theme-first action creation is live
  - review discipline and blocker visibility are live
  - suite adapters remain blocked

- [ ] **Step 4: Run tests to verify they pass**

  ```bash
  cmd /c npm test -- --run lib/action-center/mto-cockpit.test.ts lib/management-actions.test.ts
  C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_mto_department_intelligence_program.py -q
  cmd /c npx tsc --noEmit
  ```

  Expected:

  ```text
  Test Files  2 passed
  ```

  and:

  ```text
  3 passed
  ```

  from pytest, with no TypeScript errors.

- [ ] **Step 5: Commit**

  ```bash
  git add frontend/components/dashboard/action-center/mto-action-list.tsx frontend/components/dashboard/action-center/mto-review-queue.tsx frontend/app/api/management-action-reviews/route.ts frontend/lib/action-center/mto-cockpit.ts frontend/lib/action-center/mto-cockpit.test.ts tests/test_mto_department_intelligence_program.py docs/active/WAVE_01_ACTION_CENTER_CONTRACT_HARDENING.md docs/active/WAVE_02_ACTION_CENTER_MTO_COCKPIT.md docs/active/WAVE_03_ACTION_CENTER_REVIEW_DISCIPLINE.md docs/active/ACTION_CENTER_MANAGER_COCKPIT_PLAN.md docs/active/ACTION_CENTER_MANAGER_COCKPIT_WAVE_STACK_PLAN.md
  git commit -m "feat: harden mto action center review discipline"
  ```

---

## Task 7: Full verification and branch closeout

**Files:**
- Verify only

- [ ] **Step 1: Run the targeted frontend tests**

  ```bash
  cmd /c npm test -- --run lib/products/mto/department-intelligence.test.ts lib/management-actions.test.ts lib/action-center/mto-cockpit.test.ts
  ```

  Expected: `Test Files  3 passed`.

- [ ] **Step 2: Run the boundary docs test**

  ```bash
  C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_mto_department_intelligence_program.py -q
  ```

  Expected:

  ```text
  3 passed
  ```

- [ ] **Step 3: Run the typecheck**

  ```bash
  cmd /c npx tsc --noEmit
  ```

  Expected: no output and exit code `0`.

- [ ] **Step 4: Confirm a clean worktree**

  ```bash
  git status --short
  ```

  Expected: no output.

- [ ] **Step 5: Commit any final closeout fix if verification required a small patch**

  ```bash
  git add -A
  git commit -m "chore: close out mto action center track"
  ```

  If there are no verification fixes, skip the commit and leave the branch clean.

---

## Self-Review

### Spec coverage

- Department cockpit: covered by Task 3 and Task 4
- Theme-first with optional question linkage: covered by Task 2 and Task 4
- Flexible but mature action lifecycle: covered by Task 2 and Task 6
- Review discipline: covered by Task 6
- MTO-first, suite-later boundary: covered by Task 1, Task 5, and Task 6

No spec gaps remain.

### Placeholder scan

Plan contains no `TODO`, `TBD`, “similar to”, or empty testing steps.

### Type consistency

The plan consistently uses:

- `source_question_key`
- `source_question_label`
- `blocker_note`
- `last_review_outcome`
- `ManagementActionReviewRecord`
- `buildMtoActionCenterViewModel`
