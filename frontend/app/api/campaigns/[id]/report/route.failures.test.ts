import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

function tabel(data: unknown) {
  const q: Record<string, unknown> = {}
  q.select = () => q
  q.eq = () => q
  q.maybeSingle = async () => ({ data, error: null })
  q.single = async () => ({ data, error: null })
  return q
}

const supabase = {
  auth: { getUser: async () => ({ data: { user: { id: 'gebruiker-1' } } }) },
  from: (t: string) =>
    t === 'profiles'
      ? tabel({ is_verisight_admin: false })
      : t === 'campaigns'
        ? tabel({ organization_id: 'org-1', name: 'Geheime meting', scan_type: 'retention' })
        : tabel({ role: 'owner' }),
}

vi.mock('@/lib/supabase/server', () => ({ createClient: async () => supabase }))
vi.mock('@/lib/organization-secrets', () => ({ getOrganizationApiKey: async () => 'org-sleutel-geheim' }))
vi.mock('@/lib/server-env', () => ({ getBackendApiUrl: () => 'https://backend.test' }))

import { GET } from './route'

const ctx = { params: Promise.resolve({ id: 'meting-123' }) }
const verzoek = () => new Request('https://app.test/api/campaigns/meting-123/report')

let fout: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  fout = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  fout.mockRestore()
})

function gelogd(): string {
  return JSON.stringify(fout.mock.calls)
}

describe('rapportproxy: fouten verdwijnen niet stil', () => {
  it('logt de mislukte eerste poging en valt terug op de interne route', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce(new Response('%PDF', { status: 200, headers: { 'content-type': 'application/pdf' } }))
    vi.stubGlobal('fetch', fetchMock)

    const res = await GET(verzoek(), ctx)

    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(gelogd()).toContain('[rapportproxy]')
    expect(gelogd()).toContain('meting-123')
    expect(gelogd()).toContain('ECONNRESET')
    expect(gelogd()).not.toContain('org-sleutel-geheim')
    expect(gelogd()).not.toContain('Geheime meting')
  })

  it('geeft een nette 502 als de backend helemaal niet bereikbaar is', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ENOTFOUND backend.test')))

    const res = await GET(verzoek(), ctx)

    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({
      detail: 'De rapportserver is nu niet bereikbaar. Probeer het later opnieuw.',
    })
    expect(gelogd()).toContain('ENOTFOUND')
    expect(gelogd()).not.toContain('org-sleutel-geheim')
  })

  it('logt een 5xx van de backend en geeft de backendmelding door', async () => {
    const backendBody = JSON.stringify({
      detail: 'Het rapport kon niet worden gemaakt. Loep heeft hier automatisch een melding van gekregen en zoekt uit wat er misging. Je hoeft verder niets te doen. Probeer het later gerust opnieuw.',
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(backendBody, { status: 500 })))

    const res = await GET(verzoek(), ctx)

    expect(res.status).toBe(500)
    expect((await res.json()).detail).toBe(backendBody)
    expect(gelogd()).toContain('500')
    expect(gelogd()).toContain('meting-123')
  })

  it('logt een 410 of 422 niet als fout', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'weg' }), { status: 410 })),
    )

    const res = await GET(verzoek(), ctx)

    expect(res.status).toBe(410)
    expect(fout).not.toHaveBeenCalled()
  })
})
