import { describe, expect, it } from 'vitest'
import {
  buildLegacyDecisionEntryId,
  compareDecisionHistoryEntries,
  projectResultProgression,
  projectLegacyDecisionRecord,
  type ActionCenterDecisionRecord,
} from './action-center-decision-history'

describe('action-center decision history contract', () => {
  it('builds a stable legacy decision entry id from one legacy review moment', () => {
    const id = buildLegacyDecisionEntryId({
      routeId: 'route-1',
      reviewCompletedAt: '2026-04-25T10:00:00.000Z',
      reviewOutcome: 'bijstellen',
    })

    expect(id).toBe('legacy:route-1:2026-04-25T10:00:00.000Z:bijstellen')
  })

  it('orders decision entries by decisionRecordedAt descending before older fallback timestamps', () => {
    const left: ActionCenterDecisionRecord = {
      decisionEntryId: 'decision-2',
      sourceRouteId: 'route-1',
      decision: 'afronden',
      decisionReason: 'Het effect is bevestigd.',
      nextCheck: 'Geen nieuwe toets nodig.',
      decisionRecordedAt: '2026-04-28T09:00:00.000Z',
      reviewCompletedAt: '2026-04-28T08:00:00.000Z',
    }
    const right: ActionCenterDecisionRecord = {
      decisionEntryId: 'decision-1',
      sourceRouteId: 'route-1',
      decision: 'doorgaan',
      decisionReason: 'De eerste stap loopt nog.',
      nextCheck: 'Toets volgende week of de frictie daalt.',
      decisionRecordedAt: '2026-04-25T09:00:00.000Z',
      reviewCompletedAt: '2026-04-25T08:00:00.000Z',
    }

    expect(compareDecisionHistoryEntries(left, right)).toBeLessThan(0)
    expect(compareDecisionHistoryEntries(right, left)).toBeGreaterThan(0)
  })

  it('projects one legacy decision record from legacy review truth using the canonical fallback order', () => {
    const record = projectLegacyDecisionRecord({
      sourceRouteId: 'route-1',
      reviewOutcome: 'bijstellen',
      reviewCompletedAt: '2026-04-25T10:00:00.000Z',
      reviewReason: 'De eerste stap gaf nog geen stabiele verbetering.',
      reviewQuestion: 'Moet de vervolgstap worden aangescherpt?',
      managementActionOutcome: null,
      latestObservation: 'Werkdruk bleef zichtbaar in hetzelfde team.',
    })

    expect(record).toMatchObject({
      sourceRouteId: 'route-1',
      decision: 'bijstellen',
      decisionReason: 'De eerste stap gaf nog geen stabiele verbetering.',
      nextCheck: 'Moet de vervolgstap worden aangescherpt?',
      decisionRecordedAt: '2026-04-25T10:00:00.000Z',
    })
  })

  it('does not project a legacy decision record without a real review completion timestamp', () => {
    const record = projectLegacyDecisionRecord({
      sourceRouteId: 'route-1',
      reviewOutcome: 'bijstellen',
      reviewCompletedAt: null,
      reviewReason: 'De eerste stap gaf nog geen stabiele verbetering.',
      reviewQuestion: 'Moet de vervolgstap worden aangescherpt?',
      managementActionOutcome: null,
      latestObservation: 'Werkdruk bleef zichtbaar in hetzelfde team.',
    })

    expect(record).toBeNull()
  })

  it('projects compact result progression entries in chronological order with bounded follow-through fallback', () => {
    const entries: ActionCenterDecisionRecord[] = [
      {
        decisionEntryId: 'decision-2',
        sourceRouteId: 'route-1',
        decision: 'bijstellen',
        decisionReason: 'De eerste stap vroeg een koerscorrectie.',
        nextCheck: 'Toets volgende week of de aangepaste route tractie geeft.',
        decisionRecordedAt: '2026-04-28T09:00:00.000Z',
        reviewCompletedAt: '2026-04-28T08:00:00.000Z',
        currentStepSnapshot: 'Plan een tweede teamreview met de manager.',
        nextStepSnapshot: 'Leg de bijgestelde route vast in het MT-overleg.',
        observationSnapshot: 'Dezelfde frictie bleef in twee teams zichtbaar.',
      },
      {
        decisionEntryId: 'decision-1',
        sourceRouteId: 'route-1',
        decision: 'doorgaan',
        decisionReason: 'De eerste stap liep nog.',
        nextCheck: 'Toets volgende week of de frictie daalt.',
        decisionRecordedAt: '2026-04-25T09:00:00.000Z',
        reviewCompletedAt: '2026-04-25T08:00:00.000Z',
        currentStepSnapshot: 'Plan een eerste teamreview met de manager.',
        expectedEffectSnapshot: 'Binnen twee weken moet zichtbaar zijn of de eerste review de frictie smaller maakt.',
      },
    ]

    expect(projectResultProgression(entries)).toEqual([
      {
        resultEntryId: 'decision-1',
        recordedAt: '2026-04-25T08:00:00.000Z',
        currentStep: 'Plan een eerste teamreview met de manager.',
        observation: null,
        decision: 'doorgaan',
        followThrough: 'Toets volgende week of de frictie daalt.',
      },
      {
        resultEntryId: 'decision-2',
        recordedAt: '2026-04-28T08:00:00.000Z',
        currentStep: 'Plan een tweede teamreview met de manager.',
        observation: 'Dezelfde frictie bleef in twee teams zichtbaar.',
        decision: 'bijstellen',
        followThrough: 'Leg de bijgestelde route vast in het MT-overleg.',
      },
    ])
  })
})
