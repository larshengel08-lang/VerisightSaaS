import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addDays } from '@/lib/campaign-schedule'

// Mock must be declared before importing the module under test
let orgMemberRole: string | null = 'owner'
let deliveryUpserts: Array<Record<string, unknown>> = []
let campaignUpdates: Array<Record<string, unknown>> = []
let campaignUpdateOptions: Array<unknown> = []
let deliveryUpsertError: { message: string } | null = null
let campaignUpdateError: { message: string } | null = null
let confirmCount = 1
let confirmUpdates: Array<Record<string, unknown>> = []
let campaignUpdateCount: number | null = 1
let campaignRow: Record<string, unknown> = { organization_id: 'org-1', is_active: true, closed_at: null }
let deliveryRow: Record<string, unknown> | null = null
let deliveryReadError: { message: string } | null = null

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
              single: async () => ({ data: campaignRow }),
            }),
          }),
          update: (payload: Record<string, unknown>, opts?: { count?: string }) => ({
            eq: async () => {
              campaignUpdates.push(payload)
              campaignUpdateOptions.push(opts)
              // Zoals Supabase: zonder { count: 'exact' } komt er geen telling terug.
              const count = opts?.count === 'exact' && !campaignUpdateError ? campaignUpdateCount : null
              return { error: campaignUpdateError, count }
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
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: deliveryRow, error: deliveryReadError }),
            }),
          }),
          upsert: async (payload: Record<string, unknown>) => {
            deliveryUpserts.push(payload)
            return { error: deliveryUpsertError }
          },
          update: (data: Record<string, unknown>, _opts?: unknown) => ({
            eq: async () => {
              confirmUpdates.push(data)
              return { error: null, count: confirmCount }
            },
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
    campaignUpdateOptions = []
    deliveryUpsertError = null
    campaignUpdateError = null
    campaignUpdateCount = 1
    campaignRow = { organization_id: 'org-1', is_active: true, closed_at: null }
    deliveryRow = null
    deliveryReadError = null
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

  it('meldt eerlijk als de sluitdatum door de database niet is bijgewerkt (0 rijen, geen fout)', async () => {
    campaignUpdateCount = 0
    const result = await saveLaunchSetupAction('campaign-1', input())
    expect(campaignUpdateOptions).toEqual([{ count: 'exact' }])
    expect(result.ok).toBe(false)
    expect(result.error).toContain('Startdatum en deelnemers zijn opgeslagen, maar de sluitdatum niet')
  })

  it('accepteert de al opgeslagen startdatum van gisteren zolang de meting nog niet gestart is', async () => {
    const yesterday = addDays(today, -1)
    deliveryRow = { launch_date: yesterday, launch_confirmed_at: null }
    const result = await saveLaunchSetupAction('campaign-1', input({ launchDate: yesterday, closesAt: addDays(yesterday, 21) }))
    expect(result).toEqual({ ok: true })
    expect(deliveryUpserts[0]?.launch_date).toBe(yesterday)
  })

  it('weigert wijzigingen als de meting al gestart is', async () => {
    deliveryRow = { launch_date: launchDate, launch_confirmed_at: '2026-09-01T10:00:00Z' }
    const result = await saveLaunchSetupAction('campaign-1', input())
    expect(result).toEqual({ ok: false, error: 'De meting is al gestart; stap 1 kun je niet meer wijzigen.' })
    expect(deliveryUpserts).toHaveLength(0)
    expect(campaignUpdates).toHaveLength(0)
  })

  it('weigert wijzigingen als de meting al gesloten is', async () => {
    campaignRow = { organization_id: 'org-1', is_active: false, closed_at: '2026-09-10T10:00:00Z' }
    const result = await saveLaunchSetupAction('campaign-1', input())
    expect(result).toEqual({ ok: false, error: 'De meting is al gesloten; stap 1 kun je niet meer wijzigen.' })
    expect(deliveryUpserts).toHaveLength(0)
    expect(campaignUpdates).toHaveLength(0)
  })

  it('meldt het als de huidige stand van de meting niet te lezen is, in plaats van blind te schrijven', async () => {
    deliveryReadError = { message: 'timeout' }
    const result = await saveLaunchSetupAction('campaign-1', input())
    expect(result).toEqual({ ok: false, error: 'Opslaan mislukt: de huidige planning kon niet worden gelezen (timeout).' })
    expect(deliveryUpserts).toHaveLength(0)
  })
})

