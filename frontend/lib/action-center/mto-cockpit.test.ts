import { createElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { buildMtoActionCenterViewModel } from '@/lib/action-center/mto-cockpit'
import { MtoPriorityThemeGrid } from '@/components/dashboard/action-center/mto-priority-theme-grid'
import { MtoActionList } from '@/components/dashboard/action-center/mto-action-list'
import { MtoReviewQueue } from '@/components/dashboard/action-center/mto-review-queue'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: () => {},
  }),
}))

describe('buildMtoActionCenterViewModel', () => {
  it('builds a department-suite overview with one primary summary and limited headline stats', () => {
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
          signalValue: 7.9,
          title: 'Werkbelasting vraagt aandacht',
          decision: 'Open eerst een bounded werkdruksprint.',
          validate: 'Check teamritme.',
          owner: 'Manager Operations',
          actions: ['Herplan piekbelasting'],
          caution: 'Maak het niet suitebreed.',
          review: 'Review binnen 30 dagen.',
          handoffBody: 'Bounded MTO-traject.',
          stayIntentAverage: 5.9,
        },
        {
          segmentType: 'department',
          segmentLabel: 'Operations',
          factorKey: 'leadership',
          factorLabel: 'Leiderschap',
          n: 12,
          avgSignal: 6.1,
          deltaVsOrg: 0.5,
          signalValue: 5.8,
          title: 'Leiderschap vraagt aandacht',
          decision: 'Maak managementritme scherper.',
          validate: 'Check voorbeeldgedrag.',
          owner: 'Manager Operations',
          actions: ['Verduidelijk leidinggevende ritmes'],
          caution: 'Houd het bounded.',
          review: 'Review binnen 21 dagen.',
          handoffBody: 'Bounded MTO-traject.',
          stayIntentAverage: 6.3,
        },
      ],
      actions: [
        {
          id: 'a-1',
          organization_id: 'org-1',
          campaign_id: 'camp-1',
          source_product: 'mto',
          source_scope_type: 'department',
          source_scope_key: 'department:operations',
          source_scope_label: 'Operations',
          source_read_stage: 'mto_closed_improvement_loop',
          source_factor_key: 'workload',
          source_factor_label: 'Werkbelasting',
          source_signal_value: 7.9,
          source_question_key: null,
          source_question_label: null,
          title: 'Herijk prioriteiten',
          decision_context: 'Open een bounded werkdruksprint.',
          expected_outcome: 'Duidelijker prioriteiten en rustiger weekstart.',
          measured_outcome: null,
          blocker_note: null,
          last_review_outcome: 'continue',
          status: 'in_review',
          owner_label: 'Manager Operations',
          owner_email: 'ops@example.com',
          due_date: '2026-05-05',
          review_date: '2026-04-20',
          created_by: null,
          updated_by: null,
          created_at: '2026-04-01T10:00:00Z',
          updated_at: '2026-04-18T10:00:00Z',
        },
        {
          id: 'a-2',
          organization_id: 'org-1',
          campaign_id: 'camp-1',
          source_product: 'mto',
          source_scope_type: 'department',
          source_scope_key: 'department:operations',
          source_scope_label: 'Operations',
          source_read_stage: 'mto_closed_improvement_loop',
          source_factor_key: 'leadership',
          source_factor_label: 'Leiderschap',
          source_signal_value: 5.8,
          source_question_key: null,
          source_question_label: null,
          title: 'Versterk managementritme',
          decision_context: 'Maak ritme en opvolging expliciet.',
          expected_outcome: 'Meer voorspelbaar managementritme.',
          measured_outcome: null,
          blocker_note: null,
          last_review_outcome: null,
          status: 'assigned',
          owner_label: 'Manager Operations',
          owner_email: 'ops@example.com',
          due_date: '2026-05-12',
          review_date: '2026-04-29',
          created_by: null,
          updated_by: null,
          created_at: '2026-04-02T10:00:00Z',
          updated_at: '2026-04-19T10:00:00Z',
        },
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

  it('prioritizes themes by follow-through pressure instead of raw source order', () => {
    const model = buildMtoActionCenterViewModel({
      departmentReads: [
        {
          segmentType: 'department',
          segmentLabel: 'People Ops',
          factorKey: 'leadership',
          factorLabel: 'Leiderschap',
          n: 10,
          avgSignal: 5.8,
          deltaVsOrg: 0.4,
          signalValue: 5.2,
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
      actions: [
        {
          id: 'a1',
          organization_id: 'org-1',
          campaign_id: 'camp-1',
          source_product: 'mto',
          source_scope_type: 'department',
          source_scope_key: 'department:people-ops',
          source_scope_label: 'People Ops',
          source_read_stage: 'mto_closed_improvement_loop',
          source_factor_key: 'leadership',
          source_factor_label: 'Leiderschap',
          source_signal_value: 5.8,
          source_question_key: null,
          source_question_label: null,
          title: 'Herstel managementritme',
          decision_context: 'Bounded leiderschapsroute.',
          expected_outcome: 'Meer voorspelbaar teamritme.',
          measured_outcome: null,
          blocker_note: 'Nog geen ritmebesluit genomen.',
          last_review_outcome: 'follow_up_needed',
          status: 'follow_up_needed',
          owner_label: 'Manager People Ops',
          owner_email: 'people@example.com',
          due_date: '2026-05-03',
          review_date: '2026-04-20',
          created_by: null,
          updated_by: null,
          created_at: '2026-04-01T10:00:00Z',
          updated_at: '2026-04-05T10:00:00Z',
        },
      ],
      updates: [],
      reviews: [],
      todayIsoDate: '2026-04-26',
    })

    expect(model.themeCards[0].departmentLabel).toBe('People Ops')
    expect(model.departmentOverview.primaryTheme?.departmentLabel).toBe('People Ops')
  })

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
    expect(model.themeCards[0].actionHealth.status).toBe('no_action')
  })

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
    expect(model.themeCards[0].actionHealth.label).toContain('Nog geen actie')
  })

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
          source_signal_value: 7.1,
          source_question_key: null,
          source_question_label: null,
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
    expect(model.reviewQueue[0].stateLabel).toBe('Review nu')
  })

  it('summarizes action health per theme for the cockpit', () => {
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
          source_signal_value: 7.1,
          source_question_key: null,
          source_question_label: null,
          title: 'Herstel werkritme',
          decision_context: 'Bounded sprint.',
          expected_outcome: 'Rustiger weekstart.',
          measured_outcome: null,
          blocker_note: 'Capaciteit nog niet vrijgemaakt.',
          last_review_outcome: 'continue',
          status: 'in_progress',
          owner_label: 'Ops manager',
          owner_email: 'ops@example.com',
          due_date: '2026-05-01',
          review_date: '2026-04-24',
          created_by: null,
          updated_by: null,
          created_at: '2026-04-01T10:00:00Z',
          updated_at: '2026-04-10T10:00:00Z',
        },
      ],
      updates: [],
      reviews: [],
      todayIsoDate: '2026-04-26',
    })

    expect(model.themeCards[0].actionHealth.blockedCount).toBe(1)
    expect(model.themeCards[0].actionHealth.reviewDueCount).toBe(1)
    expect(model.themeCards[0].actionHealth.status).toBe('attention_now')
  })

  it('shows summary-first priority themes and does not render inline creation forms on the overview surface', () => {
    const markup = renderToStaticMarkup(
      createElement(MtoPriorityThemeGrid, {
        themes: [
          {
            departmentRead: {
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
            departmentLabel: 'Operations',
            factorKey: 'workload',
            factorLabel: 'Werkbelasting',
            questionOptions: [],
            actions: [],
            priorityScore: 680,
            actionHealth: {
              totalCount: 0,
              blockedCount: 0,
              reviewDueCount: 0,
              quietCount: 0,
              followUpCount: 0,
              status: 'no_action',
              label: 'Nog geen actie gekoppeld',
              tone: 'slate',
            },
          },
        ],
        onOpenTheme: () => {},
      }),
    )

    expect(markup).toContain('Werkbelasting')
    expect(markup).toContain('Open thema')
    expect(markup).not.toContain('Nieuwe actie')
  })

  it('renders actions as dossier summaries and removes direct review logging from the overview surface', () => {
    const listMarkup = renderToStaticMarkup(
      createElement(MtoActionList, {
        actions: [
          {
            id: 'a-1',
            organization_id: 'org-1',
            campaign_id: 'camp-1',
            source_product: 'mto',
            source_scope_type: 'department',
            source_scope_key: 'department:operations',
            source_scope_label: 'Operations',
            source_read_stage: 'mto_closed_improvement_loop',
            source_factor_key: 'workload',
            source_factor_label: 'Werkbelasting',
            source_signal_value: 7.1,
            source_question_key: null,
            source_question_label: null,
            title: 'Herijk prioriteiten',
            decision_context: 'Bounded sprint.',
            expected_outcome: 'Rustiger weekstart.',
            measured_outcome: null,
            blocker_note: null,
            last_review_outcome: null,
            status: 'in_review',
            owner_label: 'Ops manager',
            owner_email: 'ops@example.com',
            due_date: '2026-05-01',
            review_date: '2026-04-24',
            created_by: null,
            updated_by: null,
            created_at: '2026-04-01T10:00:00Z',
            updated_at: '2026-04-10T10:00:00Z',
          },
        ],
        updates: [],
        reviews: [],
        onOpenDossier: () => {},
      }),
    )

    const reviewMarkup = renderToStaticMarkup(
      createElement(MtoReviewQueue, {
        reviewQueue: [
          {
            actionId: 'a-1',
            departmentLabel: 'Operations',
            title: 'Herijk prioriteiten',
            tone: 'amber',
            stateLabel: 'Review nu',
          },
        ],
        reviews: [],
        onOpenDossier: () => {},
      }),
    )

    expect(listMarkup).toContain('Open dossier')
    expect(reviewMarkup).not.toContain('Log review')
  })

  it('uses calm neutral surfaces with targeted amber accents when review pressure is due today', () => {
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
      actions: [
        {
          id: 'a-1',
          organization_id: 'org-1',
          campaign_id: 'camp-1',
          source_product: 'mto',
          source_scope_type: 'department',
          source_scope_key: 'department:operations',
          source_scope_label: 'Operations',
          source_read_stage: 'mto_closed_improvement_loop',
          source_factor_key: 'workload',
          source_factor_label: 'Werkbelasting',
          source_signal_value: 7.1,
          source_question_key: null,
          source_question_label: null,
          title: 'Herijk prioriteiten',
          decision_context: 'Bounded sprint.',
          expected_outcome: 'Rustiger weekstart.',
          measured_outcome: null,
          blocker_note: null,
          last_review_outcome: null,
          status: 'in_review',
          owner_label: 'Ops manager',
          owner_email: 'ops@example.com',
          due_date: '2026-05-01',
          review_date: '2026-04-20',
          created_by: null,
          updated_by: null,
          created_at: '2026-04-01T10:00:00Z',
          updated_at: '2026-04-10T10:00:00Z',
        },
      ],
      updates: [],
      reviews: [],
      todayIsoDate: '2026-04-20',
    })

    expect(model.departmentSuite.stats.find((item) => item.label === 'Review nu')?.tone).toBe('amber')
    expect(model.followThroughNavigation.find((item) => item.key === 'all_themes')?.tone).toBe('slate')
    expect(model.followThroughNavigation.find((item) => item.key === 'reviews')?.tone).toBe('amber')
  })
})
