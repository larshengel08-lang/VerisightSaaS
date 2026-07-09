import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockGetUser, mockCallerProfileSingle, mockAdminFrom, mockDeleteUser } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockCallerProfileSingle: vi.fn(),
  mockAdminFrom: vi.fn(),
  mockDeleteUser: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: mockCallerProfileSingle,
        }),
      }),
    }),
  }),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
    auth: { admin: { deleteUser: mockDeleteUser } },
  }),
}))

import { DELETE } from './route'

function chainResult(result: { data: unknown; error?: unknown }) {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'eq', 'in', 'delete', 'maybeSingle', 'single']
  for (const method of methods) {
    chain[method] = vi.fn(() => chain)
  }
  chain.then = (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject)
  return chain
}

function makeContext(id: string) {
  return { params: Promise.resolve({ id }) }
}

describe('DELETE /api/organizations/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'caller-1' } } })
    mockCallerProfileSingle.mockResolvedValue({ data: { is_verisight_admin: true } })
    mockDeleteUser.mockResolvedValue({ error: null })
  })

  it('verwijdert het auth-account van een lid dat nergens anders meer aan gekoppeld is, maar laat een lid met resterend lidmaatschap met rust (2026-07-09)', async () => {
    mockAdminFrom
      .mockReturnValueOnce(chainResult({ data: { id: 'org-1', name: 'Donderdag BV' } })) // organizations select
      .mockReturnValueOnce(chainResult({ data: [{ user_id: 'orphan-1' }, { user_id: 'keeper-1' }] })) // org_members select (before delete)
      .mockReturnValueOnce(chainResult({ data: [] })) // campaigns select — geen campaigns, dus geen respondent/survey_response-stappen
      .mockReturnValueOnce(chainResult({ data: null, error: null })) // org_invites delete
      .mockReturnValueOnce(chainResult({ data: null, error: null })) // org_members delete
      .mockReturnValueOnce(chainResult({ data: null, error: null })) // organization_secrets delete
      .mockReturnValueOnce(chainResult({ data: null, error: null })) // organizations delete
      // cleanup orphan-1
      .mockReturnValueOnce(chainResult({ data: { is_verisight_admin: false } })) // profiles
      .mockReturnValueOnce(chainResult({ data: [] })) // org_members (resterend) — leeg, dus wees
      .mockReturnValueOnce(chainResult({ data: [] })) // action_center_workspace_members — leeg
      // cleanup keeper-1
      .mockReturnValueOnce(chainResult({ data: { is_verisight_admin: false } })) // profiles
      .mockReturnValueOnce(chainResult({ data: [{ org_id: 'other-org' }] })) // org_members — nog gekoppeld elders
      .mockReturnValueOnce(chainResult({ data: [] })) // action_center_workspace_members

    const response = await DELETE(new Request('http://localhost/api/organizations/org-1', { method: 'DELETE' }), makeContext('org-1'))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(mockDeleteUser).toHaveBeenCalledTimes(1)
    expect(mockDeleteUser).toHaveBeenCalledWith('orphan-1')
    expect(json.message).toContain('1 inlogaccount')
  })

  it('verwijdert geen auth-account van een Loep-beheerder, ook niet als die verder nergens meer aan gekoppeld is', async () => {
    mockAdminFrom
      .mockReturnValueOnce(chainResult({ data: { id: 'org-1', name: 'Donderdag BV' } })) // organizations select
      .mockReturnValueOnce(chainResult({ data: [{ user_id: 'admin-owner-1' }] })) // org_members select (before delete)
      .mockReturnValueOnce(chainResult({ data: [] })) // campaigns select
      .mockReturnValueOnce(chainResult({ data: null, error: null })) // org_invites delete
      .mockReturnValueOnce(chainResult({ data: null, error: null })) // org_members delete
      .mockReturnValueOnce(chainResult({ data: null, error: null })) // organization_secrets delete
      .mockReturnValueOnce(chainResult({ data: null, error: null })) // organizations delete
      // cleanup admin-owner-1 — Promise.all vuurt alle 3 queries af vóórdat het profiel-resultaat de vroege continue triggert
      .mockReturnValueOnce(chainResult({ data: { is_verisight_admin: true } })) // profiles — is admin
      .mockReturnValueOnce(chainResult({ data: [] })) // org_members
      .mockReturnValueOnce(chainResult({ data: [] })) // action_center_workspace_members

    const response = await DELETE(new Request('http://localhost/api/organizations/org-1', { method: 'DELETE' }), makeContext('org-1'))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(mockDeleteUser).not.toHaveBeenCalled()
    expect(json.message).not.toContain('inlogaccount')
  })

  it('faalt de hele verwijdering niet als het opruimen van één account misgaat', async () => {
    mockAdminFrom
      .mockReturnValueOnce(chainResult({ data: { id: 'org-1', name: 'Donderdag BV' } }))
      .mockReturnValueOnce(chainResult({ data: [{ user_id: 'orphan-1' }] }))
      .mockReturnValueOnce(chainResult({ data: [] }))
      .mockReturnValueOnce(chainResult({ data: null, error: null }))
      .mockReturnValueOnce(chainResult({ data: null, error: null }))
      .mockReturnValueOnce(chainResult({ data: null, error: null }))
      .mockReturnValueOnce(chainResult({ data: null, error: null }))
      .mockReturnValueOnce(chainResult({ data: { is_verisight_admin: false } }))
      .mockReturnValueOnce(chainResult({ data: [] }))
      .mockReturnValueOnce(chainResult({ data: [] }))
    mockDeleteUser.mockResolvedValue({ error: { message: 'kapot' } })

    const response = await DELETE(new Request('http://localhost/api/organizations/org-1', { method: 'DELETE' }), makeContext('org-1'))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.message).toContain('Donderdag BV is verwijderd')
    expect(json.message).not.toContain('inlogaccount')
  })
})
