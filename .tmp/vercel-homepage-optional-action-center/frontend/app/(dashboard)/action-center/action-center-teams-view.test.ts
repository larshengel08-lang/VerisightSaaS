import { readFileSync } from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ActionCenterTeamsView } from '@/components/dashboard/action-center-teams-view'
import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'

type ButtonElement = React.ReactElement<{
  children?: React.ReactNode
  onClick?: () => void
  'data-team-id'?: string
}>

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
    reviewDate: '2026-05-05',
    expectedEffect: 'Maak het eerste verbeterpunt expliciet.',
    reviewReason: 'Toets of de bounded stap zichtbaar is.',
    reviewOutcome: 'bijstellen',
    reviewDateLabel: '5 mei',
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

function collectButtons(node: React.ReactNode): ButtonElement[] {
  const found: ButtonElement[] = []

  function visit(value: React.ReactNode) {
    if (!value) return
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }
    if (React.isValidElement(value)) {
      const element = value as ButtonElement
      if (element.type === 'button') {
        found.push(element)
      }
      visit(element.props.children)
    }
  }

  visit(node)
  return found
}

describe('action center teams view', () => {
  it('keeps the source copy free from mojibake markers', () => {
    const source = readFileSync(new URL('../../../components/dashboard/action-center-teams-view.tsx', import.meta.url), 'utf8')

    expect(source).not.toMatch(/Ã|Â|â|�/)
    expect(source).toContain("{' · '}")
    expect(source).toContain('één open opvolgingsroute')
    expect(source).toContain('Minstens één route vraagt deze week aandacht.')
  })

  it('renders an empty state without crashing when no items are visible', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActionCenterTeamsView, {
        items: [],
        selectedTeamId: null,
        onSelectTeam: () => {},
        onNavigateToActions: () => {},
        canAssignManagers: false,
      }),
    )

    expect(html).toContain('Nog geen teams zichtbaar')
    expect(html).toContain('Zodra opvolgingsroutes aan teamscopes zijn gekoppeld, verschijnt hier het teamoverzicht.')
  })

  it('renders the agreed scope copy and hides a zero people label in detail', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActionCenterTeamsView, {
        items: [
          buildItem({
            id: 'item-1',
            ownerId: null,
            ownerName: null,
            peopleCount: 0,
          }),
          buildItem({
            id: 'item-2',
            title: 'Tweede bounded stap',
            teamId: 'operations',
            teamLabel: 'Operations',
            ownerId: null,
            ownerName: null,
            peopleCount: 0,
          }),
        ],
        selectedTeamId: 'operations',
        onSelectTeam: () => {},
        onNavigateToActions: () => {},
        canAssignManagers: false,
      }),
    )

    expect(html).toContain('Action Center / Teams in scope')
    expect(html).toContain('ACTION CENTER')
    expect(html).toContain('Teams in scope')
    expect(html).toContain('Bekijk welke teams of afdelingen aan opvolging, managers en reviews zijn gekoppeld.')
    expect(html).toContain('Niet gekoppeld')
    expect(html).toContain('Review deze week')
    expect(html).not.toContain('0 mensen')
    expect(html).not.toMatch(/Ã|Â|â|�/)
  })

  it('calls the row select callback with the clicked team id', () => {
    const onSelectTeam = vi.fn()
    const tree = ActionCenterTeamsView({
      items: [
        buildItem(),
        buildItem({ id: 'item-2', teamId: 'support', teamLabel: 'Support', ownerId: null, ownerName: null }),
      ],
      selectedTeamId: null,
      onSelectTeam,
      onNavigateToActions: () => {},
      canAssignManagers: false,
    })

    const rowButtons = collectButtons(tree).filter((button) => button.props['data-team-id'])
    expect(rowButtons).toHaveLength(2)
    expect(typeof rowButtons[1]?.props.onClick).toBe('function')

    rowButtons[1].props.onClick?.()
    expect(onSelectTeam).toHaveBeenCalledWith('support')
  })

  it('calls the navigate callback when an open action is clicked in the detail panel', () => {
    const onNavigateToActions = vi.fn()
    const tree = ActionCenterTeamsView({
      items: [buildItem()],
      selectedTeamId: 'operations',
      onSelectTeam: () => {},
      onNavigateToActions,
      canAssignManagers: false,
    })

    const detailButtons = collectButtons(tree).filter(
      (button) => !button.props['data-team-id'] && typeof button.props.onClick === 'function',
    )
    expect(detailButtons.length).toBeGreaterThan(0)
    expect(typeof detailButtons[0]?.props.onClick).toBe('function')

    detailButtons[0].props.onClick?.()
    expect(onNavigateToActions).toHaveBeenCalledWith('item-1')
  })
})
