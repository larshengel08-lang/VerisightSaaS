import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockGetUser, mockProfileMaybeSingle, mockInsertSelect } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockProfileMaybeSingle: vi.fn(),
  mockInsertSelect: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: mockProfileMaybeSingle }) }),
    }),
  }),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      insert: () => ({ select: mockInsertSelect }),
    }),
  }),
}))

import { createRespondentsAction } from './respondent-actions'

const ROW = {
  campaign_id: 'campaign-1',
  department: 'Finance',
  role_level: 'medior',
  exit_month: null,
  annual_salary_eur: null,
  email: 'r1@example.com',
}

describe('createRespondentsAction — service-role insert met admin-gate (H1)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInsertSelect.mockResolvedValue({ data: [{ token: 't1', email: 'r1@example.com' }], error: null })
  })

  it('weigert niet-ingelogd', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await createRespondentsAction([ROW])
    expect(res.ok).toBe(false)
    expect(mockInsertSelect).not.toHaveBeenCalled()
  })

  it('weigert een niet-admin (bv. org owner) — geen insert', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'owner-1' } } })
    mockProfileMaybeSingle.mockResolvedValue({ data: { is_verisight_admin: false } })
    const res = await createRespondentsAction([ROW])
    expect(res).toEqual({ ok: false, error: 'Geen toegang.' })
    expect(mockInsertSelect).not.toHaveBeenCalled()
  })

  it('weigert rijen met gemengde/ontbrekende campaign_id', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } })
    mockProfileMaybeSingle.mockResolvedValue({ data: { is_verisight_admin: true } })
    const res = await createRespondentsAction([ROW, { ...ROW, campaign_id: 'campaign-2' }])
    expect(res.ok).toBe(false)
    expect(mockInsertSelect).not.toHaveBeenCalled()
  })

  it('insert via service-role voor een Loep-admin en geeft token/email terug', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } })
    mockProfileMaybeSingle.mockResolvedValue({ data: { is_verisight_admin: true } })
    const res = await createRespondentsAction([ROW])
    expect(res).toEqual({ ok: true, created: [{ token: 't1', email: 'r1@example.com' }] })
    expect(mockInsertSelect).toHaveBeenCalledTimes(1)
  })
})
