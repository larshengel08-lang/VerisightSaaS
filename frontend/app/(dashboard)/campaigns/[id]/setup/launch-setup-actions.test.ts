import { describe, expect, it, vi } from 'vitest'

// Mock must be declared before importing the module under test
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
                maybeSingle: async () => ({ data: { role: 'owner' } }),
              }),
            }),
          }),
        }
      }
      if (table === 'campaign_delivery_records') {
        return {
          upsert: () => Promise.resolve({ error: null }),
          update: (_data: unknown, _opts?: unknown) => ({
            eq: () => Promise.resolve({ error: null, count: 1 }),
          }),
        }
      }
      return {}
    },
  }),
}))

import { confirmLaunchAction, saveLaunchSetupAction } from './launch-setup-actions'

describe('saveLaunchSetupAction', () => {
  it('returns error when launchDate is empty', async () => {
    const result = await saveLaunchSetupAction('campaign-1', '', 10)
    expect(result).toEqual({ ok: false, error: 'Startdatum is verplicht.' })
  })

  it('returns error when invitedCount is 0', async () => {
    const result = await saveLaunchSetupAction('campaign-1', '2026-07-01', 0)
    expect(result).toEqual({ ok: false, error: 'Aantal deelnemers moet minimaal 1 zijn.' })
  })

  it('returns error when invitedCount is negative', async () => {
    const result = await saveLaunchSetupAction('campaign-1', '2026-07-01', -5)
    expect(result).toEqual({ ok: false, error: 'Aantal deelnemers moet minimaal 1 zijn.' })
  })

  it('returns error for invalid date format', async () => {
    const result = await saveLaunchSetupAction('campaign-1', 'not-a-date', 25)
    expect(result).toEqual({ ok: false, error: 'Ongeldige datum.' })
  })

  it('returns error for impossible date', async () => {
    const result = await saveLaunchSetupAction('campaign-1', '2026-13-01', 25)
    expect(result).toEqual({ ok: false, error: 'Ongeldige datum.' })
  })

  it('returns ok: true for valid input', async () => {
    const result = await saveLaunchSetupAction('campaign-1', '2026-07-01', 25)
    expect(result).toEqual({ ok: true })
  })
})

describe('confirmLaunchAction', () => {
  it('returns ok: true for authorized user', async () => {
    const result = await confirmLaunchAction('campaign-1')
    expect(result).toEqual({ ok: true })
  })
})
