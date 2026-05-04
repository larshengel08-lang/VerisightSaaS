import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildDeliveryAutoSignals } from '@/lib/ops-delivery'
import {
  buildRouteBeheerLifecycleSteps,
  formatLatestActivityLabel,
  formatRoutePeriodLabel,
  getLatestActivityTimestamp,
} from './beheer-data'

describe('routebeheer data helpers', () => {
  it('copies the quarter label from the campaign name when available', () => {
    expect(formatRoutePeriodLabel('Exit Q3 2026', '2026-01-15T10:00:00.000Z')).toBe('Q3 2026')
  })

  it('prefers the newest timestamp between audit and delivery update', () => {
    expect(
      getLatestActivityTimestamp(
        [{ action_key: 'launch_invites', outcome: 'completed', action_label: 'x', owner_label: 'y', actor_role: null, actor_label: null, summary: 'done', metadata: {}, created_at: '2026-05-03T09:00:00.000Z' }],
        '2026-05-03T10:00:00.000Z',
      ),
    ).toBe('2026-05-03T10:00:00.000Z')
  })

  it('maps all delivery stages into the fixed six-step lifecycle', () => {
    const stages = [
      'setup_in_progress',
      'import_cleared',
      'invites_live',
      'client_activation_pending',
      'client_activation_confirmed',
      'first_value_reached',
      'first_management_use',
      'follow_up_decided',
      'learning_closed',
    ] as const

    const results = stages.map((stage) =>
      buildRouteBeheerLifecycleSteps({
        stage,
        isActive: true,
        hasMinDisplay: true,
        hasEnoughData: true,
      }),
    )

    expect(results[0][0]?.status).toBe('current')
    expect(results[1][1]?.status).toBe('current')
    expect(results[2][2]?.status).toBe('current')
    expect(results[3][2]?.status).toBe('current')
    expect(results[4][3]?.status).toBe('current')
    expect(results[5][3]?.status).toBe('current')
    expect(results[6][4]?.status).toBe('current')
    expect(results[7][4]?.status).toBe('current')
    expect(results[8][5]?.status).toBe('current')
  })

  it('formats latest activity in Dutch routebeheer copy', () => {
    expect(formatLatestActivityLabel('2026-05-01T08:00:00.000Z')).toContain('Laatste activiteit:')
  })

  it('keeps missing import readiness explicit instead of treating it as not ready', () => {
    const signals = buildDeliveryAutoSignals({
      scanType: 'exit',
      linkedLeadPresent: false,
      totalInvited: 0,
      totalCompleted: 0,
      invitesNotSent: 0,
      incompleteScores: 0,
      hasMinDisplay: false,
      hasEnoughData: false,
      activeClientAccessCount: 0,
      pendingClientInviteCount: 0,
      importReady: null,
    })

    expect(signals.import_qa.autoState).toBe('unknown')
    expect(signals.import_qa.summary).toContain('nog niet bekend')
  })
})

describe('routebeheer source integration', () => {
  it('adds the routebeheer bridge link to the existing campaign detail page', () => {
    const source = readFileSync(new URL('../page.tsx', import.meta.url), 'utf8')
    expect(source).toContain('Routebeheer openen')
    expect(source).toContain('/campaigns/${id}/beheer')
  })

  it('does not silently coerce unknown import readiness into a false auto-signal', () => {
    const source = readFileSync(new URL('./beheer-data.ts', import.meta.url), 'utf8')

    expect(source).not.toContain('importReady: importReady === true')
  })

  it('keeps the operational route free from analytical or action-center detail imports', () => {
    const source = readFileSync(new URL('./route-beheer-components.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Livegang')
    expect(source).toContain('Respons')
    expect(source).toContain('Dashboard leesbaarheid')
    expect(source).toContain('Eerstvolgende stap')
    expect(source).not.toContain('Frictiescore')
    expect(source).not.toContain('SDT')
    expect(source).not.toContain('buildExitNarratives')
    expect(source).not.toContain('buildRetentionNarratives')
    expect(source).not.toContain('ActionPlaybook')
  })
})
