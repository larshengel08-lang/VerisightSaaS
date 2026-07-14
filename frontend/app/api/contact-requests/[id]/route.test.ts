import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { mockGetUser, mockProfileMaybeSingle } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockProfileMaybeSingle: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: mockProfileMaybeSingle,
        }),
      }),
    }),
  }),
}))

vi.mock('@/lib/server-env', () => ({
  getBackendApiUrl: () => 'http://backend.test',
}))

import { PATCH } from './route'

function makeContext(id: string) {
  return { params: Promise.resolve({ id }) }
}

function makeRequest(body: unknown = { ops_stage: 'won' }) {
  return new Request('http://localhost/api/contact-requests/lead-1', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

describe('PATCH /api/contact-requests/[id] — caller-autorisatie (M1)', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BACKEND_ADMIN_TOKEN = 'test-admin-token'
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ id: 'lead-1' }), { status: 200 }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('weigert een niet-ingelogde aanroeper met 401 en forward niet naar de backend', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const response = await PATCH(makeRequest(), makeContext('lead-1'))

    expect(response.status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('weigert een ingelogde niet-admin (bv. klant-tenant-gebruiker) met 403 en forward niet', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'tenant-user-1' } } })
    mockProfileMaybeSingle.mockResolvedValue({ data: { is_verisight_admin: false } })

    const response = await PATCH(makeRequest(), makeContext('lead-1'))

    expect(response.status).toBe(403)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('weigert wanneer er geen profielrij is (null) met 403 en forward niet', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'ghost-1' } } })
    mockProfileMaybeSingle.mockResolvedValue({ data: null })

    const response = await PATCH(makeRequest(), makeContext('lead-1'))

    expect(response.status).toBe(403)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('laat een Loep-admin door en forward met de admin-token naar de backend', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'loep-admin-1' } } })
    mockProfileMaybeSingle.mockResolvedValue({ data: { is_verisight_admin: true } })

    const response = await PATCH(makeRequest(), makeContext('lead-1'))

    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://backend.test/api/contact-requests/lead-1')
    expect((init as RequestInit).method).toBe('PATCH')
    expect((init as RequestInit).headers).toMatchObject({ 'x-admin-token': 'test-admin-token' })
  })
})
