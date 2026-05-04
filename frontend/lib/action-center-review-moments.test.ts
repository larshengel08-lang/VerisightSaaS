import { describe, expect, it } from 'vitest'
import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'
import {
  classifyReviewMoment,
  computeReviewMomentGovernanceCounts,
  formatReviewMomentLastUpdated,
  getReviewMomentActionLabel,
  getReviewMomentManagerLabel,
  getReviewMomentOutcomeSummary,
  getReviewMomentScopeLabel,
  getReviewMomentScopeTypeLabel,
  groupReviewMomentsByUrgency,
} from './action-center-review-moments'

function buildItem(overrides: Partial<ActionCenterPreviewItem> = {}): ActionCenterPreviewItem {
  return {
    id: 'route-1',
    code: 'AC-101',
    title: 'Exit voorjaar',
    summary: 'Compacte route-read',
    reason: 'Frictie vraagt opvolging.',
    sourceLabel: 'ExitScan',
    orgId: 'org-1',
    scopeType: 'department',
    teamId: 'org-1::department::operations',
    teamLabel: 'Operations',
    ownerId: 'manager-1',
    ownerName: 'Manager Operations',
    ownerRole: 'Manager',
    ownerSubtitle: 'Operations',
    reviewOwnerName: 'HR lead',
    priority: 'hoog',
    status: 'te-bespreken',
    reviewDate: '2026-05-06T10:00:00.000Z',
    expectedEffect: 'Maak duidelijk wat eerst bestuurlijke aandacht vraagt.',
    reviewReason: null,
    reviewOutcome: 'geen-uitkomst',
    managerResponse: null,
    reviewDateLabel: '6 mei',
    reviewRhythm: 'Tweewekelijks',
    signalLabel: 'ExitScan',
    signalBody: 'Exit-signaal',
    nextStep: 'Plan de eerste review.',
    peopleCount: 23,
    coreSemantics: {} as ActionCenterPreviewItem['coreSemantics'],
    openSignals: [],
    updates: [],
    ...overrides,
  }
}

describe('action center review moments helpers', () => {
  const referenceNow = new Date('2026-05-05T12:00:00.000Z')

  it('classifies overdue, this-week, upcoming and completed moments from existing item data', () => {
    expect(
      classifyReviewMoment(
        buildItem({
          reviewDate: '2026-05-02T08:00:00.000Z',
          reviewOutcome: 'geen-uitkomst',
        }),
        referenceNow,
      ),
    ).toBe('overdue')

    expect(
      classifyReviewMoment(
        buildItem({
          reviewDate: '2026-05-08T08:00:00.000Z',
        }),
        referenceNow,
      ),
    ).toBe('this-week')

    expect(
      classifyReviewMoment(
        buildItem({
          reviewDate: '2026-05-20T08:00:00.000Z',
        }),
        referenceNow,
      ),
    ).toBe('upcoming')

    expect(
      classifyReviewMoment(
        buildItem({
          status: 'afgerond',
          reviewOutcome: 'afronden',
          reviewDate: '2026-05-01T08:00:00.000Z',
        }),
        referenceNow,
      ),
    ).toBe('completed')
  })

  it('keeps unscheduled items out of urgency lanes instead of masking them as dated work', () => {
    expect(classifyReviewMoment(buildItem({ reviewDate: null }), referenceNow)).toBeNull()
  })

  it('groups items by urgency and keeps unscheduled records separate', () => {
    const grouped = groupReviewMomentsByUrgency(
      [
        buildItem({ id: 'overdue', reviewDate: '2026-05-02T08:00:00.000Z' }),
        buildItem({ id: 'this-week', reviewDate: '2026-05-08T08:00:00.000Z' }),
        buildItem({ id: 'upcoming', reviewDate: '2026-05-20T08:00:00.000Z' }),
        buildItem({
          id: 'completed',
          status: 'afgerond',
          reviewOutcome: 'afronden',
          reviewDate: '2026-05-01T08:00:00.000Z',
        }),
        buildItem({ id: 'unscheduled', reviewDate: null }),
      ],
      referenceNow,
    )

    expect(grouped.overdue.map((item) => item.id)).toEqual(['overdue'])
    expect(grouped['this-week'].map((item) => item.id)).toEqual(['this-week'])
    expect(grouped.upcoming.map((item) => item.id)).toEqual(['upcoming'])
    expect(grouped.completed.map((item) => item.id)).toEqual(['completed'])
    expect(grouped.unscheduled.map((item) => item.id)).toEqual(['unscheduled'])
  })

  it('counts overdue, missing outcome, missing scope and missing manager without silent fallbacks', () => {
    const counts = computeReviewMomentGovernanceCounts(
      [
        buildItem({
          reviewDate: '2026-05-02T08:00:00.000Z',
          ownerName: null,
          teamLabel: '',
        }),
        buildItem({
          id: 'closed',
          status: 'afgerond',
          reviewOutcome: 'afronden',
          reviewDate: '2026-05-01T08:00:00.000Z',
        }),
      ],
      referenceNow,
    )

    expect(counts).toEqual({
      overdue: 1,
      missingOutcome: 1,
      missingScope: 1,
      missingManager: 1,
    })
  })

  it('keeps agreed reviewmomenten copy and scope fallbacks', () => {
    expect(getReviewMomentActionLabel(buildItem())).toBe('Leg uitkomst vast')
    expect(
      getReviewMomentActionLabel(
        buildItem({
          status: 'afgerond',
          reviewOutcome: 'afronden',
        }),
      ),
    ).toBe('Open reviewmoment')
    expect(getReviewMomentOutcomeSummary(buildItem())).toBe('Nog geen reviewuitkomst vastgelegd.')
    expect(getReviewMomentManagerLabel(buildItem({ ownerName: null }))).toBe('Geen manager gekoppeld')
    expect(getReviewMomentScopeLabel(buildItem({ teamLabel: '' }))).toBe('Geen scope')
    expect(getReviewMomentScopeTypeLabel('department')).toBe('Afdeling')
    expect(getReviewMomentScopeTypeLabel('item')).toBe('Campagne')
    expect(getReviewMomentScopeTypeLabel('org')).toBe('Organisatie')
    expect(getReviewMomentScopeTypeLabel(undefined)).toBe('Niet beschikbaar')
  })

  it('formats the last updated label for the filter row timestamp', () => {
    expect(formatReviewMomentLastUpdated('2026-05-05T12:10:00.000Z')).toContain('Laatste update')
  })
})
