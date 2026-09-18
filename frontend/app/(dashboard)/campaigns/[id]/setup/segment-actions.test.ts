import { beforeEach, describe, expect, it, vi } from 'vitest'

let campaignRow: Record<string, unknown> = {
  organization_id: 'org-1',
  is_active: true,
  closed_at: null,
  segment_departments: [],
}
let deliveryRow: Record<string, unknown> | null = null
let deliveryReadError: { message: string } | null = null
let campaignUpdates: Array<Record<string, unknown>> = []
let deliveryUpserts: Array<Record<string, unknown>> = []

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) },
    from: (table: string) => {
      if (table === 'campaigns') {
        return {
          select: () => ({ eq: () => ({ single: async () => ({ data: campaignRow }) }) }),
          update: (payload: Record<string, unknown>) => ({
            eq: async () => {
              campaignUpdates.push(payload)
              return { error: null }
            },
          }),
        }
      }
      if (table === 'profiles') {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { is_verisight_admin: false } }) }) }) }
      }
      if (table === 'org_members') {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { role: 'owner' } }) }) }) }),
        }
      }
      if (table === 'respondents') {
        return { select: () => ({ eq: () => ({ not: async () => ({ data: [], error: null }) }) }) }
      }
      if (table === 'campaign_delivery_records') {
        return {
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: deliveryRow, error: deliveryReadError }) }) }),
          upsert: async (payload: Record<string, unknown>) => {
            deliveryUpserts.push(payload)
            return { error: null }
          },
        }
      }
      return {}
    },
  }),
}))

import { saveSegmentDepartmentsAction } from './segment-actions'

const incoming = [
  { label: 'Zorg', invited_count: 8 },
  { label: 'Staf', invited_count: 6 },
]

describe('saveSegmentDepartmentsAction: niet meer wijzigen na lancering of sluiting', () => {
  beforeEach(() => {
    campaignRow = { organization_id: 'org-1', is_active: true, closed_at: null, segment_departments: [] }
    deliveryRow = { launch_confirmed_at: null }
    deliveryReadError = null
    campaignUpdates = []
    deliveryUpserts = []
  })

  it('slaat op zolang de meting nog niet gestart is en geeft de afdelingen met slug terug', async () => {
    const result = await saveSegmentDepartmentsAction('campaign-1', incoming)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.departments.map((d) => d.label)).toEqual(['Zorg', 'Staf'])
    expect(campaignUpdates).toHaveLength(1)
    expect(deliveryUpserts).toHaveLength(1)
  })

  it('weigert als de meting al gestart is', async () => {
    deliveryRow = { launch_confirmed_at: '2026-09-01T10:00:00Z' }
    const result = await saveSegmentDepartmentsAction('campaign-1', incoming)
    expect(result).toEqual({ ok: false, error: 'De meting is al gestart; stap 1 kun je niet meer wijzigen.' })
    expect(campaignUpdates).toHaveLength(0)
    expect(deliveryUpserts).toHaveLength(0)
  })

  it('weigert als de meting al gesloten is', async () => {
    campaignRow = { organization_id: 'org-1', is_active: false, closed_at: '2026-09-10T10:00:00Z', segment_departments: [] }
    const result = await saveSegmentDepartmentsAction('campaign-1', incoming)
    expect(result).toEqual({ ok: false, error: 'De meting is al gesloten; stap 1 kun je niet meer wijzigen.' })
    expect(campaignUpdates).toHaveLength(0)
    expect(deliveryUpserts).toHaveLength(0)
  })

  it('meldt het als de stand van de meting niet te lezen is, in plaats van blind te schrijven', async () => {
    deliveryReadError = { message: 'timeout' }
    const result = await saveSegmentDepartmentsAction('campaign-1', incoming)
    expect(result).toEqual({ ok: false, error: 'Opslaan mislukt: de huidige planning kon niet worden gelezen (timeout).' })
    expect(campaignUpdates).toHaveLength(0)
  })
})
