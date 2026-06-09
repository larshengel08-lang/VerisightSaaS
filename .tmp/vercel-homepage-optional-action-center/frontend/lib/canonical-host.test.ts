import { describe, expect, it } from 'vitest'
import { getCanonicalHostRedirectUrl } from '@/lib/canonical-host'

describe('canonical host redirect', () => {
  it('redirects the apex domain to the www host', () => {
    expect(
      getCanonicalHostRedirectUrl({
        hostname: 'verisight.nl',
        pathname: '/producten/exitscan',
        search: '?utm_source=google',
      }),
    ).toBe('https://www.verisight.nl/producten/exitscan?utm_source=google')
  })

  it('keeps the www host untouched', () => {
    expect(
      getCanonicalHostRedirectUrl({
        hostname: 'www.verisight.nl',
        pathname: '/',
        search: '',
      }),
    ).toBeNull()
  })

  it('treats hostnames case-insensitively', () => {
    expect(
      getCanonicalHostRedirectUrl({
        hostname: 'VERISIGHT.NL',
        pathname: '/',
        search: '',
      }),
    ).toBe('https://www.verisight.nl/')
  })
})
