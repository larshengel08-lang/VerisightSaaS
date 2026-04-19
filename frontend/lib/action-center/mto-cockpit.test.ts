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
