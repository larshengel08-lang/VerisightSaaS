import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computeExtendedClosesAt } from '@/lib/dashboard/campaign-extension'

let orgMemberRole: string | null = 'owner'
let isAdmin = false
let closesAt: string | null = '2026-10-07'
let isActive = true
let closedAt: string | null = null
let extensionCount = 0
let countError: { message: string } | null = null
let countFilters: Array<[string, unknown]> = []
let campaignUpdates: Array<Record<string, unknown>> = []
let updateFilters: Array<[string, unknown]> = []
/** Eén resultaat per update-aanroep, in volgorde; standaard 1 rij, geen fout. */
let updateResults: Array<{ rows: number; error: { message: string } | null }> = []
let auditInserts: Array<Record<string, unknown>> = []
let auditInsertError: { message: string } | null = null

interface CountChain {
  eq: (column: string, value: unknown) => CountChain
  contains: (column: string, value: unknown) => Promise<{ count: number | null; error: { message: string } | null }>
}

/**
 * De telquery moet op deze campagne, deze organisatie, de lifecycle-actie en
 * metadata.extension filteren; anders telt hij verkeerd en is de grens van drie
 * verlengingen te omzeilen. De mock geeft pas een telling als dat klopt.
 */
function auditCountChain(): CountChain {
  const chain: CountChain = {
    eq: (column, value) => {
      countFilters.push([column, value])
      return chain
    },
    contains: async (column, value) => {
      countFilters.push([column, value])
      const has = (c: string, v: unknown) => countFilters.some(([fc, fv]) => fc === c && JSON.stringify(fv) === JSON.stringify(v))
      const complete =
        has('campaign_id', 'campaign-1') &&
        has('organization_id', 'org-1') &&
        has('action_key', 'delivery_lifecycle_changed') &&
        has('outcome', 'completed') &&
        has('metadata', { extension: true })
      if (!complete) throw new Error(`telquery mist filters: ${JSON.stringify(countFilters)}`)
      return countError ? { count: null, error: countError } : { count: extensionCount, error: null }
    },
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
              maybeSingle: async () => ({ data: { closes_at: closesAt, is_active: isActive, closed_at: closedAt }, error: null }),
            }),
          }),
          update: (payload: Record<string, unknown>) => ({
            eq: () => {
              const select = async () => {
                campaignUpdates.push(payload)
                const result = updateResults.shift() ?? { rows: 1, error: null }
                if (result.error) return { data: null, error: result.error }
                return { data: Array.from({ length: result.rows }, () => ({ id: 'campaign-1' })), error: null }
              }
              return {
                select,
                is: (column: string, value: unknown) => {
                  updateFilters.push([column, value])
                  return { select }
                },
              }
            },
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

import { closeCampaignAction, extendCampaignAction, skipReminderAction } from './dashboard-actions'

const today = new Date().toISOString().slice(0, 10)

beforeEach(() => {
  orgMemberRole = 'owner'
  isAdmin = false
  closesAt = '2026-10-07'
  isActive = true
  closedAt = null
  extensionCount = 0
  countError = null
  countFilters = []
  campaignUpdates = []
  updateFilters = []
  updateResults = []
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

  it('weigert en schrijft niets als de telling mislukt', async () => {
    countError = { message: 'permission denied' }
    const result = await extendCampaignAction('campaign-1')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('hoe vaak deze meting al verlengd is')
    expect(campaignUpdates).toHaveLength(0)
    expect(auditInserts).toHaveLength(0)
  })

  it('weigert als de update geen rij raakt', async () => {
    updateResults = [{ rows: 0, error: null }]
    const result = await extendCampaignAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Verlengen mislukt: campagne niet gevonden of geen rechten.' })
    expect(auditInserts).toHaveLength(0)
  })

  it('zet de sluitdatum terug als de verlenging niet vastgelegd kan worden (anders telt hij niet mee)', async () => {
    closesAt = '2099-01-10'
    auditInsertError = { message: 'insert denied' }
    const result = await extendCampaignAction('campaign-1')
    expect(result).toEqual({
      ok: false,
      error: 'Verlengen is niet gelukt: Loep kon de verlenging niet vastleggen. Probeer het opnieuw.',
    })
    expect(campaignUpdates).toEqual([{ closes_at: '2099-01-24' }, { closes_at: '2099-01-10' }])
  })

  it('meldt eerlijk als ook het terugzetten mislukt: datum verschoven, verlenging niet geteld', async () => {
    closesAt = '2099-01-10'
    auditInsertError = { message: 'insert denied' }
    updateResults = [{ rows: 1, error: null }, { rows: 0, error: { message: 'update denied' } }]
    const result = await extendCampaignAction('campaign-1')
    expect(result.ok).toBe(true)
    expect(result.warning).toContain('24 januari 2099')
    expect(result.warning).toContain('kon Loep de verlenging niet vastleggen')
    expect(result.warning).toContain('hallo@getloep.nl')
    expect(campaignUpdates).toHaveLength(2)
  })

  it('meldt het ook als het terugzetten geen rij raakt', async () => {
    auditInsertError = { message: 'insert denied' }
    updateResults = [{ rows: 1, error: null }, { rows: 0, error: null }]
    const result = await extendCampaignAction('campaign-1')
    expect(result.ok).toBe(true)
    expect(result.warning).toContain('kon Loep de verlenging niet vastleggen')
  })
})

describe('skipReminderAction (spec 2026-09-16 par. 4.3)', () => {
  it('weigert voor een gesloten meting en logt niets', async () => {
    isActive = false
    const result = await skipReminderAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Deze meting is al gesloten; een herinnering overslaan is niet meer nodig.' })
    expect(auditInserts).toHaveLength(0)
  })

  it('weigert ook als closed_at gezet is', async () => {
    closedAt = '2026-09-01T10:00:00Z'
    const result = await skipReminderAction('campaign-1')
    expect(result.ok).toBe(false)
    expect(auditInserts).toHaveLength(0)
  })

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

describe('closeCampaignAction: closed_at is de klok van de bewaartermijn', () => {
  it('sluit alleen een meting waarvan closed_at nog leeg is', async () => {
    isActive = false
    closedAt = '2026-09-01T10:00:00Z'
    updateResults = [{ rows: 0, error: null }]
    await closeCampaignAction('campaign-1')
    expect(updateFilters).toEqual([['closed_at', null]])
  })

  it('een tweede keer sluiten is geen fout en verstuurt en logt niets opnieuw', async () => {
    isActive = false
    closedAt = '2026-09-01T10:00:00Z'
    updateResults = [{ rows: 0, error: null }]
    const result = await closeCampaignAction('campaign-1')
    expect(result).toEqual({
      ok: true,
      warning: 'Deze meting was al gesloten. Er is niets veranderd en er is geen nieuw bericht verstuurd.',
    })
    expect(auditInserts).toHaveLength(0)
  })

  it('0 rijen op een meting die niet gesloten is blijft een fout (geen vals succes)', async () => {
    closedAt = null
    updateResults = [{ rows: 0, error: null }]
    const result = await closeCampaignAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Sluiten mislukt: campagne niet gevonden of geen rechten.' })
    expect(auditInserts).toHaveLength(0)
  })
})
