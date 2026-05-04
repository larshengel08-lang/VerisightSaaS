import { describe, expect, it } from 'vitest'
import {
  buildActionCenterTeamRows,
  buildTeamsSummaryStats,
  deriveScopeStatusChip,
  type ActionCenterTeamRow,
} from '@/lib/action-center-teams-view'
import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'

function buildItem(overrides: Partial<ActionCenterPreviewItem> = {}): ActionCenterPreviewItem {
  return {
    id: 'item-1',
    code: 'ACT-1001',
    title: 'Exit follow-through voorjaar',
    summary: 'Een eerste bounded opvolgroute staat open.',
    reason: 'Waarom dit nu eerst aandacht vraagt.',
    sourceLabel: 'ExitScan',
    orgId: 'org-1',
    scopeType: 'department',
    teamId: 'operations',
    teamLabel: 'Operations',
    ownerId: 'manager-1',
    ownerName: 'Manager Operations',
    ownerRole: 'Manager',
    ownerSubtitle: 'Operations',
    reviewOwnerName: 'HR lead',
    priority: 'hoog',
    status: 'in-uitvoering',
    reviewDate: '2026-05-12',
    expectedEffect: 'Maak het eerste verbeterpunt expliciet.',
    reviewReason: 'Toets of de bounded stap zichtbaar is.',
    reviewOutcome: 'bijstellen',
    reviewDateLabel: '12 mei',
    reviewRhythm: 'Maandelijks',
    signalLabel: 'ExitScan - Exit voorjaar',
    signalBody: 'Deze route vraagt nu een eerste bounded reactie.',
    nextStep: 'Plan de eerste managerstap.',
    peopleCount: 38,
    coreSemantics: {} as ActionCenterPreviewItem['coreSemantics'],
    openSignals: [],
    updates: [],
    ...overrides,
  }
}

function buildTeamRow(overrides: Partial<ActionCenterTeamRow> = {}): ActionCenterTeamRow {
  return {
    id: 'operations',
    orgId: 'org-1',
    scopeType: 'department',
    label: 'Operations',
    peopleCount: 38,
    currentManagerId: 'manager-1',
    currentManagerName: 'Manager Operations',
    openActions: 2,
    reviewSoonCount: 1,
    hasOwnerGap: false,
    ...overrides,
  }
}

describe('action center teams helpers', () => {
  it('derives the agreed scope status chip only from existing team-row fields', () => {
    expect(deriveScopeStatusChip(buildTeamRow({ openActions: 2, hasOwnerGap: false }))).toBe('actief')
    expect(deriveScopeStatusChip(buildTeamRow({ openActions: 2, hasOwnerGap: true }))).toBe('zonder-manager')
    expect(deriveScopeStatusChip(buildTeamRow({ openActions: 0, hasOwnerGap: false }))).toBe('geen-opvolging')
  })

  it('builds team rows from preview items without inventing extra data', () => {
    const rows = buildActionCenterTeamRows([
      buildItem({ reviewDate: '2026-05-05', reviewDateLabel: '5 mei' }),
      buildItem({
        id: 'item-2',
        ownerId: null,
        ownerName: null,
        reviewDate: '2026-06-02',
        reviewDateLabel: '2 jun',
      }),
      buildItem({
        id: 'item-3',
        teamId: 'support',
        teamLabel: 'Support',
        ownerId: null,
        ownerName: null,
        peopleCount: 0,
        status: 'afgerond',
        reviewDate: null,
        reviewDateLabel: 'Nog niet gepland',
      }),
    ])

    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({
      id: 'operations',
      openActions: 2,
      reviewSoonCount: 1,
      hasOwnerGap: true,
      peopleCount: 38,
    })
    expect(rows[1]).toMatchObject({
      id: 'support',
      openActions: 0,
      reviewSoonCount: 0,
      hasOwnerGap: true,
      peopleCount: 0,
    })
  })

  it('summarises the visible team scope for the summary bar', () => {
    const stats = buildTeamsSummaryStats([
      buildTeamRow({ id: 'operations', openActions: 2, currentManagerId: 'manager-1', reviewSoonCount: 1 }),
      buildTeamRow({ id: 'support', openActions: 1, currentManagerId: null, currentManagerName: null, hasOwnerGap: true, reviewSoonCount: 0 }),
      buildTeamRow({ id: 'finance', openActions: 0, currentManagerId: null, currentManagerName: null, hasOwnerGap: false, reviewSoonCount: 0 }),
    ])

    expect(stats).toEqual({
      teamsInScope: 3,
      withoutManager: 2,
      withOpenFollowThrough: 2,
      reviewFirstUp: 1,
    })
  })
})
