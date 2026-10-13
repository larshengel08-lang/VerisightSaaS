import { describe, expect, it } from 'vitest'
import nextConfig from '../next.config'

describe('Cultuurbeeld-redirect (spec 2026-10-11, par. 7.2)', () => {
  it('/producten/cultuurbeeld gaat met een 308 naar Loep Behoud', async () => {
    const redirects = await nextConfig.redirects!()
    expect(redirects).toContainEqual({
      source: '/producten/cultuurbeeld',
      destination: '/producten#loep-behoud',
      permanent: true,
    })
  })
})
