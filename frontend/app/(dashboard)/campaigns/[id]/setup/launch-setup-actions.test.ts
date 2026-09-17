import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addDays } from '@/lib/campaign-schedule'

// Mock must be declared before importing the module under test
let orgMemberRole: string | null = 'owner'
let deliveryUpserts: Array<Record<string, unknown>> = []
let campaignUpdates: Array<Record<string, unknown>> = []
let deliveryUpsertError: { message: string } | null = null
let campaignUpdateError: { message: string } | null = null
let confirmCount = 1

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: 'user-1' } } }),
    },
    from: (table: string) => {
      if (table === 'campaigns') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { organization_id: 'org-1' } }),
            }),
          }),
          update: (payload: Record<string, unknown>) => ({
            eq: async () => {
              campaignUpdates.push(payload)
              return { error: campaignUpdateError }
            },
          }),
        }
      }
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { is_verisight_admin: false } }),
            }),
          }),
        }
      }
      if (table === 'org_members') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: orgMemberRole ? { role: orgMemberRole } : null }),
              }),
            }),
          }),
        }
      }
      if (table === 'campaign_delivery_records') {
        return {
          upsert: async (payload: Record<string, unknown>) => {
            deliveryUpserts.push(payload)
            return { error: deliveryUpsertError }
          },
          update: (_data: unknown, _opts?: unknown) => ({
            eq: async () => ({ error: null, count: confirmCount }),
          }),
        }
      }
      return {}
    },
  }),
}))

import { confirmLaunchAction, saveLaunchSetupAction, type LaunchSetupInput } from './launch-setup-actions'

const today = new Date().toISOString().slice(0, 10)
const launchDate = addDays(today, 2)

function input(overrides: Partial<LaunchSetupInput> = {}): LaunchSetupInput {
  return {
    launchDate,
    invitedCount: 25,
    closesAt: addDays(launchDate, 21),
    reminderChoice: 5,
    ...overrides,
  }
}

describe('saveLaunchSetupAction (spec 2026-09-16 par. 4.1 en 5.2)', () => {
  beforeEach(() => {
    deliveryUpserts = []
    campaignUpdates = []
    deliveryUpsertError = null
    campaignUpdateError = null
  })
  afterEach(() => {
    orgMemberRole = 'owner'
  })

  it('slaat startdatum, aantal en herinnering op het delivery record op en de sluitdatum op de campagne', async () => {
    const result = await saveLaunchSetupAction('campaign-1', input())
    expect(result).toEqual({ ok: true })
    expect(deliveryUpserts).toEqual([
      {
        campaign_id: 'campaign-1',
        organization_id: 'org-1',
        launch_date: launchDate,
        invited_count: 25,
        reminder_config: { enabled: true, firstReminderAfterDays: 5, maxReminderCount: 1 },
      },
    ])
    expect(campaignUpdates).toEqual([{ closes_at: addDays(launchDate, 21) }])
  })

  it('slaat "geen herinnering" op als enabled: false', async () => {
    await saveLaunchSetupAction('campaign-1', input({ reminderChoice: 'none' }))
    expect(deliveryUpserts[0]?.reminder_config).toEqual({ enabled: false, firstReminderAfterDays: 5, maxReminderCount: 1 })
  })

  it('geeft Nederlandse datumfouten terug in plaats van te gooien', async () => {
    expect(await saveLaunchSetupAction('campaign-1', input({ launchDate: '' }))).toEqual({ ok: false, error: 'Vul een startdatum in.' })
    expect(await saveLaunchSetupAction('campaign-1', input({ launchDate: addDays(today, -1), closesAt: addDays(today, 20) }))).toEqual({
      ok: false,
      error: 'Kies een startdatum vanaf vandaag.',
    })
    expect(await saveLaunchSetupAction('campaign-1', input({ launchDate: 'not-a-date' }))).toEqual({ ok: false, error: 'De startdatum is geen geldige datum.' })
    expect(await saveLaunchSetupAction('campaign-1', input({ closesAt: addDays(launchDate, 6) }))).toMatchObject({ ok: false })
    expect(await saveLaunchSetupAction('campaign-1', input({ closesAt: addDays(launchDate, 7), reminderChoice: 7 }))).toEqual({
      ok: false,
      error: 'De herinnering valt op of na de sluitdatum. Kies een eerdere herinnering of een latere sluitdatum.',
    })
    expect(deliveryUpserts).toHaveLength(0)
  })

  it('wijst minder dan 10 deelnemers af met de klantmelding', async () => {
    const result = await saveLaunchSetupAction('campaign-1', input({ invitedCount: 3 }))
    expect(result).toEqual({
      ok: false,
      error: 'Vul minimaal 10 deelnemers in. Onder de 10 ingevulde vragenlijsten maakt Loep geen rapport.',
    })
    expect(deliveryUpserts).toHaveLength(0)
  })

  it('geeft "Niet gemachtigd" terug voor een viewer i.p.v. te crashen op de RLS-afwijzing (2026-07-08 regressie)', async () => {
    orgMemberRole = 'viewer'
    const result = await saveLaunchSetupAction('campaign-1', input())
    expect(result).toEqual({ ok: false, error: 'Niet gemachtigd.' })
  })

  it('geeft "Niet gemachtigd" terug zonder org_members-record', async () => {
    orgMemberRole = null
    const result = await saveLaunchSetupAction('campaign-1', input())
    expect(result).toEqual({ ok: false, error: 'Niet gemachtigd.' })
  })

  it('meldt een databasefout als resultaat, niet als throw (Fail Loud, spec par. 9)', async () => {
    deliveryUpsertError = { message: 'permission denied' }
    const result = await saveLaunchSetupAction('campaign-1', input())
    expect(result).toEqual({ ok: false, error: 'Opslaan mislukt: permission denied' })
  })

  it('zegt eerlijk wat wel is opgeslagen als alleen de sluitdatum faalt', async () => {
    campaignUpdateError = { message: 'permission denied' }
    const result = await saveLaunchSetupAction('campaign-1', input())
    expect(result.ok).toBe(false)
    expect(result.error).toContain('Startdatum en deelnemers zijn opgeslagen, maar de sluitdatum niet')
  })
})

describe('confirmLaunchAction', () => {
  afterEach(() => {
    orgMemberRole = 'owner'
    confirmCount = 1
  })

  it('returns ok: true for authorized user', async () => {
    const result = await confirmLaunchAction('campaign-1')
    expect(result).toEqual({ ok: true })
  })

  it('geeft "Niet gemachtigd" terug voor een viewer i.p.v. te crashen op de RLS-afwijzing (2026-07-08 regressie)', async () => {
    orgMemberRole = 'viewer'
    const result = await confirmLaunchAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Niet gemachtigd.' })
  })

  it('geeft een resultaat terug als er nog geen delivery record is, geen throw', async () => {
    confirmCount = 0
    const result = await confirmLaunchAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Sla eerst stap 1 op; er is nog geen startdatum voor deze meting.' })
  })
})
