import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computeExtendedClosesAt } from '@/lib/dashboard/campaign-extension'

let orgMemberRole: string | null = 'owner'
let isAdmin = false
let closesAt: string | null = '2026-10-07'
let isActive = true
let extensionCount = 0
let campaignUpdates: Array<Record<string, unknown>> = []
let auditInserts: Array<Record<string, unknown>> = []
let auditInsertError: { message: string } | null = null

interface CountChain {
  eq: (...args: unknown[]) => CountChain
  contains: (...args: unknown[]) => Promise<{ count: number; error: null }>
}

function auditCountChain(): CountChain {
  const chain: CountChain = {
    eq: () => chain,
    contains: async () => ({ count: extensionCount, error: null }),
  }
  return chain
}

vi.mock('@/lib/email', () => ({ sendLoepEmail: async () => undefined }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) },
    from: (table: string) => {
      if (table === 'campaigns') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { organization_id: 'org-1' } }),
              maybeSingle: async () => ({ data: { closes_at: closesAt, is_active: isActive }, error: null }),
            }),
          }),
          update: (payload: Record<string, unknown>) => ({
            eq: () => ({
              select: async () => {
                campaignUpdates.push(payload)
                return { data: [{ id: 'campaign-1' }], error: null }
              },
            }),
          }),
        }
      }
      if (table === 'profiles') {
        return {
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { is_verisight_admin: isAdmin } }) }) }),
        }
      }
      if (table === 'org_members') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({ maybeSingle: async () => ({ data: orgMemberRole ? { role: orgMemberRole } : null }) }),
            }),
          }),
        }
      }
      if (table === 'campaign_action_audit_events') {
        return {
          select: () => auditCountChain(),
          insert: async (payload: Record<string, unknown>) => {
            auditInserts.push(payload)
            return { error: auditInsertError }
          },
        }
      }
      return {}
    },
  }),
}))

import { extendCampaignAction, skipReminderAction } from './dashboard-actions'

const today = new Date().toISOString().slice(0, 10)

beforeEach(() => {
  orgMemberRole = 'owner'
  isAdmin = false
  closesAt = '2026-10-07'
  isActive = true
  extensionCount = 0
  campaignUpdates = []
  auditInserts = []
  auditInsertError = null
})

describe('extendCampaignAction (spec 2026-09-16 par. 4.3)', () => {
  it('zet closes_at op max(vandaag, closes_at) + 14 dagen en logt de verlenging', async () => {
    closesAt = '2099-01-10'
    const result = await extendCampaignAction('campaign-1')
    expect(result).toEqual({ ok: true })
    expect(campaignUpdates).toEqual([{ closes_at: '2099-01-24' }])
    expect(auditInserts).toHaveLength(1)
    expect(auditInserts[0]).toMatchObject({
      action_key: 'delivery_lifecycle_changed',
      outcome: 'completed',
      metadata: { extension: true, previous_closes_at: '2099-01-10', new_closes_at: '2099-01-24', extension_number: 1 },
    })
    expect(String(auditInserts[0]?.summary)).toContain('Sluitdatum verlengd tot 24 januari 2099')
  })

  it('telt vanaf vandaag als de sluitdatum al voorbij is of ontbreekt', async () => {
    closesAt = null
    await extendCampaignAction('campaign-1')
    expect(campaignUpdates).toEqual([{ closes_at: computeExtendedClosesAt(null, today) }])
  })

  it('weigert na drie verlengingen met een duidelijke melding', async () => {
    extensionCount = 3
    const result = await extendCampaignAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Deze meting is al 3 keer verlengd. Je kunt hem alleen nog sluiten.' })
    expect(campaignUpdates).toHaveLength(0)
  })

  it('weigert voor een gesloten meting', async () => {
    isActive = false
    const result = await extendCampaignAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Deze meting is al gesloten en kan niet meer verlengd worden.' })
  })

  it('weigert voor een lid zonder eigenaarsrol', async () => {
    orgMemberRole = 'member'
    const result = await extendCampaignAction('campaign-1')
    expect(result.ok).toBe(false)
    expect(campaignUpdates).toHaveLength(0)
  })

  it('staat de operator toe', async () => {
    orgMemberRole = null
    isAdmin = true
    const result = await extendCampaignAction('campaign-1')
    expect(result).toEqual({ ok: true })
  })

  it('meldt het als de verlenging wel is opgeslagen maar niet gelogd (Fail Loud)', async () => {
    auditInsertError = { message: 'insert denied' }
    const result = await extendCampaignAction('campaign-1')
    expect(result.ok).toBe(true)
    expect(result.warning).toContain('kon dat niet vastleggen')
  })
})

describe('skipReminderAction (spec 2026-09-16 par. 4.3)', () => {
  it('logt een send_reminders-event met channel skipped_by_customer', async () => {
    const result = await skipReminderAction('campaign-1')
    expect(result).toEqual({ ok: true })
    expect(auditInserts).toHaveLength(1)
    expect(auditInserts[0]).toMatchObject({
      action_key: 'send_reminders',
      outcome: 'completed',
      summary: 'HR koos ervoor geen herinnering te versturen.',
      metadata: { channel: 'skipped_by_customer' },
    })
  })

  it('weigert voor een lid zonder eigenaarsrol', async () => {
    orgMemberRole = 'viewer'
    const result = await skipReminderAction('campaign-1')
    expect(result.ok).toBe(false)
    expect(auditInserts).toHaveLength(0)
  })

  it('geeft een fout terug als het loggen faalt', async () => {
    auditInsertError = { message: 'insert denied' }
    const result = await skipReminderAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Overslaan mislukt: insert denied' })
  })
})
