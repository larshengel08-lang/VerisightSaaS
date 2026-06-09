import { describe, expect, it } from 'vitest'
import {
  getCampaignCompositionState,
  HOME_STATE_ORDER,
  type CampaignCompositionState,
} from './dashboard-state-composition'

function classify(overrides: Partial<Parameters<typeof getCampaignCompositionState>[0]> = {}) {
  return getCampaignCompositionState({
    isActive: true,
    totalInvited: 0,
    totalCompleted: 0,
    invitesNotSent: 0,
    incompleteScores: 0,
    hasMinDisplay: false,
    hasEnoughData: false,
    ...overrides,
  })
}

describe('dashboard state-aware composition', () => {
  it('keeps the home state order aligned with execution and management readiness', () => {
    expect(HOME_STATE_ORDER).toEqual<CampaignCompositionState[]>([
      'full',
      'partial',
      'sparse',
      'running',
      'ready_to_launch',
      'setup',
      'closed',
    ])
  })

  it('classifies setup when no respondents have been prepared yet', () => {
    expect(classify()).toBe('setup')
  })

  it('classifies ready to launch when invites are still waiting to be sent', () => {
    expect(
      classify({
        totalInvited: 24,
        invitesNotSent: 24,
      }),
    ).toBe('ready_to_launch')
  })

  it('classifies running when invites are live but no safe response is available yet', () => {
    expect(
      classify({
        totalInvited: 24,
        invitesNotSent: 0,
        totalCompleted: 0,
      }),
    ).toBe('running')
  })

  it('classifies sparse when responses are still below the first display threshold', () => {
    expect(
      classify({
        totalInvited: 24,
        invitesNotSent: 0,
        totalCompleted: 4,
      }),
    ).toBe('sparse')
  })

  it('classifies partial when the first dashboard view is open but patterns remain gated', () => {
    expect(
      classify({
        totalInvited: 24,
        invitesNotSent: 0,
        totalCompleted: 6,
        hasMinDisplay: true,
      }),
    ).toBe('partial')
  })

  it('keeps a campaign partial when privacy or score completeness still hides part of the output', () => {
    expect(
      classify({
        totalInvited: 24,
        invitesNotSent: 0,
        totalCompleted: 14,
        incompleteScores: 2,
        hasMinDisplay: true,
        hasEnoughData: true,
      }),
    ).toBe('partial')
  })

  it('classifies full when the campaign is management-ready', () => {
    expect(
      classify({
        totalInvited: 24,
        invitesNotSent: 0,
        totalCompleted: 14,
        hasMinDisplay: true,
        hasEnoughData: true,
      }),
    ).toBe('full')
  })

  it('classifies closed as report-first', () => {
    expect(
      classify({
        isActive: false,
        totalInvited: 24,
        totalCompleted: 14,
        hasMinDisplay: true,
        hasEnoughData: true,
      }),
    ).toBe('closed')
  })
})
