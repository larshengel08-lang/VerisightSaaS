import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  getOrganizationApiKeyMock: vi.fn(),
  getBackendApiUrlMock: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClientMock,
}))

vi.mock('@/lib/organization-secrets', () => ({
  getOrganizationApiKey: mocks.getOrganizationApiKeyMock,
}))

vi.mock('@/lib/server-env', () => ({
  getBackendApiUrl: mocks.getBackendApiUrlMock,
}))

import { GET } from './route'

function buildSupabaseClient(totalCompleted: number) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: { id: 'user-1' },
        },
      }),
    },
    from: (table: string) => {
      if (table === 'campaigns') {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValue({
                data: { organization_id: 'org-1', name: 'Activation Campaign' },
                error: null,
              }),
            }),
          }),
        }
      }

      if (table === 'campaign_stats') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { total_completed: totalCompleted },
                error: null,
              }),
            }),
          }),
        }
      }

      throw new Error(`Unexpected table: ${table}`)
    },
  }
}

describe('campaign report route activation gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClientMock.mockResolvedValue(buildSupabaseClient(4))
    mocks.getOrganizationApiKeyMock.mockResolvedValue('api-key')
    mocks.getBackendApiUrlMock.mockReturnValue('https://backend.example.com')
    vi.stubGlobal('fetch', vi.fn())
  })

  it('blocks report download before the first safe dashboard threshold', async () => {
    const response = await GET(new Request('http://localhost/api/campaigns/camp-1/report'), {
      params: Promise.resolve({ id: 'camp-1' }),
    })

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      detail: expect.stringContaining('vanaf 5 responses'),
    })
    expect(fetch).not.toHaveBeenCalled()
  })
})