describe('confirmLaunchAction', () => {
  const closesAt = addDays(launchDate, 21)
  const savedStep1 = () => ({
    launch_date: launchDate,
    invited_count: 25,
    reminder_config: { enabled: true, firstReminderAfterDays: 5, maxReminderCount: 1 },
    launch_confirmed_at: null,
  })

  beforeEach(() => {
    confirmUpdates = []
    confirmCount = 1
    campaignRow = { organization_id: 'org-1', is_active: true, closed_at: null, closes_at: closesAt }
    deliveryRow = savedStep1()
    deliveryReadError = null
  })
  afterEach(() => {
    orgMemberRole = 'owner'
  })

  it('weigert te bevestigen als de meting al gesloten is', async () => {
    campaignRow = { organization_id: 'org-1', is_active: false, closed_at: '2026-09-10T10:00:00Z', closes_at: closesAt }
    const result = await confirmLaunchAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'De meting is al gesloten; je kunt hem niet meer als verstuurd bevestigen.' })
    expect(confirmUpdates).toHaveLength(0)
  })

  it('bevestigt als stap 1 volledig en geldig is opgeslagen', async () => {
    const result = await confirmLaunchAction('campaign-1')
    expect(result).toEqual({ ok: true })
    expect(confirmUpdates).toHaveLength(1)
    expect(confirmUpdates[0]).toHaveProperty('launch_confirmed_at')
  })

  it('geeft "Niet gemachtigd" terug voor een viewer i.p.v. te crashen op de RLS-afwijzing (2026-07-08 regressie)', async () => {
    orgMemberRole = 'viewer'
    const result = await confirmLaunchAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Niet gemachtigd.' })
    expect(confirmUpdates).toHaveLength(0)
  })

  it('weigert te bevestigen zolang startdatum en aantal niet zijn opgeslagen (het record bestaat altijd via de trigger)', async () => {
    deliveryRow = { launch_date: null, invited_count: null, reminder_config: {}, launch_confirmed_at: null }
    const result = await confirmLaunchAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Sla eerst stap 1 op: startdatum en aantal deelnemers ontbreken nog.' })
    expect(confirmUpdates).toHaveLength(0)
  })

  it('weigert ook zonder delivery record, zonder throw', async () => {
    deliveryRow = null
    const result = await confirmLaunchAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Sla eerst stap 1 op: startdatum en aantal deelnemers ontbreken nog.' })
    expect(confirmUpdates).toHaveLength(0)
  })

  it('weigert een opgeslagen aantal onder de drempel', async () => {
    deliveryRow = { ...savedStep1(), invited_count: 4 }
    const result = await confirmLaunchAction('campaign-1')
    expect(result).toEqual({
      ok: false,
      error: 'Controleer stap 1: Vul minimaal 10 deelnemers in. Onder de 10 ingevulde vragenlijsten maakt Loep geen rapport.',
    })
    expect(confirmUpdates).toHaveLength(0)
  })

  it('weigert te bevestigen als de sluitdatum al voorbij is (verouderd tabblad)', async () => {
    const oldLaunch = addDays(today, -20)
    deliveryRow = { ...savedStep1(), launch_date: oldLaunch }
    campaignRow = { organization_id: 'org-1', is_active: true, closed_at: null, closes_at: addDays(oldLaunch, 7) }
    const result = await confirmLaunchAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Controleer stap 1: Kies een sluitdatum na vandaag.' })
    expect(confirmUpdates).toHaveLength(0)
  })

  it('weigert te bevestigen zonder opgeslagen sluitdatum', async () => {
    campaignRow = { organization_id: 'org-1', is_active: true, closed_at: null, closes_at: null }
    const result = await confirmLaunchAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Controleer stap 1: Vul een sluitdatum in.' })
    expect(confirmUpdates).toHaveLength(0)
  })

  it('toetst de opgeslagen herinneringskeuze, ook "geen herinnering"', async () => {
    campaignRow = { organization_id: 'org-1', is_active: true, closed_at: null, closes_at: addDays(launchDate, 7) }
    deliveryRow = { ...savedStep1(), reminder_config: { enabled: true, firstReminderAfterDays: 7, maxReminderCount: 1 } }
    expect(await confirmLaunchAction('campaign-1')).toEqual({
      ok: false,
      error: 'Controleer stap 1: De herinnering valt op of na de sluitdatum. Kies een eerdere herinnering of een latere sluitdatum.',
    })
    deliveryRow = { ...savedStep1(), reminder_config: { enabled: false, firstReminderAfterDays: 5, maxReminderCount: 1 } }
    expect(await confirmLaunchAction('campaign-1')).toEqual({ ok: true })
  })

  it('meldt het als de planning niet te lezen is, in plaats van blind te bevestigen', async () => {
    deliveryReadError = { message: 'timeout' }
    const result = await confirmLaunchAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Bevestigen mislukt: de planning kon niet worden gelezen (timeout).' })
    expect(confirmUpdates).toHaveLength(0)
  })

  it('meldt eerlijk als de database niets heeft bijgewerkt (0 rijen, geen fout)', async () => {
    confirmCount = 0
    const result = await confirmLaunchAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Bevestigen mislukt: de meting is niet bijgewerkt. Probeer opnieuw.' })
  })
})
