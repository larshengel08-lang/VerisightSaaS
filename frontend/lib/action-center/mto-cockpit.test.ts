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
  })
})
