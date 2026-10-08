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
let waarschuwing: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  fout = vi.spyOn(console, 'error').mockImplementation(() => {})
  waarschuwing = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  fout.mockRestore()
  waarschuwing.mockRestore()
})

function gelogd(): string {
  return JSON.stringify(fout.mock.calls)
}

function pdf() {
  return new Response('%PDF', { status: 200, headers: { 'content-type': 'application/pdf' } })
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status })
}

describe('rapportproxy: fouten verdwijnen niet stil', () => {
  it('logt de mislukte eerste poging en valt terug op de interne route', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce(pdf())
    vi.stubGlobal('fetch', fetchMock)

    const res = await GET(verzoek(), ctx)

    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fout).toHaveBeenCalledTimes(1)
    expect(gelogd()).toContain('[rapportproxy]')
    expect(gelogd()).toContain('meting-123')
    expect(gelogd()).toContain('ECONNRESET')
    expect(gelogd()).not.toContain('org-sleutel-geheim')
    expect(gelogd()).not.toContain('Geheime meting')
  })

  it('geeft een nette 502 als de backend helemaal niet bereikbaar is en logt de echte oorzaak', async () => {
    // Node-fetch (undici) verstopt de echte oorzaak in error.cause.
    const fetchMislukt = () => Object.assign(new TypeError('fetch failed'), { cause: { code: 'ECONNREFUSED' } })
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => { throw fetchMislukt() }))

    const res = await GET(verzoek(), ctx)

    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({
      detail: 'De rapportserver is nu niet bereikbaar. Probeer het later opnieuw.',
    })
    expect(gelogd()).toContain('fetch failed')
    expect(gelogd()).toContain('ECONNREFUSED')
    expect(gelogd()).toContain('backend niet bereikbaar')
    expect(gelogd()).not.toContain('org-sleutel-geheim')
  })

  it('een fout in de terugval komt in de buitenste afhandeling, zonder tweede interne poging', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({ detail: 'sleutel onbekend' }, 401))
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
    vi.stubGlobal('fetch', fetchMock)

    const res = await GET(verzoek(), ctx)

    expect(res.status).toBe(502)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fout).toHaveBeenCalledTimes(1)
    expect(gelogd()).toContain('backend niet bereikbaar')
    expect(gelogd()).not.toContain('eerste poging')
  })

  it('logt een 5xx van de backend en geeft de backendmelding door', async () => {
    const backendBody = JSON.stringify({
      detail: 'Het rapport kon niet worden gemaakt. Loep heeft hier automatisch een melding van gekregen en zoekt uit wat er misging. Je hoeft verder niets te doen. Probeer het later gerust opnieuw.',
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(backendBody, { status: 500 })))

    const res = await GET(verzoek(), ctx)

    expect(res.status).toBe(500)
    // Bewust dubbel gecodeerd: de proxy geeft de ruwe backendtekst door, Task 7 pakt hem uit.
    expect((await res.json()).detail).toBe(backendBody)
    expect(gelogd()).toContain('500')
    expect(gelogd()).toContain('meting-123')
  })

  it('logt een 403 van de interne route na een geweigerde organisatiesleutel, en waarschuwt bij de terugval', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(json({ detail: 'sleutel onbekend' }, 401))
        .mockResolvedValueOnce(json({ detail: 'admin-token onjuist' }, 403)),
    )

    const res = await GET(verzoek(), ctx)

    expect(res.status).toBe(403)
    expect(waarschuwing).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(waarschuwing.mock.calls)).toContain('organisatiesleutel geweigerd')
    expect(JSON.stringify(waarschuwing.mock.calls)).toContain('401')
    expect(JSON.stringify(waarschuwing.mock.calls)).not.toContain('org-sleutel-geheim')
    expect(fout).toHaveBeenCalledTimes(1)
    expect(gelogd()).toContain('403')
    expect(gelogd()).toContain('meting-123')
  })

  it('logt een 200 zonder inhoud voordat de proxy een 502 geeft', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })))

    const res = await GET(verzoek(), ctx)

    expect(res.status).toBe(502)
    expect(gelogd()).toContain('zonder inhoud')
    expect(gelogd()).toContain('meting-123')
  })

  it.each([410, 422])('logt een %i niet als fout', async (status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ detail: 'bewust geweigerd' }, status)))

    const res = await GET(verzoek(), ctx)

    expect(res.status).toBe(status)
    expect(fout).not.toHaveBeenCalled()
    expect(waarschuwing).not.toHaveBeenCalled()
  })
})
